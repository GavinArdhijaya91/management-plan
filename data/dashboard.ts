import type { BusinessTask, ChartDataPoint } from '@/types'

export const weeklySales: ChartDataPoint[] = [
  { name: 'Minggu 1', penjualan: 45_000, modal: 30_000, profit: 15_000 },
  { name: 'Minggu 2', penjualan: 52_000, modal: 35_000, profit: 17_000 },
  { name: 'Minggu 3', penjualan: 48_000, modal: 32_000, profit: 16_000 },
  { name: 'Minggu 4', penjualan: 61_000, modal: 40_000, profit: 21_000 },
]

export const weeklyTasks: BusinessTask[] = [
  { id: 1, title: 'Cek stok barang', completed: true, priority: 'normal' },
  { id: 2, title: 'Lapor penjualan harian', completed: false, priority: 'high' },
  { id: 3, title: 'Hubungi supplier', completed: false, priority: 'normal' },
  { id: 4, title: 'Update inventaris', completed: true, priority: 'normal' },
]
