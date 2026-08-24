# Good First Issue Candidates

This catalog gives maintainers review-ready starter tasks. It is not an issue
tracker substitute: create a GitHub issue from the scoped-task form, confirm
the paths are still current, and apply `good first issue` only after a
maintainer accepts the stated boundary.

Starter work must not require production credentials, real user data, a new
database migration, or independent security design.

## Add automated Markdown link checking

**Problem:** Documentation links are reviewed manually, so renamed files can
leave contributor paths broken.

**In scope:** Add a deterministic command that checks relative links in tracked
Markdown files and include it in the repository quality workflow.

**Likely files:** `package.json`, `.github/workflows/ci.yml`, and a focused
script under `scripts/` if the selected checker needs project-specific rules.

**Acceptance criteria:**

- The command checks tracked Markdown without crawling external websites.
- A fixture or unit test proves that a missing relative target fails.
- Fragment-only and valid repository-relative links do not produce false
  failures.
- `pnpm verify` and CI invoke the same command.

## Document one planning term in every active dictionary

**Problem:** A new user may encounter a planning term whose short explanation
is inconsistent across supported languages.

**In scope:** Select one existing term from `docs/DOMAIN_GLOSSARY.md`, add or
correct its helper copy in every active dictionary, and render that copy in one
existing UI location.

**Likely files:** `app/_i18n/dictionaries.ts`, the existing planning component
that displays the term, and its unit test.

**Acceptance criteria:**

- The code identifier remains English and matches the glossary.
- Every active dictionary contains the same key.
- The explanation does not introduce a new business promise.
- The affected component has a missing-key or rendering regression test.

## Add reduced-motion coverage for one reveal component

**Problem:** Motion behavior is implemented, but a focused regression test
should prove that one representative reveal remains usable when reduced motion
is requested.

**In scope:** Add a Playwright assertion for one existing public-page reveal;
do not redesign animation primitives.

**Likely files:** the relevant public component and `e2e/accessibility-shell.spec.ts`.

**Acceptance criteria:**

- The test uses Playwright's reduced-motion emulation.
- Content remains visible and actionable without waiting for animation.
- Default-motion behavior remains unchanged.
- The assertion does not depend on timing-sensitive screenshots.

## Improve synthetic demo-data disclosure

**Problem:** Every demo surface must make it clear that its records are examples
and are not factual workspace or market data.

**In scope:** Audit one demo route and add the standard disclosure only where it
is absent; do not alter authenticated routes or data sources.

**Likely files:** one route under `app/demo/`, the shared demo shell if the
message belongs there, and the matching E2E test.

**Acceptance criteria:**

- The disclosure is visible without opening a tooltip.
- Copy explicitly says the data is an example or synthetic.
- The disclosure is associated with the affected content, not only the footer.
- An accessibility assertion finds it by semantic text or role.

## Maintainer publishing checklist

Before applying `good first issue`, confirm:

- the task still reproduces on the default branch;
- one focused pull request can complete every criterion;
- no unresolved architecture or product decision is delegated to the
  contributor;
- a maintainer can explain how to run the relevant checks;
- the issue links the domain, design, or security document that governs it;
- no private screenshots, tokens, workspace content, or production access are
  required.
