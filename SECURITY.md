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

## Credential exposure

If a real credential is exposed, revoke or rotate it immediately before
rewriting Git history. Never place the credential itself in a vulnerability
report when a redacted identifier is sufficient.
