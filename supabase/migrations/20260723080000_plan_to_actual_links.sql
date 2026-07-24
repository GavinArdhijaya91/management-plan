alter table public.transactions
  add constraint transactions_workspace_id_id_key unique (workspace_id, id);
alter table public.calendar_events
  add constraint calendar_events_workspace_id_id_key unique (workspace_id, id);
alter table public.metric_measurements
  add constraint metric_measurements_workspace_id_id_key unique (workspace_id, id);
alter table public.action_items
  add constraint action_items_workspace_id_id_key unique (workspace_id, id);

create table public.action_item_calendar_events (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  action_item_id uuid not null,
  calendar_event_id uuid not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  foreign key (workspace_id, action_item_id)
    references public.action_items(workspace_id, id) on delete cascade,
  foreign key (workspace_id, calendar_event_id)
    references public.calendar_events(workspace_id, id) on delete cascade,
  unique (action_item_id, calendar_event_id)
);

create table public.transaction_initiative_allocations (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  transaction_id uuid not null,
  business_initiative_id uuid not null,
  allocated_amount numeric(14, 2) not null check (allocated_amount > 0),
  note text check (note is null or char_length(note) <= 500),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (workspace_id, transaction_id)
    references public.transactions(workspace_id, id) on delete cascade,
  foreign key (workspace_id, business_initiative_id)
    references public.business_initiatives(workspace_id, id) on delete cascade,
  unique (transaction_id, business_initiative_id)
);

create table public.transaction_goal_target_contributions (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  transaction_id uuid not null,
  goal_target_id uuid not null,
  contribution_value numeric(18, 4) not null check (contribution_value <> 0),
  note text check (note is null or char_length(note) <= 500),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (workspace_id, transaction_id)
    references public.transactions(workspace_id, id) on delete cascade,
  foreign key (workspace_id, goal_target_id)
    references public.goal_targets(workspace_id, id) on delete cascade,
  unique (transaction_id, goal_target_id)
);

create table public.metric_measurement_transactions (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  metric_measurement_id uuid not null,
  transaction_id uuid not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  foreign key (workspace_id, metric_measurement_id)
    references public.metric_measurements(workspace_id, id) on delete cascade,
  foreign key (workspace_id, transaction_id)
    references public.transactions(workspace_id, id) on delete cascade,
  unique (metric_measurement_id, transaction_id)
);

create index action_item_calendar_events_workspace_idx
  on public.action_item_calendar_events (workspace_id, action_item_id);
create index action_item_calendar_events_calendar_idx
  on public.action_item_calendar_events (calendar_event_id);
create index transaction_initiative_allocations_workspace_idx
  on public.transaction_initiative_allocations (
    workspace_id,
    business_initiative_id
  );
create index transaction_initiative_allocations_transaction_idx
  on public.transaction_initiative_allocations (transaction_id);
create index transaction_goal_target_contributions_workspace_idx
  on public.transaction_goal_target_contributions (workspace_id, goal_target_id);
create index transaction_goal_target_contributions_transaction_idx
  on public.transaction_goal_target_contributions (transaction_id);
create index metric_measurement_transactions_workspace_idx
  on public.metric_measurement_transactions (
    workspace_id,
    metric_measurement_id
  );
create index metric_measurement_transactions_transaction_idx
  on public.metric_measurement_transactions (transaction_id);

create trigger transaction_initiative_allocations_set_updated_at
before update on public.transaction_initiative_allocations
for each row execute function private.set_updated_at();
create trigger transaction_goal_target_contributions_set_updated_at
before update on public.transaction_goal_target_contributions
for each row execute function private.set_updated_at();

create trigger action_item_calendar_events_protect_identity
before update on public.action_item_calendar_events
for each row execute function private.prevent_column_changes(
  'id',
  'workspace_id',
  'action_item_id',
  'calendar_event_id',
  'created_by',
  'created_at'
);
create trigger transaction_initiative_allocations_protect_identity
before update on public.transaction_initiative_allocations
for each row execute function private.prevent_column_changes(
  'id',
  'workspace_id',
  'transaction_id',
  'business_initiative_id',
  'created_by',
  'created_at'
);
create trigger transaction_goal_target_contributions_protect_identity
before update on public.transaction_goal_target_contributions
for each row execute function private.prevent_column_changes(
  'id',
  'workspace_id',
  'transaction_id',
  'goal_target_id',
  'created_by',
  'created_at'
);
create trigger metric_measurement_transactions_protect_identity
before update on public.metric_measurement_transactions
for each row execute function private.prevent_column_changes(
  'id',
  'workspace_id',
  'metric_measurement_id',
  'transaction_id',
  'created_by',
  'created_at'
);

create or replace function private.ensure_transaction_allocation_total()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_transaction_id uuid;
  transaction_amount numeric(14, 2);
  allocation_total numeric(14, 2);
begin
  if tg_table_name = 'transactions' then
    target_transaction_id := new.id;
  elsif tg_op = 'DELETE' then
    target_transaction_id := old.transaction_id;
  else
    target_transaction_id := new.transaction_id;
  end if;

  select amount into transaction_amount
  from public.transactions
  where id = target_transaction_id;

  if transaction_amount is null then
    return null;
  end if;

  select coalesce(sum(allocated_amount), 0)
  into allocation_total
  from public.transaction_initiative_allocations
  where transaction_id = target_transaction_id;

  if allocation_total > transaction_amount then
    raise exception 'Initiative allocations (%) exceed transaction amount (%)',
      allocation_total,
      transaction_amount
      using errcode = '23514';
  end if;

  return null;
end;
$$;

revoke all on function private.ensure_transaction_allocation_total()
from public, anon, authenticated;

create constraint trigger transaction_allocations_within_amount
after insert or update or delete on public.transaction_initiative_allocations
deferrable initially deferred
for each row execute function private.ensure_transaction_allocation_total();

create constraint trigger transaction_amount_covers_allocations
after update of amount on public.transactions
deferrable initially deferred
for each row execute function private.ensure_transaction_allocation_total();

alter table public.action_item_calendar_events enable row level security;
alter table public.transaction_initiative_allocations enable row level security;
alter table public.transaction_goal_target_contributions enable row level security;
alter table public.metric_measurement_transactions enable row level security;

create policy "action_calendar_links_select_permitted"
on public.action_item_calendar_events for select to authenticated
using (
  private.has_workspace_permission(workspace_id, 'plan.read')
  and private.has_workspace_permission(workspace_id, 'calendar.read')
);
create policy "action_calendar_links_insert_permitted"
on public.action_item_calendar_events for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'plan.write')
  and private.has_workspace_permission(workspace_id, 'calendar.write')
);
create policy "action_calendar_links_delete_permitted"
on public.action_item_calendar_events for delete to authenticated
using (
  private.has_workspace_permission(workspace_id, 'plan.write')
  and private.has_workspace_permission(workspace_id, 'calendar.write')
);

create policy "initiative_allocations_select_permitted"
on public.transaction_initiative_allocations for select to authenticated
using (
  private.has_workspace_permission(workspace_id, 'transaction.read')
  and private.has_workspace_permission(workspace_id, 'plan.read')
);
create policy "initiative_allocations_insert_permitted"
on public.transaction_initiative_allocations for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'plan.write')
);
create policy "initiative_allocations_update_permitted"
on public.transaction_initiative_allocations for update to authenticated
using (
  private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'plan.write')
)
with check (
  private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'plan.write')
);
create policy "initiative_allocations_delete_permitted"
on public.transaction_initiative_allocations for delete to authenticated
using (
  private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'plan.write')
);

create policy "goal_contributions_select_permitted"
on public.transaction_goal_target_contributions for select to authenticated
using (
  private.has_workspace_permission(workspace_id, 'transaction.read')
  and private.has_workspace_permission(workspace_id, 'plan.read')
);
create policy "goal_contributions_insert_permitted"
on public.transaction_goal_target_contributions for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'plan.write')
);
create policy "goal_contributions_update_permitted"
on public.transaction_goal_target_contributions for update to authenticated
using (
  private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'plan.write')
)
with check (
  private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'plan.write')
);
create policy "goal_contributions_delete_permitted"
on public.transaction_goal_target_contributions for delete to authenticated
using (
  private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'plan.write')
);

create policy "measurement_transactions_select_permitted"
on public.metric_measurement_transactions for select to authenticated
using (
  private.has_workspace_permission(workspace_id, 'transaction.read')
  and private.has_workspace_permission(workspace_id, 'plan.read')
);
create policy "measurement_transactions_insert_permitted"
on public.metric_measurement_transactions for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'transaction.read')
  and private.has_workspace_permission(workspace_id, 'plan.write')
);
create policy "measurement_transactions_delete_permitted"
on public.metric_measurement_transactions for delete to authenticated
using (
  private.has_workspace_permission(workspace_id, 'transaction.read')
  and private.has_workspace_permission(workspace_id, 'plan.write')
);

create trigger action_item_calendar_events_audit
after insert or update or delete on public.action_item_calendar_events
for each row execute function private.write_workspace_audit_log('action_item_calendar_event');
create trigger transaction_initiative_allocations_audit
after insert or update or delete on public.transaction_initiative_allocations
for each row execute function private.write_workspace_audit_log(
  'transaction_initiative_allocation'
);
create trigger transaction_goal_target_contributions_audit
after insert or update or delete on public.transaction_goal_target_contributions
for each row execute function private.write_workspace_audit_log(
  'transaction_goal_target_contribution'
);
create trigger metric_measurement_transactions_audit
after insert or update or delete on public.metric_measurement_transactions
for each row execute function private.write_workspace_audit_log(
  'metric_measurement_transaction'
);

create view public.initiative_financial_actuals
with (security_invoker = true)
as
select
  allocation.workspace_id,
  allocation.business_initiative_id,
  coalesce(sum(allocation.allocated_amount)
    filter (where transaction_record.type = 'sale'), 0)::numeric(14, 2)
    as allocated_revenue,
  coalesce(sum(allocation.allocated_amount)
    filter (where transaction_record.type = 'expense'), 0)::numeric(14, 2)
    as allocated_expense,
  (
    coalesce(sum(allocation.allocated_amount)
      filter (where transaction_record.type = 'sale'), 0)
    -
    coalesce(sum(allocation.allocated_amount)
      filter (where transaction_record.type = 'expense'), 0)
  )::numeric(14, 2) as allocated_net,
  count(distinct allocation.transaction_id)::bigint as transaction_count
from public.transaction_initiative_allocations allocation
join public.transactions transaction_record
  on transaction_record.id = allocation.transaction_id
  and transaction_record.workspace_id = allocation.workspace_id
group by allocation.workspace_id, allocation.business_initiative_id;

create view public.goal_target_transaction_actuals
with (security_invoker = true)
as
select
  contribution.workspace_id,
  contribution.goal_target_id,
  sum(contribution.contribution_value)::numeric(18, 4) as contributed_value,
  count(distinct contribution.transaction_id)::bigint as transaction_count,
  max(transaction_record.transaction_date) as latest_transaction_date
from public.transaction_goal_target_contributions contribution
join public.transactions transaction_record
  on transaction_record.id = contribution.transaction_id
  and transaction_record.workspace_id = contribution.workspace_id
group by contribution.workspace_id, contribution.goal_target_id;

create view public.goal_target_latest_measurements
with (security_invoker = true)
as
select distinct on (measurement.goal_target_id)
  measurement.workspace_id,
  measurement.goal_target_id,
  measurement.id as metric_measurement_id,
  measurement.measured_value,
  measurement.measured_at,
  measurement.source
from public.metric_measurements measurement
order by
  measurement.goal_target_id,
  measurement.measured_at desc,
  measurement.created_at desc;

revoke all on public.initiative_financial_actuals from anon;
revoke all on public.goal_target_transaction_actuals from anon;
revoke all on public.goal_target_latest_measurements from anon;
grant select on public.initiative_financial_actuals to authenticated;
grant select on public.goal_target_transaction_actuals to authenticated;
grant select on public.goal_target_latest_measurements to authenticated;
