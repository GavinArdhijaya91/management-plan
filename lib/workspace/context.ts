import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAuthenticatedUser } from '@/lib/auth/session'

export const activeWorkspaceCookie = 'siapin-active-workspace'

export type WorkspaceAccess = {
  workspace_id: string
  workspace_name: string
  workspace_slug: string
  workspace_logo_path: string | null
  membership_status: 'active' | 'invited' | 'suspended'
  workspace_role_id: string
  role_code: string
  role_name: string
  hierarchy_rank: number
  base_role: 'owner' | 'admin' | 'manager' | 'staff' | 'viewer'
  is_owner_role: boolean
  permission_codes: string[]
}

export async function getMyWorkspaceAccess(): Promise<WorkspaceAccess[]> {
  await requireAuthenticatedUser()
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_my_workspace_access')

  if (error) throw new Error(`Unable to resolve workspace access: ${error.message}`)
  return (data ?? []) as WorkspaceAccess[]
}

export async function getActiveWorkspace(): Promise<WorkspaceAccess | null> {
  const cookieStore = await cookies()
  const selectedWorkspaceId = cookieStore.get(activeWorkspaceCookie)?.value
  const memberships = (await getMyWorkspaceAccess()).filter((membership) => membership.membership_status === 'active')

  return (
    memberships.find((membership) => membership.workspace_id === selectedWorkspaceId) ??
    (memberships.length === 1 ? memberships[0] : null)
  )
}

export async function requireActiveWorkspace(nextPath = '/dashboard') {
  const workspace = await getActiveWorkspace()
  if (!workspace) redirect(`/workspace/select?next=${encodeURIComponent(nextPath)}`)
  return workspace
}

export function hasWorkspacePermission(workspace: WorkspaceAccess, permissionCode: string) {
  return workspace.permission_codes.includes(permissionCode)
}
