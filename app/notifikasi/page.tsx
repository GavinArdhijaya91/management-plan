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
  const orchestration = await supabase.rpc('orchestrate_my_workspace_notifications', {
    target_workspace_id: workspace.workspace_id,
  })
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
        <div className="border-b border-zinc-200 pb-6">
          <p className="app-label mb-2">Workspace / {workspace.workspace_name}</p>
          <h1 className="app-heading">Notifikasi</h1>
          <p className="mt-2 text-sm text-zinc-500">Aktivitas privat yang membutuhkan perhatian akun Anda.</p>
        </div>
        {orchestration.error && (
          <p role="status" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Pengingat terbaru belum dapat diperbarui. Notifikasi yang sudah tersimpan tetap ditampilkan.
          </p>
        )}
        {error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Notifikasi gagal dimuat.
          </p>
        ) : data?.length ? (
          <div className="app-card mt-6 divide-y divide-zinc-100 overflow-hidden">
            {data.map((notification) => {
              const content = (
                <>
                  <Bell className="mt-0.5 size-4 shrink-0 text-zinc-400" aria-hidden="true" />
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
              const className = `relative flex gap-3 p-4 hover:bg-zinc-50 ${
                notification.read_at
                  ? 'opacity-65'
                  : 'before:absolute before:inset-y-4 before:left-0 before:w-0.5 before:bg-zinc-950'
              }`
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
          <section className="app-card mt-6 flex items-start gap-3 p-6">
            <Bell className="size-5 shrink-0 text-zinc-400" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold">Belum ada notifikasi</h2>
              <p className="mt-1 text-sm text-zinc-500">Aktivitas workspace baru akan muncul di sini.</p>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
