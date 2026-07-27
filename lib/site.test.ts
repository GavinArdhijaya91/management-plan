import { afterEach, describe, expect, it } from 'vitest'
import { getSiteUrl } from './site'

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

afterEach(() => {
  if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
  else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
})

describe('getSiteUrl', () => {
  it('uses only the configured HTTP origin', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://siapin.example/untrusted/path?query=value'

    expect(getSiteUrl().toString()).toBe('https://siapin.example/')
  })

  it('rejects non-HTTP callback origins', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'javascript:alert(1)'

    expect(getSiteUrl().toString()).toBe('http://localhost:3000/')
  })

  it('falls back safely when configuration is malformed', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'not a URL'

    expect(getSiteUrl().toString()).toBe('http://localhost:3000/')
  })
})
