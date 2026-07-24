import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Arimo, JetBrains_Mono, Poppins } from 'next/font/google'
import './globals.css'
import { StructuredData } from '@/app/_components/structured-data'
import { LanguageProvider } from '@/app/_i18n/language-provider'
import { getSiteUrl, siteConfig } from '@/lib/site'

const arimo = Arimo({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-arimo',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: 'Siapin — Rencana Bisnis yang Terhubung dengan Hasil',
    template: '%s | Siapin',
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: 'business',
  referrer: 'origin-when-cross-origin',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: '/',
    siteName: siteConfig.name,
    title: 'Siapin — Rencana Bisnis yang Terhubung dengan Hasil',
    description: siteConfig.description,
    images: [
      {
        url: '/images/siapin.webp',
        width: 1200,
        height: 630,
        alt: 'Dashboard Siapin untuk perencanaan dan pengelolaan bisnis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siapin — Rencana Bisnis yang Terhubung dengan Hasil',
    description: siteConfig.description,
    images: ['/images/siapin.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#18181B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${arimo.variable} ${poppins.variable} ${jetbrainsMono.variable} min-h-dvh bg-background text-foreground antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
