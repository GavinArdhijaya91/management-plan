'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { parseBpsBinding } from '@/lib/market/bps'
import { parseBpsDynamicBinding } from '@/lib/market/bps-dynamic'
import { createClient } from '@/lib/supabase/server'
import { hasWorkspacePermission, requireActiveWorkspace } from '@/lib/workspace/context'
import { POST as ingestBpsRequest } from '@/app/api/market/ingest/bps/route'

const documentBindingSchema = z.object({
  productId: z.string().uuid(),
  model: z.enum(['pressrelease', 'publication']),
  domain: z.string().regex(/^\d{4}$/, 'Kode domain BPS harus terdiri dari 4 angka.'),
  keyword: z.string().trim().min(2, 'Kata kunci minimal 2 karakter.').max(100),
})
const dynamicBindingSchema = z.object({
  productId: z.string().uuid(),
  domain: z.string().regex(/^\d{4}$/),
  variableId: z.string().regex(/^\d+$/, 'ID variabel harus berupa angka.'),
  periodId: z.string().regex(/^\d+(?:[;:]\d+)*$/, 'ID periode tidak valid.'),
  derivedVariableId: z
    .string()
    .regex(/^\d+(?:[;:]\d+)*$/)
    .optional(),
  geographyId: z
    .string()
    .regex(/^\d+(?:[;:]\d+)*$/)
    .optional(),
  derivedPeriodId: z
    .string()
    .regex(/^\d+(?:[;:]\d+)*$/)
    .optional(),
})
const mutationSchema = z.object({ bindingId: z.string().uuid() })
const intervalSchema = mutationSchema.extend({ minutes: z.coerce.number().int().min(5).max(43200) })

function feedback(kind: 'error' | 'success', message: string): never {
  redirect(`/tren-pasar?${kind}=${encodeURIComponent(message)}`)
}

async function context() {
  const [user, workspace] = await Promise.all([
    requireAuthenticatedUser('/tren-pasar'),
    requireActiveWorkspace('/tren-pasar'),
  ])
  if (!hasWorkspacePermission(workspace, 'market.write'))
    feedback('error', 'Anda tidak memiliki akses mengubah sumber pasar.')
  return { user, workspace, supabase: await createClient() }
}

async function insertBinding(externalIdentifier: string, productId: string, success: string) {
  const { user, workspace, supabase } = await context()
  const [product, source] = await Promise.all([
    supabase
      .from('market_products')
      .select('id')
      .eq('workspace_id', workspace.workspace_id)
      .eq('id', productId)
      .single(),
    supabase.from('market_sources').select('id').eq('code', 'bps').single(),
  ])
  if (product.error || source.error) feedback('error', 'Produk atau katalog sumber BPS tidak ditemukan.')
  const { error } = await supabase.from('market_product_source_bindings').insert({
    workspace_id: workspace.workspace_id,
    product_id: product.data.id,
    market_source_id: source.data.id,
    category_code: 'official_statistics',
    external_identifier: externalIdentifier,
    country_code: 'ID',
    created_by: user.id,
  })
  if (error)
    feedback('error', error.code === '23505' ? 'Sumber BPS ini sudah terhubung.' : 'Sumber BPS gagal dihubungkan.')
  revalidatePath('/tren-pasar')
  feedback('success', success)
}

export async function createBpsBindingAction(formData: FormData) {
  const parsed = documentBindingSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) feedback('error', parsed.error.issues[0]?.message ?? 'Konfigurasi BPS tidak valid.')
  const identifier = new URLSearchParams({
    model: parsed.data.model,
    domain: parsed.data.domain,
    keyword: parsed.data.keyword,
  }).toString()
  parseBpsBinding(identifier)
  await insertBinding(identifier, parsed.data.productId, 'Sumber dokumen BPS terhubung dan menunggu sinkronisasi.')
}

export async function createBpsDynamicBindingAction(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const optional = (key: string) => String(raw[key] ?? '').trim() || undefined
  const parsed = dynamicBindingSchema.safeParse({
    ...raw,
    derivedVariableId: optional('derivedVariableId'),
    geographyId: optional('geographyId'),
    derivedPeriodId: optional('derivedPeriodId'),
  })
  if (!parsed.success) feedback('error', parsed.error.issues[0]?.message ?? 'Seri statistik BPS tidak valid.')
  const parameters = new URLSearchParams({
    model: 'data',
    domain: parsed.data.domain,
    var: parsed.data.variableId,
    th: parsed.data.periodId,
  })
  if (parsed.data.derivedVariableId) parameters.set('turvar', parsed.data.derivedVariableId)
  if (parsed.data.geographyId) parameters.set('vervar', parsed.data.geographyId)
  if (parsed.data.derivedPeriodId) parameters.set('turth', parsed.data.derivedPeriodId)
  parseBpsDynamicBinding(parameters.toString())
  await insertBinding(
    parameters.toString(),
    parsed.data.productId,
    'Seri statistik BPS terhubung dan menunggu sinkronisasi.',
  )
}

export async function toggleBpsBindingAction(formData: FormData) {
  const { workspace, supabase } = await context()
  const parsed = mutationSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) feedback('error', 'Binding sumber tidak valid.')
  const isActive = formData.get('isActive') === 'true'
  const { error } = await supabase
    .from('market_product_source_bindings')
    .update({ is_active: isActive })
    .eq('workspace_id', workspace.workspace_id)
    .eq('id', parsed.data.bindingId)
  if (error) feedback('error', 'Status sumber gagal diubah.')
  revalidatePath('/tren-pasar')
  feedback('success', isActive ? 'Sumber diaktifkan.' : 'Sumber dijeda.')
}

export async function deleteBpsBindingAction(formData: FormData) {
  const { workspace, supabase } = await context()
  if (!hasWorkspacePermission(workspace, 'market.delete'))
    feedback('error', 'Anda tidak memiliki akses menghapus sumber pasar.')
  const parsed = mutationSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) feedback('error', 'Binding sumber tidak valid.')
  const { error } = await supabase
    .from('market_product_source_bindings')
    .delete()
    .eq('workspace_id', workspace.workspace_id)
    .eq('id', parsed.data.bindingId)
  if (error) feedback('error', 'Sumber gagal dihapus.')
  revalidatePath('/tren-pasar')
  feedback('success', 'Sumber dan data turunannya telah dihapus.')
}

export async function updateBpsIntervalAction(formData: FormData) {
  const { workspace, supabase } = await context()
  const parsed = intervalSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) feedback('error', 'Interval sinkronisasi tidak valid.')
  const { error } = await supabase
    .from('market_product_source_bindings')
    .update({ refresh_interval_minutes: parsed.data.minutes })
    .eq('workspace_id', workspace.workspace_id)
    .eq('id', parsed.data.bindingId)
  if (error) feedback('error', 'Interval sinkronisasi gagal diubah.')
  revalidatePath('/tren-pasar')
  feedback('success', 'Interval sinkronisasi diperbarui.')
}

export async function retryBpsBindingAction(formData: FormData) {
  const { workspace, supabase } = await context()
  const parsed = mutationSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) feedback('error', 'Binding sumber tidak valid.')
  const binding = await supabase
    .from('market_product_source_bindings')
    .select('id')
    .eq('workspace_id', workspace.workspace_id)
    .eq('id', parsed.data.bindingId)
    .single()
  if (binding.error) feedback('error', 'Binding sumber tidak ditemukan.')
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) feedback('error', 'Sinkronisasi belum dikonfigurasi oleh administrator.')
  const response = await ingestBpsRequest(
    new Request(`http://internal/api/market/ingest/bps?bindingId=${parsed.data.bindingId}`, {
      headers: { Authorization: `Bearer ${secret}` },
    }),
  )
  if (!response.ok) feedback('error', 'Sinkronisasi manual gagal dijalankan.')
  const result = (await response.json()) as { data?: { failedBindings?: number } }
  revalidatePath('/tren-pasar')
  feedback(
    result.data?.failedBindings ? 'error' : 'success',
    result.data?.failedBindings ? 'BPS menolak atau gagal memproses sumber ini.' : 'Sinkronisasi manual selesai.',
  )
}
