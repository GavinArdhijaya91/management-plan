'use client'

import { AppToast } from '@/app/_components/app-toast'
import { Modal } from '@/app/_components/modal'
import type {
  ChatAttachment,
  ChatConversation,
  ChatConversationMember,
  ChatDirectoryMember,
  ChatMessage,
  ChatReaction,
} from '@/app/kolaborasi/_lib/chat-types'
import { createClient } from '@/lib/supabase/client'
import {
  Circle,
  Download,
  FileText,
  Hash,
  Lock,
  MessageCircle,
  Paperclip,
  Pencil,
  Plus,
  Send,
  Smile,
  Trash2,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'

interface CollaborationChatProps {
  canManage: boolean
  canModerate: boolean
  canWrite: boolean
  conversations: ChatConversation[]
  currentUserId: string
  directory: ChatDirectoryMember[]
  initialAttachments: ChatAttachment[]
  initialConversationMembers: ChatConversationMember[]
  initialMessages: ChatMessage[]
  initialReactions: ChatReaction[]
  selectedConversation: ChatConversation | null
  unreadCounts: Array<{ conversation_id: string; unread_count: number }>
  workspaceId: string
  workspaceName: string
}

const allowedAttachmentTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

const attachmentExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
}

function conversationTitle(conversation: ChatConversation, currentUserId: string, directory: ChatDirectoryMember[]) {
  if (conversation.kind === 'channel') return conversation.name ?? 'Channel'
  const counterpartId =
    conversation.direct_participant_low === currentUserId
      ? conversation.direct_participant_high
      : conversation.direct_participant_low
  return directory.find((member) => member.user_id === counterpartId)?.display_name ?? 'Anggota workspace'
}

function displayTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
}

export function CollaborationChat({
  canManage,
  canModerate,
  canWrite,
  conversations,
  currentUserId,
  directory,
  initialAttachments,
  initialConversationMembers,
  initialMessages,
  initialReactions,
  selectedConversation,
  unreadCounts,
  workspaceId,
  workspaceName,
}: CollaborationChatProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState(initialMessages)
  const [members, setMembers] = useState(initialConversationMembers)
  const [reactions, setReactions] = useState(initialReactions)
  const [attachments, setAttachments] = useState(initialAttachments)
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>(
    Object.fromEntries(unreadCounts.map((count) => [count.conversation_id, count.unread_count])),
  )
  const [toast, setToast] = useState<string | null>(null)
  const [channelModalOpen, setChannelModalOpen] = useState(false)
  const [channelName, setChannelName] = useState('')
  const [channelVisibility, setChannelVisibility] = useState<'public' | 'private'>('public')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!selectedConversation) return

    const topic = `chat:${selectedConversation.id}`
    void supabase.realtime.setAuth()
    const channel = supabase.channel(topic, {
      config: {
        private: true,
        broadcast: { self: false, ack: true },
      },
    })
    const workspacePresence = supabase.channel(`workspace:${workspaceId}`, {
      config: {
        private: true,
        presence: { key: currentUserId },
      },
    })

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const incoming = payload.new as ChatMessage
          if (payload.eventType === 'INSERT') {
            setMessages((current) =>
              current.some((message) => message.id === incoming.id) ? current : [...current, incoming],
            )
          } else if (payload.eventType === 'UPDATE') {
            setMessages((current) => current.map((message) => (message.id === incoming.id ? incoming : message)))
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversation_members',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const incoming = payload.new as ChatConversationMember
          if (payload.eventType === 'INSERT') {
            setMembers((current) =>
              current.some((member) => member.user_id === incoming.user_id) ? current : [...current, incoming],
            )
          } else if (payload.eventType === 'UPDATE') {
            setMembers((current) => current.map((member) => (member.user_id === incoming.user_id ? incoming : member)))
          } else {
            const previous = payload.old as Partial<ChatConversationMember>
            setMembers((current) => current.filter((member) => member.user_id !== previous.user_id))
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_message_reactions',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const incoming = payload.new as ChatReaction
          if (payload.eventType === 'INSERT') {
            setReactions((current) =>
              current.some(
                (reaction) =>
                  reaction.message_id === incoming.message_id &&
                  reaction.user_id === incoming.user_id &&
                  reaction.emoji === incoming.emoji,
              )
                ? current
                : [...current, incoming],
            )
          } else if (payload.eventType === 'DELETE') {
            const previous = payload.old as Partial<ChatReaction>
            setReactions((current) =>
              current.filter(
                (reaction) =>
                  reaction.message_id !== previous.message_id ||
                  reaction.user_id !== previous.user_id ||
                  reaction.emoji !== previous.emoji,
              ),
            )
          }
        },
      )
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const userId = typeof payload?.userId === 'string' ? payload.userId : null
        if (!userId || userId === currentUserId) return
        setTypingUsers((current) => [...new Set([...current, userId])])
        window.setTimeout(() => {
          setTypingUsers((current) => current.filter((candidate) => candidate !== userId))
        }, 2500)
      })
      .subscribe()

    workspacePresence
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        ({ new: record }) => {
          const incoming = record as ChatMessage
          if (incoming.sender_id === currentUserId || incoming.conversation_id === selectedConversation.id) return
          setUnreadByConversation((current) => ({
            ...current,
            [incoming.conversation_id]: (current[incoming.conversation_id] ?? 0) + 1,
          }))
        },
      )
      .on('presence', { event: 'sync' }, () => {
        setOnlineUsers(Object.keys(workspacePresence.presenceState()))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await workspacePresence.track({ online_at: new Date().toISOString() })
      })

    return () => {
      void supabase.removeChannel(channel)
      void supabase.removeChannel(workspacePresence)
    }
  }, [currentUserId, router, selectedConversation, supabase, workspaceId])

  useEffect(() => {
    const newest = messages.at(-1)
    if (!selectedConversation || !newest) return
    void supabase.rpc('mark_chat_conversation_read', {
      target_conversation_id: selectedConversation.id,
      delivered_through: newest.created_at,
      read_through: newest.created_at,
    })
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedConversation, supabase])

  const broadcastTyping = () => {
    if (!selectedConversation) return
    const channel = supabase
      .getChannels()
      .find((candidate) => candidate.topic.endsWith(`chat:${selectedConversation.id}`))
    if (!channel) return
    void channel.send({ type: 'broadcast', event: 'typing', payload: { userId: currentUserId } })
  }

  const uploadAttachment = async (messageId: string, selectedFile: File) => {
    if (!allowedAttachmentTypes.has(selectedFile.type) || selectedFile.size > 10 * 1024 * 1024) {
      throw new Error('Lampiran tidak didukung atau melebihi 10 MB.')
    }
    if (!selectedConversation) throw new Error('Percakapan tidak tersedia.')

    const extension = attachmentExtensions[selectedFile.type] ?? 'file'
    const objectPath = `${workspaceId}/${selectedConversation.id}/${currentUserId}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage.from('chat-attachments').upload(objectPath, selectedFile, {
      contentType: selectedFile.type,
      upsert: false,
    })
    if (uploadError) throw new Error('Lampiran gagal diunggah.')

    const { data: attachmentId, error: registrationError } = await supabase.rpc('register_chat_attachment', {
      target_message_id: messageId,
      target_object_path: objectPath,
      target_original_file_name: selectedFile.name.replaceAll('/', '-').replaceAll('\\', '-'),
      target_media_type: selectedFile.type,
      target_byte_size: selectedFile.size,
    })
    if (registrationError) {
      await supabase.storage.from('chat-attachments').remove([objectPath])
      throw new Error('Lampiran gagal dihubungkan ke pesan.')
    }

    const { data: registeredAttachment } = await supabase
      .from('chat_attachments')
      .select('*')
      .eq('id', attachmentId)
      .single()
    if (registeredAttachment) setAttachments((current) => [...current, registeredAttachment])
  }

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedConversation || !body.trim() || sending) return
    setSending(true)
    const requestId = crypto.randomUUID()
    const { data: messageId, error } = await supabase.rpc('send_chat_message', {
      target_conversation_id: selectedConversation.id,
      message_body: body,
      request_id: requestId,
      reply_to_id: replyTo?.id,
      mentioned_user_ids: activeDirectory
        .filter((member) => member.user_id !== currentUserId && body.includes(`@${member.display_name}`))
        .map((member) => member.user_id),
    })
    if (error || !messageId) {
      setToast(
        error?.message === 'Chat message rate limit exceeded'
          ? 'Terlalu banyak pesan. Tunggu sebentar.'
          : 'Pesan gagal dikirim.',
      )
      setSending(false)
      return
    }

    try {
      const { data: persistedMessage } = await supabase.from('chat_messages').select('*').eq('id', messageId).single()
      if (persistedMessage) {
        setMessages((current) =>
          current.some((message) => message.id === persistedMessage.id) ? current : [...current, persistedMessage],
        )
      }
      if (file) await uploadAttachment(messageId, file)
      setBody('')
      setFile(null)
      setReplyTo(null)
    } catch (attachmentError) {
      setToast(attachmentError instanceof Error ? attachmentError.message : 'Lampiran gagal diunggah.')
    } finally {
      setSending(false)
    }
  }

  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase.rpc('delete_chat_message', { target_message_id: messageId })
    setToast(error ? 'Pesan tidak dapat dihapus.' : 'Pesan dihapus dan dicatat sebagai tindakan moderasi.')
  }

  const editMessage = async (message: ChatMessage) => {
    const nextBody = window.prompt('Edit pesan', message.body ?? '')
    if (!nextBody?.trim() || nextBody === message.body) return
    const { error } = await supabase.rpc('edit_chat_message', {
      target_message_id: message.id,
      message_body: nextBody,
    })
    setToast(error ? 'Pesan tidak dapat diedit.' : 'Pesan diperbarui.')
  }

  const toggleReaction = async (messageId: string, emoji = '👍') => {
    const { error } = await supabase.rpc('toggle_chat_message_reaction', {
      target_message_id: messageId,
      reaction_emoji: emoji,
    })
    if (error) setToast('Reaction tidak dapat diperbarui.')
  }

  const startDirect = async (targetUserId: string) => {
    const { data, error } = await supabase.rpc('start_direct_chat', {
      target_workspace_id: workspaceId,
      target_user_id: targetUserId,
    })
    if (error || !data) return setToast('Direct message tidak dapat dimulai.')
    router.push(`/kolaborasi?conversation=${data}`)
    router.refresh()
  }

  const createChannel = async (event: FormEvent) => {
    event.preventDefault()
    const slug = channelName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const { data, error } = await supabase.rpc('create_chat_channel', {
      target_workspace_id: workspaceId,
      channel_name: channelName,
      channel_slug: slug,
      channel_visibility: channelVisibility,
    })
    if (error || !data) return setToast('Channel gagal dibuat. Periksa nama atau permission.')
    setChannelModalOpen(false)
    setChannelName('')
    router.push(`/kolaborasi?conversation=${data}`)
    router.refresh()
  }

  const setMember = async (userId: string, shouldJoin: boolean) => {
    if (!selectedConversation) return
    const { error } = await supabase.rpc('set_chat_conversation_membership', {
      target_conversation_id: selectedConversation.id,
      target_user_id: userId,
      should_join: shouldJoin,
    })
    if (error) setToast('Keanggotaan channel gagal diperbarui.')
  }

  const downloadAttachment = async (attachment: ChatAttachment) => {
    const { data, error } = await supabase.storage.from('chat-attachments').createSignedUrl(attachment.object_path, 60)
    if (error || !data) return setToast('Lampiran tidak dapat dibuka.')
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  const channels = conversations.filter((conversation) => conversation.kind === 'channel')
  const directMessages = conversations.filter((conversation) => conversation.kind === 'direct')
  const activeDirectory = directory.filter((member) => member.membership_status === 'active')

  return (
    <div className="motion-page-enter mx-auto grid h-[calc(100dvh-4rem)] max-w-[1600px] lg:grid-cols-[18rem_minmax(0,1fr)_17rem]">
      <aside className="hidden overflow-y-auto border-r border-zinc-200 bg-zinc-50/70 p-4 md:block">
        <p className="app-label">Kolaborasi internal</p>
        <h1 className="mt-1 truncate font-serif text-xl font-semibold">{workspaceName}</h1>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Channel</span>
          {canManage && (
            <button
              onClick={() => setChannelModalOpen(true)}
              className="rounded-lg p-2 hover:bg-zinc-200"
              aria-label="Buat channel"
            >
              <Plus className="size-4" />
            </button>
          )}
        </div>
        <nav className="mt-2 space-y-1">
          {channels.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/kolaborasi?conversation=${conversation.id}`}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                selectedConversation?.id === conversation.id ? 'bg-zinc-950 text-white' : 'hover:bg-zinc-200'
              }`}
            >
              {conversation.channel_visibility === 'private' ? (
                <Lock className="size-4" />
              ) : (
                <Hash className="size-4" />
              )}
              <span className="truncate">{conversation.name}</span>
              {selectedConversation?.id !== conversation.id && (unreadByConversation[conversation.id] ?? 0) > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                  {unreadByConversation[conversation.id]}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">Direct message</p>
        <nav className="mt-2 space-y-1">
          {directMessages.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/kolaborasi?conversation=${conversation.id}`}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                selectedConversation?.id === conversation.id ? 'bg-zinc-950 text-white' : 'hover:bg-zinc-200'
              }`}
            >
              <MessageCircle className="size-4" />
              <span className="truncate">{conversationTitle(conversation, currentUserId, directory)}</span>
              {selectedConversation?.id !== conversation.id && (unreadByConversation[conversation.id] ?? 0) > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                  {unreadByConversation[conversation.id]}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">Anggota workspace</p>
        <div className="mt-2 space-y-1">
          {activeDirectory
            .filter((member) => member.user_id !== currentUserId)
            .map((member) => (
              <button
                key={member.user_id}
                onClick={() => startDirect(member.user_id)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-zinc-200"
              >
                <Circle
                  className={`size-2 fill-current ${onlineUsers.includes(member.user_id) ? 'text-emerald-500' : 'text-zinc-300'}`}
                />
                <span className="truncate">{member.display_name}</span>
              </button>
            ))}
        </div>
      </aside>

      <section className="flex min-w-0 flex-col bg-white">
        {selectedConversation ? (
          <>
            <header className="flex min-h-16 items-center border-b border-zinc-200 px-4">
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-lg font-semibold">
                  {conversationTitle(selectedConversation, currentUserId, directory)}
                </h2>
                <p className="text-xs text-zinc-500">
                  {selectedConversation.kind === 'direct'
                    ? 'Direct message privat dalam workspace'
                    : (selectedConversation.description ?? 'Channel workspace')}
                </p>
              </div>
              <select
                aria-label="Pilih percakapan"
                value={selectedConversation.id}
                onChange={(event) => router.push(`/kolaborasi?conversation=${event.target.value}`)}
                className="ml-3 max-w-40 rounded-xl border border-zinc-200 px-2 py-2 text-xs md:hidden"
              >
                {conversations.map((conversation) => (
                  <option key={conversation.id} value={conversation.id}>
                    {conversation.kind === 'channel' ? '# ' : ''}
                    {conversationTitle(conversation, currentUserId, directory)}
                  </option>
                ))}
              </select>
            </header>
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              <div className="mx-auto max-w-4xl space-y-5">
                {messages.length === 0 && (
                  <div className="py-16 text-center">
                    <MessageCircle className="mx-auto size-9 text-zinc-300" />
                    <h3 className="mt-3 font-serif text-xl font-semibold">Mulai percakapan</h3>
                    <p className="mt-1 text-sm text-zinc-500">Pesan hanya dapat dibaca anggota yang memiliki akses.</p>
                  </div>
                )}
                {messages.map((message) => {
                  const sender = directory.find((member) => member.user_id === message.sender_id)
                  const own = message.sender_id === currentUserId
                  const messageReactions = reactions.filter((reaction) => reaction.message_id === message.id)
                  const messageAttachments = attachments.filter((attachment) => attachment.message_id === message.id)
                  const repliedMessage = messages.find((candidate) => candidate.id === message.reply_to_message_id)
                  const readCount = members.filter(
                    (member) =>
                      member.user_id !== message.sender_id &&
                      member.last_read_at &&
                      member.last_read_at >= message.created_at,
                  ).length
                  const deliveredCount = members.filter(
                    (member) =>
                      member.user_id !== message.sender_id &&
                      member.last_delivered_at &&
                      member.last_delivered_at >= message.created_at,
                  ).length
                  return (
                    <article key={message.id} className="group flex gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-xs font-semibold text-white">
                        {(sender?.display_name ?? '?').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <strong className="text-sm">{sender?.display_name ?? 'Anggota workspace'}</strong>
                          <span className="text-xs text-zinc-400">{displayTime(message.created_at)}</span>
                          {message.edited_at && <span className="text-xs text-zinc-400">diedit</span>}
                        </div>
                        {message.deleted_at ? (
                          <p className="mt-1 text-sm italic text-zinc-400">Pesan telah dihapus.</p>
                        ) : (
                          <>
                            {repliedMessage && (
                              <p className="mt-1 truncate border-l-2 border-zinc-300 pl-2 text-xs text-zinc-400">
                                {repliedMessage.deleted_at ? 'Pesan telah dihapus' : repliedMessage.body}
                              </p>
                            )}
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700">
                              {message.body}
                            </p>
                            {messageAttachments.map((attachment) => (
                              <button
                                key={attachment.id}
                                onClick={() => downloadAttachment(attachment)}
                                className="mt-2 flex max-w-sm items-center gap-3 rounded-xl border border-zinc-200 p-3 text-left hover:bg-zinc-50"
                              >
                                <FileText className="size-5 shrink-0" />
                                <span className="min-w-0 flex-1">
                                  <strong className="block truncate text-xs">{attachment.original_file_name}</strong>
                                  <span className="text-xs text-zinc-400">
                                    {Math.ceil(attachment.byte_size / 1024)} KB
                                  </span>
                                </span>
                                <Download className="size-4" />
                              </button>
                            ))}
                            <div className="mt-2 flex flex-wrap items-center gap-1">
                              {messageReactions.map((reaction) => (
                                <button
                                  key={`${reaction.user_id}-${reaction.emoji}`}
                                  onClick={() => toggleReaction(message.id, reaction.emoji)}
                                  className="rounded-full bg-zinc-100 px-2 py-1 text-xs"
                                >
                                  {reaction.emoji}
                                </button>
                              ))}
                              {canWrite && (
                                <button
                                  onClick={() => setReplyTo(message)}
                                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100"
                                  aria-label="Balas pesan"
                                >
                                  <MessageCircle className="size-4" />
                                </button>
                              )}
                              {canWrite && (
                                <button
                                  onClick={() => toggleReaction(message.id)}
                                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100"
                                >
                                  <Smile className="size-4" />
                                </button>
                              )}
                              {own && (
                                <button
                                  onClick={() => editMessage(message)}
                                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100"
                                >
                                  <Pencil className="size-4" />
                                </button>
                              )}
                              {(own || canModerate) && (
                                <button
                                  onClick={() => deleteMessage(message.id)}
                                  className="rounded-lg p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              )}
                              {own && (
                                <span className="ml-auto text-[11px] text-zinc-400">
                                  {readCount > 0
                                    ? `Dibaca ${readCount}`
                                    : deliveredCount > 0
                                      ? `Tersampaikan ${deliveredCount}`
                                      : 'Terkirim'}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </article>
                  )
                })}
                <div ref={bottomRef} />
              </div>
            </div>
            <footer className="border-t border-zinc-200 p-4">
              <div className="mx-auto max-w-4xl">
                <p className="mb-2 min-h-4 text-xs text-zinc-400">
                  {typingUsers.length
                    ? `${typingUsers
                        .map((userId) => directory.find((member) => member.user_id === userId)?.display_name)
                        .filter(Boolean)
                        .join(', ')} sedang mengetik…`
                    : ''}
                </p>
                <form
                  onSubmit={sendMessage}
                  className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-2"
                >
                  <label className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl hover:bg-zinc-200">
                    <Paperclip className="size-5" />
                    <input
                      type="file"
                      className="sr-only"
                      disabled={!canWrite}
                      onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    />
                  </label>
                  <div className="min-w-0 flex-1">
                    {replyTo && (
                      <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="block max-w-full truncate px-2 pb-1 text-left text-xs text-zinc-500"
                      >
                        Membalas: {replyTo.body}
                      </button>
                    )}
                    {file && <p className="truncate px-2 pb-1 text-xs text-zinc-500">{file.name}</p>}
                    <textarea
                      value={body}
                      maxLength={4000}
                      rows={1}
                      disabled={!canWrite || sending}
                      onChange={(event) => {
                        setBody(event.target.value)
                        broadcastTyping()
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          event.currentTarget.form?.requestSubmit()
                        }
                      }}
                      placeholder={canWrite ? 'Tulis pesan…' : 'Role Anda tidak memiliki izin mengirim pesan.'}
                      className="max-h-36 min-h-10 w-full resize-none bg-transparent px-2 py-2 text-sm outline-none"
                    />
                  </div>
                  <button
                    disabled={!canWrite || !body.trim() || sending}
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white disabled:opacity-40"
                  >
                    <Send className="size-4" />
                  </button>
                </form>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div>
              <Users className="mx-auto size-10 text-zinc-300" />
              <h2 className="mt-3 font-serif text-2xl font-semibold">Belum ada percakapan</h2>
            </div>
          </div>
        )}
      </section>

      <aside className="hidden overflow-y-auto border-l border-zinc-200 bg-zinc-50/70 p-4 lg:block">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Anggota percakapan</p>
        <div className="mt-3 space-y-2">
          {activeDirectory.map((member) => {
            const joined =
              selectedConversation?.kind === 'direct'
                ? member.user_id === selectedConversation.direct_participant_low ||
                  member.user_id === selectedConversation.direct_participant_high
                : selectedConversation?.channel_visibility === 'public' ||
                  members.some((conversationMember) => conversationMember.user_id === member.user_id)
            if (!joined && !(canManage && selectedConversation?.channel_visibility === 'private')) return null
            return (
              <div key={member.user_id} className="flex items-center gap-2 rounded-xl bg-white p-3">
                <Circle
                  className={`size-2 fill-current ${onlineUsers.includes(member.user_id) ? 'text-emerald-500' : 'text-zinc-300'}`}
                />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-xs">{member.display_name}</strong>
                  <span className="block truncate text-[11px] text-zinc-400">{member.role_name}</span>
                </span>
                {canManage &&
                  selectedConversation?.channel_visibility === 'private' &&
                  member.user_id !== currentUserId && (
                    <button
                      onClick={() => setMember(member.user_id, !joined)}
                      className="text-[11px] font-semibold text-zinc-500"
                    >
                      {joined ? 'Hapus' : 'Tambah'}
                    </button>
                  )}
              </div>
            )
          })}
        </div>
      </aside>

      <Modal
        open={channelModalOpen}
        onClose={() => setChannelModalOpen(false)}
        title="Buat channel workspace"
        description="Channel publik dapat dibaca seluruh anggota aktif. Channel privat hanya untuk anggota pilihan."
      >
        <form onSubmit={createChannel} className="space-y-4">
          <label className="block text-sm font-medium">
            Nama channel
            <input
              required
              minLength={2}
              maxLength={80}
              value={channelName}
              onChange={(event) => setChannelName(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-xl border border-zinc-200 px-3"
            />
          </label>
          <label className="block text-sm font-medium">
            Visibilitas
            <select
              value={channelVisibility}
              onChange={(event) => setChannelVisibility(event.target.value as 'public' | 'private')}
              className="mt-2 min-h-11 w-full rounded-xl border border-zinc-200 px-3"
            >
              <option value="public">Publik dalam workspace</option>
              <option value="private">Privat untuk anggota pilihan</option>
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setChannelModalOpen(false)}
              className="min-h-11 rounded-xl border px-4 text-sm"
            >
              Batal
            </button>
            <button className="app-button">Buat channel</button>
          </div>
        </form>
      </Modal>
      <AppToast message={toast} onClose={() => setToast(null)} />
    </div>
  )
}
