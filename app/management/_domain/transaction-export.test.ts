import { describe, expect, it } from 'vitest'
import {
  createDemoTransactionExportReport,
  createTransactionExportReport,
  spreadsheetSafeText,
  transactionExportFileName,
} from './transaction-export'

describe('transaction export contract', () => {
  it('creates a stable report with calculated summary', () => {
    const report = createDemoTransactionExportReport(
      [
        {
          id: 1,
          transactionDate: '2026-07-28',
          transactionType: 'sale',
          amount: 150_000,
          costAmount: 90_000,
          netResult: 60_000,
          resultStatus: 'profit',
        },
      ],
      new Date('2026-07-28T12:00:00.000Z'),
    )

    expect(report.generatedAt).toBe('2026-07-28T12:00:00.000Z')
    expect(report.rows).toEqual([
      expect.objectContaining({
        date: '2026-07-28',
        type: 'Penjualan',
        amount: 150_000,
        costAmount: 90_000,
        netResult: 60_000,
        result: 'Laba',
        currencyCode: 'IDR',
      }),
    ])
    expect(report.summaries).toEqual([expect.objectContaining({ currencyCode: 'IDR', totalNetResult: 60_000 })])
  })

  it('never aggregates different currencies into one summary', () => {
    const report = createTransactionExportReport([
      {
        accountName: 'IDR account',
        amount: 100,
        costAmount: 20,
        currencyCode: 'IDR',
        date: '2026-07-28',
        netResult: 80,
        note: '',
        result: 'Laba',
        type: 'Penjualan',
      },
      {
        accountName: 'USD account',
        amount: 10,
        costAmount: 2,
        currencyCode: 'USD',
        date: '2026-07-28',
        netResult: 8,
        note: '',
        result: 'Laba',
        type: 'Penjualan',
      },
    ])

    expect(report.summaries.map(({ currencyCode, totalSales }) => ({ currencyCode, totalSales }))).toEqual([
      { currencyCode: 'IDR', totalSales: 100 },
      { currencyCode: 'USD', totalSales: 10 },
    ])
  })

  it('sums decimal currency values without binary floating-point residue', () => {
    const report = createTransactionExportReport([
      {
        accountName: 'Cash',
        amount: 0.1,
        costAmount: 0,
        currencyCode: 'USD',
        date: '2026-07-28',
        netResult: 0.1,
        note: '',
        result: 'Laba',
        type: 'Penjualan',
      },
      {
        accountName: 'Cash',
        amount: 0.2,
        costAmount: 0,
        currencyCode: 'USD',
        date: '2026-07-28',
        netResult: 0.2,
        note: '',
        result: 'Laba',
        type: 'Penjualan',
      },
    ])

    expect(report.summaries[0]).toEqual(
      expect.objectContaining({
        totalSales: 0.3,
        totalNetResult: 0.3,
      }),
    )
  })

  it.each(['=1+1', '+SUM(A1:A2)', '-1+1', '@cmd'])('neutralizes spreadsheet formula input: %s', (value) => {
    expect(spreadsheetSafeText(value)).toBe(`'${value}`)
  })

  it('keeps ordinary spreadsheet text unchanged', () => {
    expect(spreadsheetSafeText('Penjualan')).toBe('Penjualan')
  })

  it('uses a predictable extension-specific file name', () => {
    expect(transactionExportFileName('xlsx', new Date('2026-07-28T12:00:00.000Z'))).toBe(
      'siapin-transaksi-2026-07-28.xlsx',
    )
  })
})
