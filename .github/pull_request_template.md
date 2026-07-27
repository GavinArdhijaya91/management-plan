## Summary

<!-- Explain the user-visible or engineering outcome. -->

## Validation

- [ ] Relevant automated tests pass.
- [ ] Typecheck, lint, and format checks pass.
- [ ] Production build passes when application code changes.
- [ ] No credentials, private business data, or generated environment files are included.

## Security and data boundary

- [ ] The change does not broaden anonymous access unintentionally.
- [ ] Workspace-scoped reads and writes preserve tenant isolation.
- [ ] New mutations have explicit authorization and a negative test.
- [ ] New public tables enable RLS; new views use `security_invoker`.
- [ ] New RPCs revoke default `PUBLIC`/`anon` execution before granting callers.
- [ ] Identity-owned fields cannot be forged through submitted IDs or metadata.
- [ ] Storage changes bind object paths and permissions to the correct user or workspace.

## Database changes

- [ ] Not applicable.
- [ ] A forward-only migration is included.
- [ ] Constraints, indexes, grants, RLS policies, and rollback implications were reviewed.
- [ ] Clean-database pgTAP contracts cover the permitted and denied behavior.

## Screenshots or operational notes

<!-- Add UI evidence, migration considerations, or deployment configuration that reviewers need. -->
