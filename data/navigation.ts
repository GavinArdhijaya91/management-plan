import {
  BarChart3,
  CalendarDays,
  Headphones,
  LayoutDashboard,
  ListChecks,
  MessagesSquare,
  WalletCards,
} from 'lucide-react'
import type { AppRoute } from '@/types/navigation'

export const appRoutes: AppRoute[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    shortLabel: 'Beranda',
    description: 'Lihat ringkasan performa dan kondisi bisnis.',
    icon: LayoutDashboard,
    translationKey: 'dashboard',
  },
  {
    href: '/planning',
    label: 'Planning',
    shortLabel: 'Rencana',
    description: 'Susun target, initiative, dan tindakan bisnis.',
    icon: ListChecks,
    translationKey: 'planning',
  },
  {
    href: '/manajemen',
    label: 'Manajemen',
    shortLabel: 'Kelola',
    description: 'Catat modal, penjualan, dan laba atau rugi.',
    icon: WalletCards,
    translationKey: 'management',
  },
  {
    href: '/kalender',
    label: 'Kalender',
    shortLabel: 'Jadwal',
    description: 'Rencanakan pembayaran, stok, dan agenda bisnis.',
    icon: CalendarDays,
    translationKey: 'calendar',
  },
  {
    href: '/kolaborasi',
    label: 'Kolaborasi',
    shortLabel: 'Chat',
    description: 'Berkomunikasi privat dengan anggota workspace.',
    icon: MessagesSquare,
    translationKey: 'collaboration',
  },
  {
    href: '/tren-pasar',
    label: 'Tren Pasar',
    shortLabel: 'Tren',
    description: 'Pelajari performa produk dan peluang pasar.',
    icon: BarChart3,
    translationKey: 'market',
  },
  {
    href: '/hubungi-kami',
    label: 'Hubungi Kami',
    shortLabel: 'Bantuan',
    description: 'Temukan bantuan atau kirim pertanyaan kepada tim.',
    icon: Headphones,
    translationKey: 'contact',
  },
]
