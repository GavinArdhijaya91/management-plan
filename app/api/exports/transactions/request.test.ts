import { describe, expect, it } from 'vitest'
import { transactionExportRequestSchema } from './request'

describe('transaction export request', () => {
  it('accepts supported formats and an ordered period', () => {
    expect(
      transactionExportRequestSchema.safeParse({
        format: 'xlsx',
        periodStart: '2026-07-01',
        periodEnd: '2026-07-31',
      }).success,
    ).toBe(true)
  })

  it.each(['csv', 'html', 'json'])('rejects unsupported format %s', (format) => {
    expect(transactionExportRequestSchema.safeParse({ format }).success).toBe(false)
  })

  it('rejects a reversed period', () => {
    expect(
      transactionExportRequestSchema.safeParse({
        format: 'pdf',
        periodStart: '2026-08-01',
        periodEnd: '2026-07-01',
      }).success,
    ).toBe(false)
  })

  it('rejects unknown request properties', () => {
    expect(
      transactionExportRequestSchema.safeParse({
        format: 'xlsx',
        workspaceId: '20000000-0000-0000-0000-000000000001',
      }).success,
    ).toBe(false)
  })
})
