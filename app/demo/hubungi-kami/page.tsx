'use client'

import { Header } from '@/components/header'
import { Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react'
import { useState } from 'react'
import { useLocalStorage } from '@/app/_lib/use-local-storage'
import { DemoDataNotice } from '@/app/_components/demo-data-notice'
import { AppToast } from '@/app/_components/app-toast'
import type { ContactFormEntry } from '@/types'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.'),
  email: z.email('Masukkan email yang valid.'),
  phone: z.string(),
  subject: z.string().min(1, 'Pilih subjek pesan.'),
  message: z.string().trim().min(10, 'Pesan minimal 10 karakter.').max(1000, 'Pesan maksimal 1000 karakter.'),
})

export default function HubungiKamiPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [messages, setMessages] = useLocalStorage<ContactFormEntry[]>('siapin:demo:messages', [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = contactSchema.safeParse(formData)
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])))
      return
    }
    setErrors({})
    setPending(true)
    window.setTimeout(() => {
      setMessages((current) => [...current, { id: Date.now(), createdAt: new Date().toISOString(), ...result.data }])
      setSubmitted(true)
      setPending(false)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 500)
  }

  return (
    <main className="app-shell">
      <Header mode="demo" />

      <div className="motion-page-enter mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="app-heading">Hubungi kami</h1>
          <p className="mt-2 text-zinc-500">Ada pertanyaan? Tim kami siap membantu kapan saja.</p>
        </div>
        <DemoDataNotice>
          Pengiriman pada fase demo masuk ke kotak pesan lokal. Tidak ada email yang benar-benar dikirim.
        </DemoDataNotice>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Contact Methods */}
          <div className="app-card p-4 md:p-6">
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-6 w-6 flex-shrink-0 text-zinc-950" />
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-gray-600 text-sm mt-1">support@siapin.id</p>
                <p className="text-gray-500 text-xs mt-2">Respon dalam 24 jam</p>
              </div>
            </div>
          </div>

          <div className="app-card p-4 md:p-6">
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-6 w-6 flex-shrink-0 text-zinc-950" />
              <div>
                <h3 className="font-semibold text-gray-900">Telepon</h3>
                <p className="text-gray-600 text-sm mt-1">(021) 1234-5678</p>
                <p className="text-gray-500 text-xs mt-2">Senin-Jumat 09:00-17:00</p>
              </div>
            </div>
          </div>

          <div className="app-card p-4 md:p-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-6 w-6 flex-shrink-0 text-zinc-950" />
              <div>
                <h3 className="font-semibold text-gray-900">Alamat</h3>
                <p className="text-gray-600 text-sm mt-1">Jakarta, Indonesia</p>
                <p className="text-gray-500 text-xs mt-2">Kunjungi office kami</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Contact Form */}
          <div className="app-card p-4 md:p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Kirim Pesan</h2>

            {submitted && (
              <div className="mb-4 rounded-xl bg-zinc-950 p-4">
                <p className="text-sm font-medium text-white">
                  Pesan Anda telah dikirim. Tim kami akan segera menghubungi.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nama Anda"
                    required
                    className="app-input w-full"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                    className="app-input w-full"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Nomor Telepon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+62..."
                    className="app-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Subjek</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="app-input w-full"
                  >
                    <option value="">Pilih Subjek</option>
                    <option value="teknis">Masalah Teknis</option>
                    <option value="fitur">Permintaan Fitur</option>
                    <option value="billing">Pertanyaan Billing</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                  {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Pesan</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tulis pesan Anda di sini..."
                  required
                  rows={5}
                  className="app-input w-full resize-none"
                />
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-red-600">{errors.message}</span>
                  <span className="text-zinc-400">{formData.message.length}/1000</span>
                </div>
              </div>

              <button type="submit" disabled={pending} className="app-button w-full disabled:opacity-50 md:w-auto">
                <Send className="w-4 h-4" />
                {pending ? 'Menyimpan...' : 'Kirim Pesan'}
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="app-card p-4 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              FAQ
            </h2>
            <div className="space-y-3">
              <p className="rounded-xl bg-zinc-100 p-3 text-xs text-zinc-600">
                {messages.length} pesan demo tersimpan di perangkat ini.
              </p>
              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-900 text-sm">
                  Bagaimana cara mulai menggunakan Siapin?
                </summary>
                <p className="text-gray-600 text-sm mt-2">
                  Daftar akun gratis, ikuti tutorial onboarding, dan mulai kelola bisnis Anda.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-900 text-sm">
                  Apakah ada biaya tersembunyi?
                </summary>
                <p className="text-gray-600 text-sm mt-2">
                  Tidak. Harga kami transparan dan tidak ada biaya tersembunyi.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-900 text-sm">
                  Bagaimana keamanan data saya?
                </summary>
                <p className="text-gray-600 text-sm mt-2">
                  Data Anda dienkripsi dan dilindungi dengan standar keamanan internasional.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-900 text-sm">Apakah ada versi mobile?</summary>
                <p className="text-gray-600 text-sm mt-2">
                  Siapin fully responsive dan bisa diakses dari smartphone Anda.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
      <AppToast message={submitted ? 'Pesan demo berhasil disimpan.' : null} onClose={() => setSubmitted(false)} />
    </main>
  )
}
