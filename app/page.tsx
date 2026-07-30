'use client'

import { useLocalStorage } from '@/app/_lib/use-local-storage'
import { MotionLogo } from '@/app/_components/motion-logo'
import { Reveal } from '@/app/_components/reveal'
import { TypewriterText } from '@/app/_components/typewriter-text'
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  PackageCheck,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const businessPulses = [
  { label: 'Penjualan hari ini', value: 'Rp 1,84 jt', note: '+18%' },
  { label: 'Ketahanan modal', value: '24 hari', note: 'Aman' },
  { label: 'Agenda terdekat', value: 'Bayar supplier', note: 'Besok' },
]

const features = [
  {
    icon: WalletCards,
    label: 'Keuangan',
    title: 'Pahami uang yang masuk, keluar, dan bertumbuh.',
    description: 'Catat modal, omzet, serta laba tanpa laporan yang rumit.',
    href: '/demo/manajemen',
  },
  {
    icon: CalendarDays,
    label: 'Perencanaan',
    title: 'Jadikan agenda bisnis sebagai langkah yang terukur.',
    description: 'Satukan jadwal supplier, stok, gaji, dan evaluasi.',
    href: '/demo/kalender',
  },
  {
    icon: TrendingUp,
    label: 'Analisis',
    title: 'Temukan pola sebelum menentukan arah berikutnya.',
    description: 'Pelajari perubahan performa produk dari waktu ke waktu.',
    href: '/demo/tren-pasar',
  },
  {
    icon: BarChart3,
    label: 'Ringkasan',
    title: 'Lihat kondisi usaha tanpa membuka banyak laporan.',
    description: 'Angka, perhatian, dan pekerjaan penting berada di satu tempat.',
    href: '/demo/dashboard',
  },
]

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [, setLeads] = useLocalStorage<string[]>('siapin:interest-list', [])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLeads((current) => (current.includes(email) ? current : [...current, email]))
    setSubmitted(true)
  }

  return (
    <main className="min-h-dvh bg-[#f7f7f5] text-zinc-950">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-[#f7f7f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="Siapin, kembali ke beranda">
            <MotionLogo />
            <span className="font-serif text-xl font-semibold">Siapin</span>
          </Link>
          <nav aria-label="Navigasi landing page" className="hidden items-center gap-7 text-sm text-zinc-600 md:flex">
            <a href="#fitur" className="transition-colors hover:text-zinc-950">
              Fitur
            </a>
            <a href="#cara-kerja" className="transition-colors hover:text-zinc-950">
              Cara kerja
            </a>
            <Link href="/hubungi-kami" className="transition-colors hover:text-zinc-950">
              Bantuan
            </Link>
          </nav>
          <Link href="/demo/dashboard" className="app-button motion-press">
            Buka demo <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <section className="border-b border-zinc-200/80">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:items-center lg:py-28">
          <Reveal className="min-w-0">
            <p className="app-label mb-6">Workspace manajemen untuk usaha yang bertumbuh</p>
            <h1 className="min-w-0 max-w-4xl font-serif text-[clamp(3.5rem,7.2vw,6.8rem)] font-semibold leading-[0.88] tracking-[-0.055em]">
              Rencana yang jelas.
              <span className="relative mt-[0.26em] block h-[2.25em] min-w-0 overflow-hidden text-[0.82em] leading-[1.04] text-zinc-500">
                <TypewriterText
                  items={['Keputusan yang tenang.', 'Prioritas yang terarah.', 'Pertumbuhan yang terukur.']}
                  className="absolute inset-x-0 top-0 min-w-0"
                />
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-600 md:text-xl">
              Siapin menyatukan transaksi, agenda, target, dan insight bisnis dalam workspace yang mudah dipahami. Anda
              dapat belajar sekaligus menjalankan rencana nyata.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/demo/dashboard" className="app-button motion-press px-6">
                Jelajahi data demo <ArrowRight className="size-4" />
              </Link>
              <a
                href="#fitur"
                className="motion-press inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 text-sm font-medium transition-colors hover:bg-zinc-100"
              >
                Pelajari fiturnya
              </a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-600">
              {['Data demo siap digunakan', 'Bisa diedit dan dilatih', 'Nyaman di desktop dan mobile'].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="size-4 text-zinc-950" />
                  {item}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="app-card min-w-0 overflow-hidden lg:self-center">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 md:px-6">
              <div>
                <p className="app-label">Rabu, 22 Juli</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold">Selamat pagi, Bu Rina.</h2>
              </div>
              <span className="grid size-10 place-items-center rounded-full bg-zinc-950 text-sm font-semibold text-white">
                BR
              </span>
            </div>
            <div className="p-4 md:p-6">
              <div className="rounded-2xl bg-zinc-950 p-5 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="app-label text-zinc-400">Laba bulan ini</p>
                    <p className="app-data mt-2 text-3xl font-semibold md:text-4xl">Rp 6,9 jt</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs">+18%</span>
                </div>
                <div className="mt-8 flex h-24 items-end gap-2" aria-label="Grafik laba enam minggu">
                  {[42, 57, 48, 70, 63, 92].map((height, index) => (
                    <div key={index} className="flex-1 rounded-t-sm bg-white/80" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                {businessPulses.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                    <div>
                      <p className="text-xs text-zinc-500">{item.label}</p>
                      <p className="app-data mt-1 text-sm font-medium">{item.value}</p>
                    </div>
                    <span className="font-mono text-xs text-zinc-500">{item.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-24 px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-12 grid gap-5 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="app-label mb-4">Satu sistem, empat sudut pandang</p>
              <h2 className="max-w-2xl font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-6xl">
                Mengubah catatan menjadi keputusan.
              </h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-zinc-600 lg:justify-self-end">
              Setiap fitur dirancang untuk membantu pengguna memahami konteks, bukan hanya menyimpan data.
            </p>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Reveal key={feature.title} delay={index * 70}>
                  <Link
                    href={feature.href}
                    className={`motion-press group flex min-h-72 flex-col rounded-2xl border p-6 transition-all hover:-translate-y-1 md:p-8 ${index === 0 ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-white hover:shadow-[0_12px_35px_rgba(0,0,0,.06)]'}`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="size-6" />
                      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="mt-auto pt-14">
                      <p className={`app-label mb-3 ${index === 0 ? 'text-zinc-400' : ''}`}>{feature.label}</p>
                      <h3 className="max-w-lg font-serif text-3xl font-semibold leading-tight">{feature.title}</h3>
                      <p className={`mt-3 max-w-lg leading-7 ${index === 0 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {feature.description}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="border-y border-zinc-200 bg-white px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <p className="app-label mb-4">Workflow yang dapat dipelajari</p>
            <h2 className="font-serif text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-6xl">
              Mulai dari data. Berakhir pada tindakan.
            </h2>
            <p className="mt-5 max-w-lg leading-7 text-zinc-500">
              Data contoh memberi ruang aman untuk bereksperimen sebelum pengguna mengelola rencana bisnisnya sendiri.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <ol className="divide-y divide-zinc-200 border-y border-zinc-200">
              {[
                ['01', 'Catat kondisi nyata', 'Masukkan transaksi, target, tugas, dan agenda yang memengaruhi usaha.'],
                [
                  '02',
                  'Pahami hubungan data',
                  'Lihat bagaimana satu perubahan memengaruhi ringkasan, tren, serta prioritas.',
                ],
                [
                  '03',
                  'Tentukan langkah berikutnya',
                  'Ubah insight menjadi pekerjaan dan jadwal yang dapat diselesaikan.',
                ],
              ].map(([number, title, description]) => (
                <li key={number} className="grid gap-5 py-7 sm:grid-cols-[5rem_1fr]">
                  <span className="font-mono text-sm text-zinc-400">{number}</span>
                  <div>
                    <h3 className="font-serif text-2xl font-semibold">{title}</h3>
                    <p className="mt-2 leading-7 text-zinc-500">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-20 md:px-6 md:py-28">
        <Reveal className="mx-auto grid max-w-7xl gap-8 rounded-3xl bg-zinc-950 p-6 text-white md:p-10 lg:grid-cols-[1fr_.8fr] lg:items-end">
          <div>
            <CheckCircle2 className="size-8" />
            <h2 className="mt-7 max-w-3xl font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-6xl">
              Mulai dengan data demo. Temukan cara kerja yang cocok.
            </h2>
            <p className="mt-5 max-w-2xl text-zinc-400">
              Tidak perlu menyiapkan spreadsheet atau laporan terlebih dahulu.
            </p>
          </div>
          <div className="lg:justify-self-end lg:text-right">
            {submitted ? (
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-4 text-sm">
                <PackageCheck className="size-5" />
                Kami akan menghubungi {email}.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-2 sm:flex-row">
                <label htmlFor="email" className="sr-only">
                  Email bisnis
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@usaha.com"
                  className="min-h-12 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white"
                />
                <button
                  type="submit"
                  className="min-h-12 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
                >
                  Daftar minat
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-zinc-200 px-4 py-9 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-serif text-xl font-semibold">Siapin</p>
            <p className="mt-1 text-sm text-zinc-500">Management plan yang dapat dipahami dan dijalankan.</p>
          </div>
          <nav aria-label="Navigasi footer" className="flex flex-wrap gap-5 text-sm text-zinc-600">
            <Link href="/demo/dashboard" className="hover:text-zinc-950">
              Dashboard
            </Link>
            <Link href="/demo/manajemen" className="hover:text-zinc-950">
              Manajemen
            </Link>
            <Link href="/demo/kalender" className="hover:text-zinc-950">
              Kalender
            </Link>
            <Link href="/hubungi-kami" className="hover:text-zinc-950">
              Bantuan
            </Link>
          </nav>
          <p className="font-mono text-xs text-zinc-400">© 2026 Siapin</p>
        </div>
      </footer>
    </main>
  )
}
