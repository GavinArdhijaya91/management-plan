import { z } from 'zod'

export const transactionSchema = z
  .object({
    amount: z
      .string()
      .min(1, 'Jumlah wajib diisi')
      .refine((value) => Number(value) > 0, 'Jumlah harus lebih dari nol'),
    date: z
      .string()
      .min(1, 'Tanggal wajib diisi')
      .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), 'Tanggal tidak valid'),
    modal: z
      .string()
      .min(1, 'Modal wajib diisi')
      .refine((value) => Number(value) >= 0, 'Modal tidak boleh negatif'),
    type: z.enum(['Penjualan', 'Pengeluaran']),
  })
  .superRefine((value, context) => {
    if (value.type === 'Penjualan' && Number(value.modal) > Number(value.amount)) {
      context.addIssue({
        code: 'custom',
        path: ['modal'],
        message: 'Modal penjualan tidak boleh melebihi jumlah penjualan',
      })
    }
  })

export type TransactionFormValues = z.infer<typeof transactionSchema>
