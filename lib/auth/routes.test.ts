import { describe, expect, it } from 'vitest'
import { isProtectedPath } from './routes'

describe('isProtectedPath', () => {
  it.each([
    '/dashboard',
    '/dashboard/settings',
    '/kolaborasi',
    '/kolaborasi/channel',
    '/planning',
    '/planning/reviews',
    '/portfolio',
    '/workspace',
    '/workspace/select',
  ])('protects private application path %s', (pathname) => {
    expect(isProtectedPath(pathname)).toBe(true)
  })

  it.each([
    '/',
    '/auth/login',
    '/auth/callback',
    '/api/health',
    '/demo',
    '/demo/dashboard',
    '/planning-public',
    '/portfolio/public-example',
  ])('keeps public or prefix-lookalike path %s outside the session proxy', (pathname) => {
    expect(isProtectedPath(pathname)).toBe(false)
  })
})
