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
        <p className="app-label mb-3">Workspace · {workspace.workspace_name}</p>
        <h1 className="app-heading">Kalender &amp; pengingat</h1>
        <p className="mt-2 text-zinc-500">Agenda privat workspace tanpa data contoh.</p>
        {error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Agenda gagal dimuat. Periksa permission kalender Anda.
          </p>
        ) : data?.length ? (
          <div className="mt-6 grid gap-3">
            {data.map((event) => (
              <article key={event.id} className="app-card flex gap-4 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                  <CalendarDays className="size-5" />
                </span>
                <div>
                  <span className="app-label">{event.type}</span>
                  <h2 className="mt-1 font-serif text-lg font-semibold">{event.title}</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(
                      new Date(event.starts_at),
                    )}
                  </p>
                  {event.notes && <p className="mt-2 text-sm text-zinc-600">{event.notes}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="app-card mt-6 p-8 text-center">
            <h2 className="font-serif text-2xl font-semibold">Belum ada agenda</h2>
            <p className="mt-2 text-sm text-zinc-500">Agenda contoh hanya tersedia pada mode demo.</p>
          </section>
        )}
      </div>
    </main>
  )
}
