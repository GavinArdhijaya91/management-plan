'use client'

import { Header } from '@/components/header'
import { ChevronLeft, ChevronRight, Bell, X } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/app/_components/modal'
import { AppToast } from '@/app/_components/app-toast'
import { DemoDataNotice } from '@/app/_components/demo-data-notice'
import { ConfirmationDialog } from '@/app/manajemen/_components/confirmation-dialog'
import { useLocalStorage } from '@/app/_lib/use-local-storage'
import type { DemoCalendarEvent } from '@/types'

const initialEvents: DemoCalendarEvent[] = [
  { id: 1, date: 15, month: 6, year: 2026, title: 'Bayar Supplier A', type: 'supplier', time: '10:00' },
  { id: 2, date: 20, month: 6, year: 2026, title: 'Gaji Karyawan', type: 'gaji', time: '09:00' },
  { id: 3, date: 20, month: 6, year: 2026, title: 'Cek Stok', type: 'stok', time: '14:00' },
  { id: 4, date: 25, month: 6, year: 2026, title: 'Evaluasi Bulan', type: 'lainnya', time: '16:00' },
  { id: 5, date: 28, month: 6, year: 2026, title: 'Bayar Supplier B', type: 'supplier', time: '11:00' },
]

export default function KalenderPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 20)) // July 2026
  const [selectedDate, setSelectedDate] = useState<number | null>(20)
  const [events, setEvents] = useLocalStorage<DemoCalendarEvent[]>('siapin:events', initialEvents)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'supplier' as DemoCalendarEvent['type'],
    time: '09:00',
  })

  const monthName = currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'supplier':
        return 'bg-zinc-950 text-white'
      case 'gaji':
        return 'bg-zinc-200 text-zinc-800'
      case 'stok':
        return 'bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'supplier':
        return 'Supplier'
      case 'gaji':
        return 'Gaji'
      case 'stok':
        return 'Stok'
      default:
        return 'Lainnya'
    }
  }

  const monthEvents = events.filter(
    (event) => event.month === currentMonth.getMonth() && event.year === currentMonth.getFullYear(),
  )
  const selectedDateEvents = monthEvents.filter((event) => event.date === selectedDate)

  const saveEvent = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedDate) return
    setEvents((current) =>
      editingId === null
        ? [
            ...current,
            {
              id: Date.now(),
              date: selectedDate,
              month: currentMonth.getMonth(),
              year: currentMonth.getFullYear(),
              ...eventForm,
            },
          ]
        : current.map((item) => (item.id === editingId ? { ...item, ...eventForm } : item)),
    )
    setEventForm({ title: '', type: 'supplier', time: '09:00' })
    setModalOpen(false)
    setEditingId(null)
    setToast(editingId === null ? 'Agenda berhasil ditambahkan.' : 'Agenda berhasil diperbarui.')
  }

  const openCreate = () => {
    setEditingId(null)
    setEventForm({ title: '', type: 'supplier', time: '09:00' })
    setModalOpen(true)
  }
  const openEdit = (item: DemoCalendarEvent) => {
    setEditingId(item.id)
    setEventForm({ title: item.title, type: item.type, time: item.time ?? '09:00' })
    setModalOpen(true)
  }
  const confirmDelete = () => {
    if (deleteId === null) return
    setEvents((current) => current.filter((item) => item.id !== deleteId))
    setDeleteId(null)
    setToast('Agenda berhasil dihapus.')
  }
  const confirmReset = () => {
    setEvents(initialEvents)
    setResetOpen(false)
    setToast('Data kalender demo berhasil dikembalikan.')
  }

  return (
    <main className="app-shell">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="app-heading">Kalender &amp; pengingat</h1>
            <p className="mt-2 text-zinc-500">Kelola jadwal penting dan pengingat bisnis Anda.</p>
          </div>
          <button
            onClick={() => setResetOpen(true)}
            className="min-h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium hover:bg-zinc-50"
          >
            Reset Demo
          </button>
        </div>
        <DemoDataNotice />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Calendar */}
          <div className="app-card p-4 md:p-6 lg:col-span-2">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-semibold text-zinc-950">{monthName}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <div key={day} className="py-2 text-center font-mono text-xs font-medium uppercase text-zinc-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {emptyDays.map((i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {days.map((day) => {
                const dayEvents = monthEvents.filter((e) => e.date === day)
                const isSelected = day === selectedDate
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`relative aspect-square rounded-lg p-2 font-mono text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-zinc-950 text-white'
                        : dayEvents.length > 0
                          ? 'border border-zinc-300 bg-zinc-100 text-zinc-950'
                          : 'text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {day}
                    {dayEvents.length > 0 && !isSelected && (
                      <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-zinc-950" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Events Sidebar */}
          <div className="app-card p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedDate ? `${selectedDate} Juli 2026` : 'Pilih tanggal'}
            </h3>

            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className={`p-3 rounded-lg ${getEventTypeColor(event.type)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs opacity-75">{event.time || 'Sepanjang hari'}</span>
                          <span className="text-xs opacity-75">•</span>
                          <span className="text-xs opacity-75">{getEventTypeLabel(event.type)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(event)}
                          className="rounded px-2 py-1 text-xs opacity-75 hover:opacity-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(event.id)}
                          aria-label={`Hapus ${event.title}`}
                          className="text-current opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Tidak ada event</p>
              </div>
            )}

            <button
              onClick={openCreate}
              disabled={!selectedDate}
              className="app-button mt-4 w-full disabled:cursor-not-allowed disabled:opacity-40"
            >
              + Tambah Event
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="app-card mt-6 p-4 md:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Event Mendatang</h3>
          <div className="space-y-2">
            {[...monthEvents]
              .sort((a, b) => a.date - b.date)
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(event.type)}`}>
                      {getEventTypeLabel(event.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {event.date} Juli {event.time && `• ${event.time}`}
                      </p>
                    </div>
                  </div>
                  <Bell className="w-5 h-5 text-gray-400" />
                </div>
              ))}
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId === null ? 'Tambah event' : 'Edit event'}
        description={selectedDate ? `${selectedDate} ${monthName}` : undefined}
      >
        <form onSubmit={saveEvent} className="space-y-4">
          <label className="block text-sm font-medium">
            Agenda
            <input
              required
              value={eventForm.title}
              onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })}
              placeholder="Contoh: Bayar supplier"
              className="app-input mt-1.5 w-full"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium">
              Kategori
              <select
                value={eventForm.type}
                onChange={(event) =>
                  setEventForm({
                    ...eventForm,
                    type: event.target.value as DemoCalendarEvent['type'],
                  })
                }
                className="app-input mt-1.5 w-full"
              >
                <option value="supplier">Supplier</option>
                <option value="gaji">Gaji</option>
                <option value="stok">Stok</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Waktu
              <input
                required
                type="time"
                value={eventForm.time}
                onChange={(event) => setEventForm({ ...eventForm, time: event.target.value })}
                className="app-input mt-1.5 w-full"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="min-h-11 rounded-xl border border-zinc-200 px-4 text-sm font-medium"
            >
              Batal
            </button>
            <button type="submit" className="app-button">
              Simpan event
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmationDialog
        open={deleteId !== null}
        title="Hapus agenda?"
        description="Agenda yang dihapus tidak dapat dikembalikan kecuali melalui Reset Demo."
        confirmLabel="Hapus agenda"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
      <ConfirmationDialog
        open={resetOpen}
        title="Kembalikan data kalender?"
        description="Semua perubahan kalender lokal akan diganti dengan data awal demo."
        confirmLabel="Reset Demo"
        onCancel={() => setResetOpen(false)}
        onConfirm={confirmReset}
      />
      <AppToast message={toast} onClose={() => setToast(null)} />
    </main>
  )
}
