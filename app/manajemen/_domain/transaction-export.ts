import type { DemoTransaction } from '@/types'
import { transactionAggregate } from './transaction-aggregate'

export type TransactionExportFormat = 'xlsx' | 'pdf' | 'docx'

export interface TransactionExportRow {
  amount: number
  costAmount: number
  date: string
  netResult: number
  result: string
  type: string
}

export interface TransactionExportReport {
  currency: 'IDR'
  generatedAt: string
  rows: TransactionExportRow[]
  summary: ReturnType<typeof transactionAggregate.summarize>
  title: string
}

export function spreadsheetSafeText(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value
}

export function createTransactionExportReport(
  transactions: DemoTransaction[],
  generatedAt = new Date(),
): TransactionExportReport {
  return {
    currency: 'IDR',
    generatedAt: generatedAt.toISOString(),
    title: 'Laporan Transaksi Siapin',
    summary: transactionAggregate.summarize(transactions),
    rows: transactions.map((transaction) => ({
      date: transaction.transactionDate,
      type: transaction.transactionType === 'sale' ? 'Penjualan' : 'Pengeluaran',
      amount: transaction.amount,
      costAmount: transaction.costAmount,
      netResult: transaction.netResult,
      result: transaction.resultStatus === 'profit' ? 'Laba' : 'Rugi',
    })),
  }
}

export function transactionExportFileName(format: TransactionExportFormat, generatedAt: Date) {
  const date = generatedAt.toISOString().slice(0, 10)
  return `siapin-transaksi-${date}.${format}`
}
