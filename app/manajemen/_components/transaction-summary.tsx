import { transactionAggregate } from '@/app/manajemen/_domain/transaction-aggregate'
import type { DemoTransaction } from '@/types'

interface TransactionSummaryProps {
  transactions: DemoTransaction[]
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`
}

export function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const summary = transactionAggregate.summarize(transactions)

  return (
    <section aria-label="Ringkasan transaksi" className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="app-card p-4 md:p-6">
        <p className="app-label">Total Biaya Pokok Bulan Ini</p>
        <p className="app-data mt-2 text-2xl font-semibold text-zinc-950 md:text-3xl">
          {formatRupiah(summary.totalCostAmount)}
        </p>
        <p className="mt-2 text-xs text-gray-500">Dari {summary.transactionCount} transaksi</p>
      </div>

      <div className="app-card p-4 md:p-6">
        <p className="app-label">Total Penjualan</p>
        <p className="app-data mt-2 text-2xl font-semibold text-zinc-950 md:text-3xl">
          {formatRupiah(summary.totalSales)}
        </p>
        <p className="mt-2 text-xs text-gray-500">Akumulasi penjualan</p>
      </div>

      <div className="app-card bg-zinc-950 p-4 text-white md:p-6">
        <p className="app-label text-zinc-400">Margin Keuntungan</p>
        <p className="app-data mt-2 text-2xl font-semibold text-white md:text-3xl">{summary.margin}%</p>
        <p className="mt-2 text-xs text-zinc-400">{formatRupiah(summary.totalNetResult)} hasil bersih</p>
      </div>
    </section>
  )
}
