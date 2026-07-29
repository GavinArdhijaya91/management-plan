'use client'

import { DemoDataNotice } from '@/app/_components/demo-data-notice'
import { Header } from '@/components/header'
import { CheckCircle2, Circle, Target } from 'lucide-react'

const demoPlans = [
  { title: 'Meningkatkan penjualan produk utama', status: 'Aktif', progress: 68 },
  { title: 'Menekan biaya operasional bulanan', status: 'Ditinjau', progress: 42 },
]

export default function DemoPlanningPage() {
  return (
    <main className="app-shell">
      <Header mode="demo" />
      <div className="page-shell motion-page-enter">
        <p className="app-label mb-3">Mode demo</p>
        <h1 className="app-heading">Planning bisnis</h1>
        <p className="mt-2 max-w-2xl text-zinc-500">
          Lihat bagaimana rencana, target, dan tindakan saling terhubung sebelum membuat workspace.
        </p>
        <div className="mt-6">
          <DemoDataNotice>Perubahan pada halaman demo tidak masuk ke workspace privat.</DemoDataNotice>
        </div>
        <div className="mt-6 grid gap-4">
          {demoPlans.map((plan) => (
            <article key={plan.title} className="app-card p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500">
                    <Target className="size-4" /> Business goal
                  </span>
                  <h2 className="mt-2 font-serif text-xl font-semibold">{plan.title}</h2>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium">{plan.status}</span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-zinc-950" style={{ width: `${plan.progress}%` }} />
              </div>
              <div className="mt-4 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" /> Evaluasi hasil aktual
                </span>
                <span className="flex items-center gap-2">
                  <Circle className="size-4" /> Tindakan berikutnya
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
