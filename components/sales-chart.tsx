'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ChartDataPoint } from '@/types'

interface SalesChartProps {
  data: ChartDataPoint[]
  type?: 'bar' | 'line'
  title: string
}

export function SalesChart({ data, type = 'bar', title }: SalesChartProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 md:p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
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
              <Bar dataKey="penjualan" fill="#2563eb" radius={[8, 8, 0, 0]} />
              <Bar dataKey="modal" fill="#10b981" radius={[8, 8, 0, 0]} />
              {data[0]?.profit !== undefined && <Bar dataKey="profit" fill="#f59e0b" radius={[8, 8, 0, 0]} />}
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
              <Line type="monotone" dataKey="penjualan" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb' }} />
              <Line type="monotone" dataKey="modal" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              {data[0]?.profit !== undefined && (
                <Line type="monotone" dataKey="profit" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
