'use client'

import { AppToast } from '@/app/_components/app-toast'
import { DemoDataNotice } from '@/app/_components/demo-data-notice'
import { useLocalStorage } from '@/app/_lib/use-local-storage'
import { Header } from '@/components/header'
import { Bell, CheckCircle2, PackageSearch, Trash2 } from 'lucide-react'
import { useState } from 'react'

const initial = [
  {
    id: 1,
    title: 'Stok perlu diperiksa',
    detail: 'Produk A dan C mendekati batas minimum.',
    read: false,
    type: 'stock',
  },
  {
    id: 2,
    title: 'Target hampir tercapai',
    detail: 'Penjualan bulan ini sudah mencapai 95% target.',
    read: false,
    type: 'target',
  },
  {
    id: 3,
    title: 'Agenda besok',
    detail: 'Pembayaran Supplier A dijadwalkan pukul 10.00.',
    read: true,
    type: 'schedule',
  },
]

export default function NotificationsPage() {
  const [items, setItems] = useLocalStorage('siapin:demo:notifications', initial)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [toast, setToast] = useState<string | null>(null)
  const shown = filter === 'unread' ? items.filter((item) => !item.read) : items
  const unread = items.filter((item) => !item.read).length
  const markAll = () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })))
    setToast('Semua notifikasi ditandai dibaca.')
  }
  const reset = () => {
    setItems(initial)
    setToast('Notifikasi demo dikembalikan.')
  }

  return (
    <main className="app-shell">
      <Header mode="demo" />
      <div className="page-shell motion-page-enter max-w-4xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="app-label mb-3">Pusat aktivitas</p>
            <h1 className="app-heading">Notifikasi</h1>
            <p className="mt-2 text-zinc-500">{unread} aktivitas belum dibaca.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="min-h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium"
            >
              Reset Demo
            </button>
            <button onClick={markAll} disabled={unread === 0} className="app-button disabled:opacity-40">
              Tandai semua dibaca
            </button>
          </div>
        </div>
        <DemoDataNotice />
        <div className="my-5 flex gap-2" role="group" aria-label="Filter notifikasi">
          <button
            onClick={() => setFilter('all')}
            className={
              filter === 'all' ? 'app-button' : 'min-h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm'
            }
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={
              filter === 'unread' ? 'app-button' : 'min-h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm'
            }
          >
            Belum dibaca
          </button>
        </div>
        <div className="app-card divide-y divide-zinc-100 overflow-hidden">
          {shown.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="mx-auto size-8 text-zinc-300" />
              <p className="mt-3 text-sm text-zinc-500">Tidak ada notifikasi pada filter ini.</p>
            </div>
          ) : (
            shown.map((item) => (
              <div key={item.id} className={`flex items-start gap-4 p-5 ${item.read ? 'opacity-60' : ''}`}>
                <button
                  onClick={() =>
                    setItems((current) =>
                      current.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)),
                    )
                  }
                  className="flex flex-1 items-start gap-4 text-left"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-zinc-100">
                    {item.type === 'stock' ? (
                      <PackageSearch className="size-5" />
                    ) : item.type === 'target' ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Bell className="size-5" />
                    )}
                  </span>
                  <span className="flex-1">
                    <strong className="text-sm">{item.title}</strong>
                    <span className="mt-1 block text-sm text-zinc-500">{item.detail}</span>
                  </span>
                  {!item.read && <span className="mt-2 size-2 rounded-full bg-zinc-950" />}
                </button>
                <button
                  onClick={() => {
                    setItems((current) => current.filter((entry) => entry.id !== item.id))
                    setToast('Notifikasi dihapus.')
                  }}
                  aria-label={`Hapus ${item.title}`}
                  className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <AppToast message={toast} onClose={() => setToast(null)} />
    </main>
  )
}
