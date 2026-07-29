import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { requireActiveWorkspace } from '@/lib/workspace/context'
import { CalendarDays, ListChecks, ReceiptText, Target } from 'lucide-react'
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
    { label: 'Transaksi tercatat', value: transactions.count ?? 0, icon: ReceiptText },
    { label: 'Goal aktif', value: goals.count ?? 0, icon: Target },
    { label: 'Tindakan berjalan', value: actions.count ?? 0, icon: ListChecks },
    { label: 'Agenda mendatang', value: events.count ?? 0, icon: CalendarDays },
  ]

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="app-label mb-3">Workspace · {workspace.workspace_name}</p>
            <h1 className="app-heading">Dashboard usaha</h1>
            <p className="mt-2 text-zinc-500">Ringkasan ini berasal dari data privat workspace aktif.</p>
          </div>
          <Link href="/planning" className="app-button">
            Buka planning
          </Link>
        </div>

        {unavailable && (
          <p role="alert" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            Sebagian ringkasan belum dapat dimuat. Coba segarkan halaman.
          </p>
        )}

        <section aria-label="Ringkasan workspace" className="my-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ label, value, icon: Icon }) => (
            <article key={label} className="app-card p-5">
              <Icon className="size-5 text-zinc-500" />
              <p className="app-data mt-5 text-3xl font-semibold">{value}</p>
              <p className="mt-1 text-sm text-zinc-500">{label}</p>
            </article>
          ))}
        </section>

        <section className="app-card p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="app-label">Aktivitas aktual</p>
              <h2 className="mt-1 font-serif text-xl font-semibold">Transaksi terbaru</h2>
            </div>
            <Link href="/manajemen" className="text-sm font-semibold underline">
              Lihat semua
            </Link>
          </div>
          {recentTransactions.data?.length ? (
            <div className="mt-5 divide-y divide-zinc-100">
              {recentTransactions.data.map((transaction) => (
                <div
                  key={transaction.transaction_id}
                  className="grid gap-1 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5"
                >
                  <span>{transaction.transaction_date}</span>
                  <span className="text-zinc-500">
                    {transaction.transaction_type === 'sale' ? 'Penjualan' : 'Pengeluaran'}
                  </span>
                  <strong className="app-data">
                    {formatWorkspaceAmount(Number(transaction.net_result), transaction.currency_code)}
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-zinc-50 p-5 text-sm text-zinc-600">
              Belum ada transaksi privat pada workspace ini.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
