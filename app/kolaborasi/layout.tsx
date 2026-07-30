import { WorkspaceBoundary } from '@/app/_components/workspace-boundary'
import { createPrivatePageMetadata } from '@/app/_lib/page-metadata'

export const metadata = createPrivatePageMetadata(
  'Kolaborasi Workspace',
  'Percakapan internal privat untuk anggota workspace.',
)

export default function CollaborationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceBoundary nextPath="/kolaborasi">{children}</WorkspaceBoundary>
}
