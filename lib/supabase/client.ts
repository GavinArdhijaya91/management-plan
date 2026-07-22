'use client'

import { createBrowserClient } from '@supabase/ssr'
import { getPublicSupabaseEnvironment } from './env'

export function createClient() {
  const { publishableKey, url } = getPublicSupabaseEnvironment()
  return createBrowserClient(url, publishableKey)
}
