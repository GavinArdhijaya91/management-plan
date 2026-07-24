import { createPrivatePageMetadata } from '@/app/_lib/page-metadata'
import { WorkspaceBoundary } from '@/app/_components/workspace-boundary'

export const metadata = createPrivatePageMetadata('Dashboard Usaha', 'Ringkasan privat performa dan prioritas usaha.')

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceBoundary nextPath="/dashboard">{children}</WorkspaceBoundary>
}
