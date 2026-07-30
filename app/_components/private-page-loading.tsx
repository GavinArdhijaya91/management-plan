import { Header } from '@/components/header'

export function PrivatePageLoading() {
  return (
    <main className="app-shell" aria-busy="true" aria-label="Memuat workspace">
      <Header />
      <div className="page-shell animate-pulse">
        <div className="border-b border-zinc-200 pb-6">
          <div className="h-3 w-40 rounded bg-zinc-200" />
          <div className="mt-3 h-9 w-72 max-w-full rounded-md bg-zinc-200" />
          <div className="mt-3 h-4 w-[28rem] max-w-full rounded bg-zinc-100" />
        </div>
        <div className="mt-6 grid overflow-hidden rounded-xl border border-zinc-200 bg-white sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 border-b border-r border-zinc-200 p-5 last:border-r-0">
              <div className="h-3 w-24 rounded bg-zinc-100" />
              <div className="mt-5 h-7 w-16 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
        <div className="mt-6 h-64 rounded-xl border border-zinc-200 bg-white" />
      </div>
    </main>
  )
}
