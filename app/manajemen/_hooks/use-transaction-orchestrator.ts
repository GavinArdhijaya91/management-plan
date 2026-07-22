'use client'

import { useLocalStorage } from '@/app/_lib/use-local-storage'
import {
  emptyTransactionDraft,
  transactionAggregate,
  type TransactionDraft,
  type TransactionPeriodFilter,
  type TransactionSortDirection,
  type TransactionSortField,
  type TransactionTypeFilter,
} from '@/app/manajemen/_domain/transaction-aggregate'
import { transactions as initialTransactions } from '@/data/transactions'
import type { Transaction } from '@/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const PAGE_SIZE = 20

export function useTransactionOrchestrator() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('siapin:transactions', initialTransactions)
  const [searchTerm, setSearchTermState] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [typeFilter, setTypeFilterState] = useState<TransactionTypeFilter>('Semua')
  const [periodFilter, setPeriodFilterState] = useState<TransactionPeriodFilter>('3 Bulan')
  const [sortField, setSortFieldState] = useState<TransactionSortField>('date')
  const [sortDirection, setSortDirectionState] = useState<TransactionSortDirection>('desc')
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formInitialValues, setFormInitialValues] = useState<TransactionDraft>({ ...emptyTransactionDraft })
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedSearchTerm(searchTerm); setPage(1) }, 400)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current) }, [])

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 3500)
  }, [])

  const filteredTransactions = useMemo(
    () => transactionAggregate.filter(transactions, { search: debouncedSearchTerm, type: typeFilter, period: periodFilter }),
    [debouncedSearchTerm, periodFilter, transactions, typeFilter],
  )
  const sortedTransactions = useMemo(
    () => transactionAggregate.sort(filteredTransactions, sortField, sortDirection),
    [filteredTransactions, sortDirection, sortField],
  )
  const transactionPage = useMemo(
    () => transactionAggregate.paginate(sortedTransactions, page, PAGE_SIZE),
    [page, sortedTransactions],
  )

  const setTypeFilter = (value: TransactionTypeFilter) => { setTypeFilterState(value); setPage(1) }
  const setPeriodFilter = (value: TransactionPeriodFilter) => { setPeriodFilterState(value); setPage(1) }
  const setSortField = (value: TransactionSortField) => { setSortFieldState(value); setPage(1) }
  const setSortDirection = (value: TransactionSortDirection) => { setSortDirectionState(value); setPage(1) }

  const clearFilters = () => {
    setSearchTermState('')
    setDebouncedSearchTerm('')
    setTypeFilterState('Semua')
    setPeriodFilterState('3 Bulan')
    setPage(1)
  }

  const openCreate = () => {
    setEditingId(null)
    setFormInitialValues({ ...emptyTransactionDraft })
    setModalOpen(true)
  }

  const openEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setFormInitialValues(transactionAggregate.toDraft(transaction))
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const saveTransaction = (draft: TransactionDraft) => {
    setTransactions((current) => editingId === null
      ? transactionAggregate.create(current, draft, Date.now())
      : transactionAggregate.update(current, editingId, draft))
    showToast(editingId === null ? 'Transaksi berhasil ditambahkan.' : 'Transaksi berhasil diperbarui.')
    closeModal()
  }

  const confirmDelete = () => {
    if (deleteId === null) return
    setTransactions((current) => transactionAggregate.remove(current, deleteId))
    setDeleteId(null)
    showToast('Transaksi berhasil dihapus.')
  }

  const confirmReset = () => {
    setTransactions(transactionAggregate.reset(initialTransactions))
    clearFilters()
    setResetOpen(false)
    showToast('Data demo berhasil dikembalikan.')
  }

  return {
    deleteId,
    editingId,
    formInitialValues,
    hasTransactions: transactions.length > 0,
    modalOpen,
    page: transactionPage.page,
    pageCount: transactionPage.pageCount,
    paginatedTransactions: transactionPage.items,
    periodFilter,
    resetOpen,
    searchTerm,
    sortDirection,
    sortField,
    toastMessage,
    totalFilteredTransactions: transactionPage.totalItems,
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
    setSearchTerm: setSearchTermState,
    setSortDirection,
    setSortField,
    setToastMessage,
    setTypeFilter,
  }
}
