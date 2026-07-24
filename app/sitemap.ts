import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const lastModified = new Date()

  return [
    {
      url: new URL('/', siteUrl).toString(),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: new URL('/hubungi-kami', siteUrl).toString(),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}
