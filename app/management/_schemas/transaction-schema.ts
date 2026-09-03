import { z } from 'zod'

export const transactionSchema = z
  .object({
    amount: z
      .string()
      .min(1, 'Jumlah wajib diisi')
      .refine((value) => Number(value) > 0, 'Jumlah harus lebih dari nol'),
    transactionDate: z
      .string()
      .min(1, 'Tanggal wajib diisi')
      .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), 'Tanggal tidak valid'),
    costAmount: z
      .string()
      .min(1, 'Biaya pokok wajib diisi')
      .refine((value) => Number(value) >= 0, 'Biaya pokok tidak boleh negatif'),
    transactionType: z.enum(['sale', 'expense']),
  })
  .superRefine((value, context) => {
    if (value.transactionType === 'sale' && Number(value.costAmount) > Number(value.amount)) {
      context.addIssue({
        code: 'custom',
        path: ['costAmount'],
        message: 'Biaya pokok tidak boleh melebihi jumlah penjualan',
      })
    }
  })

export type TransactionFormValues = z.infer<typeof transactionSchema>
