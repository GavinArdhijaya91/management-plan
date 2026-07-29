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
        <p className="app-label mb-3">Workspace · {workspace.workspace_name}</p>
        <h1 className="app-heading">Tren pasar</h1>
        <p className="mt-2 text-zinc-500">Observasi produk dan asumsi pasar milik workspace aktif.</p>
        {error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Data tren pasar gagal dimuat.
          </p>
        ) : data?.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {data.map((product) => {
              const latest = [...product.market_snapshots].sort((a, b) => b.observed_on.localeCompare(a.observed_on))[0]
              return (
                <article key={product.id} className="app-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="app-label">{product.active ? 'Aktif' : 'Tidak aktif'}</span>
                      <h2 className="mt-1 font-serif text-xl font-semibold">{product.name}</h2>
                    </div>
                    <TrendingUp className="size-5 text-zinc-500" />
                  </div>
                  {product.description && <p className="mt-3 text-sm text-zinc-600">{product.description}</p>}
                  <p className="app-data mt-5 text-2xl font-semibold">
                    {latest ? `${latest.change_percent}%` : 'Belum diukur'}
                  </p>
                  {latest && <p className="mt-1 text-xs text-zinc-500">{latest.market_condition}</p>}
                </article>
              )
            })}
          </div>
        ) : (
          <section className="app-card mt-6 p-8 text-center">
            <h2 className="font-serif text-2xl font-semibold">Belum ada observasi pasar</h2>
            <p className="mt-2 text-sm text-zinc-500">Data produk contoh hanya tersedia pada mode demo.</p>
          </section>
        )}
      </div>
    </main>
  )
}
