import { createHash } from 'node:crypto'
import { z } from 'zod'
import { fetchBpsJson } from './bps-fetch'

const BPS_API_ORIGIN = 'https://webapi.bps.go.id'
const supportedModels = ['pressrelease', 'publication'] as const

const bindingSchema = z.object({
  domain: z.string().regex(/^\d{4}$/),
  keyword: z.string().trim().min(2).max(100),
  model: z.enum(supportedModels),
})

const itemSchema = z
  .object({
    brs_id: z.union([z.string(), z.number()]).optional(),
    pub_id: z.union([z.string(), z.number()]).optional(),
    pdf: z.string().optional(),
    title: z.string().trim().min(2).max(500),
    rl_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .passthrough()

const responseSchema = z.object({
  status: z.string(),
  'data-availability': z.string().optional(),
  data: z.tuple([
    z.object({
      page: z.coerce.number().int().nonnegative(),
      pages: z.coerce.number().int().nonnegative(),
    }),
    z.array(itemSchema),
  ]),
})

export type BpsBinding = z.infer<typeof bindingSchema>

export interface BpsSourceDocument {
  canonicalUrl: string
  languageCode: 'id'
  publishedAt: string
  publisherName: 'Badan Pusat Statistik'
  rawPayloadSha256: string
  sourceRecordId: string
  title: string
}

export function parseBpsBinding(externalIdentifier: string): BpsBinding {
  const parameters = new URLSearchParams(externalIdentifier)
  const allowed = new Set(['domain', 'keyword', 'model'])
  for (const key of parameters.keys()) {
    if (!allowed.has(key)) throw new Error(`Parameter binding BPS tidak didukung: ${key}`)
  }

  return bindingSchema.parse({
    domain: parameters.get('domain'),
    keyword: parameters.get('keyword'),
    model: parameters.get('model'),
  })
}

export function buildBpsRequestUrl(binding: BpsBinding, apiKey: string, page = 1) {
  const path = binding.model === 'publication' ? '/v1/api/list/' : '/v1/api/list'
  const url = new URL(path, BPS_API_ORIGIN)
  url.searchParams.set('model', binding.model)
  url.searchParams.set('lang', 'ind')
  url.searchParams.set('domain', binding.domain)
  url.searchParams.set('keyword', binding.keyword)
  url.searchParams.set('page', String(page))
  url.searchParams.set('key', apiKey)
  return url
}

export function bpsCitationUrl(binding: BpsBinding, page = 1) {
  const url = buildBpsRequestUrl(binding, 'redacted', page)
  url.searchParams.delete('key')
  return url.toString()
}

function officialDocumentUrl(value: string | undefined, fallback: string) {
  if (!value) return fallback

  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return fallback
    if (url.hostname !== 'bps.go.id' && !url.hostname.endsWith('.bps.go.id')) return fallback
    url.protocol = 'https:'
    return url.toString()
  } catch {
    return fallback
  }
}

export function parseBpsResponse(payload: unknown, binding: BpsBinding) {
  const parsed = responseSchema.parse(payload)
  if (parsed.status.toUpperCase() !== 'OK') throw new Error('BPS mengembalikan status non-OK.')

  const documents = parsed.data[1].map((item): BpsSourceDocument => {
    const providerId = binding.model === 'pressrelease' ? item.brs_id : item.pub_id
    if (providerId === undefined) throw new Error(`Respons BPS tidak memiliki ID ${binding.model}.`)

    return {
      canonicalUrl: officialDocumentUrl(item.pdf, bpsCitationUrl(binding, parsed.data[0].page || 1)),
      languageCode: 'id',
      publishedAt: `${item.rl_date}T00:00:00+07:00`,
      publisherName: 'Badan Pusat Statistik',
      rawPayloadSha256: createHash('sha256').update(JSON.stringify(item)).digest('hex'),
      sourceRecordId: `${binding.model}:${providerId}`,
      title: item.title,
    }
  })

  return {
    documents,
    page: parsed.data[0].page,
    pages: parsed.data[0].pages,
  }
}

export async function fetchBpsDocuments(binding: BpsBinding, apiKey: string, maxPages = 5) {
  const documents: BpsSourceDocument[] = []
  let page = 1
  let totalPages = 1

  do {
    const parsed = parseBpsResponse(await fetchBpsJson(buildBpsRequestUrl(binding, apiKey, page)), binding)
    documents.push(...parsed.documents)
    totalPages = parsed.pages
    page += 1
  } while (page <= totalPages && page <= maxPages)

  return documents
}
