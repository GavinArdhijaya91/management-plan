import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { requireActiveWorkspace } from '@/lib/workspace/context'
import type { TablesInsert } from '@/lib/supabase/database.types'

export interface PortfolioMutationResult {
  error: { code?: string; message: string } | null
}

export async function getPortfolioBoard() {
  const workspace = await requireActiveWorkspace('/portfolio')
  const supabase = await createClient()
  const [portfolios, evidence, achievements, reviews] = await Promise.all([
    supabase.from('business_portfolios').select('*').eq('workspace_id', workspace.workspace_id),
    supabase.from('business_portfolio_evidence').select('*').eq('workspace_id', workspace.workspace_id),
    supabase.from('workspace_achievement_details').select('*').eq('workspace_id', workspace.workspace_id),
    supabase
      .from('business_reviews')
      .select('id,period_start,period_end,summary,status')
      .eq('workspace_id', workspace.workspace_id)
      .eq('status', 'finalized'),
  ])
  const error = portfolios.error ?? evidence.error ?? achievements.error ?? reviews.error
  if (error) throw new Error(`Unable to load portfolio workspace: ${error.message}`)
  return {
    workspace,
    portfolios: portfolios.data ?? [],
    evidence: evidence.data ?? [],
    achievements: achievements.data ?? [],
    finalizedReviews: reviews.data ?? [],
  }
}

async function portfolioMutationContext() {
  const [user, workspace] = await Promise.all([
    requireAuthenticatedUser('/portfolio'),
    requireActiveWorkspace('/portfolio'),
  ])
  return { user, workspace, supabase: await createClient() }
}

export async function createBusinessPortfolio(
  input: Pick<TablesInsert<'business_portfolios'>, 'title' | 'summary'>,
): Promise<PortfolioMutationResult> {
  const { user, workspace, supabase } = await portfolioMutationContext()
  const { error } = await supabase.from('business_portfolios').insert({
    ...input,
    workspace_id: workspace.workspace_id,
    created_by: user.id,
    status: 'active',
  })
  return { error }
}

export async function addReviewToPortfolio(portfolioId: string, reviewId: string): Promise<PortfolioMutationResult> {
  const { user, workspace, supabase } = await portfolioMutationContext()
  const { error } = await supabase.from('business_portfolio_reviews').insert({
    workspace_id: workspace.workspace_id,
    business_portfolio_id: portfolioId,
    business_review_id: reviewId,
    added_by: user.id,
  })
  return { error }
}

export async function setPortfolioPublication(
  portfolioId: string,
  publicSlug: string,
  shouldPublish: boolean,
): Promise<PortfolioMutationResult> {
  const { supabase } = await portfolioMutationContext()
  const { error } = await supabase.rpc('publish_business_portfolio', {
    target_business_portfolio_id: portfolioId,
    requested_public_slug: publicSlug,
    should_publish: shouldPublish,
  })
  return { error }
}
