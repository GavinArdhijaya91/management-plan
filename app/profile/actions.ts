'use server'

import { hasExpectedFileSignature } from '@/app/collaboration/_lib/chat-file-security'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { profileAssetBucket, profileBannerBucket } from '@/lib/profile/assets'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(50),
  headline: z.string().trim().max(80),
  statusText: z.string().trim().max(120),
  bio: z.string().trim().max(300),
  showActivityStatus: z.boolean(),
})

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

function fail(message: string): never {
  redirect(`/profile?error=${encodeURIComponent(message)}`)
}

function optionalText(value: string) {
  const trimmed = value.trim()
  return trimmed || null
}

async function validatedImage(formData: FormData, key: string, maxBytes: number) {
  const value = formData.get(key)
  if (!(value instanceof File) || value.size === 0) return null
  if (!imageTypes.has(value.type) || value.size > maxBytes) {
    fail(`File ${key === 'avatar' ? 'avatar' : 'banner'} harus JPG, PNG, atau WebP sesuai batas ukuran.`)
  }
  const bytes = new Uint8Array(await value.arrayBuffer())
  if (!hasExpectedFileSignature(value.type, bytes.subarray(0, 16))) fail('Isi file gambar tidak sesuai formatnya.')
  return { bytes, contentType: value.type, extension: extensions[value.type] }
}

export async function updateProfileAction(formData: FormData) {
  const parsed = profileSchema.safeParse({
    displayName: formData.get('displayName'),
    headline: formData.get('headline') ?? '',
    statusText: formData.get('statusText') ?? '',
    bio: formData.get('bio') ?? '',
    showActivityStatus: formData.get('showActivityStatus') === 'on',
  })
  if (!parsed.success) fail(parsed.error.issues[0]?.message ?? 'Profil belum valid.')

  const user = await requireAuthenticatedUser('/profile')
  const supabase = await createClient()
  const [currentResult, avatar, banner] = await Promise.all([
    supabase.from('profiles').select('avatar_path,profile_banner_path').eq('user_id', user.id).single(),
    validatedImage(formData, 'avatar', 2 * 1024 * 1024),
    validatedImage(formData, 'banner', 5 * 1024 * 1024),
  ])
  if (currentResult.error) fail('Profil saat ini tidak dapat dibaca.')

  const uploadedObjects: Array<{ bucket: string; path: string }> = []
  const upload = async (kind: 'avatar' | 'banner', image: NonNullable<typeof avatar>) => {
    const bucket = kind === 'avatar' ? profileAssetBucket : profileBannerBucket
    const path = `${user.id}/${kind}-${crypto.randomUUID()}.${image.extension}`
    const { error } = await supabase.storage.from(bucket).upload(path, image.bytes, {
      contentType: image.contentType,
      upsert: false,
    })
    if (error) throw new Error(`Gagal mengunggah ${kind}.`)
    uploadedObjects.push({ bucket, path })
    return path
  }

  const removeAvatar = formData.get('removeAvatar') === 'on'
  const removeBanner = formData.get('removeBanner') === 'on'
  let avatarPath = removeAvatar ? null : currentResult.data.avatar_path
  let bannerPath = removeBanner ? null : currentResult.data.profile_banner_path
  try {
    if (avatar) avatarPath = await upload('avatar', avatar)
    if (banner) bannerPath = await upload('banner', banner)
  } catch (error) {
    for (const object of uploadedObjects) await supabase.storage.from(object.bucket).remove([object.path])
    console.error('[profile.asset.upload.failed]', error)
    fail('Foto profil atau banner belum dapat diunggah.')
  }

  const { error: updateError } = await supabase.rpc('update_my_personal_profile', {
    requested_display_name: parsed.data.displayName,
    requested_headline: optionalText(parsed.data.headline),
    requested_status_text: optionalText(parsed.data.statusText),
    requested_bio: optionalText(parsed.data.bio),
    requested_avatar_path: avatarPath,
    requested_profile_banner_path: bannerPath,
    requested_show_activity_status: parsed.data.showActivityStatus,
  })

  if (updateError) {
    for (const object of uploadedObjects) await supabase.storage.from(object.bucket).remove([object.path])
    fail('Perubahan profil belum dapat disimpan.')
  }

  if (avatarPath !== currentResult.data.avatar_path && currentResult.data.avatar_path) {
    await supabase.storage.from(profileAssetBucket).remove([currentResult.data.avatar_path])
  }
  if (bannerPath !== currentResult.data.profile_banner_path && currentResult.data.profile_banner_path) {
    await supabase.storage.from(profileBannerBucket).remove([currentResult.data.profile_banner_path])
  }

  revalidatePath('/profile')
  revalidatePath('/collaboration')
  redirect('/profile?success=Profil berhasil diperbarui.')
}
