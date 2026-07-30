import Link from 'next/link'
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardCheck, RefreshCw } from 'lucide-react'
import { Header } from '@/components/header'
import { getBusinessReviewBoard } from '@/lib/planning/service'
import {
  createBusinessReviewAction,
  finalizeBusinessReviewAction,
  refreshBusinessReviewAction,
} from '@/app/planning/reviews/actions'

const fieldClass = 'app-input w-full'
const labelClass = 'grid gap-1.5 text-sm font-medium text-zinc-700'

interface ReviewPageProps {
  searchParams: Promise<{ error?: string; success?: string }>
}

export default async function BusinessReviewsPage({ searchParams }: ReviewPageProps) {
  const [{ error, success }, board] = await Promise.all([searchParams, getBusinessReviewBoard()])
  const permission = (code: string) => board.workspace.permission_codes.includes(code)
  const canCreate = permission('plan.update')
  const canFinalize = permission('review.finalize')

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter">
        <div className="mb-7 flex flex-col gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/planning"
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-950"
            >
              <ArrowLeft className="size-4" />
              Kembali ke planning
            </Link>
            <p className="app-label">Planning / Evaluasi</p>
            <h1 className="app-heading mt-2">Business review</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Periksa hasil aktual, pahami warning, lalu kunci evidence ketika evaluasi siap.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600">
            {board.workspace.workspace_name}
          </span>
        </div>

        {(error || success) && (
          <div
            role={error ? 'alert' : 'status'}
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {error ?? success}
          </div>
        )}

        {canCreate && board.plans.length > 0 && (
          <details className="app-card mb-6">
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold">Buat draft evaluasi</summary>
            <form
              action={createBusinessReviewAction}
              className="grid gap-4 border-t border-zinc-200 p-5 md:grid-cols-2"
            >
              <label className={`${labelClass} md:col-span-2`}>
                Rencana bisnis
                <select name="businessPlanId" required className={fieldClass} defaultValue="">
                  <option value="" disabled>
                    Pilih rencana
                  </option>
                  {board.plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Jenis periode
                <select name="periodType" className={fieldClass} defaultValue="monthly">
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                  <option value="quarterly">Kuartalan</option>
                  <option value="annual">Tahunan</option>
                  <option value="custom">Kustom</option>
                </select>
              </label>
              <span aria-hidden="true" className="hidden md:block" />
              <label className={labelClass}>
                Awal periode
                <input type="date" name="periodStart" required className={fieldClass} />
              </label>
              <label className={labelClass}>
                Akhir periode
                <input type="date" name="periodEnd" required className={fieldClass} />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                Ringkasan
                <textarea name="summary" required minLength={10} maxLength={3000} rows={4} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Pencapaian
                <textarea name="wins" maxLength={3000} rows={3} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Tantangan
                <textarea name="challenges" maxLength={3000} rows={3} className={fieldClass} />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                Tindak lanjut
                <textarea name="nextSteps" maxLength={3000} rows={3} className={fieldClass} />
              </label>
              <button type="submit" className="app-button md:col-span-2">
                Simpan draft evaluasi
              </button>
            </form>
          </details>
        )}

        {!board.reviews.length ? (
          <section className="app-card grid place-items-center p-10 text-center">
            <ClipboardCheck className="size-9 text-zinc-400" />
            <h2 className="mt-4 font-serif text-2xl font-semibold">Belum ada evaluasi</h2>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Buat evaluasi setelah rencana memiliki aktivitas atau hasil yang perlu ditinjau.
            </p>
          </section>
        ) : (
          <div className="grid gap-5">
            {board.reviews.map((review) => {
              const plan = board.plans.find((candidate) => candidate.id === review.business_plan_id)
              const issues = board.readinessByReviewId[review.id] ?? []
              const snapshots = board.goalSnapshots.filter((snapshot) => snapshot.business_review_id === review.id)
              const actionSnapshot = board.actionSnapshots.find((snapshot) => snapshot.business_review_id === review.id)
              const blockingIssues = issues.filter((issue) => issue.severity === 'blocking')
              const warnings = issues.filter((issue) => issue.severity === 'warning')

              return (
                <article key={review.id} className="app-card p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="app-label">{plan?.title ?? 'Rencana bisnis'}</p>
                      <h2 className="mt-1 font-serif text-xl font-semibold">
                        {review.period_start} — {review.period_end}
                      </h2>
                      <p className="mt-2 text-sm text-zinc-600">{review.summary}</p>
                    </div>
                    <span
                      className={`w-fit rounded-md border px-2.5 py-1 text-xs font-medium ${
                        review.status === 'finalized'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      {review.status === 'finalized' ? 'Finalized' : 'Draft'}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Metric label="Target tercatat" value={String(snapshots.length)} />
                    <Metric
                      label="Perlu rekonsiliasi"
                      value={String(
                        snapshots.filter((snapshot) => snapshot.reconciliation_status === 'attention').length,
                      )}
                    />
                    <Metric label="Action belum selesai" value={String(actionSnapshot?.overdue_count ?? 0)} />
                  </div>

                  {review.status === 'draft' && (
                    <div className="mt-5 border-t border-zinc-200 pt-5">
                      {issues.length === 0 ? (
                        <p className="flex items-center gap-2 text-sm text-emerald-700">
                          <CheckCircle2 className="size-4" />
                          Tidak ada blocker atau warning pada snapshot terakhir.
                        </p>
                      ) : (
                        <div className="grid gap-2">
                          {issues.map((issue) => (
                            <p
                              key={issue.issue_code}
                              className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
                                issue.severity === 'blocking'
                                  ? 'border-red-200 bg-red-50 text-red-800'
                                  : 'border-amber-200 bg-amber-50 text-amber-800'
                              }`}
                            >
                              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                              {issue.issue_message}
                            </p>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        {canFinalize && (
                          <form action={refreshBusinessReviewAction}>
                            <input type="hidden" name="reviewId" value={review.id} />
                            <button type="submit" className="app-button-secondary">
                              <RefreshCw className="size-4" />
                              Perbarui evidence
                            </button>
                          </form>
                        )}
                        {canFinalize && (
                          <form action={finalizeBusinessReviewAction} className="grid gap-3">
                            <input type="hidden" name="reviewId" value={review.id} />
                            {warnings.length > 0 && (
                              <label className="flex max-w-xl items-start gap-2 text-xs text-zinc-600">
                                <input type="checkbox" name="acknowledgeWarnings" required className="mt-0.5 size-4" />
                                Saya memahami {warnings.length} warning dan tetap ingin mengunci evaluasi ini.
                              </label>
                            )}
                            <button type="submit" className="app-button" disabled={blockingIssues.length > 0}>
                              Finalisasi evaluasi
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-950">{value}</p>
    </div>
  )
}
