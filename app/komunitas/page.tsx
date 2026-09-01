import Link from 'next/link'
import { Globe2, Plus, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { requireActiveWorkspace } from '@/lib/workspace/context'
import { CommunityCategoryFilter } from './_components/community-category-filter'
import { CommunityEmptyState } from './_components/community-empty-state'
import { CommunityPostCard } from './_components/community-post-card'
import {
  COMMUNITY_MAX_RESULTS,
  COMMUNITY_PAGE_SIZE,
  listCommunityCategories,
  listCommunityFeed,
} from './_domain/community-query'

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; limit?: string }>
}) {
  await requireActiveWorkspace('/komunitas')
  const params = await searchParams
  const categoryId = /^\d+$/.test(params.kategori ?? '') ? Number(params.kategori) : null
  const requestedLimit = Number(params.limit ?? COMMUNITY_PAGE_SIZE)
  const limit = Math.min(
    COMMUNITY_MAX_RESULTS,
    Math.max(COMMUNITY_PAGE_SIZE, Math.ceil(requestedLimit / COMMUNITY_PAGE_SIZE) * COMMUNITY_PAGE_SIZE),
  )
  const supabase = await createClient()
  let data: Awaited<ReturnType<typeof listCommunityFeed>> = { posts: [], hasMore: false }
  let categories: Awaited<ReturnType<typeof listCommunityCategories>> = []
  let loadError = false
  try {
    ;[data, categories] = await Promise.all([
      listCommunityFeed(supabase, categoryId, limit),
      listCommunityCategories(supabase),
    ])
  } catch {
    loadError = true
  }

  const moreParams = new URLSearchParams()
  if (categoryId !== null) moreParams.set('kategori', String(categoryId))
  moreParams.set('limit', String(limit + COMMUNITY_PAGE_SIZE))

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter max-w-5xl">
        <div className="flex flex-col justify-between gap-5 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="app-label mb-2 inline-flex items-center gap-1.5">
              <Globe2 className="size-3.5" />
              Ruang berbagi antar-UMKM
            </p>
            <h1 className="app-heading">Komunitas</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Belajar dari pengalaman UMKM lain dan temukan mitra kolaborasi yang relevan.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/komunitas/post-saya"
              className="inline-flex min-h-10 items-center rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium hover:bg-zinc-50"
            >
              Post Saya
            </Link>
            <Link href="/komunitas/buat" className="app-button">
              <Plus className="size-4" />
              Buat Post
            </Link>
          </div>
        </div>
        <aside className="mt-5 grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 sm:grid-cols-[auto_1fr] sm:items-start">
          <ShieldCheck className="mt-0.5 size-4 text-zinc-600" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-zinc-800">Publik lintas workspace, privat untuk operasi usaha</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Feed hanya menampilkan post yang diterbitkan secara eksplisit. Planning, transaksi, anggota, chat, dan
              audit workspace tidak ikut dipublikasikan.
            </p>
          </div>
        </aside>
        <CommunityCategoryFilter categories={categories} selectedId={categoryId} />
        {loadError ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Feed komunitas gagal dimuat. Coba kembali sebentar lagi.
          </p>
        ) : data.posts.length ? (
          <>
            <div className="mt-6 space-y-4">
              {data.posts.map((post) => (
                <CommunityPostCard key={post.id} post={post} />
              ))}
            </div>
            {data.hasMore && (
              <div className="mt-6 text-center">
                <Link
                  href={`/komunitas?${moreParams}`}
                  scroll={false}
                  className="inline-flex min-h-11 items-center rounded-lg border border-zinc-300 bg-white px-5 text-sm font-medium hover:bg-zinc-50"
                >
                  Muat lainnya
                </Link>
              </div>
            )}
          </>
        ) : (
          <CommunityEmptyState />
        )}
      </div>
    </main>
  )
}
