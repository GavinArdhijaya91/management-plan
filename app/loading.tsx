export default function Loading() {
  return (
    <main className="min-h-dvh bg-background" aria-busy="true" aria-label="Memuat halaman">
      <div className="page-shell animate-pulse">
        <div className="mb-8 h-8 w-48 rounded-lg bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 rounded-lg border border-border bg-white" />
          ))}
        </div>
      </div>
    </main>
  )
}
