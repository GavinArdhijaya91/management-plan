'use server'

import { revalidatePath } from 'next/cache'
import { calendarEventIdSchema, calendarEventInputSchema, calendarEventUpdateSchema } from './_lib/calendar-schema'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { hasWorkspacePermission, requireActiveWorkspace } from '@/lib/workspace/context'

export interface CalendarMutationResult {
  ok: boolean
  message: string
}

function failed(message: string): CalendarMutationResult {
  return { ok: false, message }
}

async function mutationContext(permission: 'calendar.write' | 'calendar.delete') {
  const [user, workspace] = await Promise.all([
    requireAuthenticatedUser('/calendar'),
    requireActiveWorkspace('/calendar'),
  ])
  if (!hasWorkspacePermission(workspace, permission)) return null
  return { user, workspace, supabase: await createClient() }
}

export async function createCalendarEventAction(input: unknown): Promise<CalendarMutationResult> {
  const parsed = calendarEventInputSchema.safeParse(input)
  if (!parsed.success) return failed(parsed.error.issues[0]?.message ?? 'Data agenda tidak valid.')
  const context = await mutationContext('calendar.write')
  if (!context) return failed('Role Anda tidak memiliki permission untuk membuat agenda.')

  const { error } = await context.supabase.from('calendar_events').insert({
    workspace_id: context.workspace.workspace_id,
    created_by: context.user.id,
    title: parsed.data.title,
    type: parsed.data.type,
    starts_at: parsed.data.startsAt,
    ends_at: parsed.data.endsAt,
    notes: parsed.data.notes,
  })
  if (error) {
    console.error('[calendar.create.failed]', { code: error.code, message: error.message })
    return failed('Agenda gagal dibuat. Periksa data lalu coba kembali.')
  }

  revalidatePath('/calendar')
  return { ok: true, message: 'Agenda berhasil ditambahkan.' }
}

export async function updateCalendarEventAction(input: unknown): Promise<CalendarMutationResult> {
  const parsed = calendarEventUpdateSchema.safeParse(input)
  if (!parsed.success) return failed(parsed.error.issues[0]?.message ?? 'Data agenda tidak valid.')
  const context = await mutationContext('calendar.write')
  if (!context) return failed('Role Anda tidak memiliki permission untuk mengubah agenda.')

  const { data, error } = await context.supabase
    .from('calendar_events')
    .update({
      title: parsed.data.title,
      type: parsed.data.type,
      starts_at: parsed.data.startsAt,
      ends_at: parsed.data.endsAt,
      notes: parsed.data.notes,
    })
    .eq('workspace_id', context.workspace.workspace_id)
    .eq('id', parsed.data.id)
    .select('id')
    .maybeSingle()
  if (error || !data) return failed('Agenda tidak ditemukan atau tidak dapat diubah.')

  revalidatePath('/calendar')
  return { ok: true, message: 'Agenda berhasil diperbarui.' }
}

export async function toggleCalendarEventAction(input: unknown): Promise<CalendarMutationResult> {
  const parsed = calendarEventIdSchema.safeParse(input)
  if (!parsed.success) return failed(parsed.error.issues[0]?.message ?? 'Agenda tidak valid.')
  const context = await mutationContext('calendar.write')
  if (!context) return failed('Role Anda tidak memiliki permission untuk mengubah status agenda.')

  const current = await context.supabase
    .from('calendar_events')
    .select('id,completed_at')
    .eq('workspace_id', context.workspace.workspace_id)
    .eq('id', parsed.data.id)
    .maybeSingle()
  if (current.error || !current.data) return failed('Agenda tidak ditemukan.')

  const completedAt = current.data.completed_at ? null : new Date().toISOString()
  const { data, error } = await context.supabase
    .from('calendar_events')
    .update({ completed_at: completedAt })
    .eq('workspace_id', context.workspace.workspace_id)
    .eq('id', parsed.data.id)
    .select('id')
    .maybeSingle()
  if (error || !data) return failed('Status agenda gagal diubah.')

  revalidatePath('/calendar')
  return { ok: true, message: completedAt ? 'Agenda ditandai selesai.' : 'Agenda dibuka kembali.' }
}

export async function deleteCalendarEventAction(input: unknown): Promise<CalendarMutationResult> {
  const parsed = calendarEventIdSchema.safeParse(input)
  if (!parsed.success) return failed(parsed.error.issues[0]?.message ?? 'Agenda tidak valid.')
  const context = await mutationContext('calendar.delete')
  if (!context) return failed('Role Anda tidak memiliki permission untuk menghapus agenda.')

  const { data, error } = await context.supabase
    .from('calendar_events')
    .delete()
    .eq('workspace_id', context.workspace.workspace_id)
    .eq('id', parsed.data.id)
    .select('id')
    .maybeSingle()
  if (error || !data) return failed('Agenda tidak ditemukan atau tidak dapat dihapus.')

  revalidatePath('/calendar')
  return { ok: true, message: 'Agenda berhasil dihapus.' }
}
