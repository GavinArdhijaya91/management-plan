import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { TrendDirection } from '@/types'

interface KPICardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    direction: TrendDirection
    percentage: number
  }
}

export function KPICard({ title, value, icon, trend }: KPICardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 transition-colors hover:border-zinc-300 md:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="app-label">{title}</p>
          <p className="app-data mt-2 text-2xl font-semibold text-zinc-950 md:text-[1.7rem]">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {trend.direction === 'up' ? (
            <>
              <TrendingUp className="h-4 w-4 text-zinc-950" />
              <span className="font-mono text-sm font-medium text-zinc-950">+{trend.percentage}%</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4 text-zinc-500" />
              <span className="font-mono text-sm font-medium text-zinc-600">-{trend.percentage}%</span>
            </>
          )}
          <span className="text-gray-500 text-xs md:text-sm ml-1">vs bulan lalu</span>
        </div>
      )}
    </div>
  )
}
