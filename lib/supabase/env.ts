const supabaseUrlPattern = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i

export function getPublicSupabaseEnvironment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || !publishableKey) {
    throw new Error('Supabase is not configured. Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.')
  }
  if (!supabaseUrlPattern.test(url)) throw new Error('NEXT_PUBLIC_SUPABASE_URL is invalid.')

  return { publishableKey, url }
}

export function hasPublicSupabaseEnvironment() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim())
}
