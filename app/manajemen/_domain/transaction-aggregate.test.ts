import { describe, expect, it } from 'vitest'
import type { DemoTransaction } from '../../../types/business'
import { transactionAggregate, type TransactionDraft } from './transaction-aggregate'

const seed: DemoTransaction[] = [
  {
    id: 1,
    transactionDate: '2026-07-20',
    transactionType: 'sale',
    amount: 150_000,
    costAmount: 100_000,
    netResult: 50_000,
    resultStatus: 'profit',
  },
  {
    id: 2,
    transactionDate: '2026-06-18',
    transactionType: 'expense',
    amount: 25_000,
    costAmount: 0,
    netResult: -25_000,
    resultStatus: 'loss',
  },
]

const draft: TransactionDraft = {
  transactionDate: '2026-07-22',
  transactionType: 'sale',
  amount: '200000',
  costAmount: '120000',
}

describe('transactionAggregate', () => {
  it('membuat transaksi dengan semantik yang sama seperti database', () => {
    const result = transactionAggregate.create(seed, draft, 3)
    expect(result[0]).toMatchObject({
      id: 3,
      amount: 200_000,
      costAmount: 120_000,
      netResult: 80_000,
      resultStatus: 'profit',
    })
    expect(result).toHaveLength(3)
  })

  it('menjaga nominal expense positif dan hasil bersih negatif', () => {
    const expense = transactionAggregate.create(
      seed,
      {
        transactionDate: '2026-07-22',
        transactionType: 'expense',
        amount: '30000',
        costAmount: '999',
      },
      3,
    )[0]

    expect(expense).toMatchObject({
      amount: 30_000,
      costAmount: 0,
      netResult: -30_000,
      resultStatus: 'loss',
    })
  })

  it('memperbarui dan menghapus transaksi tanpa memutasi seed', () => {
    const updated = transactionAggregate.update(seed, 1, draft)
    const removed = transactionAggregate.remove(updated, 2)
    expect(updated[0].amount).toBe(200_000)
    expect(removed.map((item) => item.id)).toEqual([1])
    expect(seed[0].amount).toBe(150_000)
  })

  it('menyaring berdasarkan tipe, periode, dan pencarian terjemahan', () => {
    const result = transactionAggregate.filter(seed, {
      search: '20 jul',
      type: 'sale',
      period: 'Bulan Ini',
    })
    expect(result.map((item) => item.id)).toEqual([1])
  })

  it('menghitung summary secara konsisten', () => {
    expect(transactionAggregate.summarize(seed)).toEqual({
      margin: 17,
      totalCostAmount: 100_000,
      totalNetResult: 25_000,
      totalSales: 150_000,
      transactionCount: 2,
    })
  })

  it('mengurutkan dan membagi data ke halaman', () => {
    const sorted = transactionAggregate.sort(seed, 'amount', 'asc')
    const page = transactionAggregate.paginate(sorted, 1, 1)
    expect(sorted.map((item) => item.id)).toEqual([2, 1])
    expect(page.items).toHaveLength(1)
    expect(page.pageCount).toBe(2)
  })
})
