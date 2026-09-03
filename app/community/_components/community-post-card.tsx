import Link from 'next/link'
import { CalendarClock, MapPin } from 'lucide-react'
import type { CommunityPostView } from '../_domain/community-types'
import { collaborationKindLabels, formatRelativeTime } from '../_domain/community-formatters'
import { CommunityIdentity } from './community-identity'
import { CommunityPostKindBadge } from './community-post-kind-badge'

export function CommunityPostCard({ post, management = false }: { post: CommunityPostView; management?: boolean }) {
  const timestamp = post.published_at ?? post.updated_at
  return (
    <article className="app-card overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/community/${post.id}`} className="block p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CommunityPostKindBadge kind={post.post_kind} />
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            {management && (
              <span className="rounded-full bg-zinc-100 px-2 py-1 font-medium capitalize">
                {post.publication_status}
              </span>
            )}
            <time dateTime={timestamp}>{formatRelativeTime(timestamp)}</time>
          </div>
        </div>
        <div className="mt-4">
          <CommunityIdentity authorName={post.author_display_name} workspaceName={post.workspace_display_name} />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-zinc-950">{post.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">{post.body}</p>

        {post.collaboration && (
          <div className="mt-4 grid gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-emerald-900">Yang kami tawarkan</p>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{post.collaboration.proposed_contribution}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-900">Mitra yang kami cari</p>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{post.collaboration.partner_expectation}</p>
            </div>
            <div className="col-span-full flex flex-wrap gap-3 text-xs text-zinc-500">
              <span>{collaborationKindLabels[post.collaboration.collaboration_kind]}</span>
              {post.collaboration.location_scope && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" />
                  {post.collaboration.location_scope}
                </span>
              )}
              {post.collaboration.closes_at && new Date(post.collaboration.closes_at) < new Date() && (
                <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                  <CalendarClock className="size-3" />
                  Sudah lewat batas waktu
                </span>
              )}
            </div>
          </div>
        )}
        {post.categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
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
      </Link>
    </article>
  )
}
