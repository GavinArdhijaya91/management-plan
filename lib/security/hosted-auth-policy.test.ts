import { describe, expect, it } from 'vitest'
import { evaluateHostedAuthConfig } from './hosted-auth-policy.mjs'

const secureConfig = {
  disable_signup: false,
  external_email_enabled: true,
  external_anonymous_users_enabled: false,
  mailer_autoconfirm: false,
  mailer_allow_unverified_email_sign_ins: false,
  mailer_secure_email_change_enabled: true,
  refresh_token_rotation_enabled: true,
  security_update_password_require_reauthentication: true,
  security_manual_linking_enabled: false,
  jwt_exp: 3600,
  security_refresh_token_reuse_interval: 10,
  rate_limit_anonymous_users: 30,
  rate_limit_email_sent: 2,
  rate_limit_otp: 30,
  rate_limit_token_refresh: 1800,
  rate_limit_verify: 360,
  password_min_length: 10,
  password_required_characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$',
  password_hibp_enabled: true,
  security_captcha_enabled: true,
  sessions_inactivity_timeout: 86_400,
  site_url: 'https://siapin.example',
  uri_allow_list: 'https://siapin.example/auth/callback',
}

describe('hosted Supabase Auth policy', () => {
  it('accepts the hardened hosted baseline', () => {
    expect(evaluateHostedAuthConfig(secureConfig, 'https://siapin.example')).toEqual({
      failures: [],
      warnings: [],
    })
  })

  it('rejects identity bypasses, long sessions, and broad redirects', () => {
    const result = evaluateHostedAuthConfig(
      {
        ...secureConfig,
        external_anonymous_users_enabled: true,
        mailer_autoconfirm: true,
        jwt_exp: 7200,
        password_min_length: 8,
        uri_allow_list: 'https://*.example.com/**,http://localhost:3000/auth/callback',
      },
      'https://siapin.example',
    )

    expect(result.failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining('external_anonymous_users_enabled'),
        expect.stringContaining('mailer_autoconfirm'),
        expect.stringContaining('jwt_exp'),
        expect.stringContaining('password_min_length'),
        expect.stringContaining('Wildcard'),
        expect.stringContaining('non-local HTTPS'),
        expect.stringContaining('canonical authentication callback'),
      ]),
    )
  })

  it('reports plan- or integration-dependent controls without misrepresenting them as active', () => {
    const result = evaluateHostedAuthConfig(
      {
        ...secureConfig,
        password_hibp_enabled: false,
        security_captcha_enabled: false,
        sessions_inactivity_timeout: 0,
      },
      'https://siapin.example',
    )

    expect(result.failures).toEqual([])
    expect(result.warnings).toHaveLength(3)
  })
})
