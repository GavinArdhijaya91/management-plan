# Release and Hosting Strategy

Siapin is currently an open-source, self-hostable preview. The repository does
not currently provide a managed hosted service, production SLA, or one-click
deployment promise.

## Product modes

| Mode | Current status | Intended user | Responsibility boundary |
| --- | --- | --- | --- |
| Account-free demo | Available | A person evaluating the workflow | Synthetic/local example data only; never implies persistence. |
| Developer self-host | Available as preview | A technical evaluator or contributor | Operator configures Supabase, secrets, email, backups, and upgrades. |
| Public staging | Planned | Invited usability testers | Maintainer-operated, disposable data, no production guarantee. |
| Managed hosted edition | Undecided | Non-technical owners and teams | Requires support, privacy, cost, retention, recovery, and sustainability decisions first. |

Self-hosting and a managed edition are different products operationally. A
Vercel button alone would not configure Supabase Auth, migrations, storage,
email delivery, scheduled operations, backup policy, or hosted security gates,
so it must not be presented as a complete one-click installation.

## Staged release gates

### Stage 0 — repository preview

- All repository quality and clean-database contracts pass.
- Demo routes remain isolated from Supabase and use visibly synthetic data.
- Setup docs identify every external dependency and secret owner.
- Public wording uses “preview”, not “production-ready”.

### Stage 1 — maintainer staging

- Dedicated staging Supabase project and deployment domain.
- Hosted Auth checks pass through `pnpm security:hosted`.
- Email confirmation, redirect allowlist, storage limits, and scheduled jobs are
  verified in the hosted environment.
- Synthetic seed only, documented reset cadence, no real business records.
- Smoke tests cover signup, workspace creation, invite acceptance, role denial,
  planning CRUD, logout, and account recovery.

### Stage 2 — invited pilot

- Privacy notice, acceptable-use policy, retention policy, incident contact,
  backup/restore rehearsal, and deletion workflow are operational.
- Accessibility audit covers keyboard, focus, labels, contrast, zoom, reduced
  motion, validation errors, and screen-reader landmarks on critical journeys.
- First-time-user research verifies that a non-technical owner can complete the
  core loop without repository knowledge.
- Usage limits and infrastructure cost alerts are defined.

### Stage 3 — production decision

- Decide whether the maintainer can sustainably operate a hosted edition.
- Define availability, support, data residency, recovery objectives, migration
  policy, pricing/subsidy, and exit/export commitments.
- Run a security review against the deployed system, not only source code.
- Announce general availability only after the release owner signs every gate.

## Accessibility and impact evidence

Supporting broad social access is a direction, not a completed claim. Track at
least:

- task completion and abandonment for first-time business planners;
- keyboard-only and assistive-technology completion of critical journeys;
- comprehension of planning terms in each advertised language;
- device/network constraints relevant to small businesses;
- whether factual market sources show provenance, period, geography, and
  freshness without prescribing an AI-generated decision.

User research must be consent-based and must not copy private workspace content
into public analytics or issue reports.
