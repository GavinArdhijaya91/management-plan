import { CollaborationChat } from '@/app/kolaborasi/_components/collaboration-chat'
import type {
  ChatAttachment,
  ChatConversation,
  ChatConversationMember,
  ChatDirectoryMember,
  ChatMessage,
  ChatReaction,
} from '@/app/kolaborasi/_lib/chat-types'
import { Header } from '@/components/header'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { requireActiveWorkspace } from '@/lib/workspace/context'

interface CollaborationPageProps {
  searchParams: Promise<{ conversation?: string }>
}

export default async function CollaborationPage({ searchParams }: CollaborationPageProps) {
  const [user, workspace, query] = await Promise.all([
    requireAuthenticatedUser('/kolaborasi'),
    requireActiveWorkspace('/kolaborasi'),
    searchParams,
  ])
  const supabase = await createClient()

  const [conversationResult, directoryResult, unreadResult] = await Promise.all([
    supabase
      .from('chat_conversations')
      .select('*')
      .eq('workspace_id', workspace.workspace_id)
      .is('archived_at', null)
      .order('is_general', { ascending: false })
      .order('updated_at', { ascending: false }),
    supabase.rpc('get_workspace_member_directory', {
      target_workspace_id: workspace.workspace_id,
    }),
    supabase.rpc('get_chat_unread_counts', {
      target_workspace_id: workspace.workspace_id,
    }),
  ])

  const conversations = (conversationResult.data ?? []) as ChatConversation[]
  const selectedConversation =
    conversations.find((conversation) => conversation.id === query.conversation) ??
    conversations.find((conversation) => conversation.is_general) ??
    conversations[0] ??
    null

  const [messageResult, memberResult, reactionResult, attachmentResult] = selectedConversation
    ? await Promise.all([
        supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', selectedConversation.id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('chat_conversation_members').select('*').eq('conversation_id', selectedConversation.id),
        supabase.from('chat_message_reactions').select('*').eq('conversation_id', selectedConversation.id),
        supabase.from('chat_attachments').select('*').eq('conversation_id', selectedConversation.id),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }]

  const messages = ([...(messageResult.data ?? [])] as ChatMessage[]).reverse()

  return (
    <main className="app-shell">
      <Header />
      <CollaborationChat
        key={selectedConversation?.id ?? 'empty'}
        workspaceId={workspace.workspace_id}
        workspaceName={workspace.workspace_name}
        currentUserId={user.id}
        canManage={workspace.permission_codes.includes('chat.manage')}
        canModerate={workspace.permission_codes.includes('chat.moderate')}
        canWrite={workspace.permission_codes.includes('chat.write')}
        conversations={conversations}
        selectedConversation={selectedConversation}
        initialMessages={messages}
        initialConversationMembers={(memberResult.data ?? []) as ChatConversationMember[]}
        initialReactions={(reactionResult.data ?? []) as ChatReaction[]}
        initialAttachments={(attachmentResult.data ?? []) as ChatAttachment[]}
        directory={(directoryResult.data ?? []) as ChatDirectoryMember[]}
        unreadCounts={unreadResult.data ?? []}
      />
    </main>
  )
}
