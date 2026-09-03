import { z } from 'zod'

const databaseUuid = z.string().uuid('ID agenda tidak valid.')
const optionalText = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() ? value.trim() : null),
  z.string().max(1000, 'Catatan maksimal 1000 karakter.').nullable(),
)
const optionalDateTime = z.preprocess(
  (value) => (typeof value === 'string' && value ? value : null),
  z.iso.datetime({ offset: true }).nullable(),
)

export const calendarEventInputSchema = z
  .object({
    title: z.string().trim().min(2, 'Judul minimal 2 karakter.').max(160, 'Judul maksimal 160 karakter.'),
    type: z.enum(['supplier', 'payroll', 'stock', 'other']),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: optionalDateTime,
    notes: optionalText,
  })
  .refine((input) => !input.endsAt || input.endsAt >= input.startsAt, {
    path: ['endsAt'],
    message: 'Waktu selesai tidak boleh mendahului waktu mulai.',
  })

export const calendarEventUpdateSchema = calendarEventInputSchema.safeExtend({ id: databaseUuid })
export const calendarEventIdSchema = z.object({ id: databaseUuid })

export type CalendarEventInput = z.input<typeof calendarEventInputSchema>
