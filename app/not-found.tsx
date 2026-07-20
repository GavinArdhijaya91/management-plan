import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <SearchX className="size-8" aria-hidden="true" />
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">404</p>
        <h1 className="text-3xl font-bold text-slate-950">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-slate-600">Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.</p>
        <Link href="/dashboard" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke dashboard
        </Link>
      </div>
    </main>
  )
}
