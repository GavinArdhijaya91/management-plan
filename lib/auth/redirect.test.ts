import { describe, expect, it } from 'vitest'
import { getSafeInternalPath } from './redirect'

describe('getSafeInternalPath', () => {
  it('keeps internal paths and their query string', () => {
    expect(getSafeInternalPath('/dashboard?tab=goal')).toBe('/dashboard?tab=goal')
  })

  it('rejects protocol-relative and external redirects', () => {
    expect(getSafeInternalPath('//evil.example')).toBe('/dashboard')
    expect(getSafeInternalPath('https://evil.example')).toBe('/dashboard')
  })

  it('uses the requested fallback for missing values', () => {
    expect(getSafeInternalPath(undefined, '/workspace/select')).toBe('/workspace/select')
  })
})
