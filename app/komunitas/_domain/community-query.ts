import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { CommunityPostView } from './community-types'

export const COMMUNITY_PAGE_SIZE = 20

const communitySelect = `
  id,workspace_id,created_by,post_kind,publication_status,title,body,
  author_display_name,workspace_display_name,published_at,archived_at,
  archived_by,archive_reason,created_at,updated_at,
  community_post_categories(category_id,business_categories(id,name)),
  collaboration_requests(collaboration_kind,partner_expectation,proposed_contribution,response_instructions,location_scope,closes_at)
`

type Client = SupabaseClient<Database>

function mapPost(row: Record<string, unknown>): CommunityPostView {
  const categoryRows = (row.community_post_categories ?? []) as Array<{
    business_categories: { id: number; name: string } | null
  }>
  const collaborationRows = (row.collaboration_requests ?? []) as CommunityPostView['collaboration'][]
  return {
    ...(row as unknown as Omit<CommunityPostView, 'categories' | 'collaboration'>),
    categories: categoryRows.flatMap((item) => (item.business_categories ? [item.business_categories] : [])),
    collaboration: collaborationRows[0] ?? null,
  }
}

export async function listCommunityCategories(client: Client) {
  const { data, error } = await client.from('business_categories').select('id,name').order('name')
  if (error) throw error
  return data
}

export async function listCommunityFeed(client: Client, categoryId: number | null, limit: number) {
  let matchingPostIds: string[] | null = null
  if (categoryId !== null) {
    const categoryMatch = await client
      .from('community_post_categories')
      .select('community_post_id')
      .eq('category_id', categoryId)
    if (categoryMatch.error) throw categoryMatch.error
    matchingPostIds = [...new Set((categoryMatch.data ?? []).map((row) => row.community_post_id))]
    if (matchingPostIds.length === 0) return { posts: [], hasMore: false }
  }
  let query = client
    .from('community_posts')
    .select(communitySelect)
    .eq('publication_status', 'published')
    .eq('audience', 'authenticated')
    .order('published_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1)

  if (matchingPostIds) query = query.in('id', matchingPostIds)
  const { data, error } = await query
  if (error) throw error
  const rows = (data ?? []).map((row) => mapPost(row as unknown as Record<string, unknown>))
  return { posts: rows.slice(0, limit), hasMore: rows.length > limit }
}

export async function getCommunityPost(client: Client, id: string) {
  const { data, error } = await client.from('community_posts').select(communitySelect).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapPost(data as unknown as Record<string, unknown>) : null
}

export async function listOwnCommunityPosts(client: Client, userId: string, status: string | null, limit: number) {
  let query = client
    .from('community_posts')
    .select(communitySelect)
    .eq('created_by', userId)
    .order('updated_at', { ascending: false })
    .limit(limit + 1)
  if (status === 'draft' || status === 'published' || status === 'archived')
    query = query.eq('publication_status', status)
  const { data, error } = await query
  if (error) throw error
  const rows = (data ?? []).map((row) => mapPost(row as unknown as Record<string, unknown>))
  return { posts: rows.slice(0, limit), hasMore: rows.length > limit }
}

export async function listWorkspaceArchive(client: Client, workspaceId: string, limit: number) {
  const { data, error } = await client
    .from('community_posts')
    .select(communitySelect)
    .eq('workspace_id', workspaceId)
    .eq('publication_status', 'archived')
    .order('archived_at', { ascending: false })
    .limit(limit + 1)
  if (error) throw error
  const rows = (data ?? []).map((row) => mapPost(row as unknown as Record<string, unknown>))
  return { posts: rows.slice(0, limit), hasMore: rows.length > limit }
}
