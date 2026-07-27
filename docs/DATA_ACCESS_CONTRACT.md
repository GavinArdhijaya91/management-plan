# Data Access Contract

This document is the application boundary for the Supabase schema. It prevents
database rows, reporting views, and local demo view-models from being treated as
the same object.

## Non-negotiable rules

1. Import database shapes from `lib/supabase/domain-types.ts`, never recreate
   them in `types/`.
2. Types prefixed with `Demo` are local-storage presentation models. They must
   not be passed directly to `.insert()` or `.update()`.
3. Database enum values remain English. Translation happens in UI mappers.
4. Monetary `transactions.amount` is always positive. Direction comes from
   `transactions.type`.
5. `transactions.cost_amount` is the direct cost of a sale. It is not business
   capital, account balance, or an expense transaction.
6. Never aggregate amounts across different `currency_code` values.
7. Authorization comes from `workspace_role_id` and explicit permissions.
   `workspace_members.role` is only a synchronized compatibility tier.
8. Snapshot, achievement, invitation lifecycle, membership lifecycle, and
   notification-event writes must use their RPCs.
9. `plan.read` is necessary but not sufficient for a restricted business plan.
   Every plan-derived query must also pass the canonical plan-visibility
   helper; a role or member visibility grant never adds mutation permission.
10. Planning lifecycle fields are RPC-only. Clients may edit content directly
    when RLS permits it, but must never update `status`, archive metadata,
    blocked metadata, completion metadata, or reopening metadata themselves.

## Preferred application sources

| Application concern | Read from | Write through | Important distinction |
| --- | --- | --- | --- |
| Current user identity | `profiles` | own-row update | `display_name` is preferred display identity; `full_name` is the account name. |
| Personal settings | `profile_preferences` | own-row update | Preferences belong to a user, never a workspace. |
| Workspace settings | `workspaces` | permitted update | One private business boundary. |
| Member and role display | `get_workspace_member_directory` | membership RPCs | Safe identity fields only; do not infer access from `base_role`. |
| Invitation management | `workspace_invitation_access` | invitation RPCs | Invitation role activation is `workspace_role_id`. |
| Plans and execution | canonical planning tables | lifecycle RPCs plus permitted content writes | Goal is an outcome; initiative is a strategy; action item is work. |
| Restricted planning | plan hierarchy under `business_plans` | owner-managed role/member grants | Child records inherit plan visibility; managers have no implicit bypass. |
| Review preparation | `business_reviews` and snapshot tables | review RPCs | Finalized evidence is immutable. |
| Transaction editing | `transactions` | permitted table writes | Amount is unsigned; type supplies financial direction. |
| Transaction result | `transaction_financial_results` | read-only | `net_result` is calculated consistently by the database. |
| Account balance | `financial_account_balances` | read-only | Native currency only; this is not double-entry accounting. |
| Category reporting | `transaction_category_actuals` | allocation table | Category allocation may be partial but cannot exceed the transaction. |
| Portfolio evidence | `business_portfolio_evidence` | portfolio tables | Portfolio remains private and only accepts finalized reviews. |
| Achievement display | `workspace_achievement_details` | database evaluator | Users cannot award badges manually. |
| Notifications | `notifications` | notification RPCs | `event_code` is semantic; `type` is only a presentation category. |
| Audit history | `audit_logs` | database triggers | Never insert audit rows from application code. |
| Contact submissions | `contact_messages` | trusted server workflow | Operator support data is not workspace-readable. |
| Email delivery | `email_deliveries` | service-role RPCs | Delivery rows are infrastructure state, not invitations. |
| System operations | operational RPC counters | service-role scheduler | Never expose health or maintenance RPCs to browser sessions. |

## Transaction mapping

```text
Database transaction
├── type: sale | expense
├── amount: positive monetary magnitude
├── cost_amount: direct sale cost, zero for expense
├── financial_account_id: where value moved
└── categories: classification through transaction_category_allocations

Calculated result
├── sale    -> amount - cost_amount
└── expense -> -amount
```

The current local-storage management screen still uses `DemoTransaction`. Its
enum values, positive monetary magnitude, ISO date, cost, and net-result
semantics intentionally match the database. It remains a presentation model
because its numeric demo ID and missing workspace/account fields are not a
database row. Do not cast it to one.

## Mutations that require RPCs

- Workspace creation and ownership transfer
- Role, member, and invitation lifecycle
- Invitation email-delivery lifecycle
- Business-review snapshot refresh and finalization
- Business-plan, goal, initiative, and action-item lifecycle transitions
- Goal, initiative, and action-item archive and restore operations
- Reminder generation and notification read actions
- Safe workspace member directory reads

Direct table mutation is appropriate only where an explicit RLS write policy
exists and no lifecycle invariant spans multiple tables.
