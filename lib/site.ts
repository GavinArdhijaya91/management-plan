const fallbackSiteUrl = 'http://localhost:3000'

export const siteConfig = {
  name: 'Siapin',
  shortName: 'Siapin',
  description:
    'Platform private-first untuk merencanakan, menjalankan, dan mengevaluasi bisnis melalui target, aktivitas, transaksi, dan hasil aktual.',
  locale: 'id_ID',
  language: 'id',
  keywords: [
    'perencanaan bisnis',
    'manajemen usaha',
    'aplikasi UMKM',
    'business plan',
    'target bisnis',
    'keuangan usaha',
    'evaluasi bisnis',
  ],
} as const

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!configuredUrl) return new URL(fallbackSiteUrl)

  try {
    const url = new URL(configuredUrl)
    if (!['http:', 'https:'].includes(url.protocol)) return new URL(fallbackSiteUrl)
    return new URL(url.origin)
  } catch {
    return new URL(fallbackSiteUrl)
  }
}
