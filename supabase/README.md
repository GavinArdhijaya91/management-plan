# Supabase PostgreSQL workflow

Before proposing a table, read the
[domain glossary](../docs/DOMAIN_GLOSSARY.md) and
[database conventions](../docs/DATABASE_CONVENTIONS.md).

1. Fill `.env.local` with the Project URL and publishable key.
2. Run `pnpm supabase login`.
3. Run `pnpm db:link --project-ref <project-ref>`.
4. Preview with `pnpm db:push --dry-run`.
5. Apply with `pnpm db:push`.
6. Generate TypeScript types using `lib/supabase/README.md`.

The initial migration creates PostgreSQL tables, constraints, indexes, triggers, workspace helpers, and RLS policies. `contact_messages` intentionally has no public insert policy. A rate-limited Route Handler will own public contact submission later.

Never run a linked database reset against production.

## Private business foundation

The second migration adds private profile and business settings:

- Profile preferences, display name, avatar path, and bio
- Business identity, address, currency, timezone, and map coordinates
- Business categories
- Active/suspended workspace memberships
- Workspace invitations
- Avatar and workspace-logo storage policies

Validate linked migrations before applying them:

```bash
pnpm db:status
pnpm db:dry-run
```

Only after reviewing the dry-run output:

```bash
pnpm db:push
pnpm db:types
```

`supabase/seed.sql` is development/staging-only. It creates deterministic,
passwordless Auth identities for SQL/RLS testing, prepares two isolated demo
workspaces, and logs `[seed.complete]` plus `[seed.personas.complete]`.

| Persona     | Local email                | Primary workspace access |
| ----------- | -------------------------- | ------------------------ |
| Owner       | `owner@siapin.local`       | Owner                    |
| Manager     | `manager@siapin.local`     | Manager                  |
| Staff       | `staff@siapin.local`       | Staff                    |
| Viewer      | `viewer@siapin.local`      | Viewer                   |
| Suspended   | `suspended@siapin.local`   | Suspended staff          |
| Outsider    | `outsider@siapin.local`    | None                     |
| Other owner | `other-owner@siapin.local` | Secondary workspace      |

These identities intentionally have no seeded passwords and cannot be used as
shared login credentials. Tests impersonate them through local JWT claims.
Create personal local Auth accounts separately when browser login is needed.

## Canonical business domains

The third migration implements the canonical ubiquitous-language model:

- Country and currency reference catalogs
- Business plans and goals
- Metric definitions, targets, and measurements
- Business initiatives and action items
- Periodic business reviews
- External business partners and their roles

Every tenant-owned table includes workspace-aware RLS and indexes. Composite
foreign keys prevent records from linking to a parent in another workspace.

## Database security tests

With the local Supabase stack running, execute:

```bash
pnpm db:test
```

The transactional test suite verifies:

- A non-member cannot promote itself to workspace owner
- Workspaces cannot be inserted directly without atomic owner creation
- Invitation tokens create the intended member exactly once
- The final active owner cannot be removed
- Protected mutations produce audit logs

## Workspace roles and professional invitations

RBAC is workspace-scoped:

- `workspace_roles` stores system and owner-created roles
- `permission_definitions` is the canonical permission catalog
- `workspace_role_permissions` maps permissions to roles
- `workspace_members.workspace_role_id` activates a role for one workspace
- Owner is the only role allowed to change roles and permission assignments

Invitation activation requires a matching, verified account and explicit
acceptance. Anonymous token holders can only read a limited invitation preview;
they cannot read workspace data. Invitation branding supports a public logo,
banner, and owner-controlled colors.

Collaboration mutations are exposed through atomic owner-only RPCs:

- `create_workspace_role`
- `update_workspace_role`
- `delete_workspace_role`
- `change_workspace_member_role`
- `set_workspace_member_status`
- `remove_workspace_member`
- `transfer_workspace_ownership`
- `resend_workspace_invitation`

Direct role, permission, and membership mutations have no authenticated write
policies. This keeps ownership and lifecycle invariants inside the database.

## Transactional email delivery

`email_deliveries` tracks invitation-email delivery without storing the raw
invitation token. The create/resend RPC returns the token once together with an
`email_delivery_id`; a server Route Handler sends the email and records the
provider result through service-role-only RPCs:

- `mark_email_delivery_processing`
- `mark_email_delivery_sent`
- `mark_email_delivery_failed`

Resending rotates the invitation token, cancels unfinished delivery records,
and creates a new delivery. Accepting, declining, revoking, or expiring an
invitation automatically cancels any delivery that has not completed.

## Plan-to-actual links

The private-business feedback loop uses explicit relationships:

```text
Action item <-> Calendar event
Transaction -> Business initiative allocation
Transaction -> Goal-target contribution
Metric measurement <- Source transactions
```

The schema intentionally avoids polymorphic foreign keys. Composite
workspace-aware foreign keys prevent cross-workspace links, while a deferred
constraint ensures initiative allocations never exceed the source transaction
amount.

Security-invoker reporting views expose:

- `initiative_financial_actuals`
- `goal_target_transaction_actuals`
- `goal_target_latest_measurements`

## Financial classification

Transactions belong to a `financial_account` and may be split across one or
more `transaction_categories` through explicit category allocations. Category
allocations may be partial, but their combined amount cannot exceed the source
transaction amount.

Each workspace receives one active default cash account and a starter set of
revenue and expense categories. Balances are calculated from opening balances
plus transactions; they are not stored as mutable totals.

The `financial_account_balances` view reports each account in its own currency.
It intentionally performs no foreign-exchange conversion. The
`transaction_category_actuals` view reports classified actuals by category and
period.

## Periodic business review cycle

A draft `business_review` can refresh period-bound snapshots before it is
finalized:

- `business_review_goal_target_snapshots` applies each metric's aggregation
  rule and captures target versus actual.
- `business_review_financial_snapshots` captures revenue, expense, and net
  actuals separately for each native currency.
- `business_review_action_item_snapshots` captures action status and overdue
  counts for the reviewed plan.

Use `refresh_business_review_snapshots` while preparing an evaluation and
`finalize_business_review` when its evidence is ready. Finalization refreshes
the snapshots atomically. Snapshot writes and lifecycle fields are RPC-only, so
clients cannot silently rewrite finalized evaluation evidence.

The security-invoker `business_review_summaries` view provides compact review
progress without replacing the underlying immutable snapshots.

## Private portfolio and achievements

`business_portfolios` curates finalized reviews through
`business_portfolio_reviews`. Portfolios remain inside the workspace boundary;
this migration does not introduce public URLs, discovery, or community data.

Built-in badges are defined by `achievement_definitions` and awarded to
`workspace_achievements`. Awards are evaluated only from finalized review
evidence. Clients may read awards but cannot insert, modify, or delete them.

Initial achievement rules cover:

- First finalized review
- Three finalized reviews
- A review where every target has an actual measurement
- A review with completed actions and no overdue actions

`business_portfolio_evidence` and `workspace_achievement_details` are
security-invoker views for application reads.

## Notification and reminder automation

Notifications use a per-user `event_key` for idempotency. Re-running reminder
generation therefore does not create duplicate notifications for the same
action deadline, calendar occurrence, review period, or achievement.

`profile_preferences` controls action, calendar, review, and achievement
notifications together with a configurable reminder lead time. Call
`generate_my_workspace_reminders` when a user opens or refreshes a workspace.
The same private generator can later be invoked by a trusted scheduled backend
without changing notification semantics.

Review finalization and achievement awards create notifications immediately.
Clients can only mutate `read_at`, either directly under RLS or through:

- `mark_notification_read`
- `mark_all_notifications_read`

## Idempotency and concurrency

Backend mutations must use the database contract that matches their retry
semantics:

- `create_workspace` treats `(created_by, slug, name)` as a natural retry. The
  same owner and payload receive the existing workspace ID.
- `create_transaction` requires a client-generated UUID
  `request_idempotency_key`. Identical retries receive the first transaction
  ID; a different payload with the same key is rejected.
- `accept_workspace_invitation` locks the token row and returns the same
  workspace when the accepting recipient retries.
- `transfer_workspace_ownership` locks every workspace membership. Supplying a
  `request_idempotency_key` lets the original owner safely retry after being
  demoted.
- `finalize_business_review` locks the review and treats an already-finalized
  review as a successful retry without refreshing evidence again.
- reminder and lifecycle notifications use `(user_id, event_key)` uniqueness.

Request fingerprints and results live in `private.idempotency_records`, not in
business-domain tables. Keys are scoped by actor and operation, expire after
24 hours, and must never be repurposed for a different payload.

## Database security tests

`supabase/tests/database_security.test.sql` covers cross-domain constraints,
invitation acceptance, ownership protection, audit logging, review
finalization, and reminder idempotency.

`supabase/tests/workspace_rbac_rls.test.sql` is the focused authorization
matrix. It verifies two-workspace isolation and the effective access of owner,
manager, staff, viewer, a custom permission role, a suspended member, and an
outsider.

`supabase/tests/workspace_invitation_lifecycle.test.sql` verifies normalized
recipient email, hashed and single-use tokens, duplicate prevention, recipient
matching, verified-email enforcement, accept/decline/revoke/expiry terminal
states, canonical role assignment, resend token rotation, and transactional
email replacement.

`supabase/tests/workspace_ownership_invariants.test.sql` verifies that each
workspace always has exactly one active owner, failed transfers are atomic,
only an owner can transfer authority, the successor must be an active member,
and outgoing owners receive either the default manager role or an explicit
non-owner fallback role.

`supabase/tests/seed_personas.test.sql` verifies that the local seed contains
all seven identities, both isolated workspaces, canonical role mappings, the
suspended state, and an outsider with no tenant access.

`supabase/tests/idempotency_contracts.test.sql` verifies natural-key retries
for workspace creation, request-key deduplication for transactions and
ownership transfers, payload mismatch rejection, idempotent review
finalization, and notification uniqueness.

`supabase/tests/query_index_contracts.test.sql` protects query-path indexes for
invitation expiry, queued email delivery, reminders, and unread notifications.
It also verifies that deliberately removed duplicate indexes remain covered by
their leading-column unique constraint indexes.

`supabase/tests/system_operations_contracts.test.sql` verifies service-role-only
access, expired-record detection and cleanup, and idempotent maintenance
retries.

Run every suite against an isolated local Supabase database:

```bash
pnpm exec supabase start
pnpm db:test
pnpm exec supabase stop --no-backup
```

The tests execute inside transactions and roll back their deterministic
fixtures. The database CI job repeats this process from a clean local stack for
every pull request and push to `main`. Never point database tests at a
production project.

Each SQL contract emits a one-test TAP plan for `pg_prove`. Assertions remain
transactional `raise exception` guards; the final TAP pass is emitted only when
every guard in that file succeeds.

Authenticated table privileges mirror the operations exposed by final RLS
policies. RLS still decides which rows are visible or mutable. Lifecycle,
notification-content, and finalized-review evidence fields retain narrower
column or RPC-only privileges as defense in depth.

## Query performance baseline

Use the linked-project inspection commands only as read-only diagnostics:

```bash
pnpm exec supabase inspect db index-stats --linked
pnpm exec supabase inspect db table-stats --linked
pnpm exec supabase inspect db outliers --linked
```

An index with zero scans is not automatically redundant. Development and newly
provisioned databases may have no representative workload yet. Remove an index
only when its columns and ordering are covered by another index and the
dependent foreign-key and application query paths have been checked.

## System operations

The service-role-only `get_system_health_snapshot` RPC reports operational
counters without exposing tenant data. `run_system_maintenance` expires pending
invitations and removes expired idempotency and notification rows. It is safe
to retry and never deletes audit logs or business-domain history.

Scheduling, backup retention, restore drills, and incident boundaries are
documented in [Database Operations](../docs/DATABASE_OPERATIONS.md).

## Planning visibility and granular permissions

Planning authorization separates workspace permission from record visibility.
`workspace` plans require `plan.read`; `restricted` plans additionally require
an owner, role grant, or member grant. Grants never add write permission, and a
suspended member remains denied.

Planning writes use granular permissions for plans, goals, metrics,
initiatives, assigned actions, all actions, and review finalization.
`plan.write` remains only as a compatibility marker for older custom roles and
is not used by new Planning RLS policies.

## Planning lifecycle

Planning records always enter through one initial state: `draft` for plans and
goals, `planned` for initiatives, and `todo` for action items. Clients edit
ordinary content through RLS but move lifecycle state only through:

- `transition_business_plan`
- `transition_business_goal`
- `transition_business_initiative`
- `transition_action_item`
- `set_planning_record_archived`

Plan activation requires at least one non-archived goal. Missed goals require a
reason and a replacement target date when reopened. Blocked actions require a
reason, while cancellation requires a reason and cannot leave unresolved
actions underneath an initiative. An assignee and due date are mandatory for
every action item.

The archive operation is recoverable. Restoring a goal, initiative, or action
returns it to `draft`, `planned`, or `todo`; audit metadata records who archived
or reopened it. Permanent deletion and finalized-evidence protection belong to
later lifecycle stages and are intentionally not inferred by these RPCs.

`supabase/tests/planning_lifecycle.test.sql` is the executable transition
contract. It guards activation prerequisites, transition edges, required
reasons, unresolved-action cancellation, direct-status-write denial, and
archive restoration.
