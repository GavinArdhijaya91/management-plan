import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { DashboardTrendDirection } from '@/types'

interface KPICardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    direction: DashboardTrendDirection
    percentage: number
  }
}

export function KPICard({ title, value, icon, trend }: KPICardProps) {
  return (
    <div className="flex flex-col border-b border-zinc-200 bg-white p-4 last:border-b-0 sm:[&:nth-child(odd)]:border-r md:p-5 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <div className="flex items-center gap-2 text-zinc-500">
        <span className="[&>svg]:size-[1.1rem]">{icon}</span>
        <p className="text-xs font-medium">{title}</p>
      </div>
      <p className="app-data mt-4 text-2xl font-semibold text-zinc-950 md:text-[1.7rem]">{value}</p>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          {trend.direction === 'up' ? (
            <>
              <TrendingUp className="size-3.5 text-emerald-600" />
              <span className="font-mono text-xs font-medium text-emerald-700">+{trend.percentage}%</span>
            </>
          ) : (
            <>
              <TrendingDown className="size-3.5 text-amber-600" />
              <span className="font-mono text-xs font-medium text-amber-700">-{trend.percentage}%</span>
            </>
          )}
          <span className="ml-1 text-xs text-zinc-400">vs bulan lalu</span>
        </div>
      )}
    </div>
  )
}
