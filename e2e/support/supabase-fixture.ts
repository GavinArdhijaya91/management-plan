import { createClient } from '@supabase/supabase-js'

export interface E2eAccount {
  email: string
  password: string
  workspaceName: string
  workspaceSlug: string
}

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required for authenticated E2E tests.`)
  return value
}

export async function createConfirmedE2eAccount(): Promise<E2eAccount> {
  const supabaseUrl = requiredEnvironment('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = requiredEnvironment('SUPABASE_SERVICE_ROLE_KEY')
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const account = {
    email: `e2e-owner-${uniqueSuffix}@siapin.test`,
    password: 'Siapin-E2E!2026',
    workspaceName: `E2E Workspace ${uniqueSuffix}`,
    workspaceSlug: `e2e-workspace-${uniqueSuffix}`,
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error } = await admin.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { full_name: 'Siapin E2E Owner' },
  })

  if (error) throw new Error(`Unable to create the E2E account: ${error.message}`)
  return account
}
