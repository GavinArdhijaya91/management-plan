# Senior Review Follow-up

This ledger records the repository audit performed after the external senior
review. It deliberately separates verified implementation from product claims
and future work.

## Findings

| Review concern | Repository evidence | Verdict | Follow-up |
| --- | --- | --- | --- |
| Core Plan–Goal–Initiative–Action entities may be missing | All four tables, metrics, measurements, and reviews exist in `20260723010000_canonical_business_domains.sql`; later migrations add lifecycle and plan-to-actual contracts. | Review was based on an incomplete migration view. | Publish the contributor-facing ERD and keep it linked from the documentation index. |
| Role-by-table RLS coverage is unclear | `workspace_rbac_rls`, `planning_visibility_permissions`, `database_adversarial_access`, and security boundary contracts cover the actor classes and tenant isolation. | Implemented, but coverage was difficult to discover. | Maintain a public security-test matrix; expand a row whenever a new sensitive asset or actor appears. |
| There is no production deployment | The repository documents hosted security checks and operations, but intentionally has no production CD target. | Correct. No production-readiness claim is justified yet. | Use the staged release gates in the hosting strategy before announcing availability. |
| Test coverage cannot be assessed externally | CI exposes quality gates but no line-coverage badge; database tests are contract tests rather than line coverage. | Partially correct. | Document contract coverage explicitly; do not use a line percentage as a substitute for RLS scenario coverage. |
| Contributor entry points are weak | `CONTRIBUTING.md` and a PR template exist; public roadmap and issue forms do not. | Correct. | Add a milestone roadmap, scoped issue forms, and a documented `good first issue` standard. |
| “For everyone” is too broad | Product direction identifies a small-team owner as a hypothesis and acknowledges incomplete application journeys. | Correct risk. | Use bounded impact language and validate accessibility and onboarding before widening the audience claim. |
| Hosted versus self-hosted positioning is unclear | Setup is developer-oriented and requires Supabase configuration; no managed service is offered. | Correct. | Position the current release as a self-hostable preview; treat a hosted edition as a later product decision. |

## Claim boundary

Until staging evidence proves otherwise, public communication should say:

> Siapin is an open-source, self-hostable preview for owners and small teams who
> want to connect planning, execution, actual results, and review.

It must not yet claim that Siapin:

- is production-ready or generally available;
- serves every business or accessibility need;
- replaces accounting, legal, or financial advice;
- provides real-time market truth without source freshness and provenance;
- offers a hosted service, uptime commitment, or support SLA.

## Re-audit rule

Update this ledger at each public milestone. A concern moves to complete only
when its linked artifact and verification gate exist in the current repository;
intent or a database-only implementation is not sufficient evidence of a
complete user journey.

