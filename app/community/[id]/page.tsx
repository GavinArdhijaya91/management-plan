import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarClock, MapPin, ShieldAlert } from 'lucide-react'
import { Header } from '@/components/header'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { hasWorkspacePermission, requireActiveWorkspace } from '@/lib/workspace/context'
import { getCommunityPost } from '../_domain/community-query'
import { CommunityIdentity } from '../_components/community-identity'
import { CommunityPlainText } from '../_components/community-plain-text'
import { CommunityPostKindBadge } from '../_components/community-post-kind-badge'
import { collaborationKindLabels, formatRelativeTime } from '../_domain/community-formatters'
import { CommunityPostActions } from './_components/community-post-actions'

export default async function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [user, workspace] = await Promise.all([
    requireAuthenticatedUser(`/community/${id}`),
    requireActiveWorkspace(`/community/${id}`),
  ])
  const supabase = await createClient()
  let post = null
  try {
    post = await getCommunityPost(supabase, id)
  } catch {
    notFound()
  }
  if (!post) notFound()
  const isAuthor = post.created_by === user.id
  const canModerate =
    post.workspace_id === workspace.workspace_id && hasWorkspacePermission(workspace, 'community_post.moderate')

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter max-w-4xl">
        <Link href="/community" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-950">
          <ArrowLeft className="size-4" />
          Kembali ke komunitas
        </Link>
        <article className="app-card mt-5 p-5 sm:p-8">
          {post.publication_status === 'published' && (
            <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
              Post ini sudah diterbitkan dan tidak dapat diubah.
            </div>
          )}
          {post.publication_status === 'archived' && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Post telah diarsipkan</p>
              <p className="mt-1">{post.archive_reason || 'Tidak ada alasan yang dicantumkan.'}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CommunityPostKindBadge kind={post.post_kind} />
            <time className="text-xs text-zinc-500" dateTime={post.published_at ?? post.created_at}>
              {formatRelativeTime(post.published_at ?? post.created_at)}
            </time>
          </div>
          <div className="mt-5">
            <CommunityIdentity authorName={post.author_display_name} workspaceName={post.workspace_display_name} />
          </div>
          <h1 className="mt-7 text-3xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-4xl">{post.title}</h1>
          <CommunityPlainText className="mt-5 text-[0.95rem] leading-7 text-zinc-700">{post.body}</CommunityPlainText>
          {post.collaboration && (
            <section className="mt-7 rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
              <h2 className="text-lg font-semibold">Detail ajakan kolaborasi</h2>
              <p className="mt-1 text-sm text-emerald-800">
                {collaborationKindLabels[post.collaboration.collaboration_kind]}
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold">Yang kami tawarkan</h3>
                  <CommunityPlainText className="mt-2 text-sm leading-6 text-zinc-600">
                    {post.collaboration.proposed_contribution}
                  </CommunityPlainText>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Mitra yang kami cari</h3>
                  <CommunityPlainText className="mt-2 text-sm leading-6 text-zinc-600">
                    {post.collaboration.partner_expectation}
                  </CommunityPlainText>
                </div>
              </div>
              {post.collaboration.location_scope && (
                <p className="mt-5 inline-flex items-center gap-2 text-sm text-zinc-600">
                  <MapPin className="size-4" />
                  {post.collaboration.location_scope}
                </p>
              )}
              {post.collaboration.closes_at && new Date(post.collaboration.closes_at) < new Date() && (
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-amber-700">
                  <CalendarClock className="size-4" />
                  Sudah lewat batas waktu
                </p>
              )}
              {post.collaboration.response_instructions && (
                <div className="mt-5 border-t border-emerald-100 pt-5">
                  <h3 className="text-sm font-semibold">Cara merespons</h3>
                  <CommunityPlainText className="mt-2 text-sm leading-6 text-zinc-700">
                    {post.collaboration.response_instructions}
                  </CommunityPlainText>
                  <p className="mt-3 flex gap-2 text-xs text-amber-800">
                    <ShieldAlert className="size-4 shrink-0" />
                    Kontak ini berada di luar Siapin. Periksa tujuan dan jangan kirim data sensitif.
                  </p>
                </div>
              )}
            </section>
          )}
          {post.categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.categories.map((category) => (
                <span
                  key={category.id}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
          {post.publication_status === 'published' && (
            <CommunityPostActions postId={post.id} isAuthor={isAuthor} canModerate={canModerate} />
          )}
        </article>
      </div>
    </main>
  )
}
