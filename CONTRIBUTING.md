# Contributing to Siapin

Thank you for improving Siapin. The repository is private-business-first:
changes must preserve workspace isolation and must not expose business data by
default.

## Before changing the schema

1. Read the [domain glossary](./docs/DOMAIN_GLOSSARY.md).
2. Follow the [database conventions](./docs/DATABASE_CONVENTIONS.md).
3. Create a new migration; never edit a migration already applied remotely.
4. Run `pnpm db:status` and `pnpm db:dry-run`.
5. Apply the reviewed migration with `pnpm db:push`.
6. Regenerate `lib/supabase/database.types.ts`.

Future or experimental concepts should be documented before tables are
created. Reusing an existing table for a different business meaning is not a
shortcut.

## Quality checks

Install dependencies with pnpm and run:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

`pnpm verify` runs the same project quality gates in sequence.

Database changes also require a running local Supabase stack:

```bash
pnpm exec supabase start
pnpm db:test
pnpm exec supabase stop --no-backup
```

The database CI job provisions a clean stack, applies every migration and the
development seed, then runs all SQL contracts in `supabase/tests`. It does not
connect to the linked remote project.

## Pull requests

Explain:

- The business problem being solved
- Domain terms introduced or changed
- Database and RLS impact
- How the change was tested
- Any migration, seed, or generated-type changes

Keep unrelated formatting or refactoring out of schema-focused pull requests.
