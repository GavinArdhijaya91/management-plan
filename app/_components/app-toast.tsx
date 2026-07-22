'use client'

import { CheckCircle2, X } from 'lucide-react'

interface AppToastProps {
  message: string | null
  onClose: () => void
}

export function AppToast({ message, onClose }: AppToastProps) {
  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-3 rounded-2xl bg-zinc-950 px-4 py-3 text-sm text-white shadow-xl"
    >
      <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="rounded-lg p-1 hover:bg-white/10"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
