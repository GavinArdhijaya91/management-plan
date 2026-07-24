import { createPrivatePageMetadata } from '@/app/_lib/page-metadata'
import { WorkspaceBoundary } from '@/app/_components/workspace-boundary'

export const metadata = createPrivatePageMetadata('Notifikasi', 'Notifikasi privat aktivitas dan perhatian usaha.')

export default function NotificationsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceBoundary nextPath="/notifikasi">{children}</WorkspaceBoundary>
}
