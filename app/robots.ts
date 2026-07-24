import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/hubungi-kami'],
      disallow: ['/api/', '/dashboard', '/kalender', '/manajemen', '/notifikasi', '/profil', '/tren-pasar'],
    },
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
    host: siteUrl.origin,
  }
}
