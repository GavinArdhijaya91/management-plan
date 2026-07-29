import { Archive, ChevronRight, Plus, RotateCcw, Target } from 'lucide-react'
import { Header } from '@/components/header'
import { getPlanningBoard } from '@/lib/planning/service'
import type {
  ActionItemRow,
  BusinessGoalRow,
  BusinessInitiativeRow,
  BusinessPlanRow,
} from '@/lib/supabase/domain-types'
import {
  createActionItemAction,
  createGoalAction,
  createInitiativeAction,
  createPlanAction,
  setPlanningArchiveAction,
  transitionPlanningRecordAction,
} from '@/app/planning/actions'
import {
  actionTransitions,
  goalTransitions,
  initiativeTransitions,
  planTransitions,
} from '@/app/planning/_lib/lifecycle'

const fieldClass = 'app-input w-full'
const labelClass = 'grid gap-1.5 text-sm font-medium text-zinc-700'

const statusLabel: Record<string, string> = {
  draft: 'Draft',
  active: 'Aktif',
  completed: 'Selesai',
  archived: 'Diarsipkan',
  cancelled: 'Dibatalkan',
  achieved: 'Tercapai',
  missed: 'Terlewat',
  planned: 'Direncanakan',
  paused: 'Dijeda',
  todo: 'Belum dimulai',
  in_progress: 'Dikerjakan',
  blocked: 'Terhambat',
}

function StatusPill({ value }: { value: string }) {
  const warning = ['missed', 'blocked', 'cancelled'].includes(value)
  const done = ['completed', 'achieved'].includes(value)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${
        warning
          ? 'border-amber-200 bg-amber-50 text-amber-800'
          : done
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-zinc-200 bg-zinc-50 text-zinc-700'
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${warning ? 'bg-amber-500' : done ? 'bg-emerald-500' : 'bg-zinc-400'}`}
        aria-hidden="true"
      />
      {statusLabel[value] ?? value}
    </span>
  )
}

function Feedback({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null
  return (
    <div
      role={error ? 'alert' : 'status'}
      className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
        error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
      }`}
    >
      {error ?? success}
    </div>
  )
}

function TransitionForm({
  recordType,
  recordId,
  transitions,
}: {
  recordType: 'business_plan' | 'business_goal' | 'business_initiative' | 'action_item'
  recordId: string
  transitions: string[]
}) {
  if (!transitions.length) return null
  return (
    <details className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <summary className="cursor-pointer text-xs font-medium text-zinc-700">Ubah status</summary>
      <form action={transitionPlanningRecordAction} className="mt-3 grid gap-2 sm:grid-cols-2">
        <input type="hidden" name="recordType" value={recordType} />
        <input type="hidden" name="recordId" value={recordId} />
        <select name="targetStatus" required className={fieldClass} defaultValue="">
          <option value="" disabled>
            Pilih status berikutnya
          </option>
          {transitions.map((status) => (
            <option key={status} value={status}>
              {statusLabel[status] ?? status}
            </option>
          ))}
        </select>
        <input name="reason" className={fieldClass} placeholder="Alasan, jika diperlukan" maxLength={1000} />
        {recordType === 'business_goal' && (
          <label className={`${labelClass} sm:col-span-2`}>
            Tanggal pengganti saat membuka target terlewat
            <input type="date" name="replacementTargetDate" className={fieldClass} />
          </label>
        )}
        <button className="app-button sm:col-span-2" type="submit">
          Terapkan perubahan
        </button>
      </form>
    </details>
  )
}

function ArchiveForm({
  recordType,
  recordId,
  archived,
}: {
  recordType: 'business_goal' | 'business_initiative' | 'action_item'
  recordId: string
  archived: boolean
}) {
  return (
    <form action={setPlanningArchiveAction}>
      <input type="hidden" name="recordType" value={recordType} />
      <input type="hidden" name="recordId" value={recordId} />
      <input type="hidden" name="shouldArchive" value={archived ? 'false' : 'true'} />
      <button
        type="submit"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
      >
        {archived ? <RotateCcw className="size-3.5" /> : <Archive className="size-3.5" />}
        {archived ? 'Pulihkan' : 'Arsipkan'}
      </button>
    </form>
  )
}

interface PlanningPageProps {
  searchParams: Promise<{ error?: string; success?: string }>
}

export default async function PlanningPage({ searchParams }: PlanningPageProps) {
  const [{ error, success }, board] = await Promise.all([searchParams, getPlanningBoard()])
  const permission = (code: string) => board.workspace.permission_codes.includes(code)
  const canUpdatePlan = permission('plan.update')
  const canManageGoals = permission('goal.manage')
  const canManageInitiatives = permission('initiative.manage')
  const canCreateActions = permission('action.create')
  const canAssignActions = permission('action.assign')
  const canUpdateAllActions = permission('action.update_all')
  const canUpdateOwnActions = permission('action.update_own')

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter">
        <div className="mb-7 flex flex-col gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="app-label">Workspace / {board.workspace.workspace_name}</p>
            <h1 className="app-heading mt-2">Planning bisnis</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Hubungkan arah bisnis menjadi target, initiative, dan tindakan yang dapat dievaluasi.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600">
            {board.workspace.role_name}
          </span>
        </div>

        <Feedback error={error} success={success} />

        {permission('plan.create') && (
          <details className="app-card mb-6">
            <summary className="flex cursor-pointer list-none items-center gap-2 font-medium">
              <span className="flex w-full items-center gap-2 px-4 py-3.5 text-sm">
                <Plus className="size-4" />
                Buat rencana bisnis
              </span>
            </summary>
            <form action={createPlanAction} className="grid gap-4 border-t border-zinc-200 p-5 md:grid-cols-2">
              <label className={`${labelClass} md:col-span-2`}>
                Nama rencana
                <input name="title" required minLength={2} maxLength={160} className={fieldClass} />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                Deskripsi
                <textarea name="description" maxLength={2000} rows={3} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Mulai
                <input type="date" name="startsOn" required className={fieldClass} />
              </label>
              <label className={labelClass}>
                Selesai
                <input type="date" name="endsOn" required className={fieldClass} />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                Visibilitas
                <select name="visibility" className={fieldClass} defaultValue="workspace">
                  <option value="workspace">Seluruh anggota sesuai permission</option>
                  <option value="restricted">Hanya owner dan penerima grant</option>
                </select>
              </label>
              <button className="app-button md:col-span-2" type="submit">
                Simpan sebagai draft
              </button>
            </form>
          </details>
        )}

        {!board.plans.length ? (
          <section className="app-card grid place-items-center p-10 text-center">
            <Target className="size-9 text-zinc-400" />
            <h2 className="mt-4 font-serif text-2xl font-semibold">Belum ada rencana bisnis</h2>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Buat draft pertama, tambahkan target, lalu aktifkan saat strukturnya siap.
            </p>
          </section>
        ) : (
          <div className="grid gap-6">
            {board.plans.map((plan) => {
              const goals = board.goals.filter((goal) => goal.business_plan_id === plan.id)
              const initiatives = board.initiatives.filter((initiative) => initiative.business_plan_id === plan.id)
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  goals={goals}
                  initiatives={initiatives}
                  actions={board.actions}
                  members={board.members}
                  userId={board.userId}
                  canUpdatePlan={canUpdatePlan}
                  canManageGoals={canManageGoals}
                  canManageInitiatives={canManageInitiatives}
                  canCreateActions={canCreateActions}
                  canAssignActions={canAssignActions}
                  canUpdateAllActions={canUpdateAllActions}
                  canUpdateOwnActions={canUpdateOwnActions}
                />
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

function PlanCard({
  plan,
  goals,
  initiatives,
  actions,
  members,
  userId,
  canUpdatePlan,
  canManageGoals,
  canManageInitiatives,
  canCreateActions,
  canAssignActions,
  canUpdateAllActions,
  canUpdateOwnActions,
}: {
  plan: BusinessPlanRow
  goals: BusinessGoalRow[]
  initiatives: BusinessInitiativeRow[]
  actions: ActionItemRow[]
  members: Awaited<ReturnType<typeof getPlanningBoard>>['members']
  userId: string
  canUpdatePlan: boolean
  canManageGoals: boolean
  canManageInitiatives: boolean
  canCreateActions: boolean
  canAssignActions: boolean
  canUpdateAllActions: boolean
  canUpdateOwnActions: boolean
}) {
  return (
    <section className="app-card overflow-hidden">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-xl font-semibold">{plan.title}</h2>
              <StatusPill value={plan.status} />
              {plan.visibility === 'restricted' && (
                <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs text-violet-800">
                  Restricted
                </span>
              )}
            </div>
            {plan.description && <p className="mt-2 max-w-3xl text-sm text-zinc-500">{plan.description}</p>}
            <p className="mt-2 text-xs text-zinc-400">
              {plan.starts_on} — {plan.ends_on}
            </p>
          </div>
          <span className="text-xs text-zinc-500">
            {goals.filter((goal) => !goal.archived_at).length} target · {initiatives.length} initiative
          </span>
        </div>
        {canUpdatePlan && (
          <TransitionForm recordType="business_plan" recordId={plan.id} transitions={planTransitions[plan.status]} />
        )}
      </div>

      <div className="grid gap-5 p-5 md:p-6">
        {canManageGoals && plan.status !== 'archived' && (
          <details className="rounded-xl border border-dashed border-zinc-300 p-4">
            <summary className="cursor-pointer text-sm font-medium">Tambah target</summary>
            <form action={createGoalAction} className="mt-4 grid gap-3 md:grid-cols-2">
              <input type="hidden" name="businessPlanId" value={plan.id} />
              <label className={`${labelClass} md:col-span-2`}>
                Nama target
                <input name="title" required minLength={2} maxLength={160} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Tanggal target
                <input type="date" name="targetDate" className={fieldClass} />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                Deskripsi
                <textarea name="description" rows={2} maxLength={1500} className={fieldClass} />
              </label>
              <button className="app-button md:col-span-2" type="submit">
                Tambahkan target
              </button>
            </form>
          </details>
        )}

        {canManageInitiatives && plan.status !== 'archived' && (
          <details className="rounded-xl border border-dashed border-zinc-300 p-4">
            <summary className="cursor-pointer text-sm font-medium">Tambah initiative</summary>
            <form action={createInitiativeAction} className="mt-4 grid gap-3 md:grid-cols-2">
              <input type="hidden" name="businessPlanId" value={plan.id} />
              <label className={`${labelClass} md:col-span-2`}>
                Nama initiative
                <input name="title" required minLength={2} maxLength={160} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Target terkait
                <select name="businessGoalId" className={fieldClass} defaultValue="">
                  <option value="">Tanpa target khusus</option>
                  {goals
                    .filter((goal) => !goal.archived_at)
                    .map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title}
                      </option>
                    ))}
                </select>
              </label>
              <label className={labelClass}>
                Konteks jika tanpa target
                <input name="unlinkedGoalContext" minLength={5} maxLength={1000} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Mulai
                <input type="date" name="startsOn" className={fieldClass} />
              </label>
              <label className={labelClass}>
                Selesai
                <input type="date" name="endsOn" className={fieldClass} />
              </label>
              <label className={labelClass}>
                Anggaran
                <input type="number" name="budgetAmount" min={0} step="0.01" className={fieldClass} />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                Deskripsi
                <textarea name="description" rows={2} maxLength={1500} className={fieldClass} />
              </label>
              <button className="app-button md:col-span-2" type="submit">
                Tambahkan initiative
              </button>
            </form>
          </details>
        )}

        <div className="grid gap-4">
          {goals.map((goal) => (
            <article
              key={goal.id}
              className={`rounded-2xl border border-zinc-200 p-4 ${goal.archived_at ? 'bg-zinc-50 opacity-70' : 'bg-white'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="size-4 text-zinc-400" />
                    <h3 className="font-medium">{goal.title}</h3>
                    <StatusPill value={goal.status} />
                  </div>
                  {goal.target_date && <p className="mt-1 pl-6 text-xs text-zinc-500">Target {goal.target_date}</p>}
                </div>
                {canUpdatePlan && (
                  <ArchiveForm recordType="business_goal" recordId={goal.id} archived={Boolean(goal.archived_at)} />
                )}
              </div>
              {canManageGoals && plan.status !== 'archived' && !goal.archived_at && (
                <TransitionForm
                  recordType="business_goal"
                  recordId={goal.id}
                  transitions={goalTransitions[goal.status]}
                />
              )}
            </article>
          ))}
        </div>

        <div className="grid gap-4">
          {initiatives.map((initiative) => {
            const initiativeActions = actions.filter((action) => action.business_initiative_id === initiative.id)
            return (
              <article
                key={initiative.id}
                className={`rounded-2xl border border-zinc-200 p-4 ${initiative.archived_at ? 'bg-zinc-50 opacity-70' : 'bg-white'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg font-semibold">{initiative.title}</h3>
                      <StatusPill value={initiative.status} />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {goals.find((goal) => goal.id === initiative.business_goal_id)?.title ??
                        initiative.unlinked_goal_context}
                    </p>
                  </div>
                  {canUpdatePlan && (
                    <ArchiveForm
                      recordType="business_initiative"
                      recordId={initiative.id}
                      archived={Boolean(initiative.archived_at)}
                    />
                  )}
                </div>

                {canManageInitiatives && plan.status !== 'archived' && !initiative.archived_at && (
                  <TransitionForm
                    recordType="business_initiative"
                    recordId={initiative.id}
                    transitions={initiativeTransitions[initiative.status]}
                  />
                )}

                <div className="mt-4 grid gap-2">
                  {initiativeActions.map((action) => {
                    const canUpdateAction =
                      canUpdateAllActions || (canUpdateOwnActions && action.assignee_id === userId)
                    return (
                      <div
                        key={action.id}
                        className={`rounded-xl border border-zinc-200 p-3 ${action.archived_at ? 'bg-zinc-50 opacity-70' : ''}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium">{action.title}</p>
                              <StatusPill value={action.status} />
                              <span className="text-[11px] text-zinc-400">P{action.priority}</span>
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">
                              {members.find((member) => member.user_id === action.assignee_id)?.display_name ??
                                'Anggota'}{' '}
                              · tenggat {action.due_on}
                            </p>
                          </div>
                          {canUpdatePlan && (
                            <ArchiveForm
                              recordType="action_item"
                              recordId={action.id}
                              archived={Boolean(action.archived_at)}
                            />
                          )}
                        </div>
                        {canUpdateAction && plan.status !== 'archived' && !action.archived_at && (
                          <TransitionForm
                            recordType="action_item"
                            recordId={action.id}
                            transitions={actionTransitions[action.status]}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                {canCreateActions && plan.status !== 'archived' && !initiative.archived_at && (
                  <details className="mt-4 rounded-xl border border-dashed border-zinc-300 p-3">
                    <summary className="cursor-pointer text-xs font-medium">Tambah tindakan</summary>
                    <form action={createActionItemAction} className="mt-3 grid gap-3 md:grid-cols-2">
                      <input type="hidden" name="businessInitiativeId" value={initiative.id} />
                      <label className={`${labelClass} md:col-span-2`}>
                        Nama tindakan
                        <input name="title" required minLength={2} maxLength={160} className={fieldClass} />
                      </label>
                      <label className={labelClass}>
                        Assignee
                        <select name="assigneeId" required className={fieldClass} defaultValue={userId}>
                          {members
                            .filter((member) => canAssignActions || member.user_id === userId)
                            .map((member) => (
                              <option key={member.user_id} value={member.user_id}>
                                {member.display_name} · {member.role_name}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label className={labelClass}>
                        Prioritas
                        <select name="priority" className={fieldClass} defaultValue="2">
                          <option value="1">P1 · Kritis</option>
                          <option value="2">P2 · Tinggi</option>
                          <option value="3">P3 · Normal</option>
                          <option value="4">P4 · Rendah</option>
                        </select>
                      </label>
                      <label className={labelClass}>
                        Mulai
                        <input type="date" name="startsOn" className={fieldClass} />
                      </label>
                      <label className={labelClass}>
                        Tenggat
                        <input type="date" name="dueOn" required className={fieldClass} />
                      </label>
                      <label className={`${labelClass} md:col-span-2`}>
                        Deskripsi
                        <textarea name="description" rows={2} maxLength={1000} className={fieldClass} />
                      </label>
                      <button className="app-button md:col-span-2" type="submit">
                        Tambahkan tindakan
                      </button>
                    </form>
                  </details>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
