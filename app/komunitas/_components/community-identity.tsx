import { BadgeCheck, Info } from 'lucide-react'
import { initialFromName } from '../_domain/community-formatters'

export function CommunityIdentity({ authorName, workspaceName }: { authorName: string; workspaceName: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white"
        aria-hidden="true"
      >
        {initialFromName(workspaceName)}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-zinc-900">{workspaceName}</p>
          <span
            title="Identitas dicocokkan saat post diterbitkan"
            aria-label="Identitas terverifikasi saat diterbitkan"
          >
            <BadgeCheck className="size-4 text-blue-600" aria-hidden="true" />
          </span>
          <span title="Nama pada saat post diterbitkan">
            <Info className="size-3.5 text-zinc-400" aria-hidden="true" />
          </span>
        </div>
        <p className="truncate text-xs text-zinc-500">oleh {authorName}</p>
      </div>
    </div>
  )
}
