import type { DemoTransaction } from '@/types'

export const transactions: DemoTransaction[] = [
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
    transactionDate: '2026-07-19',
    transactionType: 'sale',
    amount: 125_000,
    costAmount: 85_000,
    netResult: 40_000,
    resultStatus: 'profit',
  },
  {
    id: 3,
    transactionDate: '2026-07-18',
    transactionType: 'expense',
    amount: 75_000,
    costAmount: 0,
    netResult: -75_000,
    resultStatus: 'loss',
  },
  {
    id: 4,
    transactionDate: '2026-07-17',
    transactionType: 'sale',
    amount: 200_000,
    costAmount: 120_000,
    netResult: 80_000,
    resultStatus: 'profit',
  },
  {
    id: 5,
    transactionDate: '2026-07-16',
    transactionType: 'sale',
    amount: 95_000,
    costAmount: 65_000,
    netResult: 30_000,
    resultStatus: 'profit',
  },
]
