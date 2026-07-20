import type { Transaction } from '@/types'

export const transactions: Transaction[] = [
  { id: 1, date: '20 Jul 2026', type: 'Penjualan', amount: 150_000, modal: 100_000, profit: 50_000, status: 'untung' },
  { id: 2, date: '19 Jul 2026', type: 'Penjualan', amount: 125_000, modal: 85_000, profit: 40_000, status: 'untung' },
  { id: 3, date: '18 Jul 2026', type: 'Pengeluaran', amount: -75_000, modal: 75_000, profit: -75_000, status: 'rugi' },
  { id: 4, date: '17 Jul 2026', type: 'Penjualan', amount: 200_000, modal: 120_000, profit: 80_000, status: 'untung' },
  { id: 5, date: '16 Jul 2026', type: 'Penjualan', amount: 95_000, modal: 65_000, profit: 30_000, status: 'untung' },
]
