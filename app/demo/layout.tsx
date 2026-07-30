import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo Aplikasi',
  description: 'Mode demonstrasi Siapin menggunakan data contoh lokal tanpa workspace privat.',
  robots: { index: false, follow: false },
}

export default function DemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
