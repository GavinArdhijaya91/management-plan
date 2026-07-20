'use client'

import { Header } from '@/components/header'
import { Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react'
import { useState } from 'react'

export default function HubungiKamiPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hubungi Kami</h1>
          <p className="text-gray-600 mt-1">Ada pertanyaan? Kami siap membantu Anda. Hubungi tim support kami kapan saja</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Contact Methods */}
          <div className="siapin-card p-4 md:p-6">
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-gray-600 text-sm mt-1">support@siapin.id</p>
                <p className="text-gray-500 text-xs mt-2">Respon dalam 24 jam</p>
              </div>
            </div>
          </div>

          <div className="siapin-card p-4 md:p-6">
            <div className="flex items-start gap-3">
              <Phone className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Telepon</h3>
                <p className="text-gray-600 text-sm mt-1">(021) 1234-5678</p>
                <p className="text-gray-500 text-xs mt-2">Senin-Jumat 09:00-17:00</p>
              </div>
            </div>
          </div>

          <div className="siapin-card p-4 md:p-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
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
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Kirim Pesan</h2>

            {submitted && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-emerald-700 text-sm font-medium">✓ Pesan Anda telah dikirim! Tim kami akan segera menghubungi.</p>
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Subjek</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Subjek</option>
                    <option value="teknis">Masalah Teknis</option>
                    <option value="fitur">Permintaan Fitur</option>
                    <option value="billing">Pertanyaan Billing</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer w-full md:w-auto flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Kirim Pesan
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="siapin-card p-4 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              FAQ
            </h2>
            <div className="space-y-3">
              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-900 text-sm">Bagaimana cara mulai menggunakan Siapin?</summary>
                <p className="text-gray-600 text-sm mt-2">Daftar akun gratis, ikuti tutorial onboarding, dan mulai kelola bisnis Anda.</p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-900 text-sm">Apakah ada biaya tersembunyi?</summary>
                <p className="text-gray-600 text-sm mt-2">Tidak. Harga kami transparan dan tidak ada biaya tersembunyi.</p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-900 text-sm">Bagaimana keamanan data saya?</summary>
                <p className="text-gray-600 text-sm mt-2">Data Anda dienkripsi dan dilindungi dengan standar keamanan internasional.</p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-900 text-sm">Apakah ada versi mobile?</summary>
                <p className="text-gray-600 text-sm mt-2">Siapin fully responsive dan bisa diakses dari smartphone Anda.</p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
