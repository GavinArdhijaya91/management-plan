# Contributing to Siapin

Thank you for wanting to help. That already means a lot.

Siapin is a small, open workspace for helping small businesses plan better, do the work, check what really happened, and learn for next time. The best contributions make that loop **clearer, safer, and easier** for real people — not just for engineers.

You do not need to be an expert to contribute. Clearer words, better docs, bug reports, and accessibility checks are real, valued contributions.

---

## Before you start — 3 quick reads

1.  **[README.md](./README.md)** — what Siapin is and why it exists (5 minutes)
2.  **[ROADMAP.md](./ROADMAP.md)** — what we are focusing on right now
3.  **[Domain Glossary](./docs/DOMAIN_GLOSSARY.md)** — the words we use everywhere (Plan, Goal, Initiative, Action, Review). One word = one meaning, in UI, code, and database.

If you want a task right away, see [Good First Issues](./docs/GOOD_FIRST_ISSUES.md).

---

## Ways to contribute (all are welcome)

- **Words & docs** — fix a typo, make a sentence clearer, translate UI copy, improve a guide
- **Bug reports** — tell us what broke and how to reproduce it
- **Ideas & feedback** — suggest a better flow or wording (open an issue first for bigger ideas)
- **Design & accessibility** — check keyboard navigation, contrast, or mobile layout
- **Code & tests** — fix a bug, add a test, improve a small feature

> New to open source? Start with docs or a bug report. Those help us a lot and are a great way to learn the project.

---

## How to set up the project on your computer

You need **Node.js 22.13+**, **Git**, and **pnpm** (via Corepack).

```bash
git clone https://github.com/GavinArdhijaya91/management-plan.git
cd management-plan
corepack enable pnpm
pnpm install
cp .env.example .env.local   # on Windows PowerShell: Copy-Item .env.example .env.local
```

Open `.env.local` and add your Supabase dev values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SECRET_KEY=
```

Then set up the database and run the app:

```bash
pnpm db:link
pnpm db:push
pnpm dev
```

Open http://localhost:3000 — try `/demo` first (no account needed), then create an account to test the full loop.

Never commit `.env.local`, passwords, tokens, or real business data.

---

## How we work together

### 1. Find or open an issue

- Look for an existing issue that matches your idea, or open a new one.
- For **big ideas or new features**, open an issue first so we can discuss scope before you code.
- For **small fixes** (typo, small bug), you can go straight to a pull request — just link the issue if there is one.

Use the issue templates in `.github/ISSUE_TEMPLATE/` — they keep things clear for everyone.

### 2. Make your change

- Create a branch from `main`: `git checkout -b fix/clearer-error-message`
- Keep it focused — one pull request = one idea. Do not mix a feature + a big refactor + formatting changes.
- Use simple, human words in UI. Code and database names stay in English and follow the [Domain Glossary](./docs/DOMAIN_GLOSSARY.md).

### 3. Check your work before you push

Run these — they are the same checks that run in CI:

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
```

If you changed UI or user flows:

```bash
pnpm test:e2e
```

If you changed the database, migrations, RLS, or RPCs:

- Read [Database Conventions](./docs/DATABASE_CONVENTIONS.md) and [Security Test Matrix](./docs/SECURITY_TEST_MATRIX.md)
- Create a **new** migration (never edit one that was already applied)
- Regenerate types after schema changes: `pnpm db:types` → updates `lib/supabase/database.types.ts`
- Add tests for both **allowed** and **denied** access

Quick full check:

```bash
pnpm verify
```

### 4. Open a pull request

Fill in the PR template (`.github/pull_request_template.md`). A good PR answers:

- **What problem does this solve?** (one or two sentences)
- **Who benefits?** (owner, teammate, contributor, etc.)
- **What changed?** (files or areas)
- **How can a reviewer check it?** (steps or screenshots)
- **Does it touch data or security?** (auth, RLS, workspace isolation)

Add screenshots or a short video for UI changes. Keep the PR small so it is easy to review.

### 5. Review & merge

- A maintainer will review when they can. Be patient — we are a small team.
- You may get kind, direct feedback. It is not personal — we want the change to be safe and clear for everyone.
- Once approved and CI is green, a maintainer will merge.

---

## Rules we care about

We keep these rules because private business data must stay private.

**Do:**

- Use **fake data** for development and tests — never real business data or real emails
- Keep workspace data isolated — one workspace must never see another workspace's data
- Ask for help if you are tempted to disable Row Level Security to make a query work
- Report security issues privately via [SECURITY.md](./SECURITY.md), not in a public issue

**Do not:**

- Commit `.env.local`, secrets, tokens, or passwords
- Copy real customer data into issues, PRs, or screenshots (blur or replace it)
- Hard-delete community posts or reviews through the browser — use the proper lifecycle (archive, etc.)
- Add tables named `data`, `items`, `records`, etc. — use the real domain word from the glossary

---

## Code style — keep it simple

- Write code that a new contributor can read without asking for help.
- Prefer clear names over short names.
- UI text should sound human — like you are explaining to a small business owner, not an engineer.
- Do not overclaim. Siapin is a **self-hostable preview**, not a production service with an SLA. Keep that honest in docs and UI.
- Format with Prettier (`pnpm format`) and follow the existing ESLint rules.

---

## If you get stuck

- Open a draft PR and ask a question
- Comment on the issue you are working on
- Or see [SUPPORT.md](./SUPPORT.md) for other ways to ask for help

There is no silly question here. If something is confusing, it probably means our docs need to be better — and telling us is already a contribution.

Thank you for making Siapin more useful for small businesses. 🌿
