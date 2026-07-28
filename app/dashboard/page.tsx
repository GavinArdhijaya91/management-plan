'use client'

import { DemoDataNotice } from '@/app/_components/demo-data-notice'
import { useLocalStorage } from '@/app/_lib/use-local-storage'
import {
  decodeStoredTransactions,
  formatTransactionDate,
  transactionAggregate,
} from '@/app/manajemen/_domain/transaction-aggregate'
import { Header } from '@/components/header'
import { KPICard } from '@/components/kpi-card'
import { SalesChart } from '@/components/sales-chart'
import { transactions as initialTransactions } from '@/data/transactions'
import { weeklyTasks } from '@/data/dashboard'
import type { DashboardChartDataPoint, DemoBusinessTask, DemoTransaction } from '@/types'
import { CalendarDays, CircleDollarSign, ListChecks, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { useLanguage } from '@/app/_i18n/language-provider'
import { dashboardCopy } from '@/app/_i18n/pages/dashboard'

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export default function Dashboard() {
  const [transactions] = useLocalStorage<DemoTransaction[]>(
    'siapin:transactions',
    initialTransactions,
    decodeStoredTransactions,
  )
  const [tasks, setTasks] = useLocalStorage<DemoBusinessTask[]>('siapin:tasks', weeklyTasks)
  const { locale } = useLanguage()
  const copy = dashboardCopy[locale]
  const summary = useMemo(() => transactionAggregate.summarize(transactions), [transactions])
  const chartData = useMemo<DashboardChartDataPoint[]>(
    () =>
      transactions
        .slice(0, 6)
        .reverse()
        .map((item) => ({
          name: formatTransactionDate(item.transactionDate).slice(0, 6),
          salesAmount: item.transactionType === 'sale' ? item.amount : 0,
          costAmount: item.costAmount,
          netResult: item.netResult,
        })),
    [transactions],
  )
  const unfinished = tasks.filter((task) => !task.completed).length

  return (
    <main className="app-shell">
      <Header variant="monochrome" />
      <div className="page-shell">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="app-label mb-3">{copy.eyebrow}</p>
            <h1 className="app-heading">{copy.title}</h1>
            <p className="mt-2 text-zinc-500">{copy.description}</p>
          </div>
          <Link href="/manajemen" className="app-button">
            {copy.manage}
          </Link>
        </div>
        <DemoDataNotice>{copy.demo}</DemoDataNotice>

        <section aria-label="Ringkasan bisnis" className="my-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title={copy.sales}
            value={rupiah.format(summary.totalSales)}
            icon={<CircleDollarSign className="size-5" />}
          />
          <KPICard
            title={copy.costAmount}
            value={rupiah.format(summary.totalCostAmount)}
            icon={<ListChecks className="size-5" />}
          />
          <KPICard
            title={copy.profit}
            value={rupiah.format(summary.totalNetResult)}
            icon={<TrendingUp className="size-5" />}
          />
          <KPICard
            title={copy.remainingPlans}
            value={`${unfinished} ${copy.tasks}`}
            icon={<CalendarDays className="size-5" />}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SalesChart data={chartData} type="bar" title={copy.chart} variant="monochrome" />
          </div>
          <aside className="rounded-2xl bg-zinc-950 p-6 text-white">
            <p className="app-label !text-zinc-400">{copy.insights}</p>
            <div className="mt-5 space-y-5">
              {[
                [copy.marginTitle, copy.marginDescription],
                [copy.expenseTitle, copy.expenseDescription],
              ].map(([title, description]) => (
                <div key={title} className="border-b border-white/10 pb-5 last:border-0 last:pb-0">
                  <h2 className="font-serif font-semibold">{title}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{description}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section className="app-card mt-6 p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="app-label">{copy.action}</p>
              <h2 className="mt-1 font-serif text-xl font-semibold">{copy.weekly}</h2>
            </div>
            <span className="app-data text-sm text-zinc-500">
              {unfinished} {copy.remaining}
            </span>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {tasks.map((task) => (
              <label
                key={task.id}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3 hover:bg-zinc-100"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() =>
                    setTasks((current) =>
                      current.map((entry) =>
                        entry.id === task.id ? { ...entry, completed: !entry.completed } : entry,
                      ),
                    )
                  }
                  className="size-4 accent-zinc-950"
                />
                <span className={task.completed ? 'text-sm text-zinc-400 line-through' : 'text-sm text-zinc-700'}>
                  {copy.taskLabels[task.id] ?? task.title}
                </span>
                {task.priority === 'high' && (
                  <span className="ml-auto rounded-full bg-zinc-950 px-2 py-1 text-[10px] font-semibold uppercase text-white">
                    {copy.important}
                  </span>
                )}
              </label>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
