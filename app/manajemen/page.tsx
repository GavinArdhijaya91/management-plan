'use client'

import { Header } from '@/components/header'
import { Plus, RotateCcw } from 'lucide-react'
import { Modal } from '@/app/_components/modal'
import { TransactionSummary } from '@/app/manajemen/_components/transaction-summary'
import { TransactionFilters } from '@/app/manajemen/_components/transaction-filters'
import { useTransactionOrchestrator } from '@/app/manajemen/_hooks/use-transaction-orchestrator'
import { TransactionTable } from '@/app/manajemen/_components/transaction-table'
import { TransactionForm } from '@/app/manajemen/_components/transaction-form'
import { ConfirmationDialog } from '@/app/manajemen/_components/confirmation-dialog'
import { TransactionToast } from '@/app/manajemen/_components/transaction-toast'
import { TransactionPagination } from '@/app/manajemen/_components/transaction-pagination'
import { TransactionInsights } from '@/app/manajemen/_components/transaction-insights'

export default function ManajemenPage() {
  const {
    editingId,
    deleteId,
    formInitialValues,
    hasTransactions,
    modalOpen,
    page,
    pageCount,
    paginatedTransactions,
    periodFilter,
    resetOpen,
    searchTerm,
    sortDirection,
    sortField,
    toastMessage,
    totalFilteredTransactions,
    transactions,
    typeFilter,
    clearFilters,
    closeModal,
    confirmDelete,
    confirmReset,
    openCreate,
    openEdit,
    saveTransaction,
    setDeleteId,
    setPage,
    setPeriodFilter,
    setResetOpen,
    setSearchTerm,
    setSortDirection,
    setSortField,
    setToastMessage,
    setTypeFilter,
  } = useTransactionOrchestrator()

  return (
    <main className="app-shell">
      <Header variant="monochrome" />

      <div className="page-shell">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="app-heading">Manajemen transaksi & penjualan</h1>
            <p className="mt-2 text-zinc-500">Kelola transaksi, biaya pokok, dan hasil bersih usaha Anda.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium hover:bg-zinc-50"
            >
              <RotateCcw className="size-4" />
              Reset Demo
            </button>
            <button onClick={openCreate} className="app-button w-full md:w-auto">
              <Plus className="size-5" />
              Tambah Transaksi
            </button>
          </div>
        </div>

        <TransactionSummary transactions={transactions} />
        <TransactionInsights transactions={transactions} />

        <TransactionFilters
          periodFilter={periodFilter}
          searchTerm={searchTerm}
          sortDirection={sortDirection}
          sortField={sortField}
          typeFilter={typeFilter}
          onPeriodFilterChange={setPeriodFilter}
          onSearchTermChange={setSearchTerm}
          onSortDirectionChange={setSortDirection}
          onSortFieldChange={setSortField}
          onTypeFilterChange={setTypeFilter}
        />

        <TransactionTable
          transactions={paginatedTransactions}
          hasTransactions={hasTransactions}
          onClearFilters={clearFilters}
          onCreate={openCreate}
          onDelete={setDeleteId}
          onEdit={openEdit}
        />
        <TransactionPagination
          page={page}
          pageCount={pageCount}
          totalItems={totalFilteredTransactions}
          onPageChange={setPage}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit transaksi' : 'Tambah transaksi'}
        description="Data akan disimpan otomatis di perangkat ini."
      >
        <TransactionForm
          key={`${editingId ?? 'new'}-${modalOpen}`}
          initialValues={formInitialValues}
          submitLabel={editingId === null ? 'Tambah transaksi' : 'Simpan perubahan'}
          onCancel={closeModal}
          onSubmit={saveTransaction}
        />
      </Modal>

      <ConfirmationDialog
        open={deleteId !== null}
        title="Hapus transaksi?"
        description="Transaksi yang dihapus tidak dapat dikembalikan, kecuali dengan mereset seluruh data demo."
        confirmLabel="Hapus transaksi"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
      <ConfirmationDialog
        open={resetOpen}
        title="Kembalikan data demo?"
        description="Semua transaksi buatan dan perubahan Anda akan diganti dengan data contoh awal."
        confirmLabel="Reset data demo"
        onCancel={() => setResetOpen(false)}
        onConfirm={confirmReset}
      />
      <TransactionToast message={toastMessage} onClose={() => setToastMessage(null)} />
    </main>
  )
}
