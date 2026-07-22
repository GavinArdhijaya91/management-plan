import type { Transaction } from '@/types'

export type TransactionPeriodFilter = 'Bulan Ini' | 'Bulan Lalu' | '3 Bulan'
export type TransactionTypeFilter = 'Semua' | Transaction['type']
export type TransactionSortDirection = 'asc' | 'desc'
export type TransactionSortField = 'date' | 'amount' | 'modal' | 'profit'

export interface TransactionDraft {
  amount: string
  date: string
  modal: string
  type: Transaction['type']
}

export interface TransactionFilters {
  period: TransactionPeriodFilter
  search: string
  type: TransactionTypeFilter
}

export interface TransactionSummary {
  margin: number
  totalModal: number
  totalProfit: number
  totalSales: number
  transactionCount: number
}

export interface TransactionInsight {
  description: string
  title: string
  tone: 'positive' | 'warning' | 'neutral'
}

export interface TransactionPage {
  items: Transaction[]
  page: number
  pageCount: number
  totalItems: number
}

export const emptyTransactionDraft: TransactionDraft = {
  amount: '',
  date: '2026-07-22',
  modal: '',
  type: 'Penjualan',
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function transactionFromDraft(draft: TransactionDraft, id: number): Transaction {
  const amount = Number(draft.amount)
  const modal = Number(draft.modal)
  const signedAmount = draft.type === 'Pengeluaran' ? -Math.abs(amount) : Math.abs(amount)
  const profit = draft.type === 'Pengeluaran' ? -Math.abs(amount) : amount - modal

  return {
    id,
    date: formatDate(draft.date),
    type: draft.type,
    amount: signedAmount,
    modal,
    profit,
    status: profit >= 0 ? 'untung' : 'rugi',
  }
}

function dateValue(date: string) {
  const months: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    Mei: 4,
    Jun: 5,
    Jul: 6,
    Agu: 7,
    Sep: 8,
    Okt: 9,
    Nov: 10,
    Des: 11,
  }
  const [day, month, year] = date.split(' ')
  return new Date(Number(year), months[month] ?? 0, Number(day)).getTime()
}

export const transactionAggregate = {
  create(transactions: Transaction[], draft: TransactionDraft, id: number) {
    return [transactionFromDraft(draft, id), ...transactions]
  },

  update(transactions: Transaction[], id: number, draft: TransactionDraft) {
    const updated = transactionFromDraft(draft, id)
    return transactions.map((transaction) => (transaction.id === id ? updated : transaction))
  },

  remove(transactions: Transaction[], id: number) {
    return transactions.filter((transaction) => transaction.id !== id)
  },

  reset(seed: Transaction[]) {
    return seed.map((transaction) => ({ ...transaction }))
  },

  toDraft(transaction: Transaction): TransactionDraft {
    const date = new Date(dateValue(transaction.date))
    const isoDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')

    return {
      amount: String(Math.abs(transaction.amount)),
      date: isoDate,
      modal: String(transaction.modal),
      type: transaction.type,
    }
  },

  filter(transactions: Transaction[], filters: TransactionFilters) {
    const search = filters.search.trim().toLowerCase()

    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.type.toLowerCase().includes(search) || transaction.date.toLowerCase().includes(search)
      const matchesType = filters.type === 'Semua' || transaction.type === filters.type
      const matchesPeriod =
        filters.period === '3 Bulan' ||
        (filters.period === 'Bulan Ini' && transaction.date.includes('Jul 2026')) ||
        (filters.period === 'Bulan Lalu' && transaction.date.includes('Jun 2026'))

      return matchesSearch && matchesType && matchesPeriod
    })
  },

  summarize(transactions: Transaction[]): TransactionSummary {
    const totalModal = transactions.reduce((sum, transaction) => sum + transaction.modal, 0)
    const totalSales = transactions
      .filter((transaction) => transaction.type === 'Penjualan')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const totalProfit = transactions.reduce((sum, transaction) => sum + transaction.profit, 0)

    return {
      margin: totalSales === 0 ? 0 : Math.round((totalProfit / totalSales) * 100),
      totalModal,
      totalProfit,
      totalSales,
      transactionCount: transactions.length,
    }
  },

  sort(transactions: Transaction[], field: TransactionSortField, direction: TransactionSortDirection) {
    const multiplier = direction === 'asc' ? 1 : -1
    return [...transactions].sort((left, right) => {
      const leftValue = field === 'date' ? dateValue(left.date) : left[field]
      const rightValue = field === 'date' ? dateValue(right.date) : right[field]
      return (leftValue - rightValue) * multiplier
    })
  },

  paginate(transactions: Transaction[], page: number, pageSize: number): TransactionPage {
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

  insights(transactions: Transaction[]): TransactionInsight[] {
    if (transactions.length === 0) return []
    const summary = this.summarize(transactions)
    const expenseTotal = transactions
      .filter((item) => item.type === 'Pengeluaran')
      .reduce((sum, item) => sum + Math.abs(item.amount), 0)
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
            description: `Margin ${summary.margin}% masih tipis. Tinjau harga jual atau biaya modal terbesar.`,
            tone: 'warning',
          },
    )

    if (expenseTotal > summary.totalProfit && expenseTotal > 0) {
      insights.push({
        title: 'Pengeluaran cukup dominan',
        description:
          'Pengeluaran tercatat lebih besar daripada profit bersih. Periksa biaya yang dapat dijadwalkan atau dikurangi.',
        tone: 'warning',
      })
    } else {
      insights.push({
        title: 'Arus biaya masih terkendali',
        description: 'Pengeluaran belum melampaui profit bersih pada data yang tercatat.',
        tone: 'neutral',
      })
    }

    return insights
  },
}
