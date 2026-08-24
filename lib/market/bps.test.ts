import { describe, expect, it } from 'vitest'
import { bpsCitationUrl, buildBpsRequestUrl, parseBpsBinding, parseBpsResponse } from './bps'

const binding = parseBpsBinding('model=pressrelease&domain=0000&keyword=inflasi')

describe('BPS factual source adapter', () => {
  it('accepts only the documented binding parameters', () => {
    expect(binding).toEqual({ model: 'pressrelease', domain: '0000', keyword: 'inflasi' })
    expect(() => parseBpsBinding('model=news&domain=0000&keyword=inflasi')).toThrow()
    expect(() => parseBpsBinding('model=pressrelease&domain=0000&keyword=inflasi&key=secret')).toThrow()
  })

  it('keeps the API key out of persisted citation URLs', () => {
    expect(buildBpsRequestUrl(binding, 'private-key').searchParams.get('key')).toBe('private-key')
    expect(bpsCitationUrl(binding)).not.toContain('key=')
  })

  it('normalizes publisher-attributed documents without copying article content', () => {
    const result = parseBpsResponse(
      {
        status: 'OK',
        'data-availability': 'available',
        data: [
          { page: 1, pages: 1, per_page: 10, count: 1, total: 1 },
          [{ brs_id: 'brs-1', title: 'Perkembangan Inflasi', rl_date: '2026-08-01', abstract: 'not stored' }],
        ],
      },
      binding,
    )

    expect(result.documents[0]).toMatchObject({
      sourceRecordId: 'pressrelease:brs-1',
      title: 'Perkembangan Inflasi',
      publisherName: 'Badan Pusat Statistik',
      languageCode: 'id',
    })
    expect(result.documents[0]).not.toHaveProperty('abstract')
    expect(result.documents[0].rawPayloadSha256).toMatch(/^[0-9a-f]{64}$/)
  })

  it('uses only official BPS document links and upgrades them to HTTPS', () => {
    const result = parseBpsResponse(
      {
        status: 'OK',
        data: [
          { page: 1, pages: 1 },
          [{ brs_id: 99, title: 'Inflasi', rl_date: '2026-08-01', pdf: 'http://example.bps.go.id/file.pdf' }],
        ],
      },
      binding,
    )

    expect(result.documents[0]?.canonicalUrl).toBe('https://example.bps.go.id/file.pdf')
  })

  it('rejects third-party document links and falls back to a redacted citation', () => {
    const result = parseBpsResponse(
      {
        status: 'OK',
        data: [
          { page: 1, pages: 1 },
          [{ brs_id: 99, title: 'Inflasi', rl_date: '2026-08-01', pdf: 'https://attacker.example/file.pdf' }],
        ],
      },
      binding,
    )

    expect(result.documents[0]?.canonicalUrl).toContain('webapi.bps.go.id')
    expect(result.documents[0]?.canonicalUrl).not.toContain('attacker.example')
  })
})
