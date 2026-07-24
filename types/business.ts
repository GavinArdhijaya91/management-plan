export type DashboardTrendDirection = 'up' | 'down'

export type DemoTransactionStatus = 'profit' | 'loss'

export interface DashboardChartDataPoint {
  name: string
  salesAmount: number
  costAmount: number
  netResult?: number
}

export interface DemoBusinessTask {
  id: number
  title: string
  completed: boolean
  priority: 'normal' | 'high'
}

/**
 * Presentation-only transaction used by the local-storage demo.
 * This is intentionally not the `public.transactions` database row.
 */
export interface DemoTransaction {
  id: number
  transactionDate: string
  transactionType: 'sale' | 'expense'
  amount: number
  costAmount: number
  netResult: number
  resultStatus: DemoTransactionStatus
}
