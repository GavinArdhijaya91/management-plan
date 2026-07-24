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
    <main className="min-h-dvh bg-[#f7f7f5] px-4 py-12">
      <section className="mx-auto max-w-2xl">
        <p className="app-label">Session workspace</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold">Pilih usaha yang ingin dikelola</h1>
        <p className="mt-2 text-zinc-600">Pilihan ini tidak mengubah role. Izin selalu diperiksa ulang di database.</p>
        {params.error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}
        <div className="mt-8 grid gap-3">
          {memberships.map((membership) => (
            <form action={selectWorkspace} key={membership.workspace_id}>
              <input type="hidden" name="workspaceId" value={membership.workspace_id} />
              <input type="hidden" name="next" value={next} />
              <button className="app-card flex w-full items-center justify-between p-5 text-left" type="submit">
                <span>
                  <strong className="block font-serif text-xl">{membership.workspace_name}</strong>
                  <span className="mt-1 block text-sm text-zinc-500">{membership.role_name}</span>
                </span>
                <span className="text-sm font-semibold">Buka</span>
              </button>
            </form>
          ))}
        </div>
        {memberships.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-6">
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
