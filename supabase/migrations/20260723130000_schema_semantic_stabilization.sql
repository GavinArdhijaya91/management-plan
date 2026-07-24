alter table public.transactions
  rename column capital to cost_amount;

alter table public.transactions
  rename constraint sale_capital_check to sale_cost_amount_check;
alter table public.transactions
  rename constraint expense_capital_check to expense_cost_amount_check;

delete from public.workspace_role_permissions
where permission_code = 'contact.read';

delete from public.permission_definitions
where code = 'contact.read';

drop policy if exists "contact_select_permitted"
on public.contact_messages;

alter table public.financial_accounts
  add constraint financial_accounts_cash_flow_kind_check
    check (account_kind not in ('receivable', 'payable'));

update public.permission_definitions
set description =
  'Download workspace transaction data; unrelated to international trade export.'
where code = 'transaction.export';

comment on column public.workspace_members.role is
  'Compatibility base role synchronized from workspace_role_id. Authorization must use workspace_role_id and workspace role permissions.';
comment on column public.workspace_members.workspace_role_id is
  'Authoritative workspace access role. Application authorization must not infer permissions from workspace_members.role.';
comment on column public.workspace_invitations.role is
  'Compatibility base role synchronized from workspace_role_id. The invited access assignment is workspace_role_id.';
comment on column public.workspace_invitations.workspace_role_id is
  'Authoritative role to activate after invitation acceptance.';
comment on column public.workspace_roles.base_role is
  'Compatibility tier for owner invariants and legacy role checks; explicit permissions remain authoritative.';
comment on column public.transactions.cost_amount is
  'Direct cost attributable to a sale transaction. This is not owner capital, funding, or account balance.';
comment on column public.transactions.type is
  'Financial direction: sale is inflow/revenue and expense is outflow/cost. Classification belongs in transaction_categories.';
comment on column public.notifications.type is
  'Legacy presentation category. event_code is the authoritative notification event identity.';
comment on column public.notifications.event_code is
  'Stable domain event identifier used by application behavior.';
comment on column public.contact_messages.workspace_id is
  'Optional submission context only; it does not make a support message workspace-owned or workspace-readable.';
comment on column public.profiles.avatar_url is
  'Legacy external avatar URL. New uploads must use avatar_path.';
comment on column public.profiles.email_notifications is
  'Legacy aggregate preference. Granular notification behavior belongs to profile_preferences.';
comment on column public.profiles.weekly_summary is
  'Legacy aggregate preference retained for backward compatibility.';
comment on type public.financial_account_kind is
  'Cash-flow account kinds. receivable and payable are reserved until double-entry accounting is introduced.';
comment on table public.business_portfolios is
  'Private workspace portfolio. It is not publicly discoverable and has no public sharing contract.';
comment on table public.market_snapshots is
  'User-recorded market observation, not an internal transaction or sales measurement.';

create view public.workspace_member_access
with (security_invoker = true)
as
select
  member.workspace_id,
  member.user_id,
  member.status as membership_status,
  member.job_title,
  member.joined_at,
  member.workspace_role_id,
  role_record.code as role_code,
  role_record.name as role_name,
  role_record.description as role_description,
  role_record.hierarchy_rank,
  role_record.base_role,
  role_record.is_owner_role
from public.workspace_members member
join public.workspace_roles role_record
  on role_record.workspace_id = member.workspace_id
  and role_record.id = member.workspace_role_id;

create view public.workspace_invitation_access
with (security_invoker = true)
as
select
  invitation.workspace_id,
  invitation.id as workspace_invitation_id,
  invitation.email,
  invitation.status as invitation_status,
  invitation.expires_at,
  invitation.invited_by,
  invitation.delivery_status,
  invitation.workspace_role_id,
  role_record.code as role_code,
  role_record.name as role_name,
  role_record.description as role_description,
  role_record.hierarchy_rank,
  role_record.base_role
from public.workspace_invitations invitation
join public.workspace_roles role_record
  on role_record.workspace_id = invitation.workspace_id
  and role_record.id = invitation.workspace_role_id;

create view public.transaction_financial_results
with (security_invoker = true)
as
select
  transaction_record.workspace_id,
  transaction_record.id as transaction_id,
  transaction_record.type as transaction_type,
  transaction_record.transaction_date,
  transaction_record.amount,
  transaction_record.cost_amount,
  case
    when transaction_record.type = 'sale'
      then transaction_record.amount - transaction_record.cost_amount
    when transaction_record.type = 'expense'
      then -transaction_record.amount
  end::numeric(14, 2) as net_result,
  account.currency_code,
  transaction_record.financial_account_id
from public.transactions transaction_record
join public.financial_accounts account
  on account.workspace_id = transaction_record.workspace_id
  and account.id = transaction_record.financial_account_id;

revoke all on public.workspace_member_access from anon;
revoke all on public.workspace_invitation_access from anon;
revoke all on public.transaction_financial_results from anon;
grant select on public.workspace_member_access to authenticated;
grant select on public.workspace_invitation_access to authenticated;
grant select on public.transaction_financial_results to authenticated;
