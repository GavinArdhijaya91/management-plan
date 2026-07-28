import { describe, expect, it } from 'vitest'
import nextConfig from '../../next.config.mjs'

describe('Server Action security configuration', () => {
  it('keeps mutation payloads substantially below the framework default', () => {
    expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe('64kb')
  })

  it('does not add cross-origin Server Action exceptions', () => {
    const serverActions = nextConfig.experimental?.serverActions

    expect(serverActions).toBeDefined()
    expect('allowedOrigins' in (serverActions ?? {})).toBe(false)
  })
})
