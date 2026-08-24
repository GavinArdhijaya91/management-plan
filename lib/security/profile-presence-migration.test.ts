import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  join(process.cwd(), 'supabase/migrations/20260824170000_personal_profile_presence.sql'),
  'utf8',
)

describe('personal profile presence migration', () => {
  it('keeps activity visibility separate from ephemeral presence state', () => {
    expect(migration).toContain('show_activity_status boolean not null default true')
    expect(migration).not.toMatch(/\b(is_online|online_at|last_seen_at)\b\s+(boolean|timestamptz)/i)
  })

  it('binds profile banner paths to the authenticated profile folder', () => {
    expect(migration).toContain("split_part(profile_banner_path, '/', 1) = user_id::text")
    expect(migration).toContain("profile_banner_path not like '%..%'")
  })

  it('exposes only collaboration-safe profile fields through the guarded directory', () => {
    expect(migration).toContain("private.has_workspace_permission(target_workspace_id, 'member.read')")
    expect(migration).toContain('profile.headline')
    expect(migration).toContain('profile.status_text')
    expect(migration).not.toMatch(/profile\.(email|phone|bio)/)
  })

  it('updates profile identity and presence preference through one database transaction', () => {
    expect(migration).toContain('function public.update_my_personal_profile')
    expect(migration).toContain('update public.profiles')
    expect(migration).toContain('update public.profile_preferences')
    expect(migration).toContain('security invoker')
  })
})
