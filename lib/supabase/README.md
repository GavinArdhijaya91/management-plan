# Supabase data boundary

- `client.ts` is only for Client Components.
- `server.ts` is for Server Components, Server Actions, and Route Handlers.
- Never import `SUPABASE_SECRET_KEY` into browser code.
- Generate `database.types.ts` after the first migration is pushed.

```powershell
pnpm supabase gen types typescript --linked --schema public | Set-Content lib/supabase/database.types.ts
```
