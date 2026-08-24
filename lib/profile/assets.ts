const profileAssetBucket = 'avatars'

export function getProfileAssetUrl(path: string | null | undefined) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl || !path) return null
  return `${baseUrl}/storage/v1/object/public/${profileAssetBucket}/${path}`
}

export { profileAssetBucket }
