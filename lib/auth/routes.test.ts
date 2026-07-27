import { describe, expect, it } from 'vitest'
import { isProtectedPath } from './routes'

describe('isProtectedPath', () => {
  it.each(['/dashboard', '/dashboard/settings', '/planning', '/planning/reviews', '/workspace', '/workspace/select'])(
    'protects private application path %s',
    (pathname) => {
      expect(isProtectedPath(pathname)).toBe(true)
    },
  )

  it.each(['/', '/auth/login', '/auth/callback', '/api/health', '/planning-public'])(
    'keeps public or prefix-lookalike path %s outside the session proxy',
    (pathname) => {
      expect(isProtectedPath(pathname)).toBe(false)
    },
  )
})
