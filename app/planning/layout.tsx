import { createPrivatePageMetadata } from '@/app/_lib/page-metadata'
import { WorkspaceBoundary } from '@/app/_components/workspace-boundary'

export const metadata = createPrivatePageMetadata(
  'Planning Bisnis',
  'Susun rencana, target, initiative, dan tindakan privat dalam satu workspace.',
)

export default function PlanningLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceBoundary nextPath="/planning">{children}</WorkspaceBoundary>
}
