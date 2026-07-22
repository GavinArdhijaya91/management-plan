import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TransactionPaginationProps {
  page: number
  pageCount: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function TransactionPagination({ page, pageCount, totalItems, onPageChange }: TransactionPaginationProps) {
  if (totalItems === 0) return null
  return (
    <nav aria-label="Pagination transaksi" className="mt-4 flex items-center justify-between">
      <p className="font-mono text-xs text-zinc-500">
        {totalItems} transaksi · Halaman {page} dari {pageCount}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
          className="grid size-10 place-items-center rounded-xl border border-zinc-200 bg-white disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Halaman berikutnya"
          className="grid size-10 place-items-center rounded-xl border border-zinc-200 bg-white disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  )
}
