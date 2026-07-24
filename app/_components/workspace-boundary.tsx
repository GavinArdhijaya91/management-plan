import { requireActiveWorkspace } from '@/lib/workspace/context'

export async function WorkspaceBoundary({
  children,
  nextPath,
}: Readonly<{ children: React.ReactNode; nextPath: string }>) {
  await requireActiveWorkspace(nextPath)
  return children
}
