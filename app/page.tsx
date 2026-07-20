'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  Check,
  CircleDollarSign,
  PackageCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { useState } from 'react'

const businessPulses = [
  { label: 'Penjualan hari ini', value: 'Rp 1,84 jt', note: '+18%', tone: 'text-emerald-700' },
  { label: 'Modal aman sampai', value: '24 hari', note: 'Aman', tone: 'text-blue-700' },
  { label: 'Agenda terdekat', value: 'Bayar supplier', note: 'Besok', tone: 'text-orange-700' },
]

const features = [
  {
    icon: WalletCards,
    eyebrow: 'Uang masuk & keluar',
    title: 'Catatan yang akhirnya gampang dibaca.',
    description: 'Modal, omzet, dan laba tersusun tanpa membuat Anda merasa sedang mengerjakan laporan akuntansi.',
    href: '/manajemen',
    className: 'lg:col-span-7 bg-[#1746d1] text-white',
  },
  {
    icon: CalendarDays,
    eyebrow: 'Rencana usaha',
    title: 'Tidak ada lagi jadwal penting yang terlewat.',
    description: 'Supplier, gaji, stok, dan promosi bertemu di satu kalender.',
    href: '/kalender',
    className: 'lg:col-span-5 bg-[#dfff62] text-slate-950',
  },
  {
    icon: TrendingUp,
    eyebrow: 'Baca peluang',
    title: 'Tahu produk mana yang layak digenjot.',
    description: 'Lihat perubahan penjualan tanpa grafik rumit ala meja trading.',
    href: '/tren-pasar',
    className: 'lg:col-span-5 bg-[#ff8a5b] text-slate-950',
  },
  {
    icon: BarChart3,
    eyebrow: 'Ringkasan harian',
    title: 'Buka sebentar, langsung tahu kondisi usaha.',
    description: 'Angka penting, peringatan stok, dan pekerjaan minggu ini ada di satu layar.',
    href: '/dashboard',
    className: 'lg:col-span-7 bg-slate-950 text-white',
  },
]

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-[#f4f1e8] text-slate-950">
      <header className="sticky top-0 z-50 border-b-2 border-slate-950 bg-[#f4f1e8]/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="group flex items-center gap-3" aria-label="Siapin, kembali ke beranda">
            <span className="grid size-10 rotate-[-4deg] place-items-center rounded-xl bg-[#1746d1] text-lg font-black text-white transition-transform group-hover:rotate-0">S</span>
            <span className="text-xl font-black tracking-[-0.04em]">siapin.</span>
          </Link>

          <nav aria-label="Navigasi landing page" className="hidden items-center gap-8 text-sm font-bold md:flex">
            <a href="#fitur" className="hover:text-[#1746d1]">Cara kerja</a>
            <a href="#cerita" className="hover:text-[#1746d1]">Kenapa Siapin</a>
            <Link href="/hubungi-kami" className="hover:text-[#1746d1]">Bantuan</Link>
          </nav>

          <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-slate-950 bg-[#dfff62] px-5 text-sm font-black shadow-[3px_3px_0_#0f172a] transition-transform hover:-translate-y-0.5">
            Buka demo <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="relative border-b-2 border-slate-950">
        <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(#1746d1_1px,transparent_1px),linear-gradient(90deg,#1746d1_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1.02fr_.98fr] lg:py-24">
          <div>
            <div className="mb-7 inline-flex rotate-[-1deg] items-center gap-2 rounded-full border-2 border-slate-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_#0f172a]">
              <Sparkles className="size-4 text-[#1746d1]" aria-hidden="true" />
              Dibuat untuk pemilik usaha, bukan analis
            </div>

            <h1 className="max-w-3xl text-[clamp(3.3rem,8vw,7.5rem)] font-black leading-[0.82] tracking-[-0.075em]">
              Usaha rapi.
              <span className="mt-3 block text-[#1746d1]">Kepala santai.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg font-medium leading-8 text-slate-700 md:text-xl">
              Siapin menyatukan uang, stok, jadwal, dan arah bisnis Anda—supaya keputusan besok tidak lagi dibuat dari ingatan semalam.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border-2 border-slate-950 bg-[#1746d1] px-7 font-black text-white shadow-[5px_5px_0_#0f172a] transition-transform hover:-translate-y-1">
                Coba dashboard <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
              <a href="#fitur" className="inline-flex min-h-13 items-center justify-center rounded-xl border-2 border-slate-950 bg-white px-7 font-black transition-colors hover:bg-[#dfff62]">
                Lihat cara kerjanya
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-slate-700">
              <span className="flex items-center gap-2"><Check className="size-4 text-emerald-700" /> Tanpa kartu kredit</span>
              <span className="flex items-center gap-2"><Check className="size-4 text-emerald-700" /> Bahasa yang mudah</span>
              <span className="flex items-center gap-2"><Check className="size-4 text-emerald-700" /> Nyaman di HP</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mr-0">
            <div className="absolute -left-7 -top-6 hidden rotate-[-8deg] rounded-lg border-2 border-slate-950 bg-[#ff8a5b] px-4 py-3 text-sm font-black shadow-[4px_4px_0_#0f172a] sm:block">
              Bukan spreadsheet 👋
            </div>
            <div className="rotate-[1.5deg] rounded-[2rem] border-2 border-slate-950 bg-white p-4 shadow-[12px_12px_0_#1746d1] md:p-6">
              <div className="mb-6 flex items-center justify-between border-b-2 border-slate-200 pb-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Senin, 20 Juli</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">Pagi, Bu Rina!</h2>
                </div>
                <span className="grid size-11 place-items-center rounded-full bg-[#dfff62] font-black">BR</span>
              </div>

              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-400">Laba bulan ini</p>
                    <p className="mt-2 text-4xl font-black tracking-tight">Rp 6,9 jt</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">↗ 18%</span>
                </div>
                <div className="mt-7 flex h-24 items-end gap-2" aria-label="Grafik laba enam minggu">
                  {[42, 57, 48, 70, 63, 92].map((height, index) => (
                    <div key={index} className="flex-1 rounded-t-md bg-[#dfff62]" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {businessPulses.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border-2 border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-slate-500">{item.label}</p>
                      <p className="mt-0.5 font-black">{item.value}</p>
                    </div>
                    <span className={`text-xs font-black ${item.tone}`}>{item.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-slate-950 bg-[#1746d1] py-4 text-white" aria-label="Manfaat utama">
        <div className="flex min-w-max items-center justify-center gap-8 overflow-hidden px-4 text-sm font-black uppercase tracking-[0.12em] md:gap-14">
          <span>Catat uang</span><span className="text-[#dfff62]">✦</span>
          <span>Rencanakan stok</span><span className="text-[#dfff62]">✦</span>
          <span>Baca tren</span><span className="text-[#dfff62]">✦</span>
          <span>Jalankan usaha</span>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-24 px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1746d1]">Satu tempat. Empat urusan penting.</p>
            <h2 className="text-4xl font-black leading-[0.95] tracking-[-0.055em] md:text-6xl">Lebih sedikit menebak.<br />Lebih banyak bergerak.</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.title} href={feature.href} className={`${feature.className} group min-h-80 rounded-[2rem] border-2 border-slate-950 p-7 shadow-[6px_6px_0_#0f172a] transition-transform hover:-translate-y-1 md:p-9`}>
                  <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between">
                      <Icon className="size-9" aria-hidden="true" />
                      <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </div>
                    <div className="mt-auto pt-16">
                      <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] opacity-70">{feature.eyebrow}</p>
                      <h3 className="max-w-xl text-3xl font-black leading-tight tracking-[-0.04em]">{feature.title}</h3>
                      <p className="mt-3 max-w-xl font-medium leading-7 opacity-75">{feature.description}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section id="cerita" className="border-y-2 border-slate-950 bg-white px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#dfff62] px-4 py-2 text-xs font-black uppercase tracking-[0.12em]"><BadgeCheck className="size-4" /> Cara kerja Siapin</span>
            <h2 className="mt-6 text-4xl font-black leading-none tracking-[-0.055em] md:text-6xl">Dari angka mentah menjadi langkah berikutnya.</h2>
          </div>
          <ol className="space-y-4">
            {[
              ['01', 'Catat seperlunya', 'Masukkan transaksi dan agenda tanpa formulir yang melelahkan.'],
              ['02', 'Lihat gambaran besarnya', 'Siapin merangkum kondisi uang, jadwal, stok, dan tren.'],
              ['03', 'Ambil langkah', 'Dapatkan konteks yang cukup untuk menentukan prioritas usaha.'],
            ].map(([number, title, description]) => (
              <li key={number} className="grid grid-cols-[3.5rem_1fr] gap-4 rounded-2xl border-2 border-slate-950 bg-[#f4f1e8] p-5">
                <span className="text-2xl font-black text-[#1746d1]">{number}</span>
                <div><h3 className="text-xl font-black">{title}</h3><p className="mt-1 leading-6 text-slate-600">{description}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-5xl rotate-[-.5deg] rounded-[2rem] border-2 border-slate-950 bg-[#dfff62] p-7 text-center shadow-[10px_10px_0_#0f172a] md:p-14">
          <CircleDollarSign className="mx-auto size-12" aria-hidden="true" />
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-none tracking-[-0.055em] md:text-6xl">Mulai dari usaha yang Anda jalankan hari ini.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium text-slate-700">Coba alurnya dengan data contoh. Tidak perlu menyiapkan laporan apa pun.</p>

          {submitted ? (
            <div className="mx-auto mt-8 flex max-w-lg items-center justify-center gap-2 rounded-xl border-2 border-slate-950 bg-white px-5 py-4 font-black">
              <PackageCheck className="size-5 text-emerald-700" /> Siap! Kami akan menghubungi {email}.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
              <label htmlFor="email" className="sr-only">Email bisnis</label>
              <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@usaha.com" className="min-h-13 flex-1 rounded-xl border-2 border-slate-950 bg-white px-5 font-bold placeholder:text-slate-400" />
              <button type="submit" className="min-h-13 rounded-xl border-2 border-slate-950 bg-[#1746d1] px-6 font-black text-white shadow-[4px_4px_0_#0f172a] transition-transform hover:-translate-y-0.5">Daftar minat</button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t-2 border-slate-950 bg-slate-950 px-4 py-10 text-white md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div><p className="text-2xl font-black tracking-[-0.04em]">siapin.</p><p className="mt-1 text-sm text-slate-400">Rencana usaha yang bisa benar-benar dijalankan.</p></div>
          <nav aria-label="Navigasi footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
            <Link href="/dashboard" className="hover:text-[#dfff62]">Dashboard</Link>
            <Link href="/manajemen" className="hover:text-[#dfff62]">Manajemen</Link>
            <Link href="/kalender" className="hover:text-[#dfff62]">Kalender</Link>
            <Link href="/hubungi-kami" className="hover:text-[#dfff62]">Bantuan</Link>
          </nav>
          <p className="text-xs text-slate-500">© 2026 Siapin</p>
        </div>
      </footer>
    </main>
  )
}
