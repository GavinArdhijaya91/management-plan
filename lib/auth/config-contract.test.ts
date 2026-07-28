import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const config = readFileSync(new URL('../../supabase/config.toml', import.meta.url), 'utf8')

function section(name: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = config.match(new RegExp(`\\[${escapedName}\\]\\r?\\n([\\s\\S]*?)(?=\\r?\\n\\[|$)`))

  if (!match?.[1]) throw new Error(`Missing Supabase config section [${name}]`)
  return match[1]
}

describe('Supabase Auth security configuration', () => {
  it('pins session and identity defaults', () => {
    const auth = section('auth')

    expect(auth).toMatch(/^jwt_expiry = 3600$/m)
    expect(auth).toMatch(/^enable_signup = true$/m)
    expect(auth).toMatch(/^enable_anonymous_sign_ins = false$/m)
    expect(auth).toMatch(/^enable_refresh_token_rotation = true$/m)
    expect(auth).toMatch(/^refresh_token_reuse_interval = 10$/m)
  })

  it('limits redirects to the authentication callback', () => {
    const auth = section('auth')

    expect(auth).toMatch(/^additional_redirect_urls = \["http:\/\/localhost:3000\/auth\/callback"\]$/m)
    expect(auth).not.toContain('/**')
  })

  it('pins authentication abuse limits', () => {
    const rateLimit = section('auth.rate_limit')

    expect(rateLimit).toMatch(/^email_sent = 2$/m)
    expect(rateLimit).toMatch(/^token_refresh = 150$/m)
    expect(rateLimit).toMatch(/^sign_in_sign_ups = 30$/m)
    expect(rateLimit).toMatch(/^token_verifications = 30$/m)
  })

  it('requires verified email ownership and protected account changes', () => {
    const email = section('auth.email')

    expect(email).toMatch(/^enable_confirmations = true$/m)
    expect(email).toMatch(/^double_confirm_changes = true$/m)
    expect(email).toMatch(/^secure_password_change = true$/m)
    expect(email).toMatch(/^max_frequency = "1m"$/m)
    expect(email).toMatch(/^otp_length = 6$/m)
    expect(email).toMatch(/^otp_expiry = 3600$/m)
  })
})
