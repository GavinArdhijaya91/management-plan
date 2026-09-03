import type { DemoTransaction } from '@/types'

export type TransactionExportFormat = 'xlsx' | 'pdf' | 'docx'

export interface TransactionExportRow {
  accountName: string
  amount: number
  costAmount: number
  currencyCode: string
  date: string
  netResult: number
  note: string
  result: string
  type: string
}

export interface TransactionExportSummary {
  currencyCode: string
  margin: number
  totalCostAmount: number
  totalNetResult: number
  totalSales: number
  transactionCount: number
}

export interface TransactionExportReport {
  generatedAt: string
  rows: TransactionExportRow[]
  summaries: TransactionExportSummary[]
  title: string
}

export function spreadsheetSafeText(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value
}

function sumCurrencyValues(values: number[]) {
  const totalMinorUnits = values.reduce((sum, value) => sum + Math.round(value * 100), 0)
  return totalMinorUnits / 100
}

function summarizeExportRows(rows: TransactionExportRow[]) {
  const currencyCodes = [...new Set(rows.map((row) => row.currencyCode))].sort()
  return currencyCodes.map((currencyCode) => {
    const currencyRows = rows.filter((row) => row.currencyCode === currencyCode)
    const totalSales = sumCurrencyValues(
      currencyRows.filter((row) => row.type === 'Penjualan').map((row) => row.amount),
    )
    const totalCostAmount = sumCurrencyValues(currencyRows.map((row) => row.costAmount))
    const totalNetResult = sumCurrencyValues(currencyRows.map((row) => row.netResult))

    return {
      currencyCode,
      totalSales,
      totalCostAmount,
      totalNetResult,
      transactionCount: currencyRows.length,
      margin: totalSales === 0 ? 0 : Math.round((totalNetResult / totalSales) * 100),
    }
  })
}

export function createTransactionExportReport(
  rows: TransactionExportRow[],
  generatedAt = new Date(),
  title = 'Laporan Transaksi Siapin',
): TransactionExportReport {
  return {
    generatedAt: generatedAt.toISOString(),
    title,
    rows,
    summaries: summarizeExportRows(rows),
  }
}

export function createDemoTransactionExportReport(transactions: DemoTransaction[], generatedAt = new Date()) {
  return createTransactionExportReport(
    transactions.map((transaction) => ({
      accountName: 'Data demo perangkat',
      date: transaction.transactionDate,
      type: transaction.transactionType === 'sale' ? 'Penjualan' : 'Pengeluaran',
      amount: transaction.amount,
      costAmount: transaction.costAmount,
      netResult: transaction.netResult,
      currencyCode: 'IDR',
      note: '',
      result: transaction.resultStatus === 'profit' ? 'Laba' : 'Rugi',
    })),
    generatedAt,
    'Laporan Transaksi Demo Siapin',
  )
}

export function transactionExportFileName(format: TransactionExportFormat, generatedAt: Date) {
  const date = generatedAt.toISOString().slice(0, 10)
  return `siapin-transaksi-${date}.${format}`
}
