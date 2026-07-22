import { CheckCircle2, X } from 'lucide-react'

interface TransactionToastProps {
  message: string | null
  onClose: () => void
}

export function TransactionToast({ message, onClose }: TransactionToastProps) {
  if (!message) return null

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-[80] flex max-w-sm items-center gap-3 rounded-2xl bg-zinc-950 px-4 py-3 text-sm text-white shadow-2xl"
    >
      <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
