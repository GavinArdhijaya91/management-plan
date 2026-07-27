import Link from 'next/link'
import { signUp } from '@/app/auth/actions'
import { AuthField, AuthShell } from '@/app/auth/_components/auth-shell'

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  return (
    <AuthShell
      title="Buat akun Siapin"
      description="Akun dibuat lebih dulu; workspace dan role baru aktif setelah proses berikutnya."
    >
      {error && <p className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form action={signUp} className="space-y-5">
        <AuthField label="Nama lengkap" name="fullName" minLength={2} autoComplete="name" />
        <AuthField label="Email" name="email" type="email" autoComplete="email" />
        <AuthField
          label="Kata sandi (minimal 10 karakter, huruf besar/kecil, angka, dan simbol)"
          name="password"
          type="password"
          minLength={10}
          autoComplete="new-password"
        />
        <button className="app-button min-h-11 w-full justify-center" type="submit">
          Buat akun
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-600">
        Sudah punya akun?{' '}
        <Link href="/auth/login" className="font-semibold text-zinc-950 underline">
          Masuk
        </Link>
      </p>
    </AuthShell>
  )
}
