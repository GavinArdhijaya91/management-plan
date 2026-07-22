import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Arimo, JetBrains_Mono, Poppins } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/app/_i18n/language-provider'

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
  title: {
    default: 'Siapin | Platform Manajemen UMKM',
    template: '%s | Siapin',
  },
  description:
    'Siapin dulu rencananya, baru dijalankan. Kelola modal, penjualan, laba, dan rencana bisnis UMKM dalam satu tempat.',
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
      <body
        className={`${arimo.variable} ${poppins.variable} ${jetbrainsMono.variable} min-h-dvh bg-background text-foreground antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
