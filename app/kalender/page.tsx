import { Header } from '@/components/header'
import { WorkspaceCalendar } from '@/app/kalender/_components/workspace-calendar'
import { createClient } from '@/lib/supabase/server'
import { hasWorkspacePermission, requireActiveWorkspace } from '@/lib/workspace/context'

export default async function CalendarPage() {
  const workspace = await requireActiveWorkspace('/kalender')
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
        loadError={error ? 'Agenda gagal dimuat. Periksa permission kalender Anda.' : undefined}
      />
    </main>
  )
}
