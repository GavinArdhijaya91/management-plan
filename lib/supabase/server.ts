import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'
import { getPublicSupabaseEnvironment } from './env'

export async function createClient() {
  const cookieStore = await cookies()
  const { publishableKey, url } = getPublicSupabaseEnvironment()

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Cookie writes are not available in every Server Component render.
        }
      },
    },
  })
}
