import { describe, expect, it } from 'vitest'
import { hasExpectedFileSignature, sanitizeAttachmentName } from './chat-file-security'

describe('chat attachment security', () => {
  it('checks claimed image signatures', () => {
    expect(hasExpectedFileSignature('image/png', new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10]))).toBe(true)
    expect(hasExpectedFileSignature('image/png', new Uint8Array([0x3c, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74]))).toBe(
      false,
    )
  })

  it('sanitizes and bounds user-controlled file names', () => {
    expect(sanitizeAttachmentName('../folder\\invoice.pdf')).toBe('..-folder-invoice.pdf')
    expect(sanitizeAttachmentName('a'.repeat(250))).toHaveLength(180)
  })
})
