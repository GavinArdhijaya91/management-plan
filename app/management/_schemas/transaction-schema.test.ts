import { describe, expect, it } from 'vitest'
import { transactionSchema } from './transaction-schema'

describe('transactionSchema', () => {
  it('menerima transaksi penjualan yang valid', () => {
    expect(
      transactionSchema.safeParse({
        transactionDate: '2026-07-22',
        transactionType: 'sale',
        amount: '200000',
        costAmount: '120000',
      }).success,
    ).toBe(true)
  })

  it('menolak jumlah nol dan tanggal kosong', () => {
    expect(
      transactionSchema.safeParse({
        transactionDate: '',
        transactionType: 'sale',
        amount: '0',
        costAmount: '0',
      }).success,
    ).toBe(false)
  })

  it('menolak biaya pokok penjualan yang melebihi jumlah', () => {
    const result = transactionSchema.safeParse({
      transactionDate: '2026-07-22',
      transactionType: 'sale',
      amount: '100000',
      costAmount: '120000',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'costAmount')).toBe(true)
    }
  })
})
