import { createPrivatePageMetadata } from '@/app/_lib/page-metadata'
import { WorkspaceBoundary } from '@/app/_components/workspace-boundary'

export const metadata = createPrivatePageMetadata('Tren Pasar', 'Analisis privat tren produk dan asumsi pasar.')

export default function MarketTrendsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceBoundary nextPath="/tren-pasar">{children}</WorkspaceBoundary>
}
