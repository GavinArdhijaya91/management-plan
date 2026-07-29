import { MotionLogo } from '@/app/_components/motion-logo'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <main className="min-h-dvh bg-[#f7f7f5] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <MotionLogo />
            <span className="font-serif text-xl font-semibold">Siapin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/demo/dashboard"
              className="min-h-11 rounded-xl px-4 py-3 text-sm font-medium hover:bg-zinc-100"
            >
              Buka Demo
            </Link>
            <Link href="/auth/login" className="app-button">
              Masuk
            </Link>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6 md:py-28">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-zinc-950 text-white">
          <Mail className="size-6" />
        </span>
        <p className="app-label mt-8">Bantuan</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight md:text-6xl">Hubungi tim Siapin</h1>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-zinc-600">
          Formulir demo dipindahkan ke mode demo agar tidak menyerupai pengiriman sungguhan. Untuk saat ini, hubungi
          pengelola repository melalui kanal yang tercantum pada dokumentasi proyek.
        </p>
        <Link href="/demo/hubungi-kami" className="mt-8 inline-flex text-sm font-semibold underline">
          Coba formulir dalam mode demo
        </Link>
      </section>
    </main>
  )
}
