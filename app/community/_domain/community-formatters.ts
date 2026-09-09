import type { CollaborationKind } from './community-types'

export const collaborationKindLabels: Record<CollaborationKind, string> = {
  marketing: 'Pemasaran',
  distribution: 'Distribusi',
  supplier: 'Pemasok',
  event: 'Acara',
  production: 'Produksi',
  other: 'Lainnya',
}

export function formatRelativeTime(value: string | null) {
  if (!value) return 'Belum diterbitkan'
  const date = new Date(value)
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })
  if (Math.abs(seconds) < 60) return formatter.format(seconds, 'second')
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return formatter.format(hours, 'hour')
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 30) return formatter.format(days, 'day')
  const months = Math.round(days / 30)
  if (Math.abs(months) < 12) return formatter.format(months, 'month')
  return formatter.format(Math.round(months / 12), 'year')
}

export function initialFromName(name: string) {
  return name.trim().charAt(0).toLocaleUpperCase('id-ID') || 'U'
}
