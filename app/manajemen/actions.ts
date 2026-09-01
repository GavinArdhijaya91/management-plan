'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireActiveWorkspace } from '@/lib/workspace/context'

const createTransactionSchema = z
  .object({
    amount: z.coerce.number().positive('Jumlah harus lebih dari nol.'),
    costAmount: z.coerce.number().min(0, 'Biaya pokok tidak boleh negatif.'),
    transactionDate: z.iso.date('Tanggal transaksi tidak valid.'),
    transactionType: z.enum(['sale', 'expense']),
    note: z.string().trim().max(500, 'Catatan maksimal 500 karakter.').optional(),
    idempotencyKey: z.uuid('Kunci permintaan transaksi tidak valid.'),
  })
  .superRefine((value, context) => {
    if (value.transactionType === 'sale' && value.costAmount > value.amount) {
      context.addIssue({
        code: 'custom',
        path: ['costAmount'],
        message: 'Biaya pokok tidak boleh melebihi jumlah penjualan.',
      })
    }
  })

export async function createPrivateTransactionAction(formData: FormData) {
  const parsed = createTransactionSchema.safeParse({
    amount: formData.get('amount'),
    costAmount: formData.get('costAmount'),
    transactionDate: formData.get('transactionDate'),
    transactionType: formData.get('transactionType'),
    note: formData.get('note')?.toString() || undefined,
    idempotencyKey: formData.get('idempotencyKey'),
  })

  if (!parsed.success) {
    redirect(`/manajemen?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Data transaksi tidak valid.')}`)
  }

  const workspace = await requireActiveWorkspace('/manajemen')
  const supabase = await createClient()
  const { error } = await supabase.rpc('create_transaction', {
    target_workspace_id: workspace.workspace_id,
    transaction_type: parsed.data.transactionType,
    transaction_amount: parsed.data.amount,
    transaction_date: parsed.data.transactionDate,
    request_idempotency_key: parsed.data.idempotencyKey,
    transaction_cost_amount: parsed.data.transactionType === 'expense' ? 0 : parsed.data.costAmount,
    transaction_note: parsed.data.note,
    target_financial_account_id: undefined,
  })

  if (error) {
    console.error('[transaction.create.failed]', { code: error.code, message: error.message })
    redirect(`/manajemen?error=${encodeURIComponent('Transaksi gagal disimpan. Periksa akses atau coba kembali.')}`)
  }

  revalidatePath('/manajemen')
  revalidatePath('/planning/metrics')
  revalidatePath('/dashboard')
  redirect(`/manajemen?success=${encodeURIComponent('Transaksi berhasil ditambahkan.')}`)
}
