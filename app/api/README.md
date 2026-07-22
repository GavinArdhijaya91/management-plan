# API Route Handlers

Use Route Handlers only for HTTP boundaries that are needed, such as public contact submission, webhooks, exports, and integrations. Authenticated CRUD may call Supabase directly when RLS fully protects the table.

- Validate request bodies with Zod.
- Return `{ data }` on success and `{ error: { code, message } }` on failure.
- Never expose database errors or server secrets.
- Rate-limit public and expensive endpoints.
- Keep business calculations in domain modules.
- Version external contracts under `app/api/v1` when third-party clients consume them.
