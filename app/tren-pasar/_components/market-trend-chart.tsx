'use client'

import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface MarketTrendProduct {
  id: string
  name: string
  snapshots: Array<{ changePercent: number; observedOn: string }>
}

const palette = ['#18181b', '#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626']

function shortDate(value: string) {
  const [, month, day] = value.split('-')
  return month && day ? `${day}/${month}` : value
}

export function MarketTrendChart({ products }: { products: MarketTrendProduct[] }) {
  const availableProducts = useMemo(() => products.filter((product) => product.snapshots.length > 0), [products])
  const [visibleIds, setVisibleIds] = useState(() => availableProducts.slice(0, 3).map((product) => product.id))
  const chartData = useMemo(() => {
    const rows = new Map<string, Record<string, string | number>>()
    for (const product of availableProducts) {
      for (const snapshot of product.snapshots) {
        const row = rows.get(snapshot.observedOn) ?? { observedOn: snapshot.observedOn }
        row[`product-${product.id}`] = snapshot.changePercent
        rows.set(snapshot.observedOn, row)
      }
    }
    return [...rows.values()].sort((a, b) => String(a.observedOn).localeCompare(String(b.observedOn)))
  }, [availableProducts])

  function toggleProduct(id: string) {
    setVisibleIds((current) => {
      if (!current.includes(id)) return [...current, id]
      if (current.length === 1) return current
      return current.filter((item) => item !== id)
    })
  }

  if (availableProducts.length === 0) return null

  return (
    <section className="app-card mt-6 p-4 md:p-6" aria-labelledby="market-trend-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="market-trend-title" className="text-base font-semibold">
            Observasi manual per produk
          </h2>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Catatan internal workspace, bukan statistik BPS. Persentase di atas nol menunjukkan kenaikan.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
          {chartData.length} tanggal observasi
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Indikator produk grafik">
        {availableProducts.map((product, index) => {
          const visible = visibleIds.includes(product.id)
          return (
            <button
              key={product.id}
              type="button"
              aria-pressed={visible}
              onClick={() => toggleProduct(product.id)}
              className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 ${
                visible ? 'border-zinc-300 bg-zinc-50 text-zinc-950' : 'border-zinc-200 bg-white text-zinc-400'
              }`}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: palette[index % palette.length] }}
                aria-hidden="true"
              />
              {product.name}
            </button>
          )
        })}
      </div>

      <div className="mt-5 h-72 w-full sm:h-80" role="img" aria-label="Grafik perubahan tren produk dalam persen">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart accessibilityLayer data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e4e4e7" />
            <ReferenceLine y={0} stroke="#a1a1aa" strokeDasharray="4 4" />
            <XAxis
              dataKey="observedOn"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickFormatter={(value) => shortDate(String(value))}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}
              width={42}
            />
            <Tooltip
              formatter={(value, name) => [`${Number(value).toLocaleString('id-ID')}%`, name]}
              labelFormatter={(value) => `Observasi ${shortDate(String(value))}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e4e4e7',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgb(0 0 0 / 0.08)',
                fontSize: '12px',
              }}
            />
            {availableProducts.map((product, index) =>
              visibleIds.includes(product.id) ? (
                <Line
                  key={product.id}
                  type="monotone"
                  dataKey={`product-${product.id}`}
                  name={product.name}
                  connectNulls
                  stroke={palette[index % palette.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#fff', strokeWidth: 2 }}
                />
              ) : null,
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
