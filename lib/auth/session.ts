import 'server-only'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  return error ? null : user
}

export async function requireAuthenticatedUser(nextPath?: string) {
  const user = await getAuthenticatedUser()

  if (!user) {
    const search = nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''
    redirect(`/auth/login${search}`)
  }

  return user
}
