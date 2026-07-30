import Link from 'next/link'
import { Award, BookOpenCheck } from 'lucide-react'
import { Header } from '@/components/header'
import { getPortfolioBoard } from '@/lib/portfolio/service'
import { addPortfolioEvidenceAction, createPortfolioAction, publishPortfolioAction } from '@/app/portfolio/actions'

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const [{ error, success }, board] = await Promise.all([searchParams, getPortfolioBoard()])
  const canManage = board.workspace.permission_codes.includes('portfolio.manage')

  return (
    <main className="app-shell">
      <Header />
      <div className="page-shell motion-page-enter">
        <p className="app-label">Workspace / Evidence</p>
        <h1 className="app-heading mt-2">Portfolio bisnis</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Susun review finalized menjadi rekam jejak privat atau publik yang dapat diverifikasi.
        </p>

        {(error || success) && (
          <p role={error ? 'alert' : 'status'} className="app-card mt-5 p-4 text-sm">
            {error ?? success}
          </p>
        )}

        {canManage && (
          <form action={createPortfolioAction} className="app-card mt-6 grid gap-3 p-5 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              Nama portfolio
              <input name="title" required minLength={2} maxLength={160} className="app-input" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Ringkasan
              <input name="summary" maxLength={2000} className="app-input" />
            </label>
            <button className="app-button md:col-span-2">Buat portfolio aktif</button>
          </form>
        )}

        <section aria-labelledby="achievement-title" className="mt-8">
          <h2 id="achievement-title" className="font-serif text-xl font-semibold">
            Achievement badges
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {board.achievements.map((achievement) => (
              <article key={achievement.workspace_achievement_id} className="app-card flex gap-3 p-4">
                <Award className="size-5 shrink-0 text-amber-600" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold">{achievement.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{achievement.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-5">
          {board.portfolios.map((portfolio) => {
            const evidence = board.evidence.filter((item) => item.business_portfolio_id === portfolio.id)
            return (
              <article key={portfolio.id} className="app-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-semibold">{portfolio.title}</h2>
                    <p className="mt-1 text-sm text-zinc-500">{portfolio.summary}</p>
                  </div>
                  <span className="text-xs font-medium uppercase text-zinc-500">{portfolio.visibility}</span>
                </div>
                <div className="mt-4 grid gap-2">
                  {evidence.map((item) => (
                    <div key={item.business_review_id} className="rounded-xl border border-zinc-200 p-3 text-sm">
                      <BookOpenCheck className="mr-2 inline size-4" aria-hidden="true" />
                      {item.period_start} — {item.period_end}: {item.review_summary}
                    </div>
                  ))}
                </div>
                {canManage && (
                  <div className="mt-4 grid gap-3 border-t border-zinc-200 pt-4 md:grid-cols-2">
                    <form action={addPortfolioEvidenceAction} className="flex gap-2">
                      <input type="hidden" name="portfolioId" value={portfolio.id} />
                      <select name="reviewId" required className="app-input min-w-0 flex-1" defaultValue="">
                        <option value="" disabled>
                          Pilih review finalized
                        </option>
                        {board.finalizedReviews.map((review) => (
                          <option key={review.id} value={review.id}>
                            {review.period_start} — {review.period_end}
                          </option>
                        ))}
                      </select>
                      <button className="app-button-secondary">Tambah</button>
                    </form>
                    <form action={publishPortfolioAction} className="flex gap-2">
                      <input type="hidden" name="portfolioId" value={portfolio.id} />
                      <input
                        name="publicSlug"
                        className="app-input min-w-0 flex-1"
                        defaultValue={portfolio.public_slug ?? ''}
                        placeholder="slug-publik"
                      />
                      <input
                        type="hidden"
                        name="shouldPublish"
                        value={portfolio.visibility === 'public' ? 'false' : 'true'}
                      />
                      <button className="app-button">
                        {portfolio.visibility === 'public' ? 'Jadikan privat' : 'Publikasikan'}
                      </button>
                    </form>
                    {portfolio.public_slug && (
                      <Link href={`/portfolio/${portfolio.public_slug}`} className="text-sm underline">
                        Lihat halaman publik
                      </Link>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}
