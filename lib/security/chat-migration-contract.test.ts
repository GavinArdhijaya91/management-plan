import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260729120000_workspace_collaboration_chat.sql'),
  'utf8',
)

function tableDefinition(tableName: string) {
  const start = migration.indexOf(`create table public.${tableName} (`)
  const nextStatement = migration.indexOf('\n\ncreate ', start)

  expect(start).toBeGreaterThanOrEqual(0)
  return migration.slice(start, nextStatement === -1 ? migration.length : nextStatement)
}

describe('workspace chat migration source contract', () => {
  it('places the conversation-scoped message identity on chat_messages', () => {
    const conversations = tableDefinition('chat_conversations')
    const messages = tableDefinition('chat_messages')

    expect(conversations).not.toContain('unique (workspace_id, conversation_id, id)')
    expect(messages).toContain('unique (workspace_id, conversation_id, id)')
  })

  it('uses the composite message identity for child records', () => {
    expect(migration).toContain('references public.chat_messages(workspace_id, conversation_id, id)')
  })
})
