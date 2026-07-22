interface StatusBadgeProps {
  status: 'untung' | 'rugi' | 'aman' | 'warning' | 'urgent' | 'tercapai'
  label: string
  monochrome?: boolean
}

const statusConfig = {
  untung: 'bg-emerald-100 text-emerald-700',
  rugi: 'bg-red-100 text-red-700',
  aman: 'bg-emerald-100 text-emerald-700',
  tercapai: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-yellow-100 text-yellow-700',
  urgent: 'bg-red-100 text-red-700',
}

export function StatusBadge({ status, label, monochrome = false }: StatusBadgeProps) {
  return <span className={`${monochrome ? 'bg-zinc-950 text-white' : statusConfig[status]} rounded-full px-3 py-1 text-xs font-medium`}>{label}</span>
}
