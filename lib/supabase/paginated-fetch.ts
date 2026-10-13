import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * PostgREST `max_rows` (lokal 50, hosted default 1000) memotong respons
 * diam-diam tanpa error. Helper ini mengambil daftar per halaman sampai
 * habis sehingga ekspor/laporan tidak pernah kehilangan baris (B1).
 */
export async function fetchAllPages<T>(
  build: (
    from: number,
    to: number,
  ) => {
    range: (from: number, to: number) => any
  },
  pageSize = 200,
): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await build(from, from + pageSize - 1).range(from, from + pageSize - 1)
    if (error) throw new Error(`Paginated fetch failed: ${error.message}`)
    const page = (data ?? []) as T[]
    rows.push(...page)
    if (page.length < pageSize) return rows
  }
}

export const EXPORT_PAGE_SIZE = 500

/**
 * Mengambil seluruh baris ekspor transaksi lewat RPC ber-paginasi
 * `prepare_transaction_export_page`. Melempar bila jumlah baris yang
 * diterima tidak cocok dengan total dari database.
 */
export async function fetchFullTransactionExport(
  supabase: SupabaseClient<any>,
  args: {
    target_workspace_id: string
    target_format: string
    period_start?: string
    period_end?: string
  },
): Promise<any[]> {
  const all: unknown[] = []

  let expectedTotal: number | null = null
  for (let offset = 0; ; offset += EXPORT_PAGE_SIZE) {
    const { data, error } = await supabase.rpc('prepare_transaction_export_page', {
      ...args,
      result_offset: offset,
      result_limit: EXPORT_PAGE_SIZE,
    })
    if (error) throw error
    const page = (data?.rows ?? []) as unknown[]
    if (expectedTotal === null) expectedTotal = Number(data?.total_count ?? page.length)
    all.push(...page)
    if (page.length < EXPORT_PAGE_SIZE) break
  }
  if (expectedTotal !== null && all.length !== expectedTotal) {
    throw new Error(`EXPORT_ROW_COUNT_MISMATCH: expected ${expectedTotal} rows but received ${all.length}.`)
  }

  return all as any[]
}
