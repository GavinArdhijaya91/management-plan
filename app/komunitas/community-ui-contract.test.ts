import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('community UI privacy contract', () => {
  it('does not query private workspace business records', () => {
    const source = [read('app/komunitas/_domain/community-query.ts'), read('app/komunitas/actions.ts')].join('\n')
    for (const table of [
      'transactions',
      'business_plans',
      'business_goals',
      'metric_measurements',
      'business_reviews',
    ]) {
      expect(source).not.toContain(`from('${table}')`)
    }
  })

  it('publishes and archives only through lifecycle RPCs', () => {
    const actions = read('app/komunitas/actions.ts')
    expect(actions).toContain("rpc('publish_community_post'")
    expect(actions).toContain("rpc('archive_community_post'")
    expect(actions).not.toMatch(/\.update\(\{[^}]*publication_status/)
  })

  it('registers community as a protected route', () => {
    expect(read('lib/auth/routes.ts')).toContain("'/komunitas'")
  })
})
