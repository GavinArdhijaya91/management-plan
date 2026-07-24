const defaultAuthenticatedPath = '/dashboard'

export function getSafeInternalPath(value: string | null | undefined, fallback = defaultAuthenticatedPath) {
  if (!value?.startsWith('/') || value.startsWith('//')) return fallback

  try {
    const url = new URL(value, 'https://siapin.local')
    return url.origin === 'https://siapin.local' ? `${url.pathname}${url.search}${url.hash}` : fallback
  } catch {
    return fallback
  }
}
