'use client'

import { AppToast } from '@/app/_components/app-toast'
import { DemoDataNotice } from '@/app/_components/demo-data-notice'
import { Modal } from '@/app/_components/modal'
import { useLocalStorage } from '@/app/_lib/use-local-storage'
import { Header } from '@/components/header'
import { SalesChart } from '@/components/sales-chart'
import { AlertCircle, Lightbulb, Pencil, Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'

interface MarketProduct { id: number; name: string; change: number; market: string }
const initialProducts: MarketProduct[] = [
  { id: 1, name: 'Produk A', change: 25, market: 'Sedang naik' },
  { id: 2, name: 'Produk B', change: 15, market: 'Stabil' },
  { id: 3, name: 'Produk C', change: -10, market: 'Menurun' },
  { id: 4, name: 'Produk D', change: 32, market: 'Naik pesat' },
]
const trendData = [
  { name: 'Feb', penjualan: 180000, modal: 120000, profit: 60000 }, { name: 'Mar', penjualan: 210000, modal: 140000, profit: 70000 },
  { name: 'Apr', penjualan: 195000, modal: 130000, profit: 65000 }, { name: 'Mei', penjualan: 245000, modal: 160000, profit: 85000 },
  { name: 'Jun', penjualan: 280000, modal: 185000, profit: 95000 }, { name: 'Jul', penjualan: 270000, modal: 175000, profit: 95000 },
]

export default function TrenPasarPage() {
  const [products, setProducts] = useLocalStorage<MarketProduct[]>('siapin:market-products', initialProducts)
  const [period, setPeriod] = useState('6')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', change: 0, market: 'Stabil' })
  const [toast, setToast] = useState<string | null>(null)
  const visibleTrend = trendData.slice(-Number(period))
  const strongest = useMemo(() => [...products].sort((a, b) => b.change - a.change)[0], [products])
  const weakest = useMemo(() => [...products].sort((a, b) => a.change - b.change)[0], [products])

  const openCreate = () => { setEditingId(null); setForm({ name: '', change: 0, market: 'Stabil' }); setModalOpen(true) }
  const openEdit = (product: MarketProduct) => { setEditingId(product.id); setForm({ name: product.name, change: product.change, market: product.market }); setModalOpen(true) }
  const save = (event: React.FormEvent) => { event.preventDefault(); setProducts((current) => editingId === null ? [...current, { id: Date.now(), ...form }] : current.map((item) => item.id === editingId ? { ...item, ...form } : item)); setModalOpen(false); setToast(editingId === null ? 'Produk pantauan ditambahkan.' : 'Asumsi tren diperbarui.') }
  const reset = () => { setProducts(initialProducts); setToast('Data tren demo berhasil dikembalikan.') }

  return <main className="app-shell"><Header variant="monochrome" /><div className="page-shell">
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="app-label mb-3">Simulasi keputusan</p><h1 className="app-heading">Analisis tren pasar</h1><p className="mt-2 text-zinc-500">Uji asumsi produk dan lihat prioritas tindakan yang dihasilkan.</p></div><div className="flex gap-2"><button onClick={reset} className="min-h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium">Reset Demo</button><button onClick={openCreate} className="app-button"><Plus className="size-4" />Tambah produk</button></div></div>
    <DemoDataNotice>Data tren merupakan simulasi edukatif, bukan rekomendasi investasi atau riset pasar aktual.</DemoDataNotice>
    <div className="my-6 flex justify-end"><label className="text-sm font-medium">Periode <select value={period} onChange={(event) => setPeriod(event.target.value)} className="app-input ml-2"><option value="3">3 bulan</option><option value="6">6 bulan</option></select></label></div>
    <SalesChart data={visibleTrend} type="line" title={`Tren penjualan, ${period} bulan terakhir`} variant="monochrome" />
    <section className="my-6 grid gap-4 md:grid-cols-2"><div className="app-card p-5"><TrendingUp className="size-5" /><h2 className="mt-4 font-serif text-lg font-semibold">Peluang utama: {strongest?.name}</h2><p className="mt-1 text-sm text-zinc-500">Pertumbuhan simulasi {strongest?.change ?? 0}%. Validasi permintaan sebelum menambah stok.</p></div><div className="app-card p-5"><AlertCircle className="size-5 text-zinc-500" /><h2 className="mt-4 font-serif text-lg font-semibold">Perlu evaluasi: {weakest?.name}</h2><p className="mt-1 text-sm text-zinc-500">Perubahan {weakest?.change ?? 0}%. Periksa harga, promosi, dan relevansi produk.</p></div></section>
    <section className="app-card overflow-hidden"><div className="border-b border-zinc-100 p-5"><p className="app-label">Asumsi produk</p><h2 className="mt-1 font-serif text-xl font-semibold">Produk yang dipantau</h2></div>{products.length === 0 ? <div className="p-10 text-center text-sm text-zinc-500">Belum ada produk pantauan.</div> : <div className="divide-y divide-zinc-100">{products.map((product) => <div key={product.id} className="grid items-center gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto]"><strong className="text-sm">{product.name}</strong><span className="text-sm text-zinc-500">{product.market}</span><span className="app-data flex items-center gap-1 text-sm">{product.change >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}{product.change > 0 ? '+' : ''}{product.change}%</span><button onClick={() => openEdit(product)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm"><Pencil className="size-3.5" />Edit</button></div>)}</div>}</section>
    <div className="mt-6 rounded-2xl bg-zinc-950 p-5 text-white"><div className="flex gap-3"><Lightbulb className="mt-0.5 size-5" /><div><h2 className="font-serif font-semibold">Cara memakai halaman ini</h2><p className="mt-1 text-sm text-zinc-400">Masukkan perubahan yang Anda amati, bandingkan produk, lalu jadikan hasilnya hipotesis untuk diuji melalui promosi kecil.</p></div></div></div>
  </div>
  <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId === null ? 'Tambah produk pantauan' : 'Edit asumsi produk'}><form onSubmit={save} className="space-y-4"><label className="block text-sm font-medium">Nama produk<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="app-input mt-1.5 w-full" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Perubahan (%)<input required type="number" min="-100" max="1000" value={form.change} onChange={(event) => setForm({ ...form, change: Number(event.target.value) })} className="app-input mt-1.5 w-full" /></label><label className="block text-sm font-medium">Kondisi<input required value={form.market} onChange={(event) => setForm({ ...form, market: event.target.value })} className="app-input mt-1.5 w-full" /></label></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setModalOpen(false)} className="min-h-11 rounded-xl border border-zinc-200 px-4 text-sm">Batal</button><button className="app-button">Simpan</button></div></form></Modal><AppToast message={toast} onClose={() => setToast(null)} />
  </main>
}
