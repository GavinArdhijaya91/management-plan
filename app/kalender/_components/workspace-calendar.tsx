'use client'

import { AppToast } from '@/app/_components/app-toast'
import { LocalDateTime } from '@/app/_components/local-date-time'
import { Modal } from '@/app/_components/modal'
import { ConfirmationDialog } from '@/app/manajemen/_components/confirmation-dialog'
import {
  createCalendarEventAction,
  deleteCalendarEventAction,
  toggleCalendarEventAction,
  updateCalendarEventAction,
} from '@/app/kalender/actions'
import type { Database } from '@/lib/supabase/database.types'
import {
  CalendarDaysIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'

type EventType = Database['public']['Enums']['calendar_event_type']

export interface WorkspaceCalendarEvent {
  id: string
  title: string
  type: EventType
  starts_at: string
  ends_at: string | null
  completed_at: string | null
  notes: string | null
}

interface WorkspaceCalendarProps {
  canDelete: boolean
  canWrite: boolean
  events: WorkspaceCalendarEvent[]
  initialMonth: string
  loadError?: string
  workspaceName: string
}

interface EventFormState {
  title: string
  type: EventType
  startsAt: string
  endsAt: string
  notes: string
}

const eventTypeLabels: Record<EventType, string> = {
  supplier: 'Supplier',
  payroll: 'Gaji',
  stock: 'Stok',
  other: 'Lainnya',
}

function monthDate(month: string) {
  return new Date(`${month}-01T12:00:00.000Z`)
}

function shiftMonth(month: string, amount: number) {
  const date = monthDate(month)
  date.setUTCMonth(date.getUTCMonth() + amount)
  return date.toISOString().slice(0, 7)
}

function dateKey(value: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).formatToParts(new Date(value))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

function localInputValue(value: string) {
  const date = new Date(value)
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function defaultStart(date: string) {
  return `${date}T09:00`
}

export function WorkspaceCalendar({
  canDelete,
  canWrite,
  events,
  initialMonth,
  loadError,
  workspaceName,
}: Readonly<WorkspaceCalendarProps>) {
  const router = useRouter()
  const [month, setMonth] = useState(initialMonth)
  const [selectedDate, setSelectedDate] = useState(`${initialMonth}-01`)
  const [timeZone, setTimeZone] = useState('UTC')
  const [editing, setEditing] = useState<WorkspaceCalendarEvent | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceCalendarEvent | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState<EventFormState>({
    title: '',
    type: 'other',
    startsAt: defaultStart(`${initialMonth}-01`),
    endsAt: '',
    notes: '',
  })

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
      const now = new Date()
      const pad = (part: number) => String(part).padStart(2, '0')
      const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      setMonth(today.slice(0, 7))
      setSelectedDate(today)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const monthMeta = useMemo(() => {
    const date = monthDate(month)
    return {
      label: new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date),
      days: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate(),
      offset: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).getUTCDay(),
    }
  }, [month])

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, WorkspaceCalendarEvent[]>()
    for (const event of events) {
      const key = dateKey(event.starts_at, timeZone)
      grouped.set(key, [...(grouped.get(key) ?? []), event])
    }
    return grouped
  }, [events, timeZone])
  const selectedEvents = eventsByDate.get(selectedDate) ?? []

  const chooseMonth = (nextMonth: string) => {
    setMonth(nextMonth)
    setSelectedDate(`${nextMonth}-01`)
  }

  const openCreate = () => {
    setEditing(null)
    setFormError(null)
    setForm({ title: '', type: 'other', startsAt: defaultStart(selectedDate), endsAt: '', notes: '' })
    setFormOpen(true)
  }

  const openEdit = (event: WorkspaceCalendarEvent) => {
    setEditing(event)
    setFormError(null)
    setForm({
      title: event.title,
      type: event.type,
      startsAt: localInputValue(event.starts_at),
      endsAt: event.ends_at ? localInputValue(event.ends_at) : '',
      notes: event.notes ?? '',
    })
    setFormOpen(true)
  }

  const finish = (result: { ok: boolean; message: string }, onSuccess?: () => void, inlineError = false) => {
    if (!result.ok) {
      if (inlineError) setFormError(result.message)
      else setMutationError(result.message)
      return
    }
    setFormError(null)
    setMutationError(null)
    setFeedback(result.message)
    onSuccess?.()
    router.refresh()
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    const startsAt = new Date(form.startsAt)
    const endsAt = form.endsAt ? new Date(form.endsAt) : null
    if (Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime()))) {
      setFormError('Tanggal atau waktu agenda tidak valid.')
      return
    }
    const input = {
      title: form.title,
      type: form.type,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt?.toISOString() ?? null,
      notes: form.notes,
    }
    startTransition(async () => {
      const result = editing
        ? await updateCalendarEventAction({ id: editing.id, ...input })
        : await createCalendarEventAction(input)
      finish(
        result,
        () => {
          setFormOpen(false)
          setEditing(null)
        },
        true,
      )
    })
  }

  const toggleCompleted = (event: WorkspaceCalendarEvent) => {
    startTransition(async () => finish(await toggleCalendarEventAction({ id: event.id })))
  }

  const confirmDelete = () => {
    if (!deleteTarget || pending) return
    startTransition(async () => {
      const result = await deleteCalendarEventAction({ id: deleteTarget.id })
      if (!result.ok) setDeleteTarget(null)
      finish(result, () => setDeleteTarget(null))
    })
  }

  return (
    <>
      <div className="page-shell motion-page-enter">
        <div className="flex flex-col justify-between gap-5 border-b border-zinc-200 pb-6 md:flex-row md:items-end">
          <div>
            <p className="app-label mb-2">Workspace / {workspaceName}</p>
            <h1 className="app-heading">Kalender &amp; pengingat</h1>
            <p className="mt-2 text-sm text-zinc-500">Atur agenda operasional sesuai zona waktu perangkat Anda.</p>
          </div>
          {canWrite && (
            <button type="button" onClick={openCreate} className="app-button w-full md:w-auto">
              <PlusIcon className="size-4" aria-hidden="true" />
              Tambah agenda
            </button>
          )}
        </div>

        {loadError && (
          <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </p>
        )}
        {mutationError && (
          <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {mutationError}
          </p>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(19rem,.8fr)]">
          <section className="app-card p-4 md:p-6" aria-label="Kalender bulanan">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold capitalize">{monthMeta.label}</h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => chooseMonth(shiftMonth(month, -1))}
                  aria-label="Bulan sebelumnya"
                  className="grid size-11 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                >
                  <ChevronLeftIcon className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => chooseMonth(shiftMonth(month, 1))}
                  aria-label="Bulan berikutnya"
                  className="grid size-11 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                >
                  <ChevronRightIcon className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[0.68rem] font-medium text-zinc-400 sm:gap-2">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <span key={day} className="py-2">
                  {day}
                </span>
              ))}
              {Array.from({ length: monthMeta.offset }, (_, index) => (
                <span key={`empty-${index}`} aria-hidden="true" />
              ))}
              {Array.from({ length: monthMeta.days }, (_, index) => {
                const day = index + 1
                const key = `${month}-${String(day).padStart(2, '0')}`
                const dayEvents = eventsByDate.get(key) ?? []
                const selected = key === selectedDate
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(key)}
                    aria-pressed={selected}
                    aria-label={`${day} ${monthMeta.label}, ${dayEvents.length} agenda`}
                    className={`relative aspect-square min-h-10 rounded-lg border font-mono text-sm transition-[background-color,border-color,color,transform] active:scale-95 ${
                      selected
                        ? 'border-zinc-950 bg-zinc-950 text-white'
                        : dayEvents.length
                          ? 'border-zinc-300 bg-zinc-100 text-zinc-950 hover:border-zinc-500'
                          : 'border-transparent text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {day}
                    {dayEvents.length > 0 && (
                      <span
                        className={`absolute bottom-1.5 left-1/2 h-0.5 w-3 -translate-x-1/2 ${selected ? 'bg-white' : 'bg-zinc-950'}`}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <aside className="app-card overflow-hidden" aria-label="Agenda pada tanggal terpilih">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div>
                <p className="app-label">Tanggal terpilih</p>
                <p className="app-data mt-1 text-sm font-semibold">{selectedDate}</p>
              </div>
              {canWrite && (
                <button
                  type="button"
                  onClick={openCreate}
                  aria-label="Tambah agenda pada tanggal terpilih"
                  className="grid size-10 place-items-center rounded-lg border border-zinc-200 hover:bg-zinc-100"
                >
                  <PlusIcon className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {selectedEvents.length ? (
              <div className="divide-y divide-zinc-100">
                {selectedEvents.map((event) => (
                  <article
                    key={event.id}
                    className={`px-5 py-4 transition-colors ${event.completed_at ? 'bg-zinc-50/80' : 'hover:bg-zinc-50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <CalendarDaysIcon className="mt-0.5 size-5 shrink-0 text-zinc-400" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`text-sm font-semibold ${event.completed_at ? 'text-zinc-400 line-through' : ''}`}
                          >
                            {event.title}
                          </h3>
                          <span className="rounded-md border border-zinc-200 px-2 py-0.5 text-[0.68rem] text-zinc-500">
                            {eventTypeLabels[event.type]}
                          </span>
                        </div>
                        <LocalDateTime value={event.starts_at} className="mt-1 block font-mono text-xs text-zinc-500" />
                        {event.ends_at && (
                          <span className="mt-1 block text-xs text-zinc-400">
                            Selesai <LocalDateTime value={event.ends_at} />
                          </span>
                        )}
                        {event.notes && <p className="mt-2 text-sm leading-6 text-zinc-500">{event.notes}</p>}
                      </div>
                    </div>
                    {(canWrite || canDelete) && (
                      <div className="mt-3 flex flex-wrap justify-end gap-1 border-t border-zinc-100 pt-3">
                        {canWrite && (
                          <>
                            <button
                              type="button"
                              onClick={() => toggleCompleted(event)}
                              disabled={pending}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
                            >
                              <CheckIcon className="size-4" aria-hidden="true" />
                              {event.completed_at ? 'Buka kembali' : 'Selesai'}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(event)}
                              disabled={pending}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
                            >
                              <PencilSquareIcon className="size-4" aria-hidden="true" />
                              Edit
                            </button>
                          </>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(event)}
                            disabled={pending}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            <TrashIcon className="size-4" aria-hidden="true" />
                            Hapus
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <CalendarDaysIcon className="mx-auto size-7 text-zinc-300" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-semibold">Belum ada agenda</h3>
                <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-zinc-500">
                  {canWrite ? 'Tambahkan aktivitas penting untuk tanggal ini.' : 'Tidak ada agenda pada tanggal ini.'}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => !pending && setFormOpen(false)}
        title={editing ? 'Edit agenda' : 'Tambah agenda'}
        description="Waktu mengikuti zona waktu perangkat yang sedang digunakan."
      >
        <form onSubmit={submit} className="space-y-4">
          {formError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}
          <label className="block text-sm font-medium text-zinc-800">
            Judul agenda
            <input
              required
              minLength={2}
              maxLength={160}
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="app-input mt-2 min-h-11 w-full"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-800">
            Kategori
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value as EventType })}
              className="app-input mt-2 min-h-11 w-full"
            >
              {Object.entries(eventTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-800">
              Mulai
              <input
                required
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => setForm({ ...form, startsAt: event.target.value })}
                className="app-input mt-2 min-h-11 w-full"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-800">
              Selesai (opsional)
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => setForm({ ...form, endsAt: event.target.value })}
                className="app-input mt-2 min-h-11 w-full"
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-zinc-800">
            Catatan (opsional)
            <textarea
              maxLength={1000}
              rows={4}
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              className="app-input mt-2 w-full resize-y"
            />
          </label>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              disabled={pending}
              className="min-h-11 rounded-lg border border-zinc-200 px-4 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button type="submit" disabled={pending} className="app-button min-w-32 disabled:opacity-50">
              {pending ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Tambah agenda'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        open={deleteTarget !== null}
        title="Hapus agenda?"
        description={`Agenda ${deleteTarget?.title ?? ''} akan dihapus permanen dari workspace.`}
        confirmLabel={pending ? 'Menghapus...' : 'Hapus agenda'}
        onCancel={() => !pending && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      <AppToast message={feedback} onClose={() => setFeedback(null)} />
    </>
  )
}
