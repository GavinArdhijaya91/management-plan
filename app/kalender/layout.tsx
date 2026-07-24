import { createPrivatePageMetadata } from '@/app/_lib/page-metadata'
import { WorkspaceBoundary } from '@/app/_components/workspace-boundary'

export const metadata = createPrivatePageMetadata('Kalender Usaha', 'Agenda privat untuk kegiatan operasional usaha.')

export default function CalendarLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceBoundary nextPath="/kalender">{children}</WorkspaceBoundary>
}
