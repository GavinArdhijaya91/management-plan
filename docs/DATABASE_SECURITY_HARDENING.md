# Database Security Hardening and Validation

This phase applies continuously after each database or business-domain phase.
It reduces security debt before application logic starts depending on an unsafe
contract. It does not claim that the system can never contain a vulnerability.

## Protected assets

| Asset | Primary risk | Required boundary |
| --- | --- | --- |
| Workspace identity and membership | Tenant takeover or privilege escalation | Owner-controlled RBAC, immutable owner role, explicit membership lifecycle |
| Plans, goals, metrics, initiatives, and actions | Cross-workspace disclosure or unauthorized mutation | Workspace RLS plus restricted-plan visibility and granular permissions |
| Transactions and financial classification | Financial disclosure or falsification | Workspace RLS, explicit operation permissions, relational allocation limits |
| Reviews, snapshots, achievements, and portfolios | Rewriting historical evidence | RPC-only finalization, immutable snapshots, database-awarded achievements |
| Invitations and email delivery | Token replay, account confusion, infrastructure disclosure | Hashed token workflow, recipient binding, expiry, single active lifecycle |
| Notifications and audit logs | Forged evidence or private metadata leakage | Trigger/RPC writes, own-user reads, append-only audit boundary |
| Operational health and maintenance | Browser access to privileged maintenance | Service-role-only RPC execution |

## Trust boundaries

```text
anonymous browser
  -> invitation preview RPC only

authenticated browser
  -> public schema
  -> explicit table grants + RLS
  -> explicit RPC grants

public RPC (SECURITY DEFINER)
  -> fixed empty search_path
  -> auth.uid() and workspace authorization
  -> private helpers

trusted backend / scheduler
  -> service role
  -> email delivery and system operations
```

The `private` schema is never a browser API. A function used internally by an
RLS policy does not make its schema a supported client boundary.

## Role expectations

| Actor | Default expectation |
| --- | --- |
| Anonymous | No table access; only limited invitation preview |
| Outsider | No private workspace rows or workspace-scoped RPC authority |
| Suspended member | Session can explain suspension; no active workspace data |
| Viewer | Explicitly permitted reads only |
| Staff/member | Assigned or explicitly permitted work; no role administration |
| Manager | Operational permissions; no implicit ownership or restricted-plan bypass |
| Custom role | Only explicitly granted permission codes |
| Owner | Full authority inside its workspace, never another workspace |
| Service role | Infrastructure operations only from trusted server execution |

## Mandatory automated controls

Every database change must keep these contracts green:

1. Every public application table has RLS enabled.
2. Every public view uses `security_invoker`.
3. Browser roles cannot resolve the `private` schema.
4. Anonymous has no direct public-table privileges.
5. Anonymous cannot execute sensitive application RPCs.
6. Every `SECURITY DEFINER` function pins an empty `search_path`.
7. Evidence, audit, delivery, and lifecycle state remain RPC- or trigger-owned.
8. Owner, manager, member, viewer, suspended, outsider, and custom-role tests
   preserve workspace isolation and least privilege.
9. Invitation, ownership, idempotency, lifecycle, and concurrency contracts
   remain part of the clean-database CI run.

The adversarial access contract additionally submits valid foreign workspace,
plan, role, and member identifiers. It verifies that ownership in one tenant
does not authorize reads, writes, lifecycle RPCs, directory access, invitation
creation, membership administration, or audit access in another tenant. It
also verifies that actor-owned columns cannot be forged during direct writes.

## Authentication and session boundary

- Supabase `getUser()` is authoritative; cookies are never treated as verified
  identity by application code.
- Confirmation callbacks use the configured canonical site origin, never a
  request `Origin` or `Host` value.
- Post-authentication redirects accept application-page paths only. External,
  protocol-relative, backslash, control-character, `/auth`, `/api`, and
  framework-internal destinations are rejected.
- Every private top-level route is registered in the centralized session route
  classifier and still applies its server-side workspace boundary.
- The active-workspace cookie is an HTTP-only selection hint. Membership is
  reloaded from the database, suspended access is rejected, and logout removes
  the hint to prevent cross-account session confusion.

## Phase definition of done

- Threats and trust boundaries are updated when a new asset or actor appears.
- New mutations have an explicit authorization path and negative test.
- Cross-workspace identifiers cannot be used to read or mutate another tenant.
- New RPCs revoke default `PUBLIC` and `anon` execution before granting callers.
- New views use invoker security and expose only application-safe columns.
- Lifecycle/evidence records cannot be forged through direct table mutation.
- A database created from all migrations and the seed passes every pgTAP file.
- Application tests, type checking, linting, formatting, and build remain green.
