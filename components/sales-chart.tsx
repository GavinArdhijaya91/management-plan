'use client'

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { DashboardChartDataPoint } from '@/types'

interface SalesChartProps {
  data: DashboardChartDataPoint[]
  type?: 'bar' | 'line'
  title: string
  variant?: 'default' | 'monochrome'
}

export function SalesChart({ data, type = 'bar', title, variant = 'default' }: SalesChartProps) {
  const colors =
    variant === 'monochrome'
      ? { primary: '#18181b', secondary: '#a1a1aa', tertiary: '#d4d4d8' }
      : { primary: '#2563eb', secondary: '#10b981', tertiary: '#f59e0b' }

  return (
    <div
      className={
        variant === 'monochrome'
          ? 'rounded-2xl border border-zinc-200/80 bg-white p-4 md:p-6'
          : 'rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6'
      }
    >
      <h3
        className={
          variant === 'monochrome'
            ? 'mb-4 text-base font-semibold text-zinc-950'
            : 'mb-4 text-lg font-bold text-gray-900'
        }
      >
        {title}
      </h3>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="salesAmount" name="Penjualan" fill={colors.primary} radius={[6, 6, 0, 0]} />
              <Bar dataKey="costAmount" name="Biaya Pokok" fill={colors.secondary} radius={[6, 6, 0, 0]} />
              {data[0]?.netResult !== undefined && (
                <Bar dataKey="netResult" name="Hasil Bersih" fill={colors.tertiary} radius={[6, 6, 0, 0]} />
              )}
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="salesAmount"
                name="Penjualan"
                stroke={colors.primary}
                strokeWidth={2}
                dot={{ fill: colors.primary }}
              />
              <Line
                type="monotone"
                dataKey="costAmount"
                name="Biaya Pokok"
                stroke={colors.secondary}
                strokeWidth={2}
                dot={{ fill: colors.secondary }}
              />
              {data[0]?.netResult !== undefined && (
                <Line
                  type="monotone"
                  dataKey="netResult"
                  name="Hasil Bersih"
                  stroke={colors.tertiary}
                  strokeWidth={2}
                  dot={{ fill: colors.tertiary }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
