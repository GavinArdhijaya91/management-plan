import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { apiError, apiSuccess } from '@/app/api/_lib/http'
import { transactionExportRequestSchema } from '@/app/api/exports/transactions/request'
import type { TransactionExportRow } from '@/app/manajemen/_domain/transaction-export'
import { activeWorkspaceCookie } from '@/lib/workspace/context'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const requestOrigin = request.headers.get('origin')
  if (requestOrigin && requestOrigin !== request.nextUrl.origin) {
    return apiError('INVALID_ORIGIN', 'Permintaan ekspor berasal dari origin yang tidak diizinkan.', 403)
  }

  const parsed = transactionExportRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return apiError('INVALID_EXPORT_REQUEST', 'Format atau periode ekspor tidak valid.', 400)
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authenticationError,
  } = await supabase.auth.getUser()
  if (authenticationError || !user) {
    return apiError('AUTHENTICATION_REQUIRED', 'Silakan masuk kembali sebelum mengekspor data.', 401)
  }

  const [cookieStore, accessResult] = await Promise.all([cookies(), supabase.rpc('get_my_workspace_access')])
  if (accessResult.error) {
    return apiError('WORKSPACE_ACCESS_UNAVAILABLE', 'Akses workspace tidak dapat diverifikasi.', 503)
  }

  const memberships = (accessResult.data ?? []).filter((membership) => membership.membership_status === 'active')
  const selectedWorkspaceId = cookieStore.get(activeWorkspaceCookie)?.value
  const workspace =
    memberships.find((membership) => membership.workspace_id === selectedWorkspaceId) ??
    (memberships.length === 1 ? memberships[0] : null)

  if (!workspace) {
    return apiError('ACTIVE_WORKSPACE_REQUIRED', 'Pilih workspace sebelum mengekspor data.', 409)
  }
  if (!workspace.permission_codes.includes('transaction.export')) {
    return apiError('EXPORT_PERMISSION_REQUIRED', 'Role Anda tidak memiliki izin ekspor transaksi.', 403)
  }

  const { data, error } = await supabase.rpc('prepare_transaction_export', {
    target_workspace_id: workspace.workspace_id,
    target_format: parsed.data.format,
    period_start: parsed.data.periodStart ?? undefined,
    period_end: parsed.data.periodEnd ?? undefined,
  })
  if (error) {
    const tooLarge = error.code === '54000'
    return apiError(
      tooLarge ? 'EXPORT_TOO_LARGE' : 'EXPORT_PREPARATION_FAILED',
      tooLarge
        ? 'Ekspor sinkron dibatasi hingga 10.000 transaksi. Persempit periode laporan.'
        : 'Data transaksi privat gagal disiapkan.',
      tooLarge ? 413 : 500,
    )
  }

  const rows: TransactionExportRow[] = (data ?? []).map((row) => ({
    accountName: row.financial_account_name,
    amount: Number(row.amount),
    costAmount: Number(row.cost_amount),
    currencyCode: row.currency_code,
    date: row.transaction_date,
    netResult: Number(row.net_result),
    note: row.note ?? '',
    result: Number(row.net_result) >= 0 ? 'Laba' : 'Rugi',
    type: row.transaction_type === 'sale' ? 'Penjualan' : 'Pengeluaran',
  }))

  return apiSuccess({
    rows,
    workspaceName: workspace.workspace_name,
  })
}
