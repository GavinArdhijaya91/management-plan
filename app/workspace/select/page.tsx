import Link from 'next/link'
import { selectWorkspace } from '@/app/workspace/actions'
import { getSafeInternalPath } from '@/lib/auth/redirect'
import { getMyWorkspaceAccess } from '@/lib/workspace/context'

export default async function WorkspaceSelectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams
  const next = getSafeInternalPath(params.next)
  const memberships = (await getMyWorkspaceAccess()).filter((membership) => membership.membership_status === 'active')

  return (
    <main className="min-h-dvh bg-[#fafafa] px-4 py-12">
      <section className="mx-auto max-w-2xl">
        <p className="app-label">Session workspace</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Pilih usaha yang ingin dikelola</h1>
        <p className="mt-2 text-sm text-zinc-600">Role dan izin tetap diperiksa ulang oleh database.</p>
        {params.error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}
        <div className="app-card mt-8 divide-y divide-zinc-100 overflow-hidden">
          {memberships.map((membership) => (
            <form action={selectWorkspace} key={membership.workspace_id}>
              <input type="hidden" name="workspaceId" value={membership.workspace_id} />
              <input type="hidden" name="next" value={next} />
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-zinc-50"
                type="submit"
              >
                <span>
                  <strong className="block text-sm font-semibold">{membership.workspace_name}</strong>
                  <span className="mt-1 block text-sm text-zinc-500">{membership.role_name}</span>
                </span>
                <span className="text-xs font-semibold text-zinc-600">Buka →</span>
              </button>
            </form>
          ))}
        </div>
        {memberships.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white p-6">
            <p className="text-zinc-600">Belum ada workspace aktif pada akun ini.</p>
            <Link href="/workspace/setup" className="app-button mt-4">
              Buat workspace pertama
            </Link>
          </div>
        )}
        {memberships.length > 0 && (
          <Link href="/workspace/setup" className="mt-6 inline-block text-sm font-semibold underline">
            Buat workspace lain
          </Link>
        )}
      </section>
    </main>
  )
}
