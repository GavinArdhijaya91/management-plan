'use client'

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function ErrorPage({ reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#fafafa] px-4">
      <section className="max-w-md text-center" role="alert">
        <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500">
          <ExclamationTriangleIcon className="size-6" aria-hidden="true" />
        </div>
        <p className="app-label mb-2">Gangguan aplikasi</p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Halaman belum dapat dimuat</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Permintaan tidak selesai. Data Anda tidak diubah; silakan coba memuat halaman ini kembali.
        </p>
        <button type="button" onClick={reset} className="app-button mt-8">
          Coba kembali
        </button>
      </section>
    </main>
  )
}
