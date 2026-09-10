import { cookies, headers } from 'next/headers'
import { Header } from '@/components/header'
import { WorkspaceCalendar } from '@/app/calendar/_components/workspace-calendar'
import { LOCALE_COOKIE, resolveLocale } from '@/app/_i18n/locale'
import { workspaceCopy } from '@/app/_i18n/pages/workspace'
import { createClient } from '@/lib/supabase/server'
import { hasWorkspacePermission, requireActiveWorkspace } from '@/lib/workspace/context'

export default async function CalendarPage() {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const locale = resolveLocale({ cookieLocale: cookieStore.get(LOCALE_COOKIE)?.value ?? null, acceptLanguageHeader: headerStore.get('accept-language') })
  const t = workspaceCopy[locale]
  const workspace = await requireActiveWorkspace('/calendar')
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('calendar_events')
    .select('id,title,type,starts_at,ends_at,completed_at,notes')
    .eq('workspace_id', workspace.workspace_id)
    .order('starts_at', { ascending: true })
    .limit(100)

  const initialMonth = new Date().toISOString().slice(0, 7)

  return (
    <main className="app-shell">
      <Header />
      <WorkspaceCalendar
        workspaceName={workspace.workspace_name}
        events={data ?? []}
        initialMonth={initialMonth}
        canWrite={hasWorkspacePermission(workspace, 'calendar.write')}
        canDelete={hasWorkspacePermission(workspace, 'calendar.delete')}
        loadError={error ? t.calendar.error : undefined}
      />
    </main>
  )
}
