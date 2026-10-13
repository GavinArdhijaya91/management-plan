## What does this PR do?

<!-- In 1–2 simple sentences: what problem does this solve and who benefits? -->
<!-- Judul PR wajib Conventional Commits (dicek otomatis), karena squash-merge memakai judul sebagai pesan commit. Satu PR = satu tujuan; migrasi database di PR tersendiri berlabel `security` bila menyentuh RLS/RPC. -->

## Security impact

<!-- Wajib diisi: Apakah PR ini mengubah izin atau akses data? Jika ya, jelaskan dan tandai label `security`. -->

- [ ] PR ini TIDAK mengubah izin/akses data, ATAU perubahan izin dijelaskan di bawah:
- <!-- ... -->

## How to check it

<!-- Steps for a reviewer to verify: e.g. 1. pnpm dev 2. Open /planning 3. ... -->
<!-- Add screenshots or a short video for UI changes -->

## Checklist

### Quality

- [ ] `pnpm typecheck` and `pnpm lint` pass
- [ ] `pnpm test` passes (and `pnpm test:e2e` if you changed UI/flows)
- [ ] `pnpm build` passes if you changed app code
- [ ] No secrets, tokens, passwords, or real business data included
- [ ] `pnpm security:secrets` passes

### Safety — does this keep workspace data private?

- [ ] No broader anonymous access than intended
- [ ] Workspace data stays isolated (one workspace cannot see another's data)
- [ ] If you added a write/mutation: it checks permissions and has a test for the denied case
- [ ] If you added a table: RLS is enabled; if a view: it uses `security_invoker`
- [ ] If you added an RPC: you revoked `PUBLIC`/`anon` before granting callers
- [ ] No way to fake user identity via submitted IDs or metadata

### Database (if you changed database)

- [ ] Not applicable — no database change
- [ ] New migration is forward-only (never edited an old one)
- [ ] Constraints, indexes, grants, RLS, and rollback were considered
- [ ] pgTAP tests cover both allowed and denied cases

### Notes for reviewer

<!-- Anything else: migration notes, follow-up tasks, docs updated, etc. -->
