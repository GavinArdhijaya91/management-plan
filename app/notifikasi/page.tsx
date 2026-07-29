import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { requireActiveWorkspace } from '@/lib/workspace/context'
import { Bell } from 'lucide-react'
import Link from 'next/link'

export default async function NotificationsPage() {
  const [user, workspace] = await Promise.all([
    requireAuthenticatedUser('/notifikasi'),
    requireActiveWorkspace('/notifikasi'),
  ])
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('id,title,detail,href,read_at,occurred_at,type')
    .eq('workspace_id', workspace.workspace_id)
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })
    .limit(100)

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter max-w-4xl">
        <p className="app-label mb-3">Workspace · {workspace.workspace_name}</p>
        <h1 className="app-heading">Notifikasi</h1>
        <p className="mt-2 text-zinc-500">Aktivitas privat yang ditujukan kepada akun Anda.</p>
        {error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Notifikasi gagal dimuat.
          </p>
        ) : data?.length ? (
          <div className="mt-6 grid gap-3">
            {data.map((notification) => {
              const content = (
                <>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                    <Bell className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-sm">{notification.title}</strong>
                    <span className="mt-1 block text-sm text-zinc-600">{notification.detail}</span>
                    <span className="mt-2 block text-xs text-zinc-400">
                      {new Intl.DateTimeFormat('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(notification.occurred_at))}
                    </span>
                  </span>
                </>
              )
              const className = `app-card flex gap-4 p-4 ${notification.read_at ? 'opacity-70' : ''}`
              return notification.href ? (
                <Link key={notification.id} href={notification.href} className={className}>
                  {content}
                </Link>
              ) : (
                <article key={notification.id} className={className}>
                  {content}
                </article>
              )
            })}
          </div>
        ) : (
          <section className="app-card mt-6 p-8 text-center">
            <h2 className="font-serif text-2xl font-semibold">Belum ada notifikasi</h2>
            <p className="mt-2 text-sm text-zinc-500">Aktivitas workspace baru akan muncul di sini.</p>
          </section>
        )}
      </div>
    </main>
  )
}
