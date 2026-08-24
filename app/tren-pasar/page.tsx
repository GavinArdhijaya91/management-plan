import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { hasWorkspacePermission, requireActiveWorkspace } from '@/lib/workspace/context'
import { Database, ExternalLink, TrendingUp } from 'lucide-react'
import { MarketTrendChart } from './_components/market-trend-chart'
import { FactualObservationChart } from './_components/factual-observation-chart'
import { BpsSourceManagement } from './_components/bps-source-management'

interface MarketTrendsPageProps {
  searchParams: Promise<{ error?: string; success?: string }>
}

function jakartaDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(
    new Date(value),
  )
}

export default async function MarketTrendsPage({ searchParams }: MarketTrendsPageProps) {
  const workspace = await requireActiveWorkspace('/tren-pasar')
  const supabase = await createClient()
  const [{ data, error }, documentsResult, bindingsResult, observationsResult, syncRunsResult] = await Promise.all([
    supabase
      .from('market_products')
      .select('id,name,description,active,market_snapshots(observed_on,change_percent,market_condition)')
      .eq('workspace_id', workspace.workspace_id)
      .order('name'),
    supabase
      .from('market_source_documents')
      .select('id,product_id,title,canonical_url,publisher_name,published_at,fetched_at')
      .eq('workspace_id', workspace.workspace_id)
      .order('published_at', { ascending: false })
      .limit(12),
    supabase
      .from('market_product_source_bindings')
      .select('id,product_id,external_identifier,is_active,refresh_interval_minutes')
      .eq('workspace_id', workspace.workspace_id)
      .order('created_at', { ascending: false }),
    supabase
      .from('market_observations')
      .select('id,product_id,metric_code,numeric_value,unit_code,observed_at,source_url')
      .eq('workspace_id', workspace.workspace_id)
      .order('observed_at', { ascending: true })
      .limit(500),
    supabase
      .from('market_source_sync_runs')
      .select('binding_id,sync_outcome,started_at,completed_at,error_code')
      .eq('workspace_id', workspace.workspace_id)
      .order('started_at', { ascending: false })
      .limit(200),
  ])
  const feedback = await searchParams
  const productNames = new Map(data?.map((product) => [product.id, product.name]))
  const canConfigure = hasWorkspacePermission(workspace, 'market.write')
  const factualObservations = (observationsResult.data ?? []).map((observation) => ({
    id: observation.id,
    productId: observation.product_id,
    productName: productNames.get(observation.product_id) ?? 'Produk',
    metricCode: observation.metric_code,
    numericValue: Number(observation.numeric_value),
    observedAt: observation.observed_at,
    sourceUrl: observation.source_url,
    unitCode: observation.unit_code,
  }))

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter">
        <div className="border-b border-zinc-200 pb-6">
          <p className="app-label mb-2">Workspace / {workspace.workspace_name}</p>
          <h1 className="app-heading">Tren pasar</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Bandingkan catatan internal dengan bukti statistik resmi tanpa mencampur sumbernya.
          </p>
        </div>
        {feedback.error && (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {feedback.error}
          </p>
        )}
        {feedback.success && (
          <p role="status" className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
            {feedback.success}
          </p>
        )}
        {error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Data tren pasar gagal dimuat.
          </p>
        ) : data?.length ? (
          <>
            <MarketTrendChart
              products={data.map((product) => ({
                id: product.id,
                name: product.name,
                snapshots: product.market_snapshots.map((snapshot) => ({
                  changePercent: Number(snapshot.change_percent),
                  observedOn: snapshot.observed_on,
                })),
              }))}
            />
            <div className="app-card mt-6 divide-y divide-zinc-100 overflow-hidden">
              {data.map((product) => {
                const latest = [...product.market_snapshots].sort((a, b) =>
                  b.observed_on.localeCompare(a.observed_on),
                )[0]
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
          </>
        ) : (
          <section className="app-card mt-6 flex items-start gap-3 p-6">
            <TrendingUp className="size-5 shrink-0 text-zinc-400" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold">Belum ada observasi pasar</h2>
              <p className="mt-1 text-sm text-zinc-500">Tambahkan produk ketika asumsi pasar siap dicatat.</p>
            </div>
          </section>
        )}

        {observationsResult.error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Data statistik resmi gagal dimuat.
          </p>
        ) : (
          <FactualObservationChart observations={factualObservations} />
        )}

        <section className="mt-8 border-t border-zinc-200 pt-8" aria-labelledby="factual-sources-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="app-label mb-2">Bukti eksternal</p>
              <h2 id="factual-sources-title" className="text-xl font-semibold">
                Sumber faktual BPS
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-zinc-500">
                Publikasi resmi untuk membantu keputusan. Sistem tidak membuat kesimpulan AI; tim Anda tetap menilai
                relevansinya.
              </p>
            </div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
              {bindingsResult.data?.length ?? 0} topik terhubung
            </span>
          </div>

          {canConfigure && data?.length ? (
            <BpsSourceManagement
              bindings={bindingsResult.data ?? []}
              canDelete={hasWorkspacePermission(workspace, 'market.delete')}
              products={data.map(({ id, name }) => ({ id, name }))}
              syncRuns={syncRunsResult.data ?? []}
            />
          ) : null}

          {documentsResult.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              Sumber faktual gagal dimuat.
            </p>
          ) : documentsResult.data?.length ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {documentsResult.data.map((document) => (
                <article key={document.id} className="app-card flex gap-4 p-5">
                  <Database className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500">
                      {productNames.get(document.product_id) ?? 'Produk'} · {document.publisher_name}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold leading-6">{document.title}</h3>
                    <p className="mt-2 text-xs text-zinc-500">
                      Terbit {jakartaDate(document.published_at)} · Diambil {jakartaDate(document.fetched_at)}
                    </p>
                    <a
                      href={document.canonical_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
                    >
                      Buka bukti di BPS <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="app-card mt-5 p-6">
              <p className="text-sm font-semibold">Belum ada dokumen BPS</p>
              <p className="mt-1 text-sm text-zinc-500">
                Hubungkan topik di atas. Dokumen resmi akan muncul setelah endpoint sinkronisasi dijalankan.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
