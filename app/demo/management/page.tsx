'use client'

import { Header } from '@/components/header'
import { Download, Plus, RotateCcw } from 'lucide-react'
import { Modal } from '@/app/_components/modal'
import { TransactionSummary } from '@/app/management/_components/transaction-summary'
import { TransactionFilters } from '@/app/management/_components/transaction-filters'
import { useTransactionOrchestrator } from '@/app/management/_hooks/use-transaction-orchestrator'
import { TransactionTable } from '@/app/management/_components/transaction-table'
import { TransactionForm } from '@/app/management/_components/transaction-form'
import { ConfirmationDialog } from '@/app/management/_components/confirmation-dialog'
import { TransactionToast } from '@/app/management/_components/transaction-toast'
import { TransactionPagination } from '@/app/management/_components/transaction-pagination'
import { TransactionInsights } from '@/app/management/_components/transaction-insights'
import { TransactionExportDialog } from '@/app/management/_components/transaction-export-dialog'
import { useState } from 'react'
import { useLanguage } from '@/app/_i18n/language-provider'
import { managementCopy } from '@/app/_i18n/pages/management'

export default function ManajemenPage() {
  const { locale } = useLanguage()
  const copy = managementCopy[locale]
  const [exportOpen, setExportOpen] = useState(false)
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
      <Header mode="demo" />

      <div className="page-shell motion-page-enter">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="app-heading">{copy.title}</h1>
            <p className="mt-2 text-zinc-500">{copy.description}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setExportOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium hover:bg-zinc-50"
            >
              <Download className="size-4" />
              {copy.exportLabel}
            </button>
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium hover:bg-zinc-50"
            >
              <RotateCcw className="size-4" />
              {copy.resetLabel}
            </button>
            <button onClick={openCreate} className="app-button w-full md:w-auto">
              <Plus className="size-5" />
              {copy.addTransaction}
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
        title={editingId ? copy.modalEditTitle : copy.modalAddTitle}
        description={copy.modalDescription}
      >
        <TransactionForm
          key={`${editingId ?? 'new'}-${modalOpen}`}
          initialValues={formInitialValues}
          submitLabel={editingId === null ? copy.submitAdd : copy.submitEdit}
          onCancel={closeModal}
          onSubmit={saveTransaction}
        />
      </Modal>

      <ConfirmationDialog
        open={deleteId !== null}
        title={copy.deleteTitle}
        description={copy.deleteDescription}
        confirmLabel={copy.deleteConfirm}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
      <ConfirmationDialog
        open={resetOpen}
        title={copy.resetTitle}
        description={copy.resetDescription}
        confirmLabel={copy.resetConfirm}
        onCancel={() => setResetOpen(false)}
        onConfirm={confirmReset}
      />
      <TransactionExportDialog
        mode="demo"
        open={exportOpen}
        transactions={transactions}
        onClose={() => setExportOpen(false)}
        onSuccess={setToastMessage}
      />
      <TransactionToast message={toastMessage} onClose={() => setToastMessage(null)} />
    </main>
  )
}
