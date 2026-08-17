'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { hasWorkspacePermission, requireActiveWorkspace } from '@/lib/workspace/context'
import { communityDraftSchema, type CommunityDraftInput } from './_schemas/community-post-schema'

export type CommunityActionResult =
  | { ok: true; id?: string; status?: 'draft' | 'published' | 'archived'; retryAt?: string }
  | {
      ok: false
      code: 'validation' | 'permission' | 'identity' | 'rate_limit' | 'not_found' | 'unknown'
      message: string
      retryAt?: string
    }

function failure(message: string): CommunityActionResult {
  const normalized = message.toLowerCase()
  if (normalized.includes('rate limit'))
    return {
      ok: false,
      code: 'rate_limit',
      message: 'Kamu sudah mencapai batas publikasi untuk saat ini. Coba lagi nanti.',
    }
  if (normalized.includes('identity'))
    return {
      ok: false,
      code: 'identity',
      message: 'Nama publikasi tidak lagi cocok dengan identitas resmi akun dan workspace.',
    }
  if (normalized.includes('permission') || normalized.includes('not found'))
    return { ok: false, code: 'permission', message: 'Kamu tidak memiliki izin untuk melakukan tindakan ini.' }
  return { ok: false, code: 'unknown', message: 'Tindakan belum berhasil. Coba kembali.' }
}

export async function saveCommunityDraft(input: CommunityDraftInput): Promise<CommunityActionResult> {
  const parsed = communityDraftSchema.safeParse(input)
  if (!parsed.success)
    return { ok: false, code: 'validation', message: parsed.error.issues[0]?.message ?? 'Draft belum lengkap.' }

  const [user, workspace] = await Promise.all([
    requireAuthenticatedUser('/komunitas/buat'),
    requireActiveWorkspace('/komunitas/buat'),
  ])
  if (!hasWorkspacePermission(workspace, 'community_post.create')) return failure('permission')
  const supabase = await createClient()
  const value = parsed.data

  let postId = value.id
  if (postId) {
    const { error } = await supabase
      .from('community_posts')
      .update({
        post_kind: value.postKind,
        title: value.title,
        body: value.body,
        author_display_name: value.authorDisplayName,
        workspace_display_name: value.workspaceDisplayName,
      })
      .eq('id', postId)
      .eq('created_by', user.id)
      .eq('publication_status', 'draft')
    if (error) return failure(error.message)
  } else {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        workspace_id: workspace.workspace_id,
        created_by: user.id,
        post_kind: value.postKind,
        title: value.title,
        body: value.body,
        author_display_name: value.authorDisplayName,
        workspace_display_name: value.workspaceDisplayName,
      })
      .select('id')
      .single()
    if (error || !data) return failure(error?.message ?? 'Draft not found')
    postId = data.id
  }

  const { error: deleteCategoryError } = await supabase
    .from('community_post_categories')
    .delete()
    .eq('community_post_id', postId)
  if (deleteCategoryError) return failure(deleteCategoryError.message)
  if (value.categoryIds.length) {
    const { error } = await supabase.from('community_post_categories').insert(
      value.categoryIds.map((categoryId) => ({
        workspace_id: workspace.workspace_id,
        community_post_id: postId!,
        category_id: categoryId,
      })),
    )
    if (error) return failure(error.message)
  }

  if (value.postKind === 'collaboration_request') {
    const { error } = await supabase.from('collaboration_requests').upsert(
      {
        workspace_id: workspace.workspace_id,
        community_post_id: postId,
        created_by: user.id,
        collaboration_kind: value.collaborationKind!,
        partner_expectation: value.partnerExpectation,
        proposed_contribution: value.proposedContribution,
        response_instructions: value.responseInstructions || null,
        location_scope: value.locationScope || null,
        closes_at: value.closesAt ? new Date(value.closesAt).toISOString() : null,
      },
      { onConflict: 'community_post_id' },
    )
    if (error) return failure(error.message)
  } else {
    const { error } = await supabase.from('collaboration_requests').delete().eq('community_post_id', postId)
    if (error) return failure(error.message)
  }

  revalidatePath('/komunitas/post-saya')
  return { ok: true, id: postId, status: 'draft' }
}

export async function publishCommunityPost(postId: string): Promise<CommunityActionResult> {
  const workspace = await requireActiveWorkspace('/komunitas/buat')
  await requireAuthenticatedUser('/komunitas/buat')
  const supabase = await createClient()
  const { error } = await supabase.rpc('publish_community_post', { target_community_post_id: postId })
  if (error) {
    const result = failure(error.message)
    if (!result.ok && result.code === 'rate_limit') {
      const quota = await supabase.rpc('get_own_publish_quota', { target_workspace_id: workspace.workspace_id })
      return { ...result, retryAt: quota.data?.[0]?.window_ends_at }
    }
    if (!result.ok && result.code === 'unknown') {
      const { data } = await supabase
        .from('community_posts')
        .select('publication_status')
        .eq('id', postId)
        .maybeSingle()
      if (data?.publication_status === 'published') return { ok: true, id: postId, status: 'published' }
    }
    return result
  }
  revalidatePath('/komunitas')
  revalidatePath(`/komunitas/${postId}`)
  revalidatePath('/komunitas/post-saya')
  return { ok: true, id: postId, status: 'published' }
}

export async function archiveCommunityPost(postId: string, reason: string): Promise<CommunityActionResult> {
  await requireAuthenticatedUser(`/komunitas/${postId}`)
  await requireActiveWorkspace(`/komunitas/${postId}`)
  const supabase = await createClient()
  const { error } = await supabase.rpc('archive_community_post', { target_community_post_id: postId, reason })
  if (error) return failure(error.message)
  revalidatePath('/komunitas')
  revalidatePath(`/komunitas/${postId}`)
  revalidatePath('/komunitas/post-saya')
  return { ok: true, id: postId, status: 'archived' }
}

export async function deleteCommunityDraft(postId: string): Promise<CommunityActionResult> {
  const user = await requireAuthenticatedUser('/komunitas/post-saya')
  await requireActiveWorkspace('/komunitas/post-saya')
  const supabase = await createClient()
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId)
    .eq('created_by', user.id)
    .eq('publication_status', 'draft')
  if (error) return failure(error.message)
  revalidatePath('/komunitas/post-saya')
  return { ok: true }
}
