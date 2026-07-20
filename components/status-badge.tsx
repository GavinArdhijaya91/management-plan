interface StatusBadgeProps {
  status: 'untung' | 'rugi' | 'aman' | 'warning' | 'urgent' | 'tercapai'
  label: string
}

const statusConfig = {
  untung: 'bg-emerald-100 text-emerald-700',
  rugi: 'bg-red-100 text-red-700',
  aman: 'bg-emerald-100 text-emerald-700',
  tercapai: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-yellow-100 text-yellow-700',
  urgent: 'bg-red-100 text-red-700',
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return <span className={`${statusConfig[status]} px-3 py-1 rounded-full text-xs font-medium`}>{label}</span>
}
