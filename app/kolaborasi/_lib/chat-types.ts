import type { Tables } from '@/lib/supabase/database.types'

export type ChatConversation = Tables<'chat_conversations'>
export type ChatConversationMember = Tables<'chat_conversation_members'>
export type ChatMessage = Tables<'chat_messages'>
export type ChatReaction = Tables<'chat_message_reactions'>
export type ChatAttachment = Tables<'chat_attachments'>

export interface ChatDirectoryMember {
  avatar_path: string | null
  display_name: string
  membership_status: 'active' | 'suspended'
  role_name: string
  user_id: string
}
