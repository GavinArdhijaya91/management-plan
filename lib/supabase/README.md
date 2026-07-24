# Supabase data boundary

- `client.ts` is only for Client Components.
- `server.ts` is for Server Components, Server Actions, and Route Handlers.
- Never import `SUPABASE_SECRET_KEY` into browser code.
- Generate `database.types.ts` after the first migration is pushed.
- Import canonical row/view aliases from `domain-types.ts`.
- Derive RPC arguments/results from `rpc-types.ts`; do not handwrite RPC
  payload interfaces.
- Never pass a type prefixed with `Demo` to Supabase mutation methods.
- Follow [`docs/DATA_ACCESS_CONTRACT.md`](../../docs/DATA_ACCESS_CONTRACT.md)
  before adding repositories, Server Actions, or query utilities.

```powershell
pnpm supabase gen types typescript --linked --schema public | Set-Content lib/supabase/database.types.ts
```
