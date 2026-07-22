import { Database } from 'lucide-react'

interface DemoDataNoticeProps {
  children?: React.ReactNode
}

export function DemoDataNotice({ children }: DemoDataNoticeProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
      <Database className="mt-0.5 size-4 shrink-0 text-zinc-950" aria-hidden="true" />
      <p>{children ?? 'Mode demo aktif. Perubahan disimpan hanya di perangkat ini.'}</p>
    </div>
  )
}
