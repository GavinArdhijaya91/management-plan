import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260729120000_workspace_collaboration_chat.sql'),
  'utf8',
)
const chatContractTest = readFileSync(
  resolve(process.cwd(), 'supabase/tests/workspace_chat_contracts.test.sql'),
  'utf8',
)
const transactionExportMigration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260729110000_stabilize_transaction_exports.sql'),
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

  it('does not place subqueries inside PostgreSQL default expressions', () => {
    expect(migration).not.toMatch(/default\s*\(\s*select\b/i)
  })

  it('tests authenticated chat access through public RLS boundaries', () => {
    expect(chatContractTest).not.toContain('private.can_access_chat_conversation')
  })

  it('does not reuse an audit column name for the export actor variable', () => {
    expect(transactionExportMigration).toContain('audit_record.actor_id = request_actor_id')
    expect(transactionExportMigration).not.toContain('audit_record.actor_id = actor_id')
    expect(transactionExportMigration).toMatch(
      /insert into public\.audit_logs\s*\(\s*workspace_id,\s*actor_id,[\s\S]*?values\s*\(\s*target_workspace_id,\s*request_actor_id,/i,
    )
  })
})
