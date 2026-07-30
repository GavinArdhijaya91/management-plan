import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { requireActiveWorkspace } from '@/lib/workspace/context'
import { TrendingUp } from 'lucide-react'

export default async function MarketTrendsPage() {
  const workspace = await requireActiveWorkspace('/tren-pasar')
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('market_products')
    .select('id,name,description,active,market_snapshots(observed_on,change_percent,market_condition)')
    .eq('workspace_id', workspace.workspace_id)
    .order('name')

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter">
        <div className="border-b border-zinc-200 pb-6">
          <p className="app-label mb-2">Workspace / {workspace.workspace_name}</p>
          <h1 className="app-heading">Tren pasar</h1>
          <p className="mt-2 text-sm text-zinc-500">Observasi produk dan asumsi pasar milik workspace aktif.</p>
        </div>
        {error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Data tren pasar gagal dimuat.
          </p>
        ) : data?.length ? (
          <div className="app-card mt-6 divide-y divide-zinc-100 overflow-hidden">
            {data.map((product) => {
              const latest = [...product.market_snapshots].sort((a, b) => b.observed_on.localeCompare(a.observed_on))[0]
              return (
                <article
                  key={product.id}
                  className="grid gap-4 p-4 hover:bg-zinc-50 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <TrendingUp className="mt-0.5 size-5 shrink-0 text-zinc-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold">{product.name}</h2>
                        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                          <span
                            className={`size-1.5 rounded-full ${product.active ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                          />
                          {product.active ? 'Aktif' : 'Tidak aktif'}
                        </span>
                      </div>
                      {product.description && <p className="mt-1 text-sm text-zinc-500">{product.description}</p>}
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <p className="app-data text-lg font-semibold">{latest ? `${latest.change_percent}%` : '—'}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{latest?.market_condition ?? 'Belum diukur'}</p>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <section className="app-card mt-6 flex items-start gap-3 p-6">
            <TrendingUp className="size-5 shrink-0 text-zinc-400" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold">Belum ada observasi pasar</h2>
              <p className="mt-1 text-sm text-zinc-500">Tambahkan produk ketika asumsi pasar siap dicatat.</p>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
