import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Siapin — Platform Manajemen Bisnis',
    short_name: 'Siapin',
    description: 'Hubungkan rencana usaha, aktivitas, transaksi, dan hasil aktual dalam satu ruang privat.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f7f5',
    theme_color: '#18181b',
    lang: 'id',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
