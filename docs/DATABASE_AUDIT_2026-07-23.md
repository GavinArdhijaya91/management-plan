# Database Semantic Audit — 2026-07-23

Scope: migrations `20260722000000` through `20260723130000`, remote public and
private schemas, generated TypeScript types, and current Supabase utility
boundaries.

## Corrected findings

| Finding | Risk | Stabilization |
| --- | --- | --- |
| `transactions.capital` represented sale cost, not capital funding. | UI or reports could label cost of goods as business capital. | Renamed to `cost_amount`; constraints and data contract updated. |
| Workspace members and invitations expose both `role` and `workspace_role_id`. | An app could authorize from the compatibility enum and ignore custom permissions. | Added database comments and canonical `workspace_member_access` / `workspace_invitation_access` views. |
| `contact_messages` was documented as operator support but readable through workspace permission. | Workspace managers could treat operator support as internal workspace data. | Removed `contact.read` assignments/definition and authenticated select policy. |
| `financial_account_kind` exposed receivable/payable without a double-entry ledger. | A balance could look accounting-correct while using cash-flow arithmetic. | New rows cannot use receivable/payable until that capability exists. |
| `notification_type` looked like event identity. | Utilities could branch on a display category such as `system`. | `event_code` is documented as authoritative; `type` remains presentation-only. |
| Local demo interfaces used canonical names such as `Transaction`. | A demo local-storage object could be passed to Supabase despite incompatible IDs, enum values, signs, and dates. | Presentation interfaces now use the `Demo` prefix; generated aliases live in `lib/supabase/domain-types.ts`. |
| Transaction result was repeatedly calculated in presentation code. | Expense signs and sale cost could diverge between screens. | Added `transaction_financial_results` as the canonical database calculation. |
| `transaction.export` could be confused with international trade/export capability. | Developers could connect the permission to importer/exporter workflows. | Description now explicitly means data download and is unrelated to international trade. |

## Accepted compatibility fields

These fields remain because removing them would erase data or break established
database invariants:

- `workspace_members.role`: synchronized base-role compatibility tier.
- `workspace_invitations.role`: synchronized invitation compatibility tier.
- `profiles.avatar_url`: legacy external URL; new uploads use `avatar_path`.
- `profiles.email_notifications` and `profiles.weekly_summary`: legacy
  aggregate preferences; granular choices use `profile_preferences`.
- `notifications.type`: legacy display category; behavior uses `event_code`.

Application code must follow `DATA_ACCESS_CONTRACT.md` rather than guessing from
these fields.

## Deliberately unsupported

- Public portfolio or community discovery
- Presence/online status
- Import/export trade workflows
- Receivable/payable accounting
- Foreign-exchange conversion
- Manual achievement assignment

Their names must not be reused for approximate implementations.

## Canonical integration boundary

- Generated schema: `lib/supabase/database.types.ts`
- Stable aliases: `lib/supabase/domain-types.ts`
- Application rules: `docs/DATA_ACCESS_CONTRACT.md`
- Shared vocabulary: `docs/DOMAIN_GLOSSARY.md`

Any repository or utility added later must import stable aliases, use an
explicit mapper for UI copy, and call RPCs for multi-table lifecycle changes.
