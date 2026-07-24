import type { Metadata } from 'next'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description: `Hubungi tim ${siteConfig.name} untuk pertanyaan mengenai platform perencanaan dan manajemen bisnis.`,
  alternates: {
    canonical: '/hubungi-kami',
  },
  openGraph: {
    title: 'Hubungi Kami | Siapin',
    description: `Hubungi tim ${siteConfig.name} untuk pertanyaan mengenai platform perencanaan dan manajemen bisnis.`,
    url: '/hubungi-kami',
  },
}

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
