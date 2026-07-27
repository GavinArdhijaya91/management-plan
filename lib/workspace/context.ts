import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { GetMyWorkspaceAccessResult } from '@/lib/supabase/rpc-types'
import { requireAuthenticatedUser } from '@/lib/auth/session'

export const activeWorkspaceCookie = 'siapin-active-workspace'

export type WorkspaceAccess = GetMyWorkspaceAccessResult[number]

export async function getMyWorkspaceAccess(): Promise<WorkspaceAccess[]> {
  await requireAuthenticatedUser()
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_my_workspace_access')

  if (error) throw new Error(`Unable to resolve workspace access: ${error.message}`)
  return data ?? []
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
