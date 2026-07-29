import type { ComponentType, SVGProps } from 'react'

export type NavigationIcon = ComponentType<SVGProps<SVGSVGElement>>

export interface AppRoute {
  href: string
  label: string
  shortLabel: string
  description: string
  icon: NavigationIcon
  activeIcon: NavigationIcon
  translationKey: 'dashboard' | 'planning' | 'management' | 'calendar' | 'collaboration' | 'market' | 'contact'
}
