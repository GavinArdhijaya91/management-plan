# Siapin Documentation

This folder keeps the deeper domain, database, security, operations, and
release notes. The root README is intentionally lighter; technical details live
here.

## Start Here

- [Domain glossary](./DOMAIN_GLOSSARY.md) - official terms such as plan, goal,
  initiative, action, metric, actual result, review, and workspace.
- [Planning domain ERD](./PLANNING_DOMAIN_ERD.md) - the core relationships and
  lifecycle behind Plan -> Goal -> Initiative -> Action -> Actual result ->
  Review.
- [Good first issue candidates](./GOOD_FIRST_ISSUES.md) - task ideas that can
  become beginner-friendly issues.
- [Senior review follow-up](./SENIOR_REVIEW_FOLLOW_UP.md) - claim boundaries,
  audit findings, and project follow-up.

## Database And Security

- [Database conventions](./DATABASE_CONVENTIONS.md) - migration, naming, RLS,
  constraint, index, and review rules.
- [Data access contract](./DATA_ACCESS_CONTRACT.md) - boundaries between
  tables, views, RPCs, reports, and demo data.
- [Database security hardening](./DATABASE_SECURITY_HARDENING.md) - threat
  model, trust boundary, and security definition of done.
- [Security test matrix](./SECURITY_TEST_MATRIX.md) - actor, asset, permission,
  and test-contract coverage.
- [Hosted security configuration](./HOSTED_SECURITY_CONFIGURATION.md) - security
  gates for hosted environments.
- [Database operations](./DATABASE_OPERATIONS.md) - operations, backup, restore,
  maintenance, and incident boundaries.

## Release And Assets

- [Release and hosting strategy](./RELEASE_AND_HOSTING_STRATEGY.md) -
  self-hosted preview positioning, staging gates, and production boundaries.
- [Asset and SEO guide](./ASSET_AND_SEO_GUIDE.md) - WebP, Open Graph image,
  metadata, sitemap, robots, and SVG safety.

## Audits

- [Database semantic audit](./DATABASE_AUDIT_2026-07-23.md) - terminology,
  compatibility fields, and schema corrections.

When adding a new document, keep this index short and useful for contributors
who are reading the project for the first time.
