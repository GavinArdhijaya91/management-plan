import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/database.types'

function jsonObjects(value: Json) {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is { [key: string]: Json | undefined } =>
      typeof item === 'object' && item !== null && !Array.isArray(item),
  )
}

export default async function PublicPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_public_business_portfolio', {
    requested_public_slug: slug,
  })
  const portfolio = data?.[0]
  if (error || !portfolio) notFound()

  const evidence = jsonObjects(portfolio.review_evidence)
  const badges = jsonObjects(portfolio.achievement_badges)

  return (
    <main className="min-h-dvh bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="app-label">{portfolio.workspace_name}</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold">{portfolio.portfolio_title}</h1>
        <p className="mt-4 text-zinc-600">{portfolio.portfolio_summary}</p>
        <section aria-labelledby="evidence-heading" className="mt-10">
          <h2 id="evidence-heading" className="font-serif text-2xl font-semibold">
            Evidence evaluasi
          </h2>
          <div className="mt-4 grid gap-3">
            {evidence.map((item, index) => (
              <article key={index} className="app-card p-4">
                <p className="text-xs text-zinc-500">
                  {String(item.period_start)} — {String(item.period_end)}
                </p>
                <p className="mt-2 text-sm">{String(item.summary)}</p>
              </article>
            ))}
          </div>
        </section>
        {badges.length > 0 && (
          <section aria-labelledby="badge-heading" className="mt-10">
            <h2 id="badge-heading" className="font-serif text-2xl font-semibold">
              Achievement badges
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {badges.map((badge, index) => (
                <article key={index} className="app-card p-4">
                  <h3 className="font-semibold">{String(badge.name)}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{String(badge.description)}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
