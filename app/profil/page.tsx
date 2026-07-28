'use client'

import { AppToast } from '@/app/_components/app-toast'
import { DemoDataNotice } from '@/app/_components/demo-data-notice'
import { useLocalStorage } from '@/app/_lib/use-local-storage'
import { Header } from '@/components/header'
import { useEffect, useState } from 'react'
import { z } from 'zod'

const initialProfile = {
  name: 'Bu Rina',
  email: 'rina@usaha.id',
  business: 'Toko Rina',
  phone: '+62 812 3456 7890',
  emailNotification: true,
  weeklySummary: true,
}
const profileSchema = z.object({
  name: z.string().trim().min(2),
  email: z.email(),
  business: z.string().trim().min(2),
  phone: z.string().trim().min(8),
  emailNotification: z.boolean(),
  weeklySummary: z.boolean(),
})

export default function ProfilePage() {
  const [profile, setProfile, ready] = useLocalStorage('siapin:profile', initialProfile)
  const [draft, setDraft] = useState(profile)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    // Synchronize the editable draft after persisted browser data is hydrated.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ready) setDraft(profile)
  }, [profile, ready])
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const result = profileSchema.safeParse(draft)
    if (!result.success) {
      setError('Periksa kembali nama, email, nama usaha, dan nomor telepon.')
      return
    }
    setProfile(result.data)
    setError(null)
    setToast('Profil dan preferensi berhasil disimpan.')
  }
  const reset = () => {
    setDraft(initialProfile)
    setProfile(initialProfile)
    setError(null)
    setToast('Profil demo berhasil dikembalikan.')
  }

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell max-w-3xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="app-label mb-3">Akun &amp; ruang kerja</p>
            <h1 className="app-heading">Profil</h1>
            <p className="mt-2 text-zinc-500">Kelola identitas pemilik, usaha, dan preferensi komunikasi.</p>
          </div>
          <button
            onClick={reset}
            className="min-h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium"
          >
            Reset Demo
          </button>
        </div>
        <div className="mt-6">
          <DemoDataNotice />
        </div>
        <form onSubmit={submit} className="app-card mt-6 space-y-7 p-5 md:p-7">
          <section>
            <p className="app-label">Identitas</p>
            <h2 className="mt-1 font-serif text-xl font-semibold">Informasi ruang kerja</h2>
            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium">
                Nama lengkap
                <input
                  required
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  className="app-input mt-1.5 w-full"
                />
              </label>
              <label className="text-sm font-medium">
                Email
                <input
                  required
                  type="email"
                  value={draft.email}
                  onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                  className="app-input mt-1.5 w-full"
                />
              </label>
              <label className="text-sm font-medium">
                Nama usaha
                <input
                  required
                  value={draft.business}
                  onChange={(event) => setDraft({ ...draft, business: event.target.value })}
                  className="app-input mt-1.5 w-full"
                />
              </label>
              <label className="text-sm font-medium">
                Telepon
                <input
                  required
                  value={draft.phone}
                  onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                  className="app-input mt-1.5 w-full"
                />
              </label>
            </div>
          </section>
          <section className="border-t border-zinc-100 pt-6">
            <p className="app-label">Preferensi</p>
            <h2 className="mt-1 font-serif text-xl font-semibold">Komunikasi</h2>
            <div className="mt-4 space-y-2">
              <label className="flex cursor-pointer items-center justify-between rounded-xl bg-zinc-50 p-4">
                <span>
                  <strong className="block text-sm">Notifikasi email</strong>
                  <span className="text-xs text-zinc-500">Terima pembaruan penting melalui email.</span>
                </span>
                <input
                  type="checkbox"
                  checked={draft.emailNotification}
                  onChange={(event) => setDraft({ ...draft, emailNotification: event.target.checked })}
                  className="size-4 accent-zinc-950"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl bg-zinc-50 p-4">
                <span>
                  <strong className="block text-sm">Ringkasan mingguan</strong>
                  <span className="text-xs text-zinc-500">Kirim rekap performa setiap minggu.</span>
                </span>
                <input
                  type="checkbox"
                  checked={draft.weeklySummary}
                  onChange={(event) => setDraft({ ...draft, weeklySummary: event.target.checked })}
                  className="size-4 accent-zinc-950"
                />
              </label>
            </div>
          </section>
          <div className="flex justify-end border-t border-zinc-100 pt-5">
            <button className="app-button" type="submit">
              Simpan perubahan
            </button>
          </div>
        </form>
      </div>
      <AppToast message={toast} onClose={() => setToast(null)} />
    </main>
  )
}
