# Security Policy

Thank you for helping keep Siapin safe — especially for small businesses who trust us with their private data.

> **Plain language version:** If you find a way to see or change data that should not be yours, please tell us privately so we can fix it before anyone is harmed. Do not share it publicly.

---

## Supported versions

Siapin is currently a **self-hostable preview** (pre-release). We only fix security issues on the latest commit of the `main` branch.

| Version                                 | Supported? |
| --------------------------------------- | ---------- |
| `main` (latest)                         | ✅ Yes     |
| Older commits, forks, archived branches | ❌ No      |

---

## How to report a vulnerability

**Do not** open a public issue, discussion, pull request, or commit message about a security problem.

Please use **GitHub Private Vulnerability Reporting**:

👉 https://github.com/GavinArdhijaya91/management-plan/security/advisories/new

If you cannot use that, open a minimal issue that says “security issue — please contact me privately” without details, and a maintainer will reach out.

### What to include (if you can)

- Where the problem is: route, table, RLS policy, RPC, or workflow
- Steps to reproduce (as short as possible)
- What you expected vs. what actually happened
- Who is affected — can one workspace see another workspace's data? Can a viewer do an owner action?
- Screenshots or logs **with all secrets, tokens, emails, and real data removed**

### What we will do

- Acknowledge your report when we are able to review it (we are a small team, but we take this seriously)
- Reproduce it privately
- Fix it and coordinate disclosure — we will not share your details without permission
- Credit you if you want it

### Please do not

- Access, copy, or keep data that is not yours
- Try to take the service down or spam it
- Test on real user workspaces — use your own test workspace and fake data

---

## What we care about most

These are **high priority**:

- Logging in as someone else, or bypassing login
- Seeing or changing data from another workspace or another user
- Becoming an owner/manager when you should be a viewer/member
- Bypassing Row Level Security (RLS) or RPC permission checks
- Changing audit logs, finalized reviews, or portfolio evidence without permission
- Uploading files to the wrong workspace, or reading another workspace's files
- Leaked secrets, tokens, or unsafe CI/CD that could expose data
- Injection, SSRF, or running code on the server

**Out of scope** (we will not treat these as security issues):

- Features that do not exist yet
- Bugs that only affect your own workspace with your own data
- Problems that require you to already have a maintainer's password
- Demo-only data at `/demo` (it is fake and isolated by design)
- Reports that only work if you already compromised the server in another way

---

## Current development setup — important context

Siapin today is a **development and portfolio project**. The Supabase project connected to this repo is a **shared development environment**, not a production service. Please treat it that way:

- **Only use fake, disposable data** for development and testing. Never put real personal or business data there.
- Some Supabase security features (like leaked-password protection) may not be available on the current free/dev plan. That is accepted for now, but will be enabled before any production deployment.
- `SECURITY DEFINER` functions in the database are intentional — they are small, locked doors that check who you are and which workspace you belong to before doing anything. An automated scanner warning about them does not automatically mean they are unsafe. Each one is allow-listed and tested.
- Only two things are intentionally visible without login:
  - `get_public_business_portfolio(text)` — reads an explicitly published portfolio
  - `get_workspace_invitation_preview(text)` — shows a minimal invitation preview for a token
    Everything else requires login and workspace membership.

**Before any production deployment**, maintainers must: create a separate production Supabase project, rotate all secrets, enable auth protections, lock redirect URLs, review rate limits and storage rules, run all tests, and do a fresh Security Advisor review.

**Never** put live project URLs, secret keys, database passwords, internal emails, or real customer data in issues, PRs, or docs.

---

## Reviewed Supabase Security Advisor notes

Supabase will warn about every `SECURITY DEFINER` function because it runs with extra privileges. In Siapin, we use these functions on purpose where a direct table write would skip important checks (permissions, lifecycle, audit, rate limits).

We keep a strict allow-list of which `SECURITY DEFINER` functions can be called by `authenticated` users. It lives in:

```
supabase/tests/database_security_boundaries.test.sql
```

If you add a new function, change its arguments, or change who can call it, you **must** update that test and get a review that checks:

- Is the caller authenticated?
- Is workspace membership and permission checked?
- Is `search_path` empty and are tables schema-qualified?
- Are role grants minimal?
- What data is returned — is it properly scoped?
- Is there a negative test proving another workspace is denied?

Service-level operations must never be callable by `anon` or `authenticated`.

---

## If a secret was leaked

If you accidentally committed a real secret (API key, password, token):

1. **Rotate / revoke it immediately** — do not wait to clean Git history
2. Remove it from code and history
3. Tell the maintainers privately so we can help check for misuse

When reporting, do not paste the real secret — a redacted ID is enough.

---

## Thank you

Security is not just code — it is trust. Small businesses share their plans and numbers with Siapin because they believe their data will stay private. Every careful report helps keep that promise.

If you are unsure whether something is a security issue, report it privately anyway. We would rather hear from you and say “thank you, but this is out of scope” than miss something important.
