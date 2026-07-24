'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getSafeInternalPath } from '@/lib/auth/redirect'
import { createClient } from '@/lib/supabase/server'
import { activeWorkspaceCookie, getMyWorkspaceAccess } from '@/lib/workspace/context'

const workspaceSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(63),
})

async function setActiveWorkspaceCookie(workspaceId: string) {
  const cookieStore = await cookies()
  cookieStore.set(activeWorkspaceCookie, workspaceId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  })
}

export async function createWorkspace(formData: FormData) {
  const parsed = workspaceSchema.safeParse({ name: formData.get('name'), slug: formData.get('slug') })
  if (!parsed.success) redirect('/workspace/setup?error=Nama atau slug workspace tidak valid.')

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_workspace', {
    workspace_name: parsed.data.name,
    workspace_slug: parsed.data.slug,
  })

  if (error) redirect('/workspace/setup?error=Workspace gagal dibuat. Slug mungkin sudah digunakan.')
  await setActiveWorkspaceCookie(data)
  redirect('/dashboard')
}

export async function selectWorkspace(formData: FormData) {
  const workspaceId = z.uuid().safeParse(formData.get('workspaceId'))
  const next = getSafeInternalPath(formData.get('next')?.toString())
  if (!workspaceId.success) redirect('/workspace/select?error=Workspace tidak valid.')

  const memberships = await getMyWorkspaceAccess()
  const membership = memberships.find(
    (candidate) => candidate.workspace_id === workspaceId.data && candidate.membership_status === 'active',
  )
  if (!membership) redirect('/workspace/select?error=Akses workspace tidak tersedia.')

  await setActiveWorkspaceCookie(membership.workspace_id)
  redirect(next)
}
