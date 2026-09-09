import { describe, expect, it } from 'vitest'
import { communityDraftSchema } from './community-post-schema'

const validDraft = {
  id: null,
  postKind: 'insight' as const,
  title: 'Strategi pemasaran lokal',
  body: 'Kami membagikan pengalaman meningkatkan penjualan secara bertahap.',
  authorDisplayName: 'Pemilik Usaha',
  workspaceDisplayName: 'Usaha Bersama',
  categoryIds: [1, 2],
  website: '',
}

describe('communityDraftSchema', () => {
  it('normalizes public text before persistence', () => {
    const parsed = communityDraftSchema.parse({
      ...validDraft,
      title: '  Strategi\t pemasaran lokal  ',
      body: 'Baris pertama.\r\n\r\n\r\nBaris kedua untuk dibagikan.',
    })
    expect(parsed.title).toBe('Strategi pemasaran lokal')
    expect(parsed.body).toBe('Baris pertama.\n\nBaris kedua untuk dibagikan.')
  })

  it('rejects duplicate categories and bot honeypot submissions', () => {
    expect(communityDraftSchema.safeParse({ ...validDraft, categoryIds: [1, 1] }).success).toBe(false)
    expect(communityDraftSchema.safeParse({ ...validDraft, website: 'https://spam.example' }).success).toBe(false)
  })

  it('rejects excessive links, character repetition, and disallowed promotions', () => {
    const excessiveLinks = Array.from({ length: 6 }, (_, index) => `https://example.com/${index}`).join(' ')
    expect(communityDraftSchema.safeParse({ ...validDraft, body: `Referensi kami ${excessiveLinks}` }).success).toBe(
      false,
    )
    expect(communityDraftSchema.safeParse({ ...validDraft, body: 'Promosi hebat!!!!!!!!!!!! hari ini.' }).success).toBe(
      false,
    )
    expect(
      communityDraftSchema.safeParse({ ...validDraft, body: 'Promosi judi online tidak diperbolehkan.' }).success,
    ).toBe(false)
  })

  it('rejects predominantly uppercase content', () => {
    expect(
      communityDraftSchema.safeParse({
        ...validDraft,
        body: 'PROMOSI PRODUK TERBAIK UNTUK SELURUH PELAKU USAHA LOKAL INDONESIA SEKARANG JUGA',
      }).success,
    ).toBe(false)
  })

  it('rejects credential, local-network, and disguised Unicode links', () => {
    for (const url of ['https://user:secret@example.com', 'http://127.0.0.1/admin', 'https://xn--paypa-4ve.example']) {
      expect(
        communityDraftSchema.safeParse({ ...validDraft, body: `Silakan membuka tautan berikut ${url}` }).success,
      ).toBe(false)
    }
  })
})
