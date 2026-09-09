import Link from 'next/link'
import { SlidersHorizontal } from 'lucide-react'
import type { CommunityCategory } from '../_domain/community-types'

export function CommunityCategoryFilter({
  categories,
  selectedId,
}: {
  categories: CommunityCategory[]
  selectedId: number | null
}) {
  return (
    <div className="mt-6">
      <div className="hidden flex-wrap gap-2 sm:flex" aria-label="Filter kategori">
        <CategoryLink label="Semua" active={selectedId === null} />
        {categories.map((category) => (
          <CategoryLink key={category.id} label={category.name} id={category.id} active={selectedId === category.id} />
        ))}
      </div>
      <details className="relative sm:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium">
          <SlidersHorizontal className="size-4" />
          Filter kategori
        </summary>
        <div className="app-card mt-2 grid max-h-72 gap-1 overflow-y-auto p-2">
          <CategoryLink label="Semua" active={selectedId === null} />
          {categories.map((category) => (
            <CategoryLink
              key={category.id}
              label={category.name}
              id={category.id}
              active={selectedId === category.id}
            />
          ))}
        </div>
      </details>
    </div>
  )
}

function CategoryLink({ label, id, active }: { label: string; id?: number; active: boolean }) {
  const href = id ? `/community?category=${id}` : '/community'
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex min-h-10 items-center rounded-full border px-3.5 text-sm font-medium ${active ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'}`}
    >
      {label}
    </Link>
  )
}
