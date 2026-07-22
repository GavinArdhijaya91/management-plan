# Supabase PostgreSQL workflow

1. Fill `.env.local` with the Project URL and publishable key.
2. Run `pnpm supabase login`.
3. Run `pnpm db:link --project-ref <project-ref>`.
4. Preview with `pnpm db:push --dry-run`.
5. Apply with `pnpm db:push`.
6. Generate TypeScript types using `lib/supabase/README.md`.

The initial migration creates PostgreSQL tables, constraints, indexes, triggers, workspace helpers, and RLS policies. `contact_messages` intentionally has no public insert policy. A rate-limited Route Handler will own public contact submission later.

Never run a linked database reset against production.
