import { Handshake, Lightbulb } from 'lucide-react'
import type { CommunityPostKind } from '../_domain/community-types'

export function CommunityPostKindBadge({ kind }: { kind: CommunityPostKind }) {
  const collaboration = kind === 'collaboration_request'
  const Icon = collaboration ? Handshake : Lightbulb
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${collaboration ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {collaboration ? 'Ajakan Kolaborasi' : 'Insight'}
    </span>
  )
}
