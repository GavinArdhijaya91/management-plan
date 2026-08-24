const profileAssetBucket = 'avatars'
const profileBannerBucket = 'profile-banners'

function getPublicAssetUrl(bucket: string, path: string | null | undefined) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl || !path) return null
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`
}

export function getProfileAssetUrl(path: string | null | undefined) {
  return getPublicAssetUrl(profileAssetBucket, path)
}

export function getProfileBannerUrl(path: string | null | undefined) {
  return getPublicAssetUrl(profileBannerBucket, path)
}

export { profileAssetBucket, profileBannerBucket }
