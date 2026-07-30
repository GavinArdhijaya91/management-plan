'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  addReviewToPortfolio,
  createBusinessPortfolio,
  setPortfolioPublication,
  type PortfolioMutationResult,
} from '@/lib/portfolio/service'

const uuid = z.string().uuid()

function finish(result: PortfolioMutationResult, success: string): never {
  revalidatePath('/portfolio')
  if (result.error) redirect(`/portfolio?error=${encodeURIComponent('Perubahan portfolio belum dapat disimpan.')}`)
  redirect(`/portfolio?success=${encodeURIComponent(success)}`)
}

export async function createPortfolioAction(formData: FormData) {
  const parsed = z
    .object({ title: z.string().trim().min(2).max(160), summary: z.string().trim().max(2000).optional() })
    .safeParse({
      title: formData.get('title')?.toString(),
      summary: formData.get('summary')?.toString() || undefined,
    })
  if (!parsed.success) redirect('/portfolio?error=Data%20portfolio%20tidak%20valid.')
  finish(await createBusinessPortfolio(parsed.data), 'Portfolio berhasil dibuat.')
}

export async function addPortfolioEvidenceAction(formData: FormData) {
  const parsed = z.object({ portfolioId: uuid, reviewId: uuid }).safeParse({
    portfolioId: formData.get('portfolioId')?.toString(),
    reviewId: formData.get('reviewId')?.toString(),
  })
  if (!parsed.success) redirect('/portfolio?error=Evidence%20tidak%20valid.')
  finish(await addReviewToPortfolio(parsed.data.portfolioId, parsed.data.reviewId), 'Evidence ditambahkan.')
}

export async function publishPortfolioAction(formData: FormData) {
  const parsed = z
    .object({
      portfolioId: uuid,
      publicSlug: z.string().trim().min(3).max(80),
      shouldPublish: z.enum(['true', 'false']).transform((value) => value === 'true'),
    })
    .safeParse({
      portfolioId: formData.get('portfolioId')?.toString(),
      publicSlug: formData.get('publicSlug')?.toString() || 'private',
      shouldPublish: formData.get('shouldPublish')?.toString(),
    })
  if (!parsed.success) redirect('/portfolio?error=Pengaturan%20publikasi%20tidak%20valid.')
  finish(
    await setPortfolioPublication(parsed.data.portfolioId, parsed.data.publicSlug, parsed.data.shouldPublish),
    parsed.data.shouldPublish ? 'Portfolio dipublikasikan.' : 'Portfolio dijadikan privat.',
  )
}
