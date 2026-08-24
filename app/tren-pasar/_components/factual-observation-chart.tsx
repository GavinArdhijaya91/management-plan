'use client'

import { useMemo, useState } from 'react'
import { ExternalLink, ShieldCheck } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface FactualObservation {
  id: string
  productId: string
  productName: string
  metricCode: string
  numericValue: number
  observedAt: string
  sourceUrl: string
  unitCode: string
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'Asia/Jakarta' }).format(new Date(value))
}

export function FactualObservationChart({ observations }: { observations: FactualObservation[] }) {
  const series = useMemo(() => {
    const grouped = new Map<string, FactualObservation[]>()
    for (const observation of observations) {
      const key = `${observation.productId}:${observation.metricCode}:${observation.unitCode}`
      grouped.set(key, [...(grouped.get(key) ?? []), observation])
    }
    return [...grouped.entries()].map(([key, values]) => ({
      key,
      label: `${values[0]?.productName} · ${values[0]?.metricCode}`,
      values: values.sort((a, b) => a.observedAt.localeCompare(b.observedAt)),
    }))
  }, [observations])
  const [selectedKey, setSelectedKey] = useState(() => series[0]?.key ?? '')
  const selected = series.find((item) => item.key === selectedKey) ?? series[0]

  return (
    <section className="app-card mt-6 p-4 md:p-6" aria-labelledby="official-statistics-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" aria-hidden="true" />
            <h2 id="official-statistics-title" className="text-base font-semibold">
              Data statistik resmi
            </h2>
          </div>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
            Nilai eksternal apa adanya dari sumber resmi. Grafik ini tidak memprediksi atau menyimpulkan keputusan
            bisnis.
          </p>
        </div>
        {series.length > 1 && (
          <label className="grid gap-1 text-xs font-medium text-zinc-600">
            Seri data
            <select
              value={selected?.key}
              onChange={(event) => setSelectedKey(event.target.value)}
              className="app-input min-w-56"
            >
              {series.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {selected ? (
        <>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{selected.label}</p>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              Satuan: {selected.values[0]?.unitCode}
            </span>
          </div>
          <div className="mt-4 h-72 w-full" role="img" aria-label={`Grafik statistik resmi ${selected.label}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart accessibilityLayer data={selected.values} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis
                  dataKey="observedAt"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  tickFormatter={dateLabel}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  width={64}
                  tickFormatter={(value) => Number(value).toLocaleString('id-ID', { notation: 'compact' })}
                />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toLocaleString('id-ID')} ${selected.values[0]?.unitCode}`,
                    selected.values[0]?.metricCode,
                  ]}
                  labelFormatter={(value) => dateLabel(String(value))}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgb(0 0 0 / 0.08)',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="numericValue"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <a
            href={selected.values.at(-1)?.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
          >
            Periksa data sumber terbaru <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6">
          <p className="text-sm font-semibold">Belum ada seri statistik yang tersinkronisasi</p>
          <p className="mt-1 text-sm text-zinc-500">
            Area ini sudah siap. Nilai resmi akan tampil setelah adapter statistik BPS dikonfigurasi dan divalidasi.
          </p>
        </div>
      )}
    </section>
  )
}
