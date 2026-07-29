# Siapin Product Direction

This document defines the product direction that should guide requirements,
application flows, and implementation priorities. It does not introduce a new
feature. It turns the existing private-business domain into one coherent
product promise.

## Positioning

Siapin is a private-first business planning workspace that connects plans,
execution, actual results, and review.

The concise user promise is:

> Do not stop at writing a business plan. Use Siapin to execute it, measure the
> actual result, and evaluate what should happen next.

This extends the original principle without replacing it:

> Plan it first, then make it happen.

## Core feedback loop

```text
Plan
  -> Goal and measurable target
  -> Initiative
  -> Action
  -> Actual result
  -> Review
  -> Next decision
```

Each step has a distinct domain meaning:

- A **business plan** establishes a time-bounded direction.
- A **business goal** describes the desired outcome.
- A **goal target** makes that outcome measurable.
- A **business initiative** describes the strategy or coordinated program.
- An **action item** describes concrete work.
- An **actual result** records what was observed, not what was expected.
- A **business review** records the evaluation and resulting decision.

The loop is incomplete when the application only stores a plan or task list.
The product becomes useful when a user can compare a target with trustworthy
actual evidence and carry the lesson into the next decision.

## Primary user hypothesis

The first validation target is an owner working with a small team who currently
spreads planning, transactions, tasks, and periodic evaluation across separate
documents or applications.

This is a hypothesis, not a claim that the market has already been validated.
The product must remain accessible to a first-time business planner while its
workspace, permission, and evidence model can support more experienced teams.

Possible later segments include early-stage startups, business consultants,
and small organizations. Enterprise-specific integrations, compliance, and
service guarantees are outside the current product promise.

## Product differentiation

Siapin does not claim that any single component is globally unique. Its
differentiation is the deliberate combination of:

```text
private workspace
+ business planning
+ permission-aware execution
+ plan-to-actual linkage
+ periodic review
+ immutable finalized evidence
+ curated portfolio evidence
```

This combination keeps Siapin distinct from a generic project manager,
accounting application, static business-plan template, or public professional
network.

## Plan-to-actual principle

Metrics use a hybrid strategy:

- Transaction-derived actuals provide evidence when the metric has a valid
  financial source.
- Manual measurements support non-financial observations and reconciliation.
- Each metric definition must identify its authoritative source.
- A secondary source is a comparison signal, not an automatic overwrite.
- Material differences produce a warning for an authorized reviewer.
- Finalizing a business review freezes the evidence snapshot used by that
  review.

Hybrid does not mean averaging every source. Combining values is only valid
when their unit, period, aggregation rule, and business meaning are compatible.

## Privacy and evidence boundary

Workspace business data is private by default. Authentication, active
membership, plan visibility, and explicit permissions remain authoritative.

A portfolio may curate finalized evidence, but it must not expose raw workspace
data automatically. Public portfolio or community capabilities remain separate,
explicit, opt-in future work.

Achievements are evidence-based system outcomes. They are not arbitrary badges
that a user can award to themselves.

## Current application coverage

The following audit reflects the current `app/` and server-side application
integration:

| Journey stage | Current state | Evidence |
| --- | --- | --- |
| Try the product | Integrated | `/demo/*` provides an isolated, account-free journey with explicitly local example data. |
| Sign up and authenticate | Integrated | Auth actions, callback handling, cookie session refresh, and private-route checks exist. |
| Create or select workspace | Integrated | Workspace setup and selection use authenticated server actions and canonical workspace access. |
| Create business plan | Integrated | `/planning` writes a draft plan to Supabase. |
| Create goal | Integrated | `/planning` creates a goal under its plan. |
| Create initiative | Integrated | `/planning` creates a linked or explicitly unlinked initiative. |
| Create and assign action | Integrated | `/planning` creates action items using permission-aware member choices. |
| Run lifecycle transitions | Integrated | Plan, goal, initiative, action, and archive mutations use canonical RPCs. |
| Define metric and goal target | Database-ready | Tables and security contracts exist; the application flow is not integrated. |
| Record and reconcile actual | Database-ready | Measurement and transaction linkage exist; the application flow is not integrated. |
| Prepare and finalize review | Database-ready | Review lifecycle and immutable snapshots exist; the application flow is not integrated. |
| Curate portfolio evidence | Database-ready | Private portfolio and evidence contracts exist; the application flow is not integrated. |
| Award achievements | Database-ready | Database-owned achievement rules exist; the application display flow is not integrated. |
| Business operations pages | Partial | Private routes read Supabase workspace data; demo CRUD remains isolated under `/demo/*` while some private write workflows are still pending. |

`Database-ready` means that schema, authorization, and contracts exist. It does
not mean the user journey is complete.

## Next vertical slice

The next business-logic phase should complete one narrow path in this order:

1. Add a metric definition to an existing workspace.
2. Attach a measurable goal target to an existing business goal.
3. Record an actual measurement and show its source.
4. Display target versus actual for one compatible period.
5. Create a business review for the plan.
6. Finalize the review through the canonical RPC.
7. Display the immutable review evidence.

Only after this slice works end to end should portfolio presentation and
achievement display become application priorities.

## Definition of done for the slice

The slice is complete when:

- A beginner can understand the sequence without knowing the database model.
- Every mutation validates input at the application boundary.
- Database RLS and RPC authorization remain authoritative.
- Restricted-plan visibility applies to all derived reads.
- Metric unit, period, source, and aggregation are explicit.
- Retry-sensitive mutations are idempotent where required.
- Finalized review evidence cannot be silently rewritten.
- Expected failures produce actionable user-facing messages.
- Unit, database-contract, and end-to-end smoke tests cover the happy path and
  unauthorized path.

## Explicit non-goals

The following remain outside the current vertical slice:

- Lead generation or CRM workflows
- Public community posts and collaboration threads
- Import/export operations
- Presence status
- Public portfolio publishing
- Enterprise integrations

Research templates may help refine product hypotheses and positioning, but they
must not silently expand the application boundary.
