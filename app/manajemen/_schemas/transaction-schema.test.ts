import { describe, expect, it } from 'vitest'
import { transactionSchema } from './transaction-schema'

describe('transactionSchema', () => {
  it('menerima transaksi penjualan yang valid', () => {
    expect(
      transactionSchema.safeParse({ date: '2026-07-22', type: 'Penjualan', amount: '200000', modal: '120000' }).success,
    ).toBe(true)
  })

  it('menolak jumlah nol dan tanggal kosong', () => {
    expect(transactionSchema.safeParse({ date: '', type: 'Penjualan', amount: '0', modal: '0' }).success).toBe(false)
  })

  it('menolak modal penjualan yang melebihi jumlah', () => {
    const result = transactionSchema.safeParse({
      date: '2026-07-22',
      type: 'Penjualan',
      amount: '100000',
      modal: '120000',
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === 'modal')).toBe(true)
  })
})
