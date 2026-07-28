import { describe, expect, it } from 'vitest'
import { createTransactionExportReport, spreadsheetSafeText, transactionExportFileName } from './transaction-export'

describe('transaction export contract', () => {
  it('creates a stable report with calculated summary', () => {
    const report = createTransactionExportReport(
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
      {
        date: '2026-07-28',
        type: 'Penjualan',
        amount: 150_000,
        costAmount: 90_000,
        netResult: 60_000,
        result: 'Laba',
      },
    ])
    expect(report.summary.totalNetResult).toBe(60_000)
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
