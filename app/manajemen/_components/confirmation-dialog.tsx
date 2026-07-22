import { Modal } from '@/app/_components/modal'

interface ConfirmationDialogProps {
  confirmLabel: string
  description: string
  open: boolean
  title: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmationDialog({ confirmLabel, description, open, title, onCancel, onConfirm }: ConfirmationDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} description={description}>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="min-h-11 rounded-xl border border-zinc-200 px-4 text-sm font-medium hover:bg-zinc-50">Batal</button>
        <button type="button" onClick={onConfirm} className="app-button">{confirmLabel}</button>
      </div>
    </Modal>
  )
}
