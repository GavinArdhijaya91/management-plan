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
  bgColor?: string
}

export function KPICard({ title, value, icon, trend, bgColor = 'bg-blue-50' }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 md:p-6 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm md:text-base font-medium">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${bgColor} flex items-center justify-center text-blue-600`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {trend.direction === 'up' ? (
            <>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600 text-sm font-medium">+{trend.percentage}%</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-red-600 text-sm font-medium">-{trend.percentage}%</span>
            </>
          )}
          <span className="text-gray-500 text-xs md:text-sm ml-1">vs bulan lalu</span>
        </div>
      )}
    </div>
  )
}
