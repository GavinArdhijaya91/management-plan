import { ProfileAvatar } from '@/components/profile-avatar'
import { getProfileBannerUrl } from '@/lib/profile/assets'
import { ImagePlus, Radio, UserRound } from 'lucide-react'
import { updateProfileAction } from '@/app/profil/actions'

interface ProfileEditorProps {
  profile: {
    avatar_path: string | null
    bio: string | null
    display_name: string
    headline: string | null
    profile_banner_path: string | null
    status_text: string | null
  }
  showActivityStatus: boolean
}

export function ProfileEditor({ profile, showActivityStatus }: ProfileEditorProps) {
  const bannerUrl = getProfileBannerUrl(profile.profile_banner_path)

  return (
    <form action={updateProfileAction} className="app-card mt-6 overflow-hidden">
      <div className="relative h-36 bg-zinc-900 sm:h-44">
        {bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bannerUrl} alt="Banner profil saat ini" className="h-full w-full object-cover opacity-90" />
        )}
        <label className="absolute right-4 top-4 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-white/30 bg-black/60 px-3 text-sm font-medium text-white backdrop-blur-md hover:bg-black/75">
          <ImagePlus className="size-4" aria-hidden="true" />
          Ganti banner
          <input name="banner" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" />
        </label>
      </div>

      <div className="relative px-5 pb-6 sm:px-7">
        <div className="-mt-12 flex items-end gap-4">
          <span className="rounded-[1.15rem] border-4 border-[#fcfcfb] bg-[#fcfcfb]">
            <ProfileAvatar avatarPath={profile.avatar_path} displayName={profile.display_name} size="lg" />
          </span>
          <div className="min-w-0 pb-2">
            <p className="truncate text-xl font-semibold">{profile.display_name}</p>
            <p className="truncate text-sm text-zinc-500">{profile.headline ?? 'Tambahkan headline profesional'}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
            Display name
            <input
              name="displayName"
              defaultValue={profile.display_name}
              minLength={2}
              maxLength={50}
              required
              className="app-input"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
            Headline
            <input
              name="headline"
              defaultValue={profile.headline ?? ''}
              maxLength={80}
              placeholder="Contoh: Pemilik Kedai Kopi"
              className="app-input"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-zinc-700 md:col-span-2">
            Status
            <input
              name="statusText"
              defaultValue={profile.status_text ?? ''}
              maxLength={120}
              placeholder="Apa yang sedang Anda kerjakan?"
              className="app-input"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-zinc-700 md:col-span-2">
            Bio
            <textarea
              name="bio"
              defaultValue={profile.bio ?? ''}
              maxLength={300}
              rows={4}
              className="app-input resize-y"
            />
          </label>

          <fieldset className="rounded-lg border border-zinc-200 p-4 md:col-span-2">
            <legend className="px-1 text-sm font-semibold">Aset profil</legend>
            <div className="mt-1 grid gap-4 sm:grid-cols-2">
              <label className="grid cursor-pointer gap-1.5 text-sm font-medium text-zinc-700">
                <span className="inline-flex items-center gap-2">
                  <UserRound className="size-4" /> Ganti foto profil
                </span>
                <input
                  name="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="app-input file:mr-3 file:border-0 file:bg-transparent file:text-xs file:font-semibold"
                />
                <span className="text-xs font-normal text-zinc-400">Maksimal 2 MB.</span>
              </label>
              <div className="space-y-3 pt-1 text-sm text-zinc-600">
                {profile.avatar_path && (
                  <label className="flex items-center gap-2">
                    <input name="removeAvatar" type="checkbox" /> Hapus foto saat ini
                  </label>
                )}
                {profile.profile_banner_path && (
                  <label className="flex items-center gap-2">
                    <input name="removeBanner" type="checkbox" /> Hapus banner saat ini
                  </label>
                )}
              </div>
            </div>
          </fieldset>

          <label className="flex items-start justify-between gap-5 rounded-lg border border-zinc-200 p-4 md:col-span-2">
            <span>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Radio className="size-4" /> Tampilkan status aktivitas
              </span>
              <span className="mt-1 block max-w-xl text-xs leading-5 text-zinc-500">
                Saat aktif, anggota workspace dapat melihat Anda online melalui koneksi Realtime. Jika dimatikan, Anda
                selalu terlihat offline.
              </span>
            </span>
            <span className="relative mt-1 inline-flex h-6 w-11 shrink-0">
              <input
                name="showActivityStatus"
                type="checkbox"
                defaultChecked={showActivityStatus}
                className="peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0"
              />
              <span className="h-full w-full rounded-full bg-zinc-300 transition-colors peer-checked:bg-zinc-950 peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-950 peer-focus-visible:ring-offset-2" />
              <span className="pointer-events-none absolute left-1 top-1 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
            </span>
          </label>
        </div>

        <div className="mt-6 flex justify-end border-t border-zinc-200 pt-5">
          <button type="submit" className="app-button">
            Simpan profil
          </button>
        </div>
      </div>
    </form>
  )
}
