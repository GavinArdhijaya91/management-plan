const defaultAuthenticatedPath = '/dashboard'
const disallowedRedirectPrefixes = ['/api', '/auth', '/_next']

export function getSafeInternalPath(value: string | null | undefined, fallback = defaultAuthenticatedPath) {
  if (
    !value?.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return fallback
  }

  try {
    const url = new URL(value, 'https://siapin.local')
    const isDisallowed = disallowedRedirectPrefixes.some(
      (prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
    )
    return url.origin === 'https://siapin.local' && !isDisallowed ? `${url.pathname}${url.search}${url.hash}` : fallback
  } catch {
    return fallback
  }
}
