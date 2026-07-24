# Database Conventions

These conventions apply to every PostgreSQL change in `supabase/migrations`.
They exist to keep forks, reviews, generated types, and future integrations
predictable.

Read [DOMAIN_GLOSSARY.md](./DOMAIN_GLOSSARY.md) before designing a table.

## Naming

- Use English `snake_case` identifiers.
- Use plural table names: `business_plans`, not `business_plan`.
- Use singular enum type names: `workspace_role`, not `workspace_roles`.
- Name primary keys `id`, except identity extensions such as
  `profiles.user_id`.
- Name foreign keys `<entity>_id`: `workspace_id`, `business_goal_id`.
- Name join tables after both entities:
  `workspace_business_categories`.
- Use `_at` for timestamps and `_date` or `_on` for business dates.
- Use `_by` for an actor foreign key: `created_by`, `invited_by`.
- Use `_code` for stable reference codes: `currency_code`, `country_code`.
- Use explicit monetary names: `target_amount`, `exchange_rate`, and
  `base_amount`; avoid a generic `value` when the unit is money.
- Use booleans that read as conditions: `is_active`, `has_access`, or a
  domain-specific adjective such as `completed`.

Do not use ambiguous names such as `items`, `details`, `management`, `data`,
`records`, `type`, or `status` without clear domain context.

## Table responsibility

Each table represents one domain concept or one explicit relationship.

- Identity data belongs to `profiles`.
- Personal settings belong to `profile_preferences`.
- Business settings and defaults belong to `workspaces`.
- Authorization belongs to `workspace_members` and policies.
- External business parties must not be represented as workspace members.
- User-facing evaluations must not be stored as audit logs.
- Scheduled time and executable work remain separate concepts.

Do not model a table after the layout of a page. One UI card may compose data
from several domain tables.

## Keys and relationships

- Prefer UUIDs for tenant-owned business entities.
- Use small identity keys only for stable reference catalogs.
- Declare every foreign key and choose its delete behavior deliberately.
- Default tenant-owned records to `on delete cascade` from their workspace
  only when deleting the workspace must remove them.
- Prefer `restrict` for referenced actors or definitions when silent deletion
  would destroy history.
- Use a join table for a relationship that may gain metadata later.
- Add unique constraints for business invariants, not merely for UI
  convenience.

## Workspace isolation and RLS

Every workspace-owned table must:

1. Include a non-null `workspace_id`.
2. Enable Row Level Security.
3. Define explicit policies for each supported operation.
4. Use `private.is_workspace_member` or
   `private.has_workspace_role` where appropriate.
5. Add an index beginning with `workspace_id` for common access paths.

Never rely on a workspace identifier supplied by the browser as proof of
access. RLS is the final authorization boundary.

Reference tables may be readable by authenticated users, but writes should be
limited to migrations or trusted server operations.

## Columns and integrity

- Add `created_at` to durable entities.
- Add `updated_at` and the shared trigger when records can change.
- Use enums for small, stable state machines.
- Prefer reference tables for lists expected to grow or carry metadata.
- Use `check` constraints for ranges, paired values, and length limits.
- Store currency as a three-letter code, never as a display symbol.
- Store country as a two-letter code.
- Store file paths in business tables; store file contents in Supabase
  Storage.
- Store latitude and longitude together and validate their ranges.
- Do not store secrets, raw invitation tokens, access tokens, or passwords.

## Migration policy

- Applied migrations are immutable.
- Create a new timestamped migration for every schema change.
- Make reference-data inserts idempotent where practical.
- Keep production reference data in migrations.
- Keep fictional business data in `supabase/seed.sql`.
- Never run a linked database reset against production.
- Preview remote changes with `pnpm db:dry-run`.
- Generate `lib/supabase/database.types.ts` after applying a migration.

Migration file names follow:

```text
YYYYMMDDHHMMSS_short_description.sql
```

## Required migration review

Before applying a migration, confirm:

- [ ] Every term exists in the domain glossary or is added through review.
- [ ] Application row types come from `lib/supabase/domain-types.ts`; a local
      demo or presentation interface does not reuse a canonical database name.
- [ ] Monetary sign, currency, and derived-result rules follow
      `docs/DATA_ACCESS_CONTRACT.md`.
- [ ] The table has one clear responsibility.
- [ ] Foreign keys and deletion behavior are explicit.
- [ ] Required uniqueness and check constraints exist.
- [ ] Common workspace queries have suitable indexes.
- [ ] RLS is enabled on every exposed table.
- [ ] Select, insert, update, and delete policies were considered separately.
- [ ] Security-definer functions use an empty `search_path`.
- [ ] Seed data cannot accidentally populate production.
- [ ] Generated TypeScript types will be refreshed.
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build` pass.

## Proposal template

Use this short template in an issue, pull request, or design note:

```text
Domain term:
Business definition:
Owner/workspace boundary:
Who can read:
Who can create:
Who can update:
Who can delete:
Important invariants:
Expected query paths:
Why an existing table cannot represent it:
```

If these questions cannot yet be answered, document the idea but postpone the
migration.
