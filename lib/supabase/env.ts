function isAllowedSupabaseUrl(value: string) {
  try {
    const url = new URL(value)
    const hostedProject = url.protocol === 'https:' && /^[a-z0-9-]+\.supabase\.co$/i.test(url.hostname)
    const localDevelopment =
      process.env.NODE_ENV !== 'production' &&
      url.protocol === 'http:' &&
      ['127.0.0.1', 'localhost'].includes(url.hostname)

    return hostedProject || localDevelopment
  } catch {
    return false
  }
}

export function getPublicSupabaseEnvironment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || !publishableKey) {
    throw new Error(
      'Supabase is not configured. Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    )
  }
  if (!isAllowedSupabaseUrl(url)) throw new Error('NEXT_PUBLIC_SUPABASE_URL is invalid.')

  return { publishableKey, url }
}

export function hasPublicSupabaseEnvironment() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
  )
}
