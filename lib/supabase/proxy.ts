import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'
import { getPublicSupabaseEnvironment } from './env'

export async function refreshAuthSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { publishableKey, url } = getPublicSupabaseEnvironment()
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return { response, user }
  } catch {
    return { response, user: null }
  }
}
