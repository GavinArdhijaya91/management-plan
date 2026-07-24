import { createWorkspace } from '@/app/workspace/actions'
import { requireAuthenticatedUser } from '@/lib/auth/session'

export default async function WorkspaceSetupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAuthenticatedUser('/workspace/setup')
  const { error } = await searchParams

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f7f7f5] px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-7">
        <p className="app-label">Onboarding privat</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold">Buat workspace usaha</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Kamu otomatis menjadi owner. Data bisnis baru dibuat setelah konfirmasi ini.
        </p>
        {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form action={createWorkspace} className="mt-7 space-y-5">
          <label className="block text-sm font-medium">
            Nama usaha
            <input
              required
              minLength={2}
              maxLength={100}
              name="name"
              className="mt-2 min-h-11 w-full rounded-xl border px-3"
            />
          </label>
          <label className="block text-sm font-medium">
            Slug workspace
            <input
              required
              maxLength={63}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              name="slug"
              className="mt-2 min-h-11 w-full rounded-xl border px-3"
              placeholder="toko-bu-rina"
            />
          </label>
          <button type="submit" className="app-button min-h-11 w-full justify-center">
            Buat workspace
          </button>
        </form>
      </section>
    </main>
  )
}
