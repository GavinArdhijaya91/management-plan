import { z } from 'zod'

export const transactionExportRequestSchema = z
  .object({
    format: z.enum(['xlsx', 'pdf', 'docx']),
    periodStart: z.iso.date().nullable().optional(),
    periodEnd: z.iso.date().nullable().optional(),
  })
  .refine(
    ({ periodStart, periodEnd }) => !periodStart || !periodEnd || periodStart <= periodEnd,
    'Tanggal awal tidak boleh melewati tanggal akhir.',
  )

export const transactionExportResponseSchema = z.object({
  data: z.object({
    rows: z.array(
      z.object({
        accountName: z.string().min(1).max(100),
        amount: z.number().finite().nonnegative(),
        costAmount: z.number().finite().nonnegative(),
        currencyCode: z.string().regex(/^[A-Z]{3}$/),
        date: z.iso.date(),
        netResult: z.number().finite(),
        note: z.string().max(500),
        result: z.enum(['Laba', 'Rugi']),
        type: z.enum(['Penjualan', 'Pengeluaran']),
      }),
    ),
    workspaceName: z.string().min(2).max(120),
  }),
})
