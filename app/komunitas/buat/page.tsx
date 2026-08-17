import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/header'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { hasWorkspacePermission, requireActiveWorkspace } from '@/lib/workspace/context'
import { getCommunityPost, listCommunityCategories } from '../_domain/community-query'
import { CommunityComposer } from './_components/community-composer'

export default async function CreateCommunityPostPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; duplikasi?: string }>
}) {
  const [user, workspace, params] = await Promise.all([
    requireAuthenticatedUser('/komunitas/buat'),
    requireActiveWorkspace('/komunitas/buat'),
    searchParams,
  ])
  const supabase = await createClient()
  const [categoriesResult, profileResult] = await Promise.all([
    listCommunityCategories(supabase),
    supabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
  ])
  const sourceId = params.id ?? params.duplikasi
  let sourcePost = sourceId ? await getCommunityPost(supabase, sourceId).catch(() => null) : null
  const editingDraft = Boolean(
    params.id && sourcePost?.publication_status === 'draft' && sourcePost.created_by === user.id,
  )
  if (sourcePost && !editingDraft && sourcePost.publication_status === 'draft') sourcePost = null
  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter max-w-6xl">
        <Link href="/komunitas" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-950">
          <ArrowLeft className="size-4" />
          Kembali ke komunitas
        </Link>
        <div className="mt-5 border-b border-zinc-200 pb-6">
          <p className="app-label mb-2">Workspace / {workspace.workspace_name}</p>
          <h1 className="app-heading">
            {editingDraft ? 'Lanjutkan draft' : params.duplikasi ? 'Duplikasi sebagai draft' : 'Buat Post'}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">Bagikan hanya informasi yang memang kamu pilih untuk komunitas.</p>
        </div>
        <div className="mt-6">
          <CommunityComposer
            categories={categoriesResult}
            sourcePost={sourcePost}
            editingDraft={editingDraft}
            officialIdentity={{
              authorName: profileResult.data?.full_name ?? 'Pengguna Siapin',
              workspaceName: workspace.workspace_name,
            }}
            permissions={{
              canCreate: hasWorkspacePermission(workspace, 'community_post.create'),
              canPublish: hasWorkspacePermission(workspace, 'community_post.publish'),
              canModerate: hasWorkspacePermission(workspace, 'community_post.moderate'),
            }}
          />
        </div>
      </div>
    </main>
  )
}
