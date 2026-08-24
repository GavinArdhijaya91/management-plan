import { timingSafeEqual } from 'node:crypto'
import { fetchBpsDocuments, parseBpsBinding } from '@/lib/market/bps'
import { createServiceClient } from '@/lib/supabase/service'
import { apiError, apiSuccess } from '@/app/api/_lib/http'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET?.trim()
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!expected || expected.length < 32 || !supplied) return false

  const expectedBytes = Buffer.from(expected)
  const suppliedBytes = Buffer.from(supplied)
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes)
}

function ingestionErrorCode(error: unknown) {
  if (error instanceof Error && /^BPS_HTTP_\d{3}$/.test(error.message)) return error.message
  if (error instanceof Error && error.name === 'ZodError') return 'BPS_RESPONSE_INVALID'
  return 'BPS_SYNC_FAILED'
}

async function ingest(request: Request) {
  if (!authorized(request)) return apiError('UNAUTHORIZED', 'Kredensial ingestion tidak valid.', 401)

  const apiKey = process.env.BPS_API_KEY?.trim()
  if (!apiKey) return apiError('BPS_NOT_CONFIGURED', 'BPS API belum dikonfigurasi.', 503)

  const supabase = createServiceClient()
  const sourceResult = await supabase.from('market_sources').select('id').eq('code', 'bps').single()
  if (sourceResult.error) return apiError('SOURCE_NOT_FOUND', 'Katalog sumber BPS tidak tersedia.', 500)

  const bindingsResult = await supabase
    .from('market_product_source_bindings')
    .select('id,workspace_id,product_id,market_source_id,category_code,external_identifier,country_code')
    .eq('market_source_id', sourceResult.data.id)
    .eq('category_code', 'official_statistics')
    .eq('is_active', true)
    .limit(100)

  if (bindingsResult.error) return apiError('BINDING_READ_FAILED', 'Konfigurasi sumber tidak dapat dibaca.', 500)

  let acceptedCount = 0
  let failedBindings = 0
  let fetchedCount = 0

  for (const binding of bindingsResult.data) {
    const startedAt = new Date().toISOString()
    const runResult = await supabase
      .from('market_source_sync_runs')
      .insert({
        workspace_id: binding.workspace_id,
        product_id: binding.product_id,
        binding_id: binding.id,
        market_source_id: binding.market_source_id,
        category_code: binding.category_code,
        started_at: startedAt,
      })
      .select('id')
      .single()

    if (runResult.error) {
      failedBindings += 1
      continue
    }

    try {
      const documents = await fetchBpsDocuments(parseBpsBinding(binding.external_identifier), apiKey)
      fetchedCount += documents.length

      const sourceRecordIds = documents.map((document) => document.sourceRecordId)
      const existingResult = sourceRecordIds.length
        ? await supabase
            .from('market_source_documents')
            .select('source_record_id')
            .eq('binding_id', binding.id)
            .in('source_record_id', sourceRecordIds)
        : { data: [], error: null }
      if (existingResult.error) throw new Error('BPS_EXISTING_READ_FAILED')

      const existingIds = new Set(existingResult.data?.map((document) => document.source_record_id))
      const fetchedAt = new Date().toISOString()
      const rows = documents
        .filter((document) => !existingIds.has(document.sourceRecordId))
        .map((document) => ({
          workspace_id: binding.workspace_id,
          product_id: binding.product_id,
          binding_id: binding.id,
          market_source_id: binding.market_source_id,
          category_code: binding.category_code,
          source_record_id: document.sourceRecordId,
          title: document.title,
          canonical_url: document.canonicalUrl,
          publisher_name: document.publisherName,
          published_at: document.publishedAt,
          fetched_at: fetchedAt,
          language_code: document.languageCode,
          country_code: binding.country_code ?? 'ID',
          raw_payload_sha256: document.rawPayloadSha256,
        }))

      if (rows.length) {
        const insertResult = await supabase.from('market_source_documents').insert(rows)
        if (insertResult.error) throw new Error('BPS_DOCUMENT_INSERT_FAILED')
      }

      acceptedCount += rows.length
      await supabase
        .from('market_source_sync_runs')
        .update({
          sync_outcome: 'succeeded',
          completed_at: new Date().toISOString(),
          fetched_count: documents.length,
          accepted_count: rows.length,
          error_code: null,
        })
        .eq('id', runResult.data.id)
    } catch (error) {
      failedBindings += 1
      await supabase
        .from('market_source_sync_runs')
        .update({
          sync_outcome: 'failed',
          completed_at: new Date().toISOString(),
          error_code: ingestionErrorCode(error),
        })
        .eq('id', runResult.data.id)
    }
  }

  return apiSuccess({
    acceptedCount,
    bindingCount: bindingsResult.data.length,
    failedBindings,
    fetchedCount,
  })
}

export async function GET(request: Request) {
  return ingest(request)
}

export async function POST(request: Request) {
  return ingest(request)
}
