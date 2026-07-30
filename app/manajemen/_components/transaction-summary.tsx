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
    <section
      aria-label="Ringkasan transaksi"
      className="mb-6 grid overflow-hidden rounded-xl border border-zinc-200 bg-white md:grid-cols-3"
    >
      <div className="border-b border-zinc-200 p-4 md:border-b-0 md:border-r md:p-5">
        <p className="app-label">Total Biaya Pokok Bulan Ini</p>
        <p className="app-data mt-3 text-2xl font-semibold text-zinc-950">{formatRupiah(summary.totalCostAmount)}</p>
        <p className="mt-2 text-xs text-gray-500">Dari {summary.transactionCount} transaksi</p>
      </div>

      <div className="border-b border-zinc-200 p-4 md:border-b-0 md:border-r md:p-5">
        <p className="app-label">Total Penjualan</p>
        <p className="app-data mt-3 text-2xl font-semibold text-zinc-950">{formatRupiah(summary.totalSales)}</p>
        <p className="mt-2 text-xs text-gray-500">Akumulasi penjualan</p>
      </div>

      <div className="p-4 md:p-5">
        <p className="app-label">Margin Keuntungan</p>
        <p className="app-data mt-3 text-2xl font-semibold text-zinc-950">{summary.margin}%</p>
        <p className="mt-2 text-xs text-zinc-500">{formatRupiah(summary.totalNetResult)} hasil bersih</p>
      </div>
    </section>
  )
}
