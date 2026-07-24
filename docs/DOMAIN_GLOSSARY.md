# Siapin Domain Glossary

This glossary defines the shared language used across product discussions, UI
copy, TypeScript code, API contracts, and PostgreSQL. A term must keep the same
meaning across every layer.

If a proposed feature does not fit these definitions, update the glossary
through review before introducing a new table or reusing an existing term.

## Product boundary

Siapin is a private-first business planning and operations workspace. Its core
feedback loop is:

```text
Plan -> Goal -> Initiative -> Action -> Actual result -> Review
```

Community, collaboration discovery, import, and export are future optional
modules. They must not change the meaning of the core private-business terms.

## Identity and access

| Domain term | UI term | Database name | Definition |
| --- | --- | --- | --- |
| Profile | Profil pribadi | `profiles` | The identity of one authenticated person. |
| Profile preference | Preferensi | `profile_preferences` | Personal display and notification choices that do not belong to a business. |
| Workspace | Ruang usaha | `workspaces` | The private boundary containing one business's data and settings. |
| Workspace member | Anggota | `workspace_members` | An internal person who has access to a workspace. |
| Workspace invitation | Undangan | `workspace_invitations` | A time-limited request to become a workspace member. |
| Workspace role | Peran | `workspace_role` | Authorization level inside one workspace: owner, manager, member, or viewer. |
| Custom workspace role | Role akses | `workspace_roles` | A workspace-owned role such as Director or Staff that groups explicit permissions. |
| Permission definition | Permission | `permission_definitions` | A stable resource/action capability such as `transaction.read`. |
| Role permission | Akses role | `workspace_role_permissions` | Assignment of one permission to one workspace role. |

A user may belong to multiple workspaces. Business settings, capabilities, and
business data therefore belong to a workspace, never directly to a user.

## Business planning

| Domain term | UI term | Database name | Definition |
| --- | --- | --- | --- |
| Business plan | Rencana bisnis | `business_plans` | A time-bounded direction that groups goals, initiatives, and reviews. |
| Business goal | Target | `business_goals` | A desired business outcome, not the work used to achieve it. |
| Metric definition | Indikator | `metric_definitions` | A reusable definition of what is measured, including unit and aggregation behavior. |
| Goal target | Sasaran terukur | `goal_targets` | A metric and target value attached to one business goal. |
| Metric measurement | Realisasi | `metric_measurements` | An observed value at a specific point or period. |
| Business initiative | Program | `business_initiatives` | A coordinated strategy or program intended to advance one or more goals. |
| Action item | Tindakan | `action_items` | A concrete piece of work that can be assigned and completed. |
| Business review | Evaluasi | `business_reviews` | A user-authored assessment of results, lessons, and next decisions. |
| Review goal-target snapshot | Snapshot target evaluasi | `business_review_goal_target_snapshots` | The target definition and calculated actual captured for one review period. |
| Review financial snapshot | Snapshot finansial evaluasi | `business_review_financial_snapshots` | Revenue, expense, and net actuals captured per currency for one review period. |
| Review action-item snapshot | Snapshot tindakan evaluasi | `business_review_action_item_snapshots` | Action-item status and overdue counts captured for one review period. |
| Business portfolio | Portfolio usaha | `business_portfolios` | A private, curated presentation of finalized business-review evidence. |
| Portfolio review evidence | Bukti portfolio | `business_portfolio_reviews` | A finalized business review selected for inclusion in one business portfolio. |
| Achievement definition | Definisi pencapaian | `achievement_definitions` | A system-owned catalog entry describing one evidence-based badge. |
| Workspace achievement | Pencapaian usaha | `workspace_achievements` | A badge awarded automatically to a workspace with a finalized review as evidence. |

### Terms that must not be merged

- A **plan** groups direction; a **goal** describes a desired result.
- A **goal** is not a **metric**. The metric explains how progress is measured.
- An **initiative** is a strategy or program; an **action item** is executable work.
- An **action item** describes what must happen; a **calendar event** describes when something happens.
- A **business review** is business content; an **audit log** is an immutable technical record.

## Business operations

| Domain term | UI term | Database name | Definition |
| --- | --- | --- | --- |
| Transaction | Transaksi | `transactions` | A positive monetary magnitude whose `type` supplies direction and whose `cost_amount` is only the direct cost of a sale. |
| Financial account | Akun keuangan | `financial_accounts` | A workspace-owned place where transaction value is held or tracked, such as cash, bank, or e-wallet. |
| Transaction category | Kategori transaksi | `transaction_categories` | A hierarchical revenue or expense classification whose type must match the transaction. |
| Transaction category allocation | Alokasi kategori | `transaction_category_allocations` | A portion of one transaction classified under one transaction category. |
| Calendar event | Agenda | `calendar_events` | A scheduled occurrence, reminder, or appointment. |
| Action-item calendar link | Jadwal tindakan | `action_item_calendar_events` | An explicit relationship between executable work and one scheduled event. |
| Transaction initiative allocation | Alokasi transaksi | `transaction_initiative_allocations` | A portion of one transaction attributed to a business initiative. |
| Goal-target contribution | Kontribusi target | `transaction_goal_target_contributions` | A transaction-derived value that contributes to one measurable goal target. |
| Measurement transaction source | Sumber realisasi | `metric_measurement_transactions` | Evidence that a metric measurement was derived from a specific transaction. |
| Market product | Produk pantauan | `market_products` | A product whose market movement is observed; it is not yet inventory. |
| Market snapshot | Catatan tren | `market_snapshots` | A dated observation about a market product. |
| Business partner | Mitra | `business_partners` | An external party such as a supplier, customer, distributor, or logistics provider. |
| Contact message | Pesan kontak | `contact_messages` | A message submitted to the application operator, not an internal workspace conversation. |

A business partner does not receive workspace access. If a person needs
internal access, invite them as a workspace member.

`workspace_members.role` and `workspace_invitations.role` are compatibility
base roles. `workspace_role_id` plus `workspace_role_permissions` is the
authoritative access model.

## Reference and system data

| Domain term | Database name | Definition |
| --- | --- | --- |
| Business category | `business_categories` | Controlled classification of a workspace's business sector. |
| Workspace business category | `workspace_business_categories` | Many-to-many assignment of categories to a workspace. |
| Currency | `currencies` | ISO-style reference data for monetary codes and display metadata. |
| Country | `countries` | Reference data for country codes and default currencies. |
| Notification | `notifications` | An idempotent, user-facing domain event or reminder requiring awareness or action. |
| Notification preference | `profile_preferences` | A user's channel-independent choices for action, calendar, review, achievement, and reminder timing. |
| Email delivery | `email_deliveries` | One tracked transactional-email delivery attempt associated with a domain event. |
| Audit log | `audit_logs` | A system-authored record of who changed a protected entity and when. |

## Reserved future terms

These concepts are intentionally not implemented until their workflows and
authorization rules are approved:

- Workspace capabilities and capability setup
- Import/export plans, shipments, costs, and documents
- Presence status
- Community posts and collaboration requests

Do not create generic placeholders for these concepts. In particular, avoid
tables named `modules`, `items`, `details`, `activity`, `data`, or `records`.

## Canonical table inventory

These names are final unless an approved domain decision supersedes them:

```text
Core identity
├── profiles
├── profile_preferences
├── workspaces
├── workspace_members
├── workspace_invitations
├── workspace_roles
└── workspace_role_permissions

Business planning
├── business_plans
├── business_goals
├── metric_definitions
├── goal_targets
├── metric_measurements
├── business_initiatives
├── action_items
├── business_reviews
├── business_review_goal_target_snapshots
├── business_review_financial_snapshots
├── business_review_action_item_snapshots
├── business_portfolios
├── business_portfolio_reviews
├── achievement_definitions
└── workspace_achievements

Business operations
├── transactions
├── financial_accounts
├── transaction_categories
├── transaction_category_allocations
├── calendar_events
├── business_partners
├── business_partner_roles
├── action_item_calendar_events
├── transaction_initiative_allocations
├── transaction_goal_target_contributions
└── metric_measurement_transactions

Reference data
├── countries
├── currencies
├── business_categories
└── workspace_business_categories

System
├── permission_definitions
├── email_deliveries
├── notifications
├── audit_logs
└── contact_messages
```

## Naming across layers

Prefer a predictable mapping:

```text
UI: Rencana Bisnis
Domain type: BusinessPlan
Database table: business_plans
Foreign key: business_plan_id
API path: /business-plans
```

UI copy may be translated, but code and database identifiers remain in
English. When naming is uncertain, use the domain term from this glossary
before inventing a synonym.
