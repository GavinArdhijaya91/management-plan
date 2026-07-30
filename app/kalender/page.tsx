import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { requireActiveWorkspace } from '@/lib/workspace/context'
import { CalendarDays } from 'lucide-react'

export default async function CalendarPage() {
  const workspace = await requireActiveWorkspace('/kalender')
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('calendar_events')
    .select('id,title,type,starts_at,ends_at,completed_at,notes')
    .eq('workspace_id', workspace.workspace_id)
    .order('starts_at', { ascending: true })
    .limit(100)

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter">
        <div className="border-b border-zinc-200 pb-6">
          <p className="app-label mb-2">Workspace / {workspace.workspace_name}</p>
          <h1 className="app-heading">Kalender &amp; pengingat</h1>
          <p className="mt-2 text-sm text-zinc-500">Agenda privat dan tenggat yang terhubung dengan workspace.</p>
        </div>
        {error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Agenda gagal dimuat. Periksa permission kalender Anda.
          </p>
        ) : data?.length ? (
          <div className="app-card mt-6 divide-y divide-zinc-100 overflow-hidden">
            {data.map((event) => (
              <article
                key={event.id}
                className="grid gap-3 px-4 py-4 hover:bg-zinc-50 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="flex min-w-0 gap-3">
                  <CalendarDays className="mt-0.5 size-5 shrink-0 text-zinc-400" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-semibold">{event.title}</h2>
                      <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[0.68rem] font-medium text-zinc-600">
                        {event.type}
                      </span>
                    </div>
                    {event.notes && <p className="mt-1 truncate text-sm text-zinc-500">{event.notes}</p>}
                  </div>
                </div>
                <p className="app-data whitespace-nowrap text-xs text-zinc-500">
                  {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(
                    new Date(event.starts_at),
                  )}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <section className="app-card mt-6 flex items-start gap-3 p-6">
            <CalendarDays className="size-5 shrink-0 text-zinc-400" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold">Belum ada agenda</h2>
              <p className="mt-1 text-sm text-zinc-500">Agenda workspace akan muncul ketika jadwal mulai dibuat.</p>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
