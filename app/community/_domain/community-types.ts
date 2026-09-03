import type { Database } from '@/lib/supabase/database.types'

export type CommunityPostKind = Database['public']['Enums']['community_post_kind']
export type CommunityPostStatus = Database['public']['Enums']['community_post_publication_status']
export type CollaborationKind = Database['public']['Enums']['collaboration_request_kind']

export interface CommunityCategory {
  id: number
  name: string
}

export interface CollaborationSummary {
  collaboration_kind: CollaborationKind
  partner_expectation: string
  proposed_contribution: string
  response_instructions: string | null
  location_scope: string | null
  closes_at: string | null
}

export interface CommunityPostView {
  id: string
  workspace_id: string
  created_by: string
  post_kind: CommunityPostKind
  publication_status: CommunityPostStatus
  title: string
  body: string
  author_display_name: string
  workspace_display_name: string
  published_at: string | null
  archived_at: string | null
  archived_by: string | null
  archive_reason: string | null
  created_at: string
  updated_at: string
  categories: CommunityCategory[]
  collaboration: CollaborationSummary | null
}

export interface CommunityPermissions {
  canCreate: boolean
  canPublish: boolean
  canModerate: boolean
}
