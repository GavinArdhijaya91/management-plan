import { Edit, ReceiptText, SearchX, Trash2 } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import type { Transaction } from '@/types'

interface TransactionTableProps {
  transactions: Transaction[]
  hasTransactions: boolean
  onClearFilters: () => void
  onCreate: () => void
  onDelete: (id: number) => void
  onEdit: (transaction: Transaction) => void
}

function formatRupiah(value: number) {
  return `Rp ${Math.abs(value).toLocaleString('id-ID')}`
}

export function TransactionTable({ transactions, hasTransactions, onClearFilters, onCreate, onDelete, onEdit }: TransactionTableProps) {
  if (transactions.length === 0) {
    const Icon = hasTransactions ? SearchX : ReceiptText
    return (
      <section className="app-card px-5 py-14 text-center" aria-live="polite">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-zinc-100 text-zinc-500">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-serif text-xl font-semibold text-zinc-950">{hasTransactions ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi'}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
          {hasTransactions ? 'Coba ubah kata pencarian, tipe transaksi, atau periode yang dipilih.' : 'Tambahkan transaksi pertama untuk mulai membaca kondisi keuangan usaha.'}
        </p>
        <button type="button" onClick={hasTransactions ? onClearFilters : onCreate} className="app-button mt-5">
          {hasTransactions ? 'Bersihkan filter' : 'Tambah transaksi'}
        </button>
      </section>
    )
  }

  return (
    <section aria-label="Daftar transaksi" className="app-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-900 md:px-6">Tanggal</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 md:px-6">Tipe</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 md:px-6">Jumlah</th>
              <th className="hidden px-4 py-3 text-right font-semibold text-gray-900 md:table-cell md:px-6">Modal</th>
              <th className="hidden px-4 py-3 text-right font-semibold text-gray-900 md:table-cell md:px-6">Profit/Rugi</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900 md:px-6">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900 md:px-6">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-gray-200 transition-colors last:border-b-0 hover:bg-gray-50">
                <td className="px-4 py-4 text-gray-900 md:px-6">{transaction.date}</td>
                <td className="px-4 py-4 text-gray-900 md:px-6">{transaction.type}</td>
                <td className="px-4 py-4 text-right font-medium text-gray-900 md:px-6">
                  {transaction.amount > 0 ? '+' : ''}{formatRupiah(transaction.amount)}
                </td>
                <td className="hidden px-4 py-4 text-right text-gray-600 md:table-cell md:px-6">
                  {formatRupiah(transaction.modal)}
                </td>
                <td className="hidden px-4 py-4 text-right font-medium md:table-cell md:px-6">
                  <span className={transaction.profit > 0 ? 'text-zinc-950' : 'text-zinc-500'}>
                    {transaction.profit > 0 ? '+' : ''}{formatRupiah(transaction.profit)}
                  </span>
                </td>
                <td className="px-4 py-4 text-center md:px-6">
                  <StatusBadge status={transaction.status} label={transaction.status === 'untung' ? 'Untung' : 'Rugi'} monochrome />
                </td>
                <td className="px-4 py-4 md:px-6">
                  <div className="flex justify-center gap-2">
                    <button type="button" onClick={() => onEdit(transaction)} aria-label={`Edit transaksi ${transaction.date}`} className="rounded-lg p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950">
                      <Edit className="size-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => onDelete(transaction.id)} aria-label={`Hapus transaksi ${transaction.date}`} className="rounded-lg p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950">
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
