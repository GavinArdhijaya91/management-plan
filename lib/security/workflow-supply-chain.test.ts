import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const workflowDirectory = resolve(process.cwd(), '.github/workflows')
const workflows = readdirSync(workflowDirectory)
  .filter((fileName) => fileName.endsWith('.yml') || fileName.endsWith('.yaml'))
  .map((fileName) => ({
    fileName,
    source: readFileSync(resolve(workflowDirectory, fileName), 'utf8'),
  }))

describe('GitHub Actions supply-chain contracts', () => {
  it('pins every external action to a full commit SHA', () => {
    for (const workflow of workflows) {
      const actionReferences = [...workflow.source.matchAll(/^\s*uses:\s*([^\s#]+).*$/gm)]

      expect(actionReferences.length, `${workflow.fileName} should contain an action`).toBeGreaterThan(0)
      for (const reference of actionReferences) {
        expect(reference[1], `${workflow.fileName}: ${reference[1]}`).toMatch(/^[^@]+@[0-9a-f]{40}$/)
      }
    }
  })

  it('does not execute contributor-controlled workflow code with target privileges', () => {
    for (const workflow of workflows) {
      expect(workflow.source, workflow.fileName).not.toMatch(/^\s*pull_request_target\s*:/m)
    }
  })

  it('does not grant broad repository or identity write permissions', () => {
    for (const workflow of workflows) {
      expect(workflow.source, workflow.fileName).not.toMatch(/^\s*(contents|actions|packages):\s*write\s*$/m)
      expect(workflow.source, workflow.fileName).not.toMatch(/^\s*id-token:\s*write\s*$/m)
    }
  })

  it('keeps CodeQL on its verified immutable release', () => {
    const codeql = workflows.find(({ fileName }) => fileName === 'codeql.yml')

    expect(codeql?.source).toContain('github/codeql-action/init@7211b7c8077ea37d8641b6271f6a365a22a5fbfa')
    expect(codeql?.source).toContain('github/codeql-action/analyze@7211b7c8077ea37d8641b6271f6a365a22a5fbfa')
    expect(codeql?.source).toContain('queries: security-extended')
  })
})
