import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const scannerSource = readFileSync(resolve(process.cwd(), 'scripts/check-tracked-secrets.mjs'), 'utf8')

describe('Tracked-secret scanner security contracts', () => {
  it('checks and reads each tracked file through one open file descriptor', () => {
    expect(scannerSource).toContain("const fileDescriptor = openSync(fileName, 'r')")
    expect(scannerSource).toContain('fstatSync(fileDescriptor).size')
    expect(scannerSource).toContain("readFileSync(fileDescriptor, 'utf8')")
    expect(scannerSource).toContain('closeSync(fileDescriptor)')
    expect(scannerSource).not.toMatch(/\bstatSync\(fileName\)/)
    expect(scannerSource).not.toMatch(/\breadFileSync\(fileName,\s*['"]utf8['"]\)/)
  })
})
