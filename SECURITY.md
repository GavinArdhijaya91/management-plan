# Security Policy

## Supported version

Siapin is currently pre-release software. Security fixes are applied only to
the latest commit on the default branch.

| Version                                     | Supported |
| ------------------------------------------- | --------- |
| `main`                                      | Yes       |
| Older commits, forks, and archived branches | No        |

## Reporting a vulnerability

Do not disclose a suspected vulnerability in a public issue, discussion, pull
request, or commit message.

Use
[GitHub private vulnerability reporting](https://github.com/GavinArdhijaya91/management-plan/security/advisories/new)
and include:

- the affected route, table, policy, RPC, workflow, or dependency;
- the prerequisites and minimal reproduction steps;
- the expected and observed authorization boundary;
- the potential impact, including whether another user or workspace is
  affected;
- logs or screenshots with credentials, tokens, personal information, and
  business data removed.

Maintainers will acknowledge a complete report when repository activity
permits, reproduce it privately, and coordinate remediation before public
disclosure. Do not access data that is not yours, degrade service availability,
or retain sensitive data while testing.

## Scope

High-priority reports include:

- authentication or session bypass;
- cross-workspace or cross-user data access;
- privilege escalation in workspace roles or invitations;
- Row Level Security or RPC authorization bypass;
- unauthorized mutation of audit, review, portfolio, or lifecycle evidence;
- storage upload, ownership, or cross-tenant asset violations;
- exposed credentials or unsafe CI/CD execution;
- injection, server-side request forgery, or arbitrary code execution.

Demo-only behavior, missing product features, unsupported old commits, and
findings that require a compromised maintainer account without another
security boundary bypass are generally out of scope.

## Development environment limitations

Siapin is currently an open-source portfolio and development project. The
connected Supabase project is a shared development environment, not a
production service intended to store real personal, financial, or business
data.

The following limitations are accepted during this phase:

- development and test environments must contain synthetic or disposable data
  only;
- Supabase features that require a paid plan, including leaked-password
  protection when unavailable on the active plan, are not treated as enabled
  safeguards;
- `SECURITY DEFINER` functions are intentional database boundaries only when
  they authenticate the caller, enforce workspace scope and permissions, use a
  controlled `search_path`, expose the minimum role grants, and are covered by
  database contract or adversarial tests;
- anonymous access is limited to explicitly public, token-scoped flows such as
  an invitation preview and must not reveal private workspace data;
- a Supabase Security Advisor warning is reviewed against the current migration
  history and function signature before it is accepted or remediated.

This limitation is not a production security waiver. Before any public
deployment, maintainers must create an isolated production project, rotate all
environment credentials, enable the available authentication protections,
configure exact redirect origins, review rate limits and storage policies, run
the complete verification suite, and perform a fresh Security Advisor review.

Repository documentation must never include live project URLs, access tokens,
secret keys, database passwords, internal email addresses, or real customer
data.

## Reviewed Supabase Security Advisor findings

Supabase reports executable `SECURITY DEFINER` functions because these
functions run with the function owner's privileges. In Siapin, such functions
are intentional RPC boundaries only when direct table writes would bypass
authorization, lifecycle, audit, idempotency, or concurrency invariants. An
Advisor warning is therefore a mandatory review signal, not an instruction to
bulk-convert functions to `SECURITY INVOKER` or revoke application access.

The database security boundary contract maintains an exact, signature-aware
allowlist of public `SECURITY DEFINER` functions executable by `authenticated`.
It also permits only these anonymous capabilities:

- `get_public_business_portfolio(text)` for explicitly published portfolio
  reads;
- `get_workspace_invitation_preview(text)` for a token-scoped, minimal
  invitation preview.

Any added function, overload, argument-type change, or role grant must update
the allowlist in `supabase/tests/database_security_boundaries.test.sql`. Such a
change requires review of caller authentication, workspace and permission
checks, empty `search_path`, schema-qualified object references, minimum role
grants, returned data, and negative cross-workspace tests. Service operations
must remain inaccessible to `anon` and `authenticated`.

The hosted Auth warning for leaked-password protection is accepted only while
the active development plan does not provide that feature. Enable it before a
public production deployment whenever the selected Supabase plan supports it.

## Credential exposure

If a real credential is exposed, revoke or rotate it immediately before
rewriting Git history. Never place the credential itself in a vulnerability
report when a redacted identifier is sufficient.
