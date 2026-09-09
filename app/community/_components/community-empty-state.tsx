import { MessagesSquare } from 'lucide-react'
import Link from 'next/link'

export function CommunityEmptyState({ mine = false }: { mine?: boolean }) {
  return (
    <section className="app-card mt-6 px-6 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-zinc-100">
        <MessagesSquare className="size-6 text-zinc-500" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">
        {mine ? 'Kamu belum membuat post apa pun' : 'Belum ada post di kategori ini'}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {mine
          ? 'Mulai bagikan pengalaman atau cari mitra untuk UMKM-mu.'
          : 'Jadi yang pertama berbagi insight dengan komunitas UMKM.'}
      </p>
      <Link href="/community/create" className="app-button mt-5">
        Buat Post
      </Link>
    </section>
  )
}
