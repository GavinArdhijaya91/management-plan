import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Header } from '@/components/header'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { hasWorkspacePermission, requireActiveWorkspace } from '@/lib/workspace/context'
import { CommunityEmptyState } from '../_components/community-empty-state'
import { CommunityPostCard } from '../_components/community-post-card'
import {
  COMMUNITY_MAX_RESULTS,
  COMMUNITY_PAGE_SIZE,
  listOwnCommunityPosts,
  listWorkspaceArchive,
} from '../_domain/community-query'

const statuses = [
  ['all', 'Semua'],
  ['draft', 'Draft'],
  ['published', 'Published'],
  ['archived', 'Archived'],
] as const

export default async function MyCommunityPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; view?: string; limit?: string }>
}) {
  const [user, workspace, params] = await Promise.all([
    requireAuthenticatedUser('/community/my-posts'),
    requireActiveWorkspace('/community/my-posts'),
    searchParams,
  ])
  const canModerate = hasWorkspacePermission(workspace, 'community_post.moderate')
  const workspaceArchive = params.view === 'workspace-archive' && canModerate
  const status = statuses.some(([value]) => value === params.status) ? (params.status ?? 'all') : 'all'
  const limit = Math.min(
    COMMUNITY_MAX_RESULTS,
    Math.max(COMMUNITY_PAGE_SIZE, Number(params.limit) || COMMUNITY_PAGE_SIZE),
  )
  const supabase = await createClient()
  let result = { posts: [] as Awaited<ReturnType<typeof listOwnCommunityPosts>>['posts'], hasMore: false }
  let error = false
  try {
    result = workspaceArchive
      ? await listWorkspaceArchive(supabase, workspace.workspace_id, limit)
      : await listOwnCommunityPosts(supabase, user.id, status, limit)
  } catch {
    error = true
  }
  const next = new URLSearchParams()
  if (workspaceArchive) next.set('view', 'workspace-archive')
  else next.set('status', status)
  next.set('limit', String(limit + COMMUNITY_PAGE_SIZE))

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter max-w-5xl">
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="app-label mb-2">Komunitas / {workspace.workspace_name}</p>
            <h1 className="app-heading">{workspaceArchive ? 'Arsip Komunitas Workspace' : 'Post Saya'}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {workspaceArchive
                ? 'Post workspace yang telah diarsipkan. Akses ini hanya untuk moderator.'
                : 'Kelola draft dan lihat riwayat post komunitas milikmu.'}
            </p>
          </div>
          <Link href="/community/create" className="app-button">
            <Plus className="size-4" />
            Buat Post
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Tampilan post">
          {!workspaceArchive &&
            statuses.map(([value, label]) => (
              <Link
                key={value}
                href={`/community/my-posts?status=${value}`}
                aria-current={status === value ? 'page' : undefined}
                className={`inline-flex min-h-10 items-center rounded-full border px-3.5 text-sm font-medium ${status === value ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-600'}`}
              >
                {label}
              </Link>
            ))}
          {canModerate && (
            <Link
              href="/community/my-posts?view=workspace-archive"
              aria-current={workspaceArchive ? 'page' : undefined}
              className={`inline-flex min-h-10 items-center rounded-full border px-3.5 text-sm font-medium ${workspaceArchive ? 'border-amber-700 bg-amber-700 text-white' : 'border-amber-200 bg-amber-50 text-amber-800'}`}
            >
              Arsip Workspace
            </Link>
          )}
        </div>
        {error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Post komunitas gagal dimuat.
          </p>
        ) : result.posts.length ? (
          <>
            <div className="mt-6 space-y-4">
              {result.posts.map((post) => (
                <div key={post.id}>
                  {post.publication_status === 'draft' ? (
                    <Link
                      href={`/community/create?id=${post.id}`}
                      className="mb-2 inline-block text-xs font-semibold text-blue-700 hover:underline"
                    >
                      Lanjutkan draft
                    </Link>
                  ) : null}
                  <CommunityPostCard post={post} management />
                </div>
              ))}
            </div>
            {result.hasMore && (
              <div className="mt-6 text-center">
                <Link
                  href={`/community/my-posts?${next}`}
                  className="inline-flex min-h-11 items-center rounded-lg border border-zinc-300 bg-white px-5 text-sm font-medium"
                >
                  Muat lainnya
                </Link>
              </div>
            )}
          </>
        ) : (
          <CommunityEmptyState mine={!workspaceArchive} />
        )}
      </div>
    </main>
  )
}
