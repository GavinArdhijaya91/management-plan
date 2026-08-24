'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { parseBpsBinding } from '@/lib/market/bps'
import { createClient } from '@/lib/supabase/server'
import { hasWorkspacePermission, requireActiveWorkspace } from '@/lib/workspace/context'

const bindingFormSchema = z.object({
  productId: z.string().uuid(),
  model: z.enum(['pressrelease', 'publication']),
  domain: z.string().regex(/^\d{4}$/, 'Kode domain BPS harus terdiri dari 4 angka.'),
  keyword: z.string().trim().min(2, 'Kata kunci minimal 2 karakter.').max(100),
})

function feedback(kind: 'error' | 'success', message: string): never {
  redirect(`/tren-pasar?${kind}=${encodeURIComponent(message)}`)
}

export async function createBpsBindingAction(formData: FormData) {
  const [user, workspace] = await Promise.all([
    requireAuthenticatedUser('/tren-pasar'),
    requireActiveWorkspace('/tren-pasar'),
  ])
  if (!hasWorkspacePermission(workspace, 'market.write'))
    feedback('error', 'Anda tidak memiliki akses mengubah sumber pasar.')

  const parsed = bindingFormSchema.safeParse({
    productId: formData.get('productId')?.toString(),
    model: formData.get('model')?.toString(),
    domain: formData.get('domain')?.toString(),
    keyword: formData.get('keyword')?.toString(),
  })
  if (!parsed.success) feedback('error', parsed.error.issues[0]?.message ?? 'Konfigurasi BPS tidak valid.')

  const externalIdentifier = new URLSearchParams({
    model: parsed.data.model,
    domain: parsed.data.domain,
    keyword: parsed.data.keyword,
  }).toString()
  parseBpsBinding(externalIdentifier)

  const supabase = await createClient()
  const [productResult, sourceResult] = await Promise.all([
    supabase
      .from('market_products')
      .select('id')
      .eq('workspace_id', workspace.workspace_id)
      .eq('id', parsed.data.productId)
      .single(),
    supabase.from('market_sources').select('id').eq('code', 'bps').single(),
  ])
  if (productResult.error || sourceResult.error) feedback('error', 'Produk atau katalog sumber BPS tidak ditemukan.')

  const { error } = await supabase.from('market_product_source_bindings').insert({
    workspace_id: workspace.workspace_id,
    product_id: productResult.data.id,
    market_source_id: sourceResult.data.id,
    category_code: 'official_statistics',
    external_identifier: externalIdentifier,
    country_code: 'ID',
    created_by: user.id,
  })
  if (error)
    feedback(
      'error',
      error.code === '23505' ? 'Topik BPS ini sudah terhubung ke produk.' : 'Sumber BPS gagal dihubungkan.',
    )

  revalidatePath('/tren-pasar')
  feedback('success', 'Sumber BPS terhubung. Data akan masuk pada jadwal sinkronisasi berikutnya.')
}
