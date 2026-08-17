import { Header } from '@/components/header'

export default function CommunityLoading() {
  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell max-w-5xl">
        <div className="h-24 animate-pulse rounded-xl bg-zinc-100" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="app-card h-64 animate-pulse bg-zinc-50" />
          ))}
        </div>
      </div>
    </main>
  )
}
