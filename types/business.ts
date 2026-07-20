export type TrendDirection = 'up' | 'down'

export type TransactionStatus = 'untung' | 'rugi'

export interface ChartDataPoint {
  name: string
  penjualan: number
  modal: number
  profit?: number
}

export interface BusinessTask {
  id: number
  title: string
  completed: boolean
  priority: 'normal' | 'high'
}

export interface Transaction {
  id: number
  date: string
  type: 'Penjualan' | 'Pengeluaran'
  amount: number
  modal: number
  profit: number
  status: TransactionStatus
}
