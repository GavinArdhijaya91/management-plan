'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, Copy } from 'lucide-react'
import { Modal } from '@/app/_components/modal'
import { archiveCommunityPost } from '../../actions'

export function CommunityPostActions({
  postId,
  isAuthor,
  canModerate,
}: {
  postId: string
  isAuthor: boolean
  canModerate: boolean
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const statusRef = useRef<HTMLParagraphElement>(null)
  if (!isAuthor && !canModerate) return null
  const moderation = !isAuthor

  const archive = () =>
    startTransition(async () => {
      const result = await archiveCommunityPost(postId, reason)
      if (!result.ok) {
        setError(result.message)
        return
      }
      setOpen(false)
      router.refresh()
      requestAnimationFrame(() => statusRef.current?.focus())
    })

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2 border-t border-zinc-200 pt-5">
        {isAuthor && (
          <LinkButton href={`/community/create?duplikasi=${postId}`}>
            <Copy className="size-4" />
            Duplikasi sebagai draft
          </LinkButton>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 px-3.5 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          <Archive className="size-4" />
          Arsipkan
        </button>
      </div>
      <p ref={statusRef} tabIndex={-1} role="status" className="sr-only">
        Status post diperbarui.
      </p>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Arsipkan post?"
        description="Post akan hilang dari feed dan tidak dapat dipulihkan."
      >
        <label className="block text-sm font-medium">
          Alasan {moderation ? '(wajib untuk moderator)' : '(opsional)'}
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            rows={4}
            className="app-input mt-2 w-full"
          />
        </label>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="min-h-10 rounded-lg border border-zinc-200 px-4 text-sm font-medium"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={archive}
            disabled={pending || (moderation && !reason.trim())}
            className="app-button bg-red-700 hover:bg-red-600 disabled:opacity-50"
          >
            {pending ? 'Mengarsipkan…' : 'Arsipkan'}
          </button>
        </div>
      </Modal>
    </>
  )
}

function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-zinc-200 px-3.5 text-sm font-medium hover:bg-zinc-50"
    >
      {children}
    </a>
  )
}
