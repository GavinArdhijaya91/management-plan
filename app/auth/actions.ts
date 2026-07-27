'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { loginCredentialsSchema, signupCredentialsSchema } from '@/lib/auth/credentials'
import { getSafeInternalPath } from '@/lib/auth/redirect'
import { getSiteUrl } from '@/lib/site'
import { createClient } from '@/lib/supabase/server'
import { activeWorkspaceCookie } from '@/lib/workspace/context'

function authErrorPath(path: string, message: string, next?: string) {
  const params = new URLSearchParams({ error: message })
  if (next) params.set('next', getSafeInternalPath(next))
  return `${path}?${params}`
}

export async function login(formData: FormData) {
  const parsed = loginCredentialsSchema.safeParse({
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
  const parsed = signupCredentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  })

  if (!parsed.success) {
    redirect(
      authErrorPath(
        '/auth/sign-up',
        'Gunakan kata sandi 10–72 karakter dengan huruf besar, huruf kecil, angka, dan simbol.',
      ),
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: new URL('/auth/callback?next=/workspace/select', getSiteUrl()).toString(),
    },
  })

  if (error) {
    redirect(
      authErrorPath(
        '/auth/sign-up',
        'Pendaftaran tidak dapat diproses. Periksa data atau tunggu sebentar sebelum mencoba kembali.',
      ),
    )
  }
  redirect(data.session ? '/workspace/select' : '/auth/verify-email')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const cookieStore = await cookies()
  cookieStore.delete(activeWorkspaceCookie)
  redirect('/')
}
