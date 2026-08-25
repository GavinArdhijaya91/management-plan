import Link from 'next/link'
import { Activity, ArrowLeft, ClipboardCheck, Database, Gauge, Plus, Target } from 'lucide-react'
import { Header } from '@/components/header'
import { getMetricBoard } from '@/lib/planning/service'
import {
  createGoalTargetAction,
  createMetricDefinitionAction,
  createMetricMeasurementAction,
} from '@/app/planning/metrics/actions'
import type { MetricDefinitionRow } from '@/lib/supabase/domain-types'

const fieldClass = 'app-input w-full'
const labelClass = 'grid gap-1.5 text-sm font-medium text-zinc-700'

const aggregationLabel = {
  sum: 'Jumlah',
  average: 'Rata-rata',
  latest: 'Nilai terbaru',
  minimum: 'Nilai minimum',
  maximum: 'Nilai maksimum',
  count: 'Jumlah data',
} as const

function formatValue(value: number | null, metric?: MetricDefinitionRow) {
  if (value === null) return 'Belum tercatat'
  if (metric?.unit_type === 'currency') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: metric.unit_label || 'IDR',
      maximumFractionDigits: 2,
    }).format(value)
  }
  const formatted = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value)
  return metric?.unit_type === 'percentage'
    ? `${formatted}%`
    : `${formatted}${metric?.unit_label ? ` ${metric.unit_label}` : ''}`
}

interface MetricPageProps {
  searchParams: Promise<{ error?: string; success?: string }>
}

export default async function MetricPage({ searchParams }: MetricPageProps) {
  const [{ error, success }, board] = await Promise.all([searchParams, getMetricBoard()])
  const canManage = board.workspace.permission_codes.includes('metric.manage')
  const metricById = new Map(board.metrics.map((metric) => [metric.id, metric]))
  const goalById = new Map(board.goals.map((goal) => [goal.id, goal]))
  const planById = new Map(board.plans.map((plan) => [plan.id, plan]))
  const actualByTargetId = new Map(board.actuals.map((actual) => [actual.goal_target_id, actual]))
  const latestMeasurementByTargetId = new Map<string, (typeof board.measurements)[number]>()
  for (const measurement of board.measurements) {
    if (!latestMeasurementByTargetId.has(measurement.goal_target_id)) {
      latestMeasurementByTargetId.set(measurement.goal_target_id, measurement)
    }
  }

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter">
        <header className="mb-7 flex flex-col gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/planning"
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-950"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Kembali ke planning
            </Link>
            <p className="app-label">Planning / Pengukuran</p>
            <h1 className="app-heading mt-2">Target dan hasil aktual</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Tentukan cara ukur, tetapkan target, lalu catat hasil beserta sumber faktualnya.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/planning/reviews" className="app-button-secondary">
              <ClipboardCheck className="size-4" aria-hidden="true" />
              Buka evaluasi
            </Link>
            <span className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600">
              {board.workspace.workspace_name}
            </span>
          </div>
        </header>

        {(error || success) && (
          <div
            role={error ? 'alert' : 'status'}
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {error ?? success}
          </div>
        )}

        {canManage && (
          <section aria-label="Input pengukuran" className="mb-7 grid gap-4 lg:grid-cols-3">
            <EntryPanel
              icon={Gauge}
              title="1. Definisikan metrik"
              description="Tetapkan unit dan sumber yang berwenang."
              defaultOpen={board.metrics.length === 0}
            >
              <form action={createMetricDefinitionAction} className="grid gap-3">
                <label className={labelClass}>
                  Nama metrik
                  <input name="name" required minLength={2} maxLength={100} className={fieldClass} />
                </label>
                <label className={labelClass}>
                  Kode
                  <input
                    name="code"
                    required
                    pattern="[a-z0-9]+(?:_[a-z0-9]+)*"
                    placeholder="omzet_bulanan"
                    className={fieldClass}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={labelClass}>
                    Jenis unit
                    <select name="unitType" defaultValue="currency" className={fieldClass}>
                      <option value="currency">Mata uang</option>
                      <option value="number">Angka</option>
                      <option value="percentage">Persentase</option>
                    </select>
                  </label>
                  <label className={labelClass}>
                    Label unit
                    <input name="unitLabel" maxLength={30} placeholder="IDR" className={fieldClass} />
                  </label>
                </div>
                <label className={labelClass}>
                  Agregasi
                  <select name="aggregation" defaultValue="latest" className={fieldClass}>
                    {Object.entries(aggregationLabel).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  Sumber otoritatif
                  <select name="authoritativeSource" defaultValue="manual" className={fieldClass}>
                    <option value="manual">Pengukuran manual</option>
                    <option value="transaction">Transaksi workspace</option>
                  </select>
                </label>
                <label className={labelClass}>
                  Toleransi rekonsiliasi (%)
                  <input
                    type="number"
                    name="reconciliationTolerancePercent"
                    min="0"
                    max="100"
                    step="0.01"
                    defaultValue="5"
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Keterangan
                  <textarea name="description" maxLength={500} rows={2} className={fieldClass} />
                </label>
                <button type="submit" className="app-button w-full">
                  Simpan metrik
                </button>
              </form>
            </EntryPanel>

            <EntryPanel
              icon={Target}
              title="2. Tetapkan target"
              description="Hubungkan satu metrik ke outcome bisnis."
              defaultOpen={board.metrics.length > 0 && board.targets.length === 0}
            >
              {board.goals.length && board.metrics.length ? (
                <form action={createGoalTargetAction} className="grid gap-3">
                  <label className={labelClass}>
                    Goal
                    <select name="businessGoalId" required defaultValue="" className={fieldClass}>
                      <option value="" disabled>
                        Pilih goal
                      </option>
                      {board.goals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={labelClass}>
                    Metrik
                    <select name="metricDefinitionId" required defaultValue="" className={fieldClass}>
                      <option value="" disabled>
                        Pilih metrik
                      </option>
                      {board.metrics.map((metric) => (
                        <option key={metric.id} value={metric.id}>
                          {metric.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={labelClass}>
                      Nilai awal
                      <input type="number" name="startingValue" step="any" className={fieldClass} />
                    </label>
                    <label className={labelClass}>
                      Nilai target
                      <input type="number" name="targetValue" step="any" required className={fieldClass} />
                    </label>
                  </div>
                  <label className={labelClass}>
                    Arah keberhasilan
                    <select name="direction" defaultValue="increase" className={fieldClass}>
                      <option value="increase">Naik menuju target</option>
                      <option value="decrease">Turun menuju target</option>
                      <option value="maintain">Pertahankan nilai</option>
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={labelClass}>
                      Tenggat
                      <input type="date" name="targetDate" className={fieldClass} />
                    </label>
                    <label className={labelClass}>
                      Bobot (%)
                      <input
                        type="number"
                        name="weightPercent"
                        min="0.01"
                        max="100"
                        step="0.01"
                        defaultValue="100"
                        className={fieldClass}
                      />
                    </label>
                  </div>
                  <button type="submit" className="app-button w-full">
                    Tambahkan target
                  </button>
                </form>
              ) : (
                <DependencyEmpty text="Buat goal dan definisi metrik terlebih dahulu." />
              )}
            </EntryPanel>

            <EntryPanel
              icon={Activity}
              title="3. Catat actual"
              description="Simpan observasi, waktu, dan sumbernya."
              defaultOpen={board.targets.length > 0}
            >
              {board.targets.length ? (
                <form action={createMetricMeasurementAction} className="grid gap-3">
                  <label className={labelClass}>
                    Target terukur
                    <select name="goalTargetId" required defaultValue="" className={fieldClass}>
                      <option value="" disabled>
                        Pilih target
                      </option>
                      {board.targets.map((target) => {
                        const goal = goalById.get(target.business_goal_id)
                        const metric = metricById.get(target.metric_definition_id)
                        return (
                          <option key={target.id} value={target.id}>
                            {goal?.title} - {metric?.name}
                          </option>
                        )
                      })}
                    </select>
                  </label>
                  <label className={labelClass}>
                    Nilai aktual
                    <input type="number" name="measuredValue" step="any" required className={fieldClass} />
                  </label>
                  <label className={labelClass}>
                    Waktu pengukuran
                    <input type="datetime-local" name="measuredAt" required className={fieldClass} />
                  </label>
                  <label className={labelClass}>
                    Sumber
                    <input
                      name="source"
                      required
                      minLength={2}
                      maxLength={50}
                      placeholder="Rekap kas harian"
                      className={fieldClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Catatan bukti
                    <textarea name="note" maxLength={500} rows={3} className={fieldClass} />
                  </label>
                  <button type="submit" className="app-button w-full">
                    Catat hasil aktual
                  </button>
                </form>
              ) : (
                <DependencyEmpty text="Tetapkan sekurangnya satu target terukur dahulu." />
              )}
            </EntryPanel>
          </section>
        )}

        {!board.targets.length ? (
          <section className="app-card grid place-items-center p-10 text-center">
            <Database className="size-9 text-zinc-400" aria-hidden="true" />
            <h2 className="mt-4 font-serif text-2xl font-semibold">Belum ada target terukur</h2>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Mulai dari definisi metrik agar hasil aktual dapat dibandingkan dengan target yang bermakna.
            </p>
          </section>
        ) : (
          <section aria-labelledby="measurement-register-heading" className="app-card overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-4">
              <p className="app-label">Register pengukuran</p>
              <h2 id="measurement-register-heading" className="mt-1 text-lg font-semibold">
                Target versus aktual
              </h2>
            </div>
            <div className="grid gap-px bg-zinc-200">
              {board.targets.map((target) => {
                const goal = goalById.get(target.business_goal_id)
                const plan = goal ? planById.get(goal.business_plan_id) : undefined
                const metric = metricById.get(target.metric_definition_id)
                const actual = actualByTargetId.get(target.id)
                const latest = latestMeasurementByTargetId.get(target.id)
                return (
                  <article
                    key={target.id}
                    className="grid gap-4 bg-white p-5 lg:grid-cols-[minmax(0,1fr)_repeat(3,minmax(8rem,auto))] lg:items-center"
                  >
                    <div>
                      <p className="text-xs text-zinc-500">
                        {plan?.title ?? 'Rencana'} / {goal?.title ?? 'Goal'}
                      </p>
                      <h3 className="mt-1 font-semibold text-zinc-950">{metric?.name ?? 'Metrik'}</h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        Sumber utama:{' '}
                        {metric?.authoritative_source === 'transaction' ? 'transaksi workspace' : 'pengukuran manual'}
                        {latest ? ` · Bukti terakhir: ${latest.source}` : ''}
                      </p>
                    </div>
                    <Measure label="Target" value={formatValue(target.target_value, metric)} />
                    <Measure label="Aktual" value={formatValue(actual?.actual_value ?? null, metric)} />
                    <Measure
                      label="Progress"
                      value={
                        actual?.progress_percent === null || actual?.progress_percent === undefined
                          ? 'Belum tersedia'
                          : `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(actual.progress_percent)}%`
                      }
                      attention={actual?.reconciliation_status === 'attention'}
                    />
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {!canManage && (
          <p className="mt-4 text-sm text-zinc-500">
            Role Anda dapat melihat pengukuran, tetapi tidak memiliki izin `metric.manage` untuk mengubahnya.
          </p>
        )}
      </div>
    </main>
  )
}

function EntryPanel({
  icon: Icon,
  title,
  description,
  defaultOpen,
  children,
}: {
  icon: typeof Plus
  title: string
  description: string
  defaultOpen: boolean
  children: React.ReactNode
}) {
  return (
    <details className="app-card group" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-start gap-3 border-b border-zinc-200 px-4 py-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-zinc-50">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-semibold">{title}</span>
          <span className="mt-0.5 block text-xs font-normal text-zinc-500">{description}</span>
        </span>
      </summary>
      <div className="p-4">{children}</div>
    </details>
  )
}

function DependencyEmpty({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">{text}</p>
}

function Measure({ label, value, attention = false }: { label: string; value: string; attention?: boolean }) {
  return (
    <div className={attention ? 'text-amber-800' : 'text-zinc-950'}>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="app-data mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}
