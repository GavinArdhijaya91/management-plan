import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const privatePages = [
  'app/dashboard/page.tsx',
  'app/manajemen/page.tsx',
  'app/kalender/page.tsx',
  'app/notifikasi/page.tsx',
  'app/profil/page.tsx',
  'app/tren-pasar/page.tsx',
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

  it('keeps demo storage keys explicitly namespaced', () => {
    const demoSources = [
      'app/demo/dashboard/page.tsx',
      'app/demo/kalender/page.tsx',
      'app/demo/notifikasi/page.tsx',
      'app/demo/profil/page.tsx',
      'app/demo/tren-pasar/page.tsx',
    ]
      .map((fileName) => readFileSync(resolve(process.cwd(), fileName), 'utf8'))
      .join('\n')

    expect(demoSources).not.toMatch(/['"]siapin:(?!demo:)/)
  })
})
