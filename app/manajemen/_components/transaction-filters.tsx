import { Search } from 'lucide-react'
import type {
  TransactionPeriodFilter,
  TransactionSortDirection,
  TransactionSortField,
  TransactionTypeFilter,
} from '@/app/manajemen/_domain/transaction-aggregate'

interface TransactionFiltersProps {
  periodFilter: TransactionPeriodFilter
  searchTerm: string
  sortDirection: TransactionSortDirection
  sortField: TransactionSortField
  typeFilter: TransactionTypeFilter
  onPeriodFilterChange: (value: TransactionPeriodFilter) => void
  onSearchTermChange: (value: string) => void
  onSortDirectionChange: (value: TransactionSortDirection) => void
  onSortFieldChange: (value: TransactionSortField) => void
  onTypeFilterChange: (value: TransactionTypeFilter) => void
}

export function TransactionFilters({
  periodFilter,
  searchTerm,
  sortDirection,
  sortField,
  typeFilter,
  onPeriodFilterChange,
  onSearchTermChange,
  onSortDirectionChange,
  onSortFieldChange,
  onTypeFilterChange,
}: TransactionFiltersProps) {
  return (
    <section aria-label="Filter transaksi" className="app-card mb-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 size-5 text-gray-400" aria-hidden="true" />
          <input
            aria-label="Cari transaksi"
            type="search"
            placeholder="Cari transaksi..."
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            className="app-input w-full pl-10"
          />
        </div>

        <select
          aria-label="Filter tipe transaksi"
          value={typeFilter}
          onChange={(event) => onTypeFilterChange(event.target.value as TransactionTypeFilter)}
          className="app-input"
        >
          <option value="all">Semua Tipe</option>
          <option value="sale">Penjualan</option>
          <option value="expense">Pengeluaran</option>
        </select>

        <select
          aria-label="Filter periode transaksi"
          value={periodFilter}
          onChange={(event) => onPeriodFilterChange(event.target.value as TransactionPeriodFilter)}
          className="app-input"
        >
          <option value="Bulan Ini">Bulan Ini</option>
          <option value="Bulan Lalu">Bulan Lalu</option>
          <option value="3 Bulan">3 Bulan Terakhir</option>
        </select>

        <select
          aria-label="Urutkan transaksi"
          value={sortField}
          onChange={(event) => onSortFieldChange(event.target.value as TransactionSortField)}
          className="app-input"
        >
          <option value="transactionDate">Urutkan: Tanggal</option>
          <option value="amount">Jumlah</option>
          <option value="costAmount">Biaya Pokok</option>
          <option value="netResult">Hasil Bersih</option>
        </select>
        <select
          aria-label="Arah urutan"
          value={sortDirection}
          onChange={(event) => onSortDirectionChange(event.target.value as TransactionSortDirection)}
          className="app-input"
        >
          <option value="desc">Terbesar/Terbaru</option>
          <option value="asc">Terkecil/Terlama</option>
        </select>
      </div>
    </section>
  )
}
