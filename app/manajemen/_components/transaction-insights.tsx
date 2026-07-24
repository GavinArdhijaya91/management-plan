import { CircleAlert, Lightbulb } from 'lucide-react'
import { transactionAggregate } from '@/app/manajemen/_domain/transaction-aggregate'
import type { DemoTransaction } from '@/types'

export function TransactionInsights({ transactions }: { transactions: DemoTransaction[] }) {
  const insights = transactionAggregate.insights(transactions)
  if (insights.length === 0) return null

  return (
    <section aria-labelledby="transaction-insights-title" className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="size-4" />
        <h2 id="transaction-insights-title" className="text-sm font-semibold">
          Kenapa ini penting?
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {insights.map((insight) => (
          <article
            key={insight.title}
            className={`rounded-2xl border p-4 ${insight.tone === 'warning' ? 'border-zinc-300 bg-zinc-100' : 'border-zinc-200 bg-white'}`}
          >
            <div className="flex gap-3">
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-zinc-500" />
              <div>
                <h3 className="text-sm font-semibold">{insight.title}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-500">{insight.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
