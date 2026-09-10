'use client'

import { AppToast } from '@/app/_components/app-toast'
import { DemoDataNotice } from '@/app/_components/demo-data-notice'
import { Modal } from '@/app/_components/modal'
import { useLocalStorage } from '@/app/_lib/use-local-storage'
import { Header } from '@/components/header'
import { SalesChart } from '@/components/sales-chart'
import { AlertCircle, Lightbulb, Pencil, Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLanguage } from '@/app/_i18n/language-provider'
import { marketTrendsCopy } from '@/app/_i18n/pages/market-trends'

const trendData = [
  { name: 'Feb', salesAmount: 180000, costAmount: 120000, netResult: 60000 },
  { name: 'Mar', salesAmount: 210000, costAmount: 140000, netResult: 70000 },
  { name: 'Apr', salesAmount: 195000, costAmount: 130000, netResult: 65000 },
  { name: 'Mei', salesAmount: 245000, costAmount: 160000, netResult: 85000 },
  { name: 'Jun', salesAmount: 280000, costAmount: 185000, netResult: 95000 },
  { name: 'Jul', salesAmount: 270000, costAmount: 175000, netResult: 95000 },
]

export default function TrenPasarPage() {
  const { locale } = useLanguage()
  const copy = marketTrendsCopy[locale]
  const initialProducts = copy.initialProducts
  const [products, setProducts] = useLocalStorage('siapin:demo:market-products', initialProducts)
  const [period, setPeriod] = useState('6')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', change: 0, market: copy.conditions[1] ?? 'Stabil' })
  const [toast, setToast] = useState<string | null>(null)
  const visibleTrend = trendData.slice(-Number(period))
  const strongest = useMemo(() => [...products].sort((a, b) => b.change - a.change)[0], [products])
  const weakest = useMemo(() => [...products].sort((a, b) => a.change - b.change)[0], [products])

  const openCreate = () => {
    setEditingId(null)
    setForm({ name: '', change: 0, market: copy.conditions[1] ?? 'Stabil' })
    setModalOpen(true)
  }
  const openEdit = (product: (typeof products)[number]) => {
    setEditingId(product.id)
    setForm({ name: product.name, change: product.change, market: product.market })
    setModalOpen(true)
  }
  const save = (event: React.FormEvent) => {
    event.preventDefault()
    setProducts((current) =>
      editingId === null
        ? [...current, { id: Date.now(), ...form }]
        : current.map((item) => (item.id === editingId ? { ...item, ...form } : item)),
    )
    setModalOpen(false)
    setToast(editingId === null ? copy.toast.added : copy.toast.updated)
  }
  const reset = () => {
    setProducts(initialProducts)
    setToast(copy.toast.reset)
  }

  return (
    <main className="app-shell">
      <Header mode="demo" />
      <div className="page-shell motion-page-enter">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="app-label mb-3">{copy.eyebrow}</p>
            <h1 className="app-heading">{copy.title}</h1>
            <p className="mt-2 text-zinc-500">{copy.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="min-h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium"
            >
              {copy.resetLabel}
            </button>
            <button onClick={openCreate} className="app-button">
              <Plus className="size-4" />
              {copy.addProduct}
            </button>
          </div>
        </div>
        <DemoDataNotice>{copy.demoNotice}</DemoDataNotice>
        <div className="my-6 flex justify-end">
          <label className="text-sm font-medium">
            {copy.periodLabel}{' '}
            <select value={period} onChange={(event) => setPeriod(event.target.value)} className="app-input ml-2">
              <option value="3">{copy.periodOptions['3']}</option>
              <option value="6">{copy.periodOptions['6']}</option>
            </select>
          </label>
        </div>
        <SalesChart
          data={visibleTrend}
          type="line"
          title={copy.chartTitle(period)}
          variant="monochrome"
        />
        <section className="my-6 grid gap-4 md:grid-cols-2">
          <div className="app-card p-5">
            <TrendingUp className="size-5" />
            <h2 className="mt-4 font-serif text-lg font-semibold">{copy.topOpportunity}: {strongest?.name}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {strongest ? copy.topOpportunityDesc(strongest.name, strongest.change) : ''}
            </p>
          </div>
          <div className="app-card p-5">
            <AlertCircle className="size-5 text-zinc-500" />
            <h2 className="mt-4 font-serif text-lg font-semibold">{copy.needsReview}: {weakest?.name}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {weakest ? copy.needsReviewDesc(weakest.name, weakest.change) : ''}
            </p>
          </div>
        </section>
        <section className="app-card overflow-hidden">
          <div className="border-b border-zinc-100 p-5">
            <p className="app-label">{copy.assumptionLabel}</p>
            <h2 className="mt-1 font-serif text-xl font-semibold">{copy.monitoredProducts}</h2>
          </div>
          {products.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-500">{copy.empty}</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {products.map((product) => (
                <div key={product.id} className="grid items-center gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto]">
                  <strong className="text-sm">{product.name}</strong>
                  <span className="text-sm text-zinc-500">{product.market}</span>
                  <span className="app-data flex items-center gap-1 text-sm">
                    {product.change >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                    {product.change > 0 ? '+' : ''}
                    {product.change}%
                  </span>
                  <button
                    onClick={() => openEdit(product)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm"
                  >
                    <Pencil className="size-3.5" />
                    {copy.table.edit}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        <div className="mt-6 rounded-2xl bg-zinc-950 p-5 text-white">
          <div className="flex gap-3">
            <Lightbulb className="mt-0.5 size-5" />
            <div>
              <h2 className="font-serif font-semibold">{copy.howToTitle}</h2>
              <p className="mt-1 text-sm text-zinc-400">{copy.howToDesc}</p>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId === null ? copy.modalAddTitle : copy.modalEditTitle}
      >
        <form onSubmit={save} className="space-y-4">
          <label className="block text-sm font-medium">
            {copy.form.name}
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="app-input mt-1.5 w-full"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              {copy.form.change}
              <input
                required
                type="number"
                min="-100"
                max="1000"
                value={form.change}
                onChange={(event) => setForm({ ...form, change: Number(event.target.value) })}
                className="app-input mt-1.5 w-full"
              />
            </label>
            <label className="block text-sm font-medium">
              {copy.form.condition}
              <input
                required
                value={form.market}
                onChange={(event) => setForm({ ...form, market: event.target.value })}
                className="app-input mt-1.5 w-full"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="min-h-11 rounded-xl border border-zinc-200 px-4 text-sm"
            >
              {copy.form.cancel}
            </button>
            <button className="app-button">{copy.form.save}</button>
          </div>
        </form>
      </Modal>
      <AppToast message={toast} onClose={() => setToast(null)} />
    </main>
  )
}
