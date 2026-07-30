import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { requireActiveWorkspace } from '@/lib/workspace/context'
import { BanknotesIcon, CalendarDaysIcon, CheckCircleIcon, FlagIcon } from '@heroicons/react/24/outline'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

function formatWorkspaceAmount(value: number, currencyCode: string | null) {
  if (!currencyCode) return new Intl.NumberFormat('id-ID').format(value)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: currencyCode }).format(value)
}

export default async function DashboardPage() {
  const workspace = await requireActiveWorkspace('/dashboard')
  const supabase = await createClient()
  const [transactions, goals, actions, events, recentTransactions] = await Promise.all([
    supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspace.workspace_id),
    supabase
      .from('business_goals')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspace.workspace_id)
      .eq('status', 'active'),
    supabase
      .from('action_items')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspace.workspace_id)
      .in('status', ['todo', 'in_progress', 'blocked']),
    supabase
      .from('calendar_events')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspace.workspace_id)
      .gte('starts_at', new Date().toISOString()),
    supabase
      .from('transaction_financial_results')
      .select('transaction_id,transaction_type,transaction_date,amount,net_result,currency_code')
      .eq('workspace_id', workspace.workspace_id)
      .order('transaction_date', { ascending: false })
      .limit(5),
  ])

  const unavailable = [transactions, goals, actions, events, recentTransactions].some((result) => result.error)
  const cards = [
    { label: 'Transaksi tercatat', value: transactions.count ?? 0, icon: BanknotesIcon },
    { label: 'Goal aktif', value: goals.count ?? 0, icon: FlagIcon },
    { label: 'Tindakan berjalan', value: actions.count ?? 0, icon: CheckCircleIcon },
    { label: 'Agenda mendatang', value: events.count ?? 0, icon: CalendarDaysIcon },
  ]

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter">
        <div className="flex flex-col justify-between gap-5 border-b border-zinc-200 pb-6 md:flex-row md:items-end">
          <div>
            <p className="app-label mb-2">Workspace / {workspace.workspace_name}</p>
            <h1 className="app-heading">Dashboard usaha</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Kondisi aktual, komitmen berjalan, dan aktivitas terbaru dalam satu tampilan.
            </p>
          </div>
          <Link href="/planning" className="app-button">
            Buka planning
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {unavailable && (
          <p role="alert" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            Sebagian ringkasan belum dapat dimuat. Coba segarkan halaman.
          </p>
        )}

        <section
          aria-label="Ringkasan workspace"
          className="my-6 grid overflow-hidden rounded-xl border border-zinc-200 bg-white sm:grid-cols-2 lg:grid-cols-4"
        >
          {cards.map(({ label, value, icon: Icon }) => (
            <article
              key={label}
              className="border-b border-zinc-200 p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <div className="flex items-center gap-2 text-zinc-500">
                <Icon className="size-[1.1rem]" aria-hidden="true" />
                <p className="text-xs font-medium">{label}</p>
              </div>
              <p className="app-data mt-4 text-3xl font-semibold">{value}</p>
              <p className="mt-1 text-xs text-zinc-400">Workspace aktif</p>
            </article>
          ))}
        </section>

        <section className="app-card overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="px-5 py-4">
              <h2 className="text-sm font-semibold">Transaksi terbaru</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Aktivitas finansial terakhir pada workspace.</p>
            </div>
            <Link
              href="/manajemen"
              className="mr-5 inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-950"
            >
              Lihat semua
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          {recentTransactions.data?.length ? (
            <div className="divide-y divide-zinc-100 border-t border-zinc-200">
              {recentTransactions.data.map((transaction) => (
                <div
                  key={transaction.transaction_id}
                  className="grid gap-1 px-5 py-3.5 text-sm hover:bg-zinc-50 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8"
                >
                  <span className="text-zinc-600">{transaction.transaction_date}</span>
                  <span className="text-zinc-500">
                    {transaction.transaction_type === 'sale' ? 'Penjualan' : 'Pengeluaran'}
                  </span>
                  <strong className="app-data text-right">
                    {formatWorkspaceAmount(Number(transaction.net_result), transaction.currency_code)}
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-3 border-t border-zinc-200 px-5 py-8">
              <BanknotesIcon className="mt-0.5 size-5 shrink-0 text-zinc-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-zinc-800">Belum ada transaksi</p>
                <p className="mt-1 max-w-sm text-sm text-zinc-500">
                  Catat aktivitas finansial pertama agar ringkasan aktual mulai terbentuk.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
