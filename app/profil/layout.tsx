import { createPrivatePageMetadata } from '@/app/_lib/page-metadata'
import { requireAuthenticatedUser } from '@/lib/auth/session'

export const metadata = createPrivatePageMetadata(
  'Profil dan Pengaturan',
  'Identitas, preferensi, dan pengaturan privat pengguna.',
)

export default async function ProfileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAuthenticatedUser('/profil')
  return children
}
