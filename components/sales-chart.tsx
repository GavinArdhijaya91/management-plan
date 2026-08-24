'use client'

import { useMemo, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DashboardChartDataPoint } from '@/types'

type ChartSeriesKey = 'salesAmount' | 'costAmount' | 'netResult'

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const compactRupiah = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

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
  const series = useMemo(
    () => [
      { key: 'salesAmount' as const, label: 'Penjualan', color: colors.primary },
      { key: 'costAmount' as const, label: 'Biaya pokok', color: colors.secondary },
      ...(data.some((point) => point.netResult !== undefined)
        ? [{ key: 'netResult' as const, label: 'Hasil bersih', color: colors.tertiary }]
        : []),
    ],
    [colors.primary, colors.secondary, colors.tertiary, data],
  )
  const [visibleSeries, setVisibleSeries] = useState<ChartSeriesKey[]>(['salesAmount', 'costAmount', 'netResult'])
  const totals = useMemo(
    () =>
      series.map((item) => ({
        ...item,
        total: data.reduce((sum, point) => sum + Number(point[item.key] ?? 0), 0),
      })),
    [data, series],
  )

  function toggleSeries(key: ChartSeriesKey) {
    setVisibleSeries((current) => {
      if (!current.includes(key)) return [...current, key]
      if (current.filter((item) => series.some((entry) => entry.key === item)).length === 1) return current
      return current.filter((item) => item !== key)
    })
  }

  const chartMargin = { top: 12, right: 12, left: 0, bottom: 4 }
  const tooltip = (
    <Tooltip
      cursor={{ fill: '#f4f4f5', stroke: '#d4d4d8' }}
      formatter={(value) => rupiah.format(Number(value))}
      labelFormatter={(label) => `Periode ${label}`}
      contentStyle={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgb(0 0 0 / 0.08)',
        fontSize: '12px',
      }}
    />
  )

  return (
    <div
      className={
        variant === 'monochrome'
          ? 'rounded-2xl border border-zinc-200/80 bg-white p-4 md:p-6'
          : 'rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6'
      }
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <h3 className={variant === 'monochrome' ? 'text-base font-semibold text-zinc-950' : 'text-lg font-bold'}>
            {title}
          </h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">Pilih indikator untuk membandingkan data pada grafik.</p>
        </div>
        <span className="mt-1 shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
          {data.length} periode
        </span>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3" aria-label="Ringkasan indikator grafik">
        {totals.map((item) => {
          const visible = visibleSeries.includes(item.key)
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={visible}
              onClick={() => toggleSeries(item.key)}
              className={`rounded-xl border p-3 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 ${
                visible
                  ? 'border-zinc-300 bg-zinc-50 shadow-sm'
                  : 'border-zinc-200 bg-white opacity-55 hover:opacity-80'
              }`}
            >
              <span className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                <span className="h-1.5 w-5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                {item.label}
              </span>
              <strong className="app-data mt-2 block text-sm text-zinc-950">{rupiah.format(item.total)}</strong>
            </button>
          )
        })}
      </div>

      <div className="mt-5 h-72 w-full sm:h-80" role="img" aria-label={`${title}. Grafik ${type}.`}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart accessibilityLayer data={data} margin={chartMargin} barGap={4}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickFormatter={(value) => compactRupiah.format(Number(value))}
                width={48}
              />
              {tooltip}
              {visibleSeries.includes('salesAmount') && (
                <Bar dataKey="salesAmount" name="Penjualan" fill={colors.primary} radius={[5, 5, 0, 0]} />
              )}
              {visibleSeries.includes('costAmount') && (
                <Bar dataKey="costAmount" name="Biaya pokok" fill={colors.secondary} radius={[5, 5, 0, 0]} />
              )}
              {series.some((item) => item.key === 'netResult') && visibleSeries.includes('netResult') && (
                <Bar dataKey="netResult" name="Hasil Bersih" fill={colors.tertiary} radius={[6, 6, 0, 0]} />
              )}
            </BarChart>
          ) : (
            <LineChart accessibilityLayer data={data} margin={chartMargin}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickFormatter={(value) => compactRupiah.format(Number(value))}
                width={48}
              />
              {tooltip}
              {visibleSeries.includes('salesAmount') && (
                <Line
                  type="monotone"
                  dataKey="salesAmount"
                  name="Penjualan"
                  stroke={colors.primary}
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                  dot={{ r: 3, fill: '#fff', strokeWidth: 2 }}
                />
              )}
              {visibleSeries.includes('costAmount') && (
                <Line
                  type="monotone"
                  dataKey="costAmount"
                  name="Biaya pokok"
                  stroke={colors.secondary}
                  strokeWidth={2.5}
                  strokeDasharray="7 4"
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                  dot={{ r: 3, fill: '#fff', strokeWidth: 2 }}
                />
              )}
              {series.some((item) => item.key === 'netResult') && visibleSeries.includes('netResult') && (
                <Line
                  type="monotone"
                  dataKey="netResult"
                  name="Hasil Bersih"
                  stroke={colors.tertiary}
                  strokeWidth={2.5}
                  strokeDasharray="2 4"
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                  dot={{ r: 3, fill: '#fff', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
