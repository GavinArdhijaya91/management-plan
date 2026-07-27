import { describe, expect, it } from 'vitest'
import { getSecurityHeaders } from './headers.mjs'

function asRecord(production: boolean) {
  return Object.fromEntries(getSecurityHeaders(production).map(({ key, value }) => [key, value]))
}

describe('HTTP security headers', () => {
  it('enforces browser isolation and production transport security', () => {
    const headers = asRecord(true)

    expect(headers['Content-Security-Policy']).toContain("frame-ancestors 'none'")
    expect(headers['Content-Security-Policy']).toContain("object-src 'none'")
    expect(headers['Content-Security-Policy']).toContain('upgrade-insecure-requests')
    expect(headers['Content-Security-Policy']).not.toContain("'unsafe-eval'")
    expect(headers['Strict-Transport-Security']).toContain('max-age=31536000')
    expect(headers['X-Frame-Options']).toBe('DENY')
    expect(headers['X-Content-Type-Options']).toBe('nosniff')
  })

  it('allows local Supabase development without enabling production HSTS', () => {
    const headers = asRecord(false)

    expect(headers['Content-Security-Policy']).toContain('http://127.0.0.1:54321')
    expect(headers['Content-Security-Policy']).toContain("'unsafe-eval'")
    expect(headers['Strict-Transport-Security']).toBeUndefined()
  })
})
