# Database Operations

This runbook covers operational checks for the private-business database. It
does not replace the Supabase platform backup policy or authorize production
data to be copied into development.

## Release sequence

1. Confirm the target project and review `pnpm db:status`.
2. Run `pnpm db:dry-run` and review every pending migration.
3. Run the local database contracts with `pnpm db:test`.
4. Apply migrations with `pnpm db:push`.
5. Run linked database lint and regenerate TypeScript database types.
6. Verify application health before enabling new backend traffic.

Never reset a linked production database and never edit an applied migration.

## Operational health

Only a trusted service-role backend may call:

```sql
select * from public.get_system_health_snapshot();
```

The snapshot contains counters only:

- Pending invitations that have passed their expiry
- Queued email deliveries ready to send
- Email deliveries stuck in processing for more than 15 minutes
- Expired idempotency records
- Expired notifications

It exposes no workspace, user, recipient, or business values. A non-zero stale
email count requires investigation by the delivery worker; maintenance does
not guess whether an external provider accepted the message.

## Maintenance

A trusted scheduler may call:

```sql
select * from public.run_system_maintenance();
```

The operation is idempotent. It marks expired pending invitations and deletes
expired idempotency and notification rows. It deliberately does not delete
audit logs, business records, sent email history, reviews, or portfolio
evidence.

Start with a daily schedule. Alert on execution failure and retain the returned
counts in infrastructure logs. Scheduling credentials belong in the deployment
platform, never in PostgreSQL tables or repository files.

## Backup and restore

- Enable the Supabase backup and point-in-time recovery features appropriate
  for the production plan.
- Record the project reference, database region, retention window, and restore
  owner in the private deployment inventory.
- Before a high-risk release, confirm that the latest successful backup falls
  within the agreed recovery point objective.
- Test restoration into an isolated non-production project. Never overwrite
  production merely to test a restore.
- After restoration, verify migration history, row counts, RLS, service-role
  functions, storage references, Auth redirect URLs, and application health.

Secrets, raw invitation tokens, and service-role keys must never appear in a
backup drill report.

## Incident boundaries

Pause writes and escalate before restoring when:

- Migration history differs from the repository
- Cross-workspace access is suspected
- Audit history is unexpectedly missing
- A delivery worker repeatedly leaves rows in processing
- Database integrity or ownership invariants fail

Document timestamps in UTC, affected project references, and migration
versions. Do not include tenant financial values in public issues.
