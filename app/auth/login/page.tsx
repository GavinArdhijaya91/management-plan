import Link from 'next/link'
import { login } from '@/app/auth/actions'
import { AuthField, AuthShell } from '@/app/auth/_components/auth-shell'
import { getSafeInternalPath } from '@/lib/auth/redirect'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams
  const next = getSafeInternalPath(params.next, '/workspace/select')

  return (
    <AuthShell title="Masuk ke workspace" description="Akses data usaha privat menggunakan akun Siapin kamu.">
      {params.error && <p className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}
      <form action={login} className="space-y-5">
        <input type="hidden" name="next" value={next} />
        <AuthField label="Email" name="email" type="email" maxLength={254} autoComplete="email" />
        <AuthField
          label="Kata sandi"
          name="password"
          type="password"
          minLength={8}
          maxLength={72}
          autoComplete="current-password"
        />
        <button className="app-button min-h-11 w-full justify-center" type="submit">
          Masuk
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-600">
        Belum punya akun?{' '}
        <Link href="/auth/sign-up" className="font-semibold text-zinc-950 underline">
          Buat akun
        </Link>
      </p>
    </AuthShell>
  )
}
