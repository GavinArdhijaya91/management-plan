import { createPrivatePageMetadata } from '@/app/_lib/page-metadata'
import { WorkspaceBoundary } from '@/app/_components/workspace-boundary'

export const metadata = createPrivatePageMetadata(
  'Manajemen Transaksi',
  'Pencatatan dan analisis privat transaksi usaha.',
)

export default function ManagementLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceBoundary nextPath="/manajemen">{children}</WorkspaceBoundary>
}
