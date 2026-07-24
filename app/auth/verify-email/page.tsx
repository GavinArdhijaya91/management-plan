import Link from 'next/link'
import { AuthShell } from '@/app/auth/_components/auth-shell'

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Periksa email kamu"
      description="Kami mengirim link konfirmasi. Buka link tersebut untuk mengaktifkan session akun."
    >
      <Link href="/auth/login" className="app-button min-h-11 w-full justify-center">
        Kembali ke halaman masuk
      </Link>
    </AuthShell>
  )
}
