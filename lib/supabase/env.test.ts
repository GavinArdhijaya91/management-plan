import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPublicSupabaseEnvironment } from './env'

describe('public Supabase environment', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('accepts a hosted Supabase project over HTTPS', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example-project.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'publishable-key')

    expect(getPublicSupabaseEnvironment()).toEqual({
      url: 'https://example-project.supabase.co',
      publishableKey: 'publishable-key',
    })
  })

  it('accepts the local Supabase API during development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'local-anon-key')

    expect(getPublicSupabaseEnvironment().url).toBe('http://127.0.0.1:54321')
  })

  it('rejects a local Supabase API in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'local-anon-key')

    expect(() => getPublicSupabaseEnvironment()).toThrow('NEXT_PUBLIC_SUPABASE_URL is invalid.')
  })

  it('rejects lookalike and unsupported URLs', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://supabase.co.attacker.example')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'publishable-key')

    expect(() => getPublicSupabaseEnvironment()).toThrow('NEXT_PUBLIC_SUPABASE_URL is invalid.')
  })
})
