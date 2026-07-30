import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#fafafa] px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500">
          <SearchX className="size-6" aria-hidden="true" />
        </div>
        <p className="app-label mb-2">Error 404</p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-950">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.
        </p>
        <Link href="/dashboard" className="app-button mt-8">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke dashboard
        </Link>
      </div>
    </main>
  )
}
