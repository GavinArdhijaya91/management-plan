import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { getSupabaseServiceEnvironment } from './env'

export function createServiceClient() {
  const { secretKey, url } = getSupabaseServiceEnvironment()
  return createClient<Database>(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
