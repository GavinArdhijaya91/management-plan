import { createHash } from 'node:crypto'
import { z } from 'zod'
import { fetchBpsJson } from './bps-fetch'

const identifierSchema = z.object({
  domain: z.string().regex(/^\d{4}$/),
  model: z.literal('data'),
  th: z.string().regex(/^\d+(?:[;:]\d+)*$/),
  turth: z
    .string()
    .regex(/^\d+(?:[;:]\d+)*$/)
    .optional(),
  turvar: z
    .string()
    .regex(/^\d+(?:[;:]\d+)*$/)
    .optional(),
  var: z.string().regex(/^\d+$/),
  vervar: z
    .string()
    .regex(/^\d+(?:[;:]\d+)*$/)
    .optional(),
})

const dimensionItem = z.object({ val: z.coerce.number().int().nonnegative(), label: z.coerce.string().trim().min(1) })
const responseSchema = z.object({
  status: z.string(),
  'data-availability': z.string().optional(),
  var: z.array(
    z.object({
      val: z.coerce.number().int().nonnegative(),
      label: z.string().trim().min(1),
      unit: z.string().trim().min(1),
    }),
  ),
  turvar: z.array(dimensionItem).default([]),
  labelvervar: z.string().trim().min(1),
  vervar: z.array(dimensionItem),
  tahun: z.array(dimensionItem),
  turtahun: z.array(dimensionItem).default([]),
  datacontent: z.record(z.string(), z.union([z.number(), z.string(), z.null()])),
})

export type BpsDynamicBinding = z.infer<typeof identifierSchema>

export interface BpsDynamicObservation {
  metricCode: string
  numericValue: number
  observedAt: string
  rawPayloadSha256: string
  sourceRecordId: string
  sourceUrl: string
  unitCode: string
}

export function parseBpsDynamicBinding(value: string): BpsDynamicBinding {
  const parameters = new URLSearchParams(value)
  const allowed = new Set(['domain', 'model', 'th', 'turth', 'turvar', 'var', 'vervar'])
  for (const key of parameters.keys()) {
    if (!allowed.has(key)) throw new Error(`Parameter statistik BPS tidak didukung: ${key}`)
  }
  return identifierSchema.parse(Object.fromEntries(parameters))
}

export function buildBpsDynamicUrl(binding: BpsDynamicBinding, apiKey?: string) {
  const url = new URL('https://webapi.bps.go.id/v1/api/list')
  for (const [key, value] of Object.entries(binding)) url.searchParams.set(key, value)
  url.searchParams.set('lang', 'ind')
  if (apiKey) url.searchParams.set('key', apiKey)
  return url
}

function unitCode(value: string) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/%/g, 'percent')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  if (!normalized || normalized.length > 32) throw new Error('BPS_UNIT_UNSUPPORTED')
  return normalized
}

function observedAt(yearLabel: string, derivedPeriod: number) {
  if (!/^\d{4}$/.test(yearLabel)) throw new Error('BPS_PERIOD_UNSUPPORTED')
  if (derivedPeriod === 0) return `${yearLabel}-01-01T00:00:00+07:00`
  if (derivedPeriod >= 1 && derivedPeriod <= 12)
    return `${yearLabel}-${String(derivedPeriod).padStart(2, '0')}-01T00:00:00+07:00`
  throw new Error('BPS_PERIOD_UNSUPPORTED')
}

export function parseBpsDynamicResponse(payload: unknown, binding: BpsDynamicBinding): BpsDynamicObservation[] {
  const parsed = responseSchema.parse(payload)
  if (parsed.status.toUpperCase() !== 'OK') throw new Error('BPS_STATUS_NOT_OK')
  if (parsed.var.length !== 1) throw new Error('BPS_VARIABLE_AMBIGUOUS')

  const variable = parsed.var[0]
  const derivedVariables = parsed.turvar.length ? parsed.turvar : [{ val: 0, label: 'Tanpa turunan' }]
  const derivedPeriods = parsed.turtahun.length ? parsed.turtahun : [{ val: 0, label: 'Tahun' }]
  const sourceUrl = buildBpsDynamicUrl(binding).toString()
  const observations: BpsDynamicObservation[] = []

  for (const geography of parsed.vervar) {
    for (const derivedVariable of derivedVariables) {
      for (const year of parsed.tahun) {
        for (const derivedPeriod of derivedPeriods) {
          const contentKey = `${geography.val}${variable.val}${derivedVariable.val}${year.val}${derivedPeriod.val}`
          const rawValue = parsed.datacontent[contentKey]
          if (rawValue === undefined || rawValue === null || rawValue === '') continue
          const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue)
          if (!Number.isFinite(numericValue)) throw new Error('BPS_VALUE_NON_NUMERIC')

          const record = { contentKey, geography, variable, derivedVariable, year, derivedPeriod, rawValue }
          observations.push({
            metricCode: `bps.var.${variable.val}.turvar.${derivedVariable.val}.vervar.${geography.val}`,
            numericValue,
            observedAt: observedAt(year.label, derivedPeriod.val),
            rawPayloadSha256: createHash('sha256').update(JSON.stringify(record)).digest('hex'),
            sourceRecordId: `data:${contentKey}`,
            sourceUrl,
            unitCode: unitCode(variable.unit),
          })
        }
      }
    }
  }

  const knownKeys = new Set(observations.map((item) => item.sourceRecordId.replace('data:', '')))
  const populatedKeys = Object.entries(parsed.datacontent).filter(([, value]) => value !== null && value !== '')
  if (populatedKeys.some(([key]) => !knownKeys.has(key))) throw new Error('BPS_DIMENSION_KEY_UNKNOWN')
  return observations
}

export async function fetchBpsDynamicObservations(binding: BpsDynamicBinding, apiKey: string) {
  return parseBpsDynamicResponse(await fetchBpsJson(buildBpsDynamicUrl(binding, apiKey)), binding)
}
