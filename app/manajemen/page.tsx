import { PrivateTransactionExportButton } from '@/app/manajemen/_components/private-transaction-export-button'
import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { requireActiveWorkspace } from '@/lib/workspace/context'

function formatWorkspaceAmount(value: number, currencyCode: string | null) {
  if (!currencyCode) return new Intl.NumberFormat('id-ID').format(value)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: currencyCode }).format(value)
}

export default async function ManagementPage() {
  const workspace = await requireActiveWorkspace('/manajemen')
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transaction_financial_results')
    .select('transaction_id,transaction_type,transaction_date,amount,cost_amount,net_result,currency_code')
    .eq('workspace_id', workspace.workspace_id)
    .order('transaction_date', { ascending: false })
    .limit(100)

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="app-label mb-3">Workspace · {workspace.workspace_name}</p>
            <h1 className="app-heading">Manajemen transaksi</h1>
            <p className="mt-2 text-zinc-500">Data pada halaman ini berasal dari database workspace privat.</p>
          </div>
          <PrivateTransactionExportButton />
        </div>

        {error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Transaksi gagal dimuat. Periksa permission role atau coba kembali.
          </p>
        ) : data?.length ? (
          <div className="app-card mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">Jenis</th>
                  <th className="px-5 py-4">Nominal</th>
                  <th className="px-5 py-4">Biaya pokok</th>
                  <th className="px-5 py-4">Hasil bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.map((transaction) => {
                  return (
                    <tr key={transaction.transaction_id}>
                      <td className="px-5 py-4">{transaction.transaction_date}</td>
                      <td className="px-5 py-4">
                        {transaction.transaction_type === 'sale' ? 'Penjualan' : 'Pengeluaran'}
                      </td>
                      <td className="app-data px-5 py-4">
                        {formatWorkspaceAmount(Number(transaction.amount), transaction.currency_code)}
                      </td>
                      <td className="app-data px-5 py-4">
                        {formatWorkspaceAmount(Number(transaction.cost_amount), transaction.currency_code)}
                      </td>
                      <td className="app-data px-5 py-4 font-semibold">
                        {formatWorkspaceAmount(Number(transaction.net_result), transaction.currency_code)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <section className="app-card mt-6 p-8 text-center">
            <h2 className="font-serif text-2xl font-semibold">Belum ada transaksi privat</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Workspace ini masih kosong. Data demo hanya tersedia melalui tombol Buka Demo pada halaman utama.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
