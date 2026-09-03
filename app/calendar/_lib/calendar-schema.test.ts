import { describe, expect, it } from 'vitest'
import { calendarEventInputSchema, calendarEventUpdateSchema } from './calendar-schema'

const validEvent = {
  title: 'Bayar supplier utama',
  type: 'supplier',
  startsAt: '2026-08-24T02:00:00.000Z',
  endsAt: '2026-08-24T03:00:00.000Z',
  notes: 'Periksa invoice sebelum pembayaran.',
}

describe('calendar event schema', () => {
  it('accepts a complete event and trims optional notes', () => {
    expect(calendarEventInputSchema.parse({ ...validEvent, notes: '  Catatan agenda  ' })).toMatchObject({
      title: validEvent.title,
      notes: 'Catatan agenda',
    })
  })

  it('rejects an end time before the start time', () => {
    const result = calendarEventInputSchema.safeParse({
      ...validEvent,
      endsAt: '2026-08-24T01:00:00.000Z',
    })
    expect(result.success).toBe(false)
  })

  it('requires a valid database id for updates', () => {
    expect(calendarEventUpdateSchema.safeParse({ ...validEvent, id: 'not-an-id' }).success).toBe(false)
  })
})
