import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { requireActiveWorkspace } from '@/lib/workspace/context'
import { BanknotesIcon, CalendarDaysIcon, CheckCircleIcon, FlagIcon } from '@heroicons/react/24/outline'
import { AlertTriangle, ArrowUpRight, ClipboardCheck, Gauge, ListChecks } from 'lucide-react'
import Link from 'next/link'

function formatWorkspaceAmount(value: number, currencyCode: string | null) {
  if (!currencyCode) return new Intl.NumberFormat('id-ID').format(value)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: currencyCode }).format(value)
}

export default async function DashboardPage() {
  const workspace = await requireActiveWorkspace('/dashboard')
  const supabase = await createClient()
  const [transactions, goals, actions, events, recentTransactions, actuals, overdue, reviews] = await Promise.all([
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
    supabase.from('goal_target_actual_reconciliation').select('*').eq('workspace_id', workspace.workspace_id),
    supabase
      .from('planning_overdue_evaluations')
      .select('*')
      .eq('workspace_id', workspace.workspace_id)
      .eq('is_overdue', true)
      .order('days_overdue', { ascending: false })
      .limit(5),
    supabase
      .from('business_reviews')
      .select('id,status')
      .eq('workspace_id', workspace.workspace_id)
      .eq('status', 'draft'),
  ])

  const unavailable = [transactions, goals, actions, events, recentTransactions, actuals, overdue, reviews].some(
    (result) => result.error,
  )
  const attentionTargets =
    actuals.data?.filter((actual) =>
      ['attention', 'missing_authoritative'].includes(actual.reconciliation_status ?? ''),
    ) ?? []
  const canManageMetrics = workspace.permission_codes.includes('metric.manage')
  const canFinalizeReview = workspace.permission_codes.includes('review.finalize')
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

        <section aria-labelledby="decision-heading" className="mb-6 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="app-card overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
              <div>
                <p className="app-label">Perlu keputusan</p>
                <h2 id="decision-heading" className="mt-1 text-lg font-semibold">
                  Sinyal operasional
                </h2>
              </div>
              <span className="app-data text-sm font-semibold">
                {attentionTargets.length + (overdue.data?.length ?? 0) + (reviews.data?.length ?? 0)} item
              </span>
            </div>
            {attentionTargets.length || overdue.data?.length || reviews.data?.length ? (
              <div className="grid gap-px bg-zinc-200">
                {attentionTargets.length > 0 && (
                  <DecisionRow
                    icon={Gauge}
                    title={`${attentionTargets.length} target perlu diperiksa`}
                    detail="Sumber aktual belum tersedia atau berbeda melewati toleransi."
                    href="/planning/metrics"
                    action={canManageMetrics ? 'Perbarui actual' : 'Lihat pengukuran'}
                    tone="warning"
                  />
                )}
                {(overdue.data?.length ?? 0) > 0 && (
                  <DecisionRow
                    icon={ListChecks}
                    title={`${overdue.data?.length ?? 0} pekerjaan melewati tenggat`}
                    detail={overdue.data?.[0]?.title ?? 'Tinjau prioritas dan penanggung jawab.'}
                    href="/planning"
                    action="Buka planning"
                    tone="danger"
                  />
                )}
                {(reviews.data?.length ?? 0) > 0 && (
                  <DecisionRow
                    icon={ClipboardCheck}
                    title={`${reviews.data?.length ?? 0} evaluasi masih draft`}
                    detail="Periksa readiness sebelum evidence dikunci."
                    href="/planning/reviews"
                    action={canFinalizeReview ? 'Finalisasi evaluasi' : 'Lihat evaluasi'}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3 px-5 py-8">
                <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">Belum ada sinyal kritis</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Tambahkan target terukur agar dashboard dapat membandingkan rencana dan hasil aktual.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="app-card p-5">
            <p className="app-label">Siklus keputusan</p>
            <h2 className="mt-1 text-lg font-semibold">Lanjutkan dari data</h2>
            <ol className="mt-5 grid gap-3 text-sm">
              <DecisionStep number="01" label="Tetapkan target terukur" complete={(actuals.data?.length ?? 0) > 0} />
              <DecisionStep
                number="02"
                label="Catat atau hubungkan actual"
                complete={attentionTargets.length === 0 && (actuals.data?.length ?? 0) > 0}
              />
              <DecisionStep
                number="03"
                label="Evaluasi dan kunci evidence"
                complete={(reviews.data?.length ?? 0) === 0 && (actuals.data?.length ?? 0) > 0}
              />
            </ol>
            <Link href="/planning/metrics" className="app-button mt-5 w-full">
              Buka target dan actual
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="app-card overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="px-5 py-4">
              <h2 className="text-sm font-semibold">Transaksi terbaru</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Aktivitas finansial terakhir pada workspace.</p>
            </div>
            <Link
              href="/management"
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

function DecisionRow({
  icon: Icon,
  title,
  detail,
  href,
  action,
  tone = 'neutral',
}: {
  icon: typeof AlertTriangle
  title: string
  detail: string
  href: string
  action: string
  tone?: 'neutral' | 'warning' | 'danger'
}) {
  const iconClass = tone === 'danger' ? 'text-red-600' : tone === 'warning' ? 'text-amber-600' : 'text-zinc-500'
  return (
    <article className="grid gap-3 bg-white px-5 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <Icon className={`size-5 ${iconClass}`} aria-hidden="true" />
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-0.5 text-xs text-zinc-500">{detail}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950"
      >
        {action}
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Link>
    </article>
  )
}

function DecisionStep({ number, label, complete }: { number: string; label: string; complete: boolean }) {
  return (
    <li className="grid grid-cols-[2rem_1fr_auto] items-center gap-3">
      <span className="app-data text-xs text-zinc-400">{number}</span>
      <span className={complete ? 'text-zinc-500 line-through' : 'font-medium text-zinc-800'}>{label}</span>
      <span className={`text-xs font-medium ${complete ? 'text-emerald-700' : 'text-zinc-400'}`}>
        {complete ? 'Selesai' : 'Berikutnya'}
      </span>
    </li>
  )
}
