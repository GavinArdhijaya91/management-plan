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
        <div className="border-b border-zinc-200 pb-6">
          <p className="app-label mb-2">Akun privat</p>
          <h1 className="app-heading">Profil</h1>
          <p className="mt-2 text-sm text-zinc-500">Identitas akun dan preferensi lintas workspace.</p>
        </div>

        {profileResult.error || preferenceResult.error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Sebagian profil belum dapat dimuat.
          </p>
        ) : (
          <div className="app-card mt-6 divide-y divide-zinc-200 overflow-hidden">
            <section>
              <div className="border-b border-zinc-100 bg-zinc-50/70 px-5 py-3">
                <h2 className="text-sm font-semibold">Identitas</h2>
              </div>
              <dl className="grid sm:grid-cols-2">
                {[
                  ['Nama lengkap', profile?.full_name ?? 'Belum diisi'],
                  ['Display name', profile?.display_name ?? 'Belum diisi'],
                  ['Email', profile?.email ?? user.email ?? 'Belum tersedia'],
                  ['Telepon', profile?.phone ?? 'Belum diisi'],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-zinc-100 px-5 py-4 sm:[&:nth-child(odd)]:border-r">
                    <dt className="text-xs text-zinc-500">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              {profile?.bio && (
                <p className="border-t border-zinc-100 px-5 py-4 text-sm text-zinc-600">{profile.bio}</p>
              )}
            </section>
            <section>
              <div className="border-b border-zinc-100 bg-zinc-50/70 px-5 py-3">
                <h2 className="text-sm font-semibold">Preferensi</h2>
              </div>
              <dl className="grid sm:grid-cols-2">
                {[
                  ['Bahasa', preferences?.locale ?? 'id'],
                  ['Zona waktu', preferences?.timezone ?? 'Asia/Jakarta'],
                  ['Format tanggal', preferences?.date_format ?? 'DD/MM/YYYY'],
                  ['Tema', preferences?.theme ?? 'system'],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-zinc-100 px-5 py-4 sm:[&:nth-child(odd)]:border-r">
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
