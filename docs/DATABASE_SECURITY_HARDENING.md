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
- Local Auth configuration explicitly enables refresh-token rotation, disables
  anonymous sign-in, limits sign-in/sign-up and verification traffic, requires
  email confirmation, and protects password and email changes.
- Signup validation requires a 10–72 character password containing lowercase,
  uppercase, numeric, and symbol characters. Login remains compatible with
  existing accounts while the hosted password policy is rolled out.
- Authentication input lengths are bounded in both browser forms and
  server-side schemas. Login and signup failures do not disclose whether an
  email address already owns an account.
- Auth identity provisioning independently bounds untrusted user metadata,
  creates default preferences, grants no implicit workspace membership, and
  keeps profile identity fields synchronized with `auth.users`.
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

The hosted Supabase project must mirror the repository baseline before a
production release. Verify email confirmation, double-confirmed email changes,
secure password changes, refresh-token rotation, Auth endpoint rate limits, and
the strongest available password policy in the Supabase dashboard. Enable
leaked-password protection when the selected plan supports it. CAPTCHA remains
a separate deployment integration because it requires a provider choice and
server-side secrets; it must not be represented as active until those keys are
configured and the challenge token is passed to Supabase Auth.

## HTTP and API boundary

- A global Content Security Policy limits scripts, styles, connections, images,
  forms, frames, workers, and object embedding to the origins required by
  Next.js and Supabase. Development-only sources are excluded in production.
- Clickjacking, MIME sniffing, permissive referrers, browser capabilities, and
  insecure production transport are restricted through response headers.
- API helpers default to `Cache-Control: no-store` and a stable JSON envelope.
- Public health checks expose liveness only. They do not reveal environment,
  database configuration, timestamps, dependency versions, or secrets.
- SVG image responses remain attachment-only with their own restrictive
  sandbox CSP.

## Storage asset boundary

- User-generated assets are limited to JPEG, PNG, and WebP; SVG is never an
  accepted upload MIME type.
- Avatar paths are bound to the owning profile identity. Logo and banner paths
  are bound to the owning workspace, preventing cross-tenant asset references.
- Avatar inserts bind both the object folder and Storage ownership metadata to
  `auth.uid()`.
- Workspace logo and branding policies preserve their distinct manager and
  owner boundaries.
- Public delivery is intentional for display assets; anonymous upload, update,
  and deletion remain forbidden.

## Dependency and CI supply chain

- Production dependencies must pass `pnpm security:audit`; the CI quality job
  fails on every known production advisory, including low severity.
- GitHub Actions are pinned to reviewed full commit SHAs. Version comments keep
  Dependabot updates understandable without trusting a mutable tag at runtime.
- Dependabot monitors both pnpm dependencies and GitHub Actions every week.
- Runtime tooling that is not imported by the application must not remain in
  `dependencies`; unused CLIs are removed rather than shipped.
- A current development-only `brace-expansion` advisory remains upstream-bound
  through ESLint 9 plugins. Forcing the patched major breaks `minimatch` and
  ESLint 10 is not yet supported by the Next.js plugin set. Production audit is
  clean; this residual must be reevaluated when those plugins add ESLint 10
  support.

## Phase definition of done

- Threats and trust boundaries are updated when a new asset or actor appears.
- New mutations have an explicit authorization path and negative test.
- Cross-workspace identifiers cannot be used to read or mutate another tenant.
- New RPCs revoke default `PUBLIC` and `anon` execution before granting callers.
- New views use invoker security and expose only application-safe columns.
- Lifecycle/evidence records cannot be forged through direct table mutation.
- A database created from all migrations and the seed passes every pgTAP file.
- Application tests, type checking, linting, formatting, and build remain green.
