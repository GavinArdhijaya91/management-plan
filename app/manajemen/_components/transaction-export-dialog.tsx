'use client'

import { Modal } from '@/app/_components/modal'
import type { TransactionExportFormat } from '@/app/manajemen/_domain/transaction-export'
import { downloadTransactionExport } from '@/app/manajemen/_lib/download-transaction-export'
import type { DemoTransaction } from '@/types'
import { Download } from 'lucide-react'
import { useState } from 'react'

interface TransactionExportDialogProps {
  open: boolean
  transactions: DemoTransaction[]
  onClose: () => void
  onSuccess: (message: string) => void
}

const formats: Array<{ description: string; label: string; value: TransactionExportFormat }> = [
  { value: 'xlsx', label: 'Excel (.xlsx)', description: 'Untuk pengolahan dan analisis data lanjutan.' },
  { value: 'pdf', label: 'PDF (.pdf)', description: 'Untuk laporan tetap yang mudah dibagikan.' },
  { value: 'docx', label: 'Word (.docx)', description: 'Untuk laporan yang masih perlu disunting.' },
]

export function TransactionExportDialog({ open, transactions, onClose, onSuccess }: TransactionExportDialogProps) {
  const [format, setFormat] = useState<TransactionExportFormat>('xlsx')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportTransactions = async () => {
    setExporting(true)
    setError(null)
    try {
      await downloadTransactionExport(transactions, format)
      onClose()
      onSuccess(`Laporan ${format.toUpperCase()} berhasil dibuat.`)
    } catch {
      setError('Laporan gagal dibuat. Coba ulangi atau pilih format lain.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={exporting ? () => undefined : onClose}
      title="Ekspor laporan transaksi"
      description="File hanya memuat data demo yang sedang tersimpan di perangkat ini."
    >
      <fieldset className="space-y-2">
        <legend className="app-label mb-3">Pilih format file</legend>
        {formats.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50"
          >
            <input
              type="radio"
              name="export-format"
              value={option.value}
              checked={format === option.value}
              onChange={() => setFormat(option.value)}
              className="mt-1 accent-zinc-950"
            />
            <span>
              <strong className="block text-sm">{option.label}</strong>
              <span className="mt-1 block text-xs text-zinc-500">{option.description}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="mt-4 rounded-xl bg-zinc-100 p-3 text-xs text-zinc-600">
        {transactions.length} transaksi · Mata uang IDR · Dibuat saat tombol ekspor ditekan
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={exporting}
          onClick={onClose}
          className="min-h-11 rounded-xl border border-zinc-200 px-4 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          disabled={exporting || transactions.length === 0}
          onClick={exportTransactions}
          className="app-button disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="size-4" />
          {exporting ? 'Membuat file…' : `Unduh ${format.toUpperCase()}`}
        </button>
      </div>
    </Modal>
  )
}
