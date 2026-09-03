import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const privatePages = [
  'app/dashboard/page.tsx',
  'app/management/page.tsx',
  'app/calendar/page.tsx',
  'app/collaboration/page.tsx',
  'app/notifications/page.tsx',
  'app/profile/page.tsx',
  'app/market-trends/page.tsx',
]

describe('demo and private route boundary', () => {
  it.each(privatePages)('keeps local demo state out of private page %s', (fileName) => {
    const source = readFileSync(resolve(process.cwd(), fileName), 'utf8')

    expect(source).not.toContain('useLocalStorage')
    expect(source).not.toContain('DemoDataNotice')
    expect(source).not.toContain('Reset Demo')
  })

  it('routes the public demo call-to-action into the demo namespace', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8')

    expect(source).toContain('href="/demo/dashboard"')
  })

  it('exposes real account routes without presenting local storage as email delivery', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8')

    expect(source).toContain('href="/auth/login"')
    expect(source).toContain('href="/auth/sign-up"')
    expect(source).not.toContain('siapin:interest-list')
    expect(source).not.toContain('Daftar minat')
  })

  it('keeps demo storage keys explicitly namespaced', () => {
    const demoSources = [
      'app/demo/dashboard/page.tsx',
      'app/demo/calendar/page.tsx',
      'app/demo/notifications/page.tsx',
      'app/demo/profile/page.tsx',
      'app/demo/market-trends/page.tsx',
    ]
      .map((fileName) => readFileSync(resolve(process.cwd(), fileName), 'utf8'))
      .join('\n')

    expect(demoSources).not.toMatch(/['"]siapin:(?!demo:)/)
  })
})
