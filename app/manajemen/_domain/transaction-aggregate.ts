import type { DemoTransaction } from '@/types'

export type TransactionPeriodFilter = 'Bulan Ini' | 'Bulan Lalu' | '3 Bulan'
export type TransactionTypeFilter = 'all' | DemoTransaction['transactionType']
export type TransactionSortDirection = 'asc' | 'desc'
export type TransactionSortField = 'transactionDate' | 'amount' | 'costAmount' | 'netResult'

export interface TransactionDraft {
  amount: string
  costAmount: string
  transactionDate: string
  transactionType: DemoTransaction['transactionType']
}

export interface TransactionFilters {
  period: TransactionPeriodFilter
  search: string
  type: TransactionTypeFilter
}

export interface TransactionSummary {
  margin: number
  totalCostAmount: number
  totalNetResult: number
  totalSales: number
  transactionCount: number
}

export interface TransactionInsight {
  description: string
  title: string
  tone: 'positive' | 'warning' | 'neutral'
}

export interface TransactionPage {
  items: DemoTransaction[]
  page: number
  pageCount: number
  totalItems: number
}

export const emptyTransactionDraft: TransactionDraft = {
  amount: '',
  costAmount: '',
  transactionDate: '2026-07-22',
  transactionType: 'sale',
}

const monthNumber: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
}

function normalizedTransactionDate(value: unknown) {
  if (typeof value !== 'string') return null

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const date = new Date(`${value}T00:00:00Z`)
    if (
      date.getUTCFullYear() === Number(isoMatch[1]) &&
      date.getUTCMonth() + 1 === Number(isoMatch[2]) &&
      date.getUTCDate() === Number(isoMatch[3])
    ) {
      return value
    }
  }

  const legacyMatch = value.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/)
  if (!legacyMatch) return null

  const month = monthNumber[legacyMatch[2].toLowerCase()]
  const day = legacyMatch[1].padStart(2, '0')
  const normalized = month ? `${legacyMatch[3]}-${month}-${day}` : null
  return normalizedTransactionDate(normalized)
}

function finiteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function decodeTransaction(value: unknown): DemoTransaction | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const id = finiteNumber(record.id)
  const transactionDate = normalizedTransactionDate(record.transactionDate ?? record.date)
  const amount = finiteNumber(record.amount)

  if (id === null || !transactionDate || amount === null) return null

  const transactionType =
    record.transactionType === 'sale' || record.type === 'Penjualan'
      ? 'sale'
      : record.transactionType === 'expense' || record.type === 'Pengeluaran'
        ? 'expense'
        : null
  if (!transactionType) return null

  const costAmount = transactionType === 'expense' ? 0 : finiteNumber(record.costAmount ?? record.modal)
  const netResult = finiteNumber(record.netResult ?? record.profit)
  if (costAmount === null || netResult === null) return null

  return {
    id,
    transactionDate,
    transactionType,
    amount: Math.abs(amount),
    costAmount: Math.abs(costAmount),
    netResult,
    resultStatus: netResult >= 0 ? 'profit' : 'loss',
  }
}

export function decodeStoredTransactions(value: unknown) {
  if (!Array.isArray(value)) return null

  const decoded = value.map(decodeTransaction)
  if (decoded.some((transaction) => transaction === null)) return null
  return decoded as DemoTransaction[]
}

export function formatTransactionDate(transactionDate: string) {
  const normalized = normalizedTransactionDate(transactionDate)
  if (!normalized) return 'Tanggal tidak valid'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${normalized}T00:00:00Z`))
}

function transactionFromDraft(draft: TransactionDraft, id: number): DemoTransaction {
  const amount = Math.abs(Number(draft.amount))
  const costAmount = draft.transactionType === 'expense' ? 0 : Math.abs(Number(draft.costAmount))
  const netResult = draft.transactionType === 'expense' ? -amount : amount - costAmount

  return {
    id,
    transactionDate: draft.transactionDate,
    transactionType: draft.transactionType,
    amount,
    costAmount,
    netResult,
    resultStatus: netResult >= 0 ? 'profit' : 'loss',
  }
}

function dateValue(transactionDate: string) {
  const normalized = normalizedTransactionDate(transactionDate)
  return normalized ? new Date(`${normalized}T00:00:00Z`).getTime() : 0
}

function transactionTypeLabel(type: DemoTransaction['transactionType']) {
  return type === 'sale' ? 'penjualan' : 'pengeluaran'
}

export const transactionAggregate = {
  create(transactions: DemoTransaction[], draft: TransactionDraft, id: number) {
    return [transactionFromDraft(draft, id), ...transactions]
  },

  update(transactions: DemoTransaction[], id: number, draft: TransactionDraft) {
    const updated = transactionFromDraft(draft, id)
    return transactions.map((transaction) => (transaction.id === id ? updated : transaction))
  },

  remove(transactions: DemoTransaction[], id: number) {
    return transactions.filter((transaction) => transaction.id !== id)
  },

  reset(seed: DemoTransaction[]) {
    return seed.map((transaction) => ({ ...transaction }))
  },

  toDraft(transaction: DemoTransaction): TransactionDraft {
    return {
      amount: String(transaction.amount),
      costAmount: String(transaction.costAmount),
      transactionDate: transaction.transactionDate,
      transactionType: transaction.transactionType,
    }
  },

  filter(transactions: DemoTransaction[], filters: TransactionFilters) {
    const search = filters.search.trim().toLowerCase()

    return transactions.filter((transaction) => {
      const displayDate = formatTransactionDate(transaction.transactionDate).toLowerCase()
      const matchesSearch =
        transactionTypeLabel(transaction.transactionType).includes(search) || displayDate.includes(search)
      const matchesType = filters.type === 'all' || transaction.transactionType === filters.type
      const matchesPeriod =
        filters.period === '3 Bulan' ||
        (filters.period === 'Bulan Ini' && transaction.transactionDate.startsWith('2026-07')) ||
        (filters.period === 'Bulan Lalu' && transaction.transactionDate.startsWith('2026-06'))

      return matchesSearch && matchesType && matchesPeriod
    })
  },

  summarize(transactions: DemoTransaction[]): TransactionSummary {
    const totalCostAmount = transactions.reduce((sum, transaction) => sum + transaction.costAmount, 0)
    const totalSales = transactions
      .filter((transaction) => transaction.transactionType === 'sale')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const totalNetResult = transactions.reduce((sum, transaction) => sum + transaction.netResult, 0)

    return {
      margin: totalSales === 0 ? 0 : Math.round((totalNetResult / totalSales) * 100),
      totalCostAmount,
      totalNetResult,
      totalSales,
      transactionCount: transactions.length,
    }
  },

  sort(transactions: DemoTransaction[], field: TransactionSortField, direction: TransactionSortDirection) {
    const multiplier = direction === 'asc' ? 1 : -1
    return [...transactions].sort((left, right) => {
      const leftValue = field === 'transactionDate' ? dateValue(left.transactionDate) : left[field]
      const rightValue = field === 'transactionDate' ? dateValue(right.transactionDate) : right[field]
      return (leftValue - rightValue) * multiplier
    })
  },

  paginate(transactions: DemoTransaction[], page: number, pageSize: number): TransactionPage {
    const pageCount = Math.max(1, Math.ceil(transactions.length / pageSize))
    const safePage = Math.min(Math.max(page, 1), pageCount)
    const start = (safePage - 1) * pageSize

    return {
      items: transactions.slice(start, start + pageSize),
      page: safePage,
      pageCount,
      totalItems: transactions.length,
    }
  },

  insights(transactions: DemoTransaction[]): TransactionInsight[] {
    if (transactions.length === 0) return []
    const summary = this.summarize(transactions)
    const expenseTotal = transactions
      .filter((item) => item.transactionType === 'expense')
      .reduce((sum, item) => sum + item.amount, 0)
    const insights: TransactionInsight[] = []

    insights.push(
      summary.margin >= 25
        ? {
            title: 'Margin berada di jalur sehat',
            description: `Margin ${summary.margin}% memberi ruang untuk biaya operasional dan pertumbuhan.`,
            tone: 'positive',
          }
        : {
            title: 'Margin perlu diperhatikan',
            description: `Margin ${summary.margin}% masih tipis. Tinjau harga jual atau biaya pokok terbesar.`,
            tone: 'warning',
          },
    )

    if (expenseTotal > summary.totalNetResult && expenseTotal > 0) {
      insights.push({
        title: 'Pengeluaran cukup dominan',
        description:
          'Pengeluaran tercatat lebih besar daripada hasil bersih. Periksa biaya yang dapat dijadwalkan atau dikurangi.',
        tone: 'warning',
      })
    } else {
      insights.push({
        title: 'Arus biaya masih terkendali',
        description: 'Pengeluaran belum melampaui hasil bersih pada data yang tercatat.',
        tone: 'neutral',
      })
    }

    return insights
  },
}
