import type { DashboardChartDataPoint, DemoBusinessTask } from '@/types'

export const weeklySales: DashboardChartDataPoint[] = [
  { name: 'Minggu 1', salesAmount: 45_000, costAmount: 30_000, netResult: 15_000 },
  { name: 'Minggu 2', salesAmount: 52_000, costAmount: 35_000, netResult: 17_000 },
  { name: 'Minggu 3', salesAmount: 48_000, costAmount: 32_000, netResult: 16_000 },
  { name: 'Minggu 4', salesAmount: 61_000, costAmount: 40_000, netResult: 21_000 },
]

export const weeklyTasks: DemoBusinessTask[] = [
  { id: 1, title: 'Cek stok barang', completed: true, priority: 'normal' },
  { id: 2, title: 'Lapor penjualan harian', completed: false, priority: 'high' },
  { id: 3, title: 'Hubungi supplier', completed: false, priority: 'normal' },
  { id: 4, title: 'Update inventaris', completed: true, priority: 'normal' },
]
