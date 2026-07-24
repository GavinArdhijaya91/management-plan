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
    return new URL(configuredUrl)
  } catch {
    return new URL(fallbackSiteUrl)
  }
}
