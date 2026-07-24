import { getSiteUrl, siteConfig } from '@/lib/site'

export function StructuredData() {
  const siteUrl = getSiteUrl()
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl.toString(),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    inLanguage: siteConfig.language,
    image: new URL('/images/siapin.webp', siteUrl).toString(),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
