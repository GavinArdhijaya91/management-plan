import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { requireAuthenticatedUser } from '@/lib/auth/session'

export default async function ProfilePage() {
  const user = await requireAuthenticatedUser('/profil')
  const supabase = await createClient()
  const [profileResult, preferenceResult] = await Promise.all([
    supabase.from('profiles').select('full_name,display_name,email,phone,bio').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('profile_preferences')
      .select('locale,timezone,date_format,theme,calendar_notifications,review_notifications')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])
  const profile = profileResult.data
  const preferences = preferenceResult.data

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter max-w-3xl">
        <p className="app-label mb-3">Akun privat</p>
        <h1 className="app-heading">Profil</h1>
        <p className="mt-2 text-zinc-500">Identitas ini berasal dari akun Supabase Anda, bukan data demo perangkat.</p>

        {profileResult.error || preferenceResult.error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Sebagian profil belum dapat dimuat.
          </p>
        ) : (
          <div className="mt-6 grid gap-5">
            <section className="app-card p-5 md:p-6">
              <p className="app-label">Identitas</p>
              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                {[
                  ['Nama lengkap', profile?.full_name ?? 'Belum diisi'],
                  ['Display name', profile?.display_name ?? 'Belum diisi'],
                  ['Email', profile?.email ?? user.email ?? 'Belum tersedia'],
                  ['Telepon', profile?.phone ?? 'Belum diisi'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-zinc-500">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              {profile?.bio && (
                <p className="mt-5 border-t border-zinc-100 pt-5 text-sm text-zinc-600">{profile.bio}</p>
              )}
            </section>
            <section className="app-card p-5 md:p-6">
              <p className="app-label">Preferensi</p>
              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                {[
                  ['Bahasa', preferences?.locale ?? 'id'],
                  ['Zona waktu', preferences?.timezone ?? 'Asia/Jakarta'],
                  ['Format tanggal', preferences?.date_format ?? 'DD/MM/YYYY'],
                  ['Tema', preferences?.theme ?? 'system'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-zinc-500">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
