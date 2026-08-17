import { WorkspaceBoundary } from '@/app/_components/workspace-boundary'
import { createPrivatePageMetadata } from '@/app/_lib/page-metadata'

export const metadata = createPrivatePageMetadata(
  'Komunitas',
  'Insight dan ajakan kolaborasi yang dibagikan secara sadar oleh UMKM.',
)

export default function CommunityLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceBoundary nextPath="/komunitas">{children}</WorkspaceBoundary>
}
