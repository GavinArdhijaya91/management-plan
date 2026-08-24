import { MotionLogo } from '@/app/_components/motion-logo'
import { Reveal } from '@/app/_components/reveal'
import { ArrowRight, BarChart3, CalendarDays, Check, CheckCircle2, TrendingUp, WalletCards } from 'lucide-react'
import Link from 'next/link'

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
  return (
    <main className="min-h-dvh bg-[#f7f7f5] text-zinc-950 selection:bg-zinc-950 selection:text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-[#f7f7f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="Siapin, kembali ke beranda">
            <MotionLogo />
            <span className="text-xl font-semibold tracking-tight">Siapin</span>
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
          <nav aria-label="Navigasi akun" className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="motion-press inline-flex min-h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 sm:px-4"
            >
              Masuk
            </Link>
            <Link href="/auth/sign-up" className="app-button motion-press">
              Buat akun
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-zinc-200/80">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:items-center lg:py-28">
          <Reveal className="min-w-0">
            <p className="app-label mb-6">Workspace manajemen untuk usaha yang bertumbuh</p>
            <h1 className="min-w-0 max-w-4xl text-[clamp(3.25rem,6.4vw,5.75rem)] font-semibold leading-[0.94] tracking-[-0.055em]">
              Rencana jelas.
              <span className="mt-2 block text-zinc-500">Keputusan terukur.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-zinc-600 md:text-lg">
              Satukan transaksi, agenda, target, dan insight bisnis dalam satu workspace yang mudah ditindaklanjuti.
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
                <h2 className="mt-1 text-xl font-semibold">Selamat pagi, Bu Rina.</h2>
              </div>
              <span className="grid size-10 place-items-center rounded-full bg-zinc-950 text-sm font-semibold text-white">
                BR
              </span>
            </div>
            <div className="p-4 md:p-6">
              <div className="rounded-lg bg-zinc-950 p-5 text-white">
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
                  <div
                    key={item.label}
                    className="flex items-center justify-between border-t border-zinc-200 px-1 py-3 first:border-t-0"
                  >
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
          <Reveal className="mb-12 max-w-3xl">
            <h2 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-5xl">
              Mengubah catatan menjadi keputusan.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600">
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
                    className={`motion-press group flex min-h-64 flex-col rounded-lg border p-6 transition-colors md:p-8 ${index === 0 ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-[#fcfcfb] hover:border-zinc-400'}`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="size-6" />
                      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="mt-auto pt-14">
                      <p className={`mb-3 text-xs font-medium ${index === 0 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {feature.label}
                      </p>
                      <h3 className="max-w-lg text-2xl font-semibold leading-tight">{feature.title}</h3>
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
            <h2 className="text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-5xl">
              Mulai dari data. Berakhir pada tindakan.
            </h2>
            <p className="mt-5 max-w-lg leading-7 text-zinc-500">
              Data contoh memberi ruang aman untuk bereksperimen sebelum pengguna mengelola rencana bisnisnya sendiri.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <ol className="divide-y divide-zinc-200 border-y border-zinc-200">
              {[
                [
                  'Catat',
                  'Catat kondisi nyata',
                  'Masukkan transaksi, target, tugas, dan agenda yang memengaruhi usaha.',
                ],
                [
                  'Pahami',
                  'Pahami hubungan data',
                  'Lihat bagaimana satu perubahan memengaruhi ringkasan, tren, serta prioritas.',
                ],
                [
                  'Tindak',
                  'Tentukan langkah berikutnya',
                  'Ubah insight menjadi pekerjaan dan jadwal yang dapat diselesaikan.',
                ],
              ].map(([verb, title, description]) => (
                <li key={verb} className="grid gap-5 py-7 sm:grid-cols-[5rem_1fr]">
                  <span className="font-mono text-xs font-medium uppercase tracking-wide text-zinc-500">{verb}</span>
                  <div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="mt-2 leading-7 text-zinc-500">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-20 md:px-6 md:py-28">
        <Reveal className="mx-auto grid max-w-7xl gap-8 rounded-lg bg-zinc-950 p-6 text-white md:p-10 lg:grid-cols-[1fr_.8fr] lg:items-end">
          <div>
            <CheckCircle2 className="size-8" />
            <h2 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-5xl">
              Siap mengelola rencana bisnis yang nyata?
            </h2>
            <p className="mt-5 max-w-2xl text-zinc-400">
              Buat akun untuk menyimpan data di workspace privat. Kami akan meminta verifikasi email sebelum Anda masuk.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-self-end">
            <Link
              href="/auth/sign-up"
              className="motion-press inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
            >
              Buat akun
            </Link>
            <Link
              href="/auth/login"
              className="motion-press inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Masuk
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-zinc-200 bg-white px-4 py-12 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 border-b border-zinc-200 pb-10 md:grid-cols-[minmax(0,1fr)_auto_auto] md:gap-16">
            <div className="max-w-md">
              <Link href="/" className="inline-flex items-center gap-3" aria-label="Siapin, kembali ke beranda">
                <MotionLogo />
                <span className="text-xl font-semibold tracking-tight">Siapin</span>
              </Link>
              <p className="mt-4 text-sm leading-6 text-zinc-500">
                Workspace untuk memahami kondisi usaha, menyusun rencana, dan menjalankannya bersama tim.
              </p>
            </div>
            <div>
              <p className="app-label mb-4">Akun</p>
              <nav aria-label="Tautan akun" className="flex flex-col items-start gap-3 text-sm text-zinc-600">
                <Link href="/auth/login" className="hover:text-zinc-950">
                  Masuk
                </Link>
                <Link href="/auth/sign-up" className="hover:text-zinc-950">
                  Buat akun
                </Link>
              </nav>
            </div>
            <div>
              <p className="app-label mb-4">Informasi</p>
              <nav aria-label="Tautan informasi" className="flex flex-col items-start gap-3 text-sm text-zinc-600">
                <Link href="/demo/dashboard" className="hover:text-zinc-950">
                  Coba demo
                </Link>
                <Link href="/hubungi-kami" className="hover:text-zinc-950">
                  Bantuan
                </Link>
              </nav>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-6 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Siapin</p>
            <p>Data demo tersimpan hanya di perangkat Anda.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
