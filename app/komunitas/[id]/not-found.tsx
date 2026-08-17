import Link from 'next/link'
export default function CommunityPostNotFound() {
  return (
    <main className="app-shell">
      <div className="page-shell flex min-h-[70vh] max-w-xl items-center justify-center text-center">
        <div>
          <h1 className="app-heading">Post tidak tersedia</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">Post tidak ditemukan atau sudah tidak tersedia.</p>
          <Link href="/komunitas" className="app-button mt-6">
            Kembali ke komunitas
          </Link>
        </div>
      </div>
    </main>
  )
}
