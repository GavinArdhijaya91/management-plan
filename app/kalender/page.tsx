'use client'

import { Header } from '@/components/header'
import { ChevronLeft, ChevronRight, Bell, X } from 'lucide-react'
import { useState } from 'react'

interface Event {
  id: number
  date: number
  title: string
  type: 'supplier' | 'gaji' | 'stok' | 'lainnya'
  time?: string
}

export default function KalenderPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 20)) // July 2026
  const [selectedDate, setSelectedDate] = useState<number | null>(20)
  const [events] = useState<Event[]>([
    { id: 1, date: 15, title: 'Bayar Supplier A', type: 'supplier', time: '10:00' },
    { id: 2, date: 20, title: 'Gaji Karyawan', type: 'gaji', time: '09:00' },
    { id: 3, date: 20, title: 'Cek Stok', type: 'stok', time: '14:00' },
    { id: 4, date: 25, title: 'Evaluasi Bulan', type: 'lainnya', time: '16:00' },
    { id: 5, date: 28, title: 'Bayar Supplier B', type: 'supplier', time: '11:00' },
  ])

  const monthName = currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'supplier':
        return 'bg-blue-100 text-blue-700'
      case 'gaji':
        return 'bg-emerald-100 text-emerald-700'
      case 'stok':
        return 'bg-orange-100 text-orange-700'
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

  const selectedDateEvents = events.filter((e) => e.date === selectedDate)

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kalender Rencana & Reminder</h1>
          <p className="text-gray-600 mt-1">Kelola jadwal penting dan reminder bisnis Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 md:p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{monthName}</h2>
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
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
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
                const dayEvents = events.filter((e) => e.date === day)
                const isSelected = day === selectedDate
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square p-2 rounded-lg font-medium text-sm transition-all relative ${
                      isSelected ? 'bg-blue-600 text-white shadow-lg' : dayEvents.length > 0 ? 'bg-blue-50 text-gray-900 border-2 border-blue-200' : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    {day}
                    {dayEvents.length > 0 && !isSelected && <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Events Sidebar */}
          <div className="siapin-card p-4 md:p-6">
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
                      <button className="text-current opacity-60 hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                      </button>
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

            <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              + Tambah Event
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="siapin-card p-4 md:p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Event Mendatang</h3>
          <div className="space-y-2">
            {events
              .sort((a, b) => a.date - b.date)
              .map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(event.type)}`}>{getEventTypeLabel(event.type)}</div>
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
    </main>
  )
}
