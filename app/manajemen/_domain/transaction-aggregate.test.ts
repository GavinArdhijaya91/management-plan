import { describe, expect, it } from 'vitest'
import { transactionAggregate, type TransactionDraft } from './transaction-aggregate'
import type { Transaction } from '../../../types/business'

const seed: Transaction[] = [
  { id: 1, date: '20 Jul 2026', type: 'Penjualan', amount: 150_000, modal: 100_000, profit: 50_000, status: 'untung' },
  { id: 2, date: '18 Jun 2026', type: 'Pengeluaran', amount: -25_000, modal: 25_000, profit: -25_000, status: 'rugi' },
]

const draft: TransactionDraft = { date: '2026-07-22', type: 'Penjualan', amount: '200000', modal: '120000' }

describe('transactionAggregate', () => {
  it('membuat transaksi dan menghitung profit', () => {
    const result = transactionAggregate.create(seed, draft, 3)
    expect(result[0]).toMatchObject({ id: 3, amount: 200_000, modal: 120_000, profit: 80_000, status: 'untung' })
    expect(result).toHaveLength(3)
  })

  it('memperbarui dan menghapus transaksi tanpa memutasi seed', () => {
    const updated = transactionAggregate.update(seed, 1, draft)
    const removed = transactionAggregate.remove(updated, 2)
    expect(updated[0].amount).toBe(200_000)
    expect(removed.map((item) => item.id)).toEqual([1])
    expect(seed[0].amount).toBe(150_000)
  })

  it('menyaring berdasarkan tipe, periode, dan pencarian', () => {
    const result = transactionAggregate.filter(seed, { search: '20 jul', type: 'Penjualan', period: 'Bulan Ini' })
    expect(result.map((item) => item.id)).toEqual([1])
  })

  it('menghitung summary secara konsisten', () => {
    expect(transactionAggregate.summarize(seed)).toEqual({ margin: 17, totalModal: 125_000, totalProfit: 25_000, totalSales: 150_000, transactionCount: 2 })
  })

  it('mengurutkan dan membagi data ke halaman', () => {
    const sorted = transactionAggregate.sort(seed, 'amount', 'asc')
    const page = transactionAggregate.paginate(sorted, 1, 1)
    expect(sorted.map((item) => item.id)).toEqual([2, 1])
    expect(page.items).toHaveLength(1)
    expect(page.pageCount).toBe(2)
  })
})
