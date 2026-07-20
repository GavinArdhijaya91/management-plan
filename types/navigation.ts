import type { LucideIcon } from 'lucide-react'

export interface AppRoute {
  href: string
  label: string
  shortLabel: string
  description: string
  icon: LucideIcon
}
