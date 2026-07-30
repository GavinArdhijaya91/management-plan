'use client'

import { TransactionExportDialog } from '@/app/manajemen/_components/transaction-export-dialog'
import { AppToast } from '@/app/_components/app-toast'
import { Download } from 'lucide-react'
import { useState } from 'react'

export function PrivateTransactionExportButton() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium hover:bg-zinc-50"
      >
        <Download className="size-4" />
        Ekspor
      </button>
      <TransactionExportDialog
        mode="private"
        open={open}
        transactions={[]}
        onClose={() => setOpen(false)}
        onSuccess={setToast}
      />
      <AppToast message={toast} onClose={() => setToast(null)} />
    </>
  )
}
