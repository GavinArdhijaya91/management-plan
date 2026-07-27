'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getSafeInternalPath } from '@/lib/auth/redirect'
import { getSiteUrl } from '@/lib/site'
import { createClient } from '@/lib/supabase/server'
import { activeWorkspaceCookie } from '@/lib/workspace/context'

const credentialsSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(72),
})

function authErrorPath(path: string, message: string, next?: string) {
  const params = new URLSearchParams({ error: message })
  if (next) params.set('next', getSafeInternalPath(next))
  return `${path}?${params}`
}

export async function login(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  const next = getSafeInternalPath(formData.get('next')?.toString(), '/workspace/select')

  if (!parsed.success) redirect(authErrorPath('/auth/login', 'Email atau kata sandi tidak valid.', next))

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) redirect(authErrorPath('/auth/login', 'Email atau kata sandi salah.', next))

  redirect(next)
}

export async function signUp(formData: FormData) {
  const parsed = credentialsSchema.extend({ fullName: z.string().trim().min(2).max(100) }).safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  })

  if (!parsed.success) redirect(authErrorPath('/auth/sign-up', 'Periksa kembali nama, email, dan kata sandi.'))

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: new URL('/auth/callback?next=/workspace/select', getSiteUrl()).toString(),
    },
  })

  if (error) redirect(authErrorPath('/auth/sign-up', 'Pendaftaran gagal. Email mungkin sudah digunakan.'))
  redirect(data.session ? '/workspace/select' : '/auth/verify-email')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const cookieStore = await cookies()
  cookieStore.delete(activeWorkspaceCookie)
  redirect('/')
}
