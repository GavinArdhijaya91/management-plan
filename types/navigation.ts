import type { LucideIcon } from 'lucide-react'

export interface AppRoute {
  href: string
  label: string
  shortLabel: string
  description: string
  icon: LucideIcon
  translationKey: 'dashboard' | 'management' | 'calendar' | 'market' | 'contact'
}
