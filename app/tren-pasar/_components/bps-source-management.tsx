import { Pause, Play, Trash2 } from 'lucide-react'
import {
  createBpsBindingAction,
  createBpsDynamicBindingAction,
  deleteBpsBindingAction,
  retryBpsBindingAction,
  toggleBpsBindingAction,
  updateBpsIntervalAction,
} from '../actions'

interface Binding {
  external_identifier: string
  id: string
  is_active: boolean
  product_id: string
  refresh_interval_minutes: number
}

interface SyncRun {
  binding_id: string
  completed_at: string | null
  error_code: string | null
  started_at: string
  sync_outcome: 'failed' | 'running' | 'succeeded'
}

function bindingLabel(identifier: string) {
  const value = new URLSearchParams(identifier)
  if (value.get('model') === 'data') return `Variabel ${value.get('var')} · periode ${value.get('th')}`
  return `${value.get('model') === 'publication' ? 'Publikasi' : 'BRS'} · ${value.get('keyword')}`
}

function freshness(run: SyncRun | undefined, interval: number) {
  if (!run) return { label: 'Belum disinkronkan', tone: 'bg-zinc-100 text-zinc-600' }
  if (run.sync_outcome === 'running') return { label: 'Sedang berjalan', tone: 'bg-blue-50 text-blue-700' }
  if (run.sync_outcome === 'failed') return { label: `Gagal · ${run.error_code}`, tone: 'bg-red-50 text-red-700' }
  const age = Date.now() - new Date(run.completed_at ?? run.started_at).getTime()
  return age > interval * 60_000
    ? { label: 'Perlu diperbarui', tone: 'bg-amber-50 text-amber-700' }
    : { label: 'Data segar', tone: 'bg-emerald-50 text-emerald-700' }
}

export function BpsSourceManagement({
  bindings,
  canDelete,
  products,
  syncRuns,
}: {
  bindings: Binding[]
  canDelete: boolean
  products: Array<{ id: string; name: string }>
  syncRuns: SyncRun[]
}) {
  const latestRuns = new Map<string, SyncRun>()
  for (const run of syncRuns) if (!latestRuns.has(run.binding_id)) latestRuns.set(run.binding_id, run)

  return (
    <div className="mt-5 space-y-4">
      <details className="app-card p-5">
        <summary className="cursor-pointer text-sm font-semibold">Hubungkan sumber BPS baru</summary>
        <div className="mt-5 grid gap-6 xl:grid-cols-2">
          <form action={createBpsBindingAction} className="grid content-start gap-3">
            <h3 className="text-sm font-semibold">Dokumen resmi berdasarkan kata kunci</h3>
            <select name="productId" required className="app-input">
              <option value="">Pilih produk</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <select name="model" className="app-input">
                <option value="pressrelease">Berita resmi statistik</option>
                <option value="publication">Publikasi</option>
              </select>
              <input
                name="domain"
                defaultValue="0000"
                pattern="[0-9]{4}"
                required
                className="app-input"
                aria-label="Domain BPS"
              />
            </div>
            <input
              name="keyword"
              placeholder="Kata kunci, contoh: inflasi"
              minLength={2}
              maxLength={100}
              required
              className="app-input"
            />
            <button className="app-button" type="submit">
              Hubungkan dokumen
            </button>
          </form>
          <form action={createBpsDynamicBindingAction} className="grid content-start gap-3">
            <div>
              <h3 className="text-sm font-semibold">Seri angka tabel dinamis</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Gunakan ID dari dokumentasi/penjelajah tabel BPS; sinkronisasi menolak dimensi ambigu.
              </p>
            </div>
            <select name="productId" required className="app-input">
              <option value="">Pilih produk</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                name="domain"
                defaultValue="0000"
                pattern="[0-9]{4}"
                required
                className="app-input"
                aria-label="Domain BPS"
              />
              <input name="variableId" inputMode="numeric" placeholder="ID variabel" required className="app-input" />
              <input name="periodId" placeholder="ID periode" required className="app-input" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <input name="derivedVariableId" placeholder="Turvar (opsional)" className="app-input" />
              <input name="geographyId" placeholder="Vervar (opsional)" className="app-input" />
              <input name="derivedPeriodId" placeholder="Turth (opsional)" className="app-input" />
            </div>
            <button className="app-button" type="submit">
              Hubungkan seri angka
            </button>
          </form>
        </div>
      </details>

      {bindings.length > 0 && (
        <div className="app-card divide-y divide-zinc-100 overflow-hidden">
          {bindings.map((binding) => {
            const state = freshness(latestRuns.get(binding.id), binding.refresh_interval_minutes)
            return (
              <article
                key={binding.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {products.find((product) => product.id === binding.product_id)?.name ?? 'Produk'} ·{' '}
                    {bindingLabel(binding.external_identifier)}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                    <span className={`rounded-full px-2 py-0.5 ${state.tone}`}>{state.label}</span>
                    <span>Interval {Math.round(binding.refresh_interval_minutes / 60)} jam</span>
                    <span>{binding.is_active ? 'Aktif' : 'Dijeda'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {binding.is_active && (
                    <form action={retryBpsBindingAction}>
                      <input type="hidden" name="bindingId" value={binding.id} />
                      <button
                        type="submit"
                        className="inline-flex min-h-9 items-center rounded-lg border border-zinc-200 px-3 text-xs font-medium hover:bg-zinc-50"
                      >
                        Sinkronkan
                      </button>
                    </form>
                  )}
                  <form action={updateBpsIntervalAction} className="flex">
                    <input type="hidden" name="bindingId" value={binding.id} />
                    <select
                      name="minutes"
                      defaultValue={binding.refresh_interval_minutes}
                      className="min-h-9 rounded-l-lg border border-zinc-200 bg-white px-2 text-xs"
                      aria-label="Interval sinkronisasi"
                    >
                      <option value="360">6 jam</option>
                      <option value="720">12 jam</option>
                      <option value="1440">24 jam</option>
                      <option value="10080">7 hari</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-r-lg border border-l-0 border-zinc-200 px-2 text-xs font-medium"
                    >
                      Simpan
                    </button>
                  </form>
                  <form action={toggleBpsBindingAction}>
                    <input type="hidden" name="bindingId" value={binding.id} />
                    <input type="hidden" name="isActive" value={String(!binding.is_active)} />
                    <button
                      type="submit"
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-xs font-medium hover:bg-zinc-50"
                    >
                      {binding.is_active ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                      {binding.is_active ? 'Jeda' : 'Aktifkan'}
                    </button>
                  </form>
                  {canDelete && (
                    <form action={deleteBpsBindingAction}>
                      <input type="hidden" name="bindingId" value={binding.id} />
                      <button
                        type="submit"
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                        Hapus
                      </button>
                    </form>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
