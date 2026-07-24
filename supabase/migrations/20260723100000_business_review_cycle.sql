create type public.business_review_status as enum (
  'draft',
  'finalized'
);

alter table public.business_reviews
  add column status public.business_review_status not null default 'draft',
  add column snapshot_refreshed_at timestamptz,
  add column finalized_at timestamptz,
  add constraint business_reviews_workspace_id_unique
    unique (workspace_id, id),
  add constraint business_reviews_finalization_check check (
    (status = 'draft' and finalized_at is null)
    or
    (status = 'finalized' and finalized_at is not null)
  );

create table public.business_review_goal_target_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  business_review_id uuid not null,
  goal_target_id uuid not null,
  metric_name text not null,
  unit_type public.metric_unit_type not null,
  aggregation public.metric_aggregation not null,
  direction public.goal_direction not null,
  starting_value numeric(18, 4),
  target_value numeric(18, 4) not null,
  actual_value numeric(18, 4),
  captured_at timestamptz not null default now(),
  unique (business_review_id, goal_target_id),
  foreign key (workspace_id, business_review_id)
    references public.business_reviews(workspace_id, id) on delete cascade,
  foreign key (workspace_id, goal_target_id)
    references public.goal_targets(workspace_id, id) on delete restrict
);

create table public.business_review_financial_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  business_review_id uuid not null,
  currency_code text not null references public.currencies(code)
    on update cascade on delete restrict,
  revenue_amount numeric(18, 2) not null default 0,
  expense_amount numeric(18, 2) not null default 0,
  net_amount numeric(18, 2) generated always as (
    revenue_amount - expense_amount
  ) stored,
  transaction_count bigint not null default 0 check (transaction_count >= 0),
  captured_at timestamptz not null default now(),
  unique (business_review_id, currency_code),
  foreign key (workspace_id, business_review_id)
    references public.business_reviews(workspace_id, id) on delete cascade
);

create table public.business_review_action_item_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  business_review_id uuid not null,
  total_count bigint not null default 0 check (total_count >= 0),
  todo_count bigint not null default 0 check (todo_count >= 0),
  in_progress_count bigint not null default 0 check (in_progress_count >= 0),
  blocked_count bigint not null default 0 check (blocked_count >= 0),
  completed_count bigint not null default 0 check (completed_count >= 0),
  cancelled_count bigint not null default 0 check (cancelled_count >= 0),
  overdue_count bigint not null default 0 check (overdue_count >= 0),
  captured_at timestamptz not null default now(),
  unique (business_review_id),
  foreign key (workspace_id, business_review_id)
    references public.business_reviews(workspace_id, id) on delete cascade
);

create index business_review_goal_snapshots_workspace_idx
  on public.business_review_goal_target_snapshots (
    workspace_id,
    business_review_id
  );
create index business_review_financial_snapshots_workspace_idx
  on public.business_review_financial_snapshots (
    workspace_id,
    business_review_id
  );
create index business_review_action_snapshots_workspace_idx
  on public.business_review_action_item_snapshots (
    workspace_id,
    business_review_id
  );

create or replace function private.refresh_business_review_snapshots(
  target_business_review_id uuid,
  actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  review_record public.business_reviews%rowtype;
begin
  select *
  into review_record
  from public.business_reviews
  where id = target_business_review_id
  for update;

  if review_record.id is null then
    raise exception 'Business review not found';
  end if;

  if review_record.status <> 'draft' then
    raise exception 'Only a draft business review can refresh its snapshots';
  end if;

  if actor_id is null or not exists (
    select 1
    from public.workspace_members member
    join public.workspace_roles role_record
      on role_record.workspace_id = member.workspace_id
      and role_record.id = member.workspace_role_id
    where member.workspace_id = review_record.workspace_id
      and member.user_id = actor_id
      and member.status = 'active'
      and (
        role_record.is_owner_role
        or exists (
          select 1
          from public.workspace_role_permissions role_permission
          where role_permission.workspace_id = member.workspace_id
            and role_permission.workspace_role_id = role_record.id
            and role_permission.permission_code = 'plan.write'
        )
      )
  ) then
    raise exception 'Not authorized to refresh this business review';
  end if;

  delete from public.business_review_goal_target_snapshots
  where business_review_id = review_record.id;
  delete from public.business_review_financial_snapshots
  where business_review_id = review_record.id;
  delete from public.business_review_action_item_snapshots
  where business_review_id = review_record.id;

  insert into public.business_review_goal_target_snapshots (
    workspace_id,
    business_review_id,
    goal_target_id,
    metric_name,
    unit_type,
    aggregation,
    direction,
    starting_value,
    target_value,
    actual_value
  )
  select
    review_record.workspace_id,
    review_record.id,
    target.id,
    metric.name,
    metric.unit_type,
    metric.aggregation,
    target.direction,
    target.starting_value,
    target.target_value,
    case metric.aggregation
      when 'sum' then measurement.sum_value
      when 'average' then measurement.average_value
      when 'latest' then measurement.latest_value
      when 'minimum' then measurement.minimum_value
      when 'maximum' then measurement.maximum_value
      when 'count' then measurement.measurement_count
    end
  from public.business_goals goal
  join public.goal_targets target
    on target.workspace_id = goal.workspace_id
    and target.business_goal_id = goal.id
  join public.metric_definitions metric
    on metric.workspace_id = target.workspace_id
    and metric.id = target.metric_definition_id
  left join lateral (
    select
      sum(source.measured_value)::numeric(18, 4) as sum_value,
      avg(source.measured_value)::numeric(18, 4) as average_value,
      min(source.measured_value)::numeric(18, 4) as minimum_value,
      max(source.measured_value)::numeric(18, 4) as maximum_value,
      count(source.id)::numeric(18, 4) as measurement_count,
      (array_agg(
        source.measured_value
        order by source.measured_at desc, source.created_at desc
      ))[1]::numeric(18, 4) as latest_value
    from public.metric_measurements source
    where source.workspace_id = target.workspace_id
      and source.goal_target_id = target.id
      and source.measured_at < review_record.period_end + interval '1 day'
      and (
        metric.aggregation = 'latest'
        or source.measured_at >= review_record.period_start
      )
  ) measurement on true
  where goal.workspace_id = review_record.workspace_id
    and goal.business_plan_id = review_record.business_plan_id;

  insert into public.business_review_financial_snapshots (
    workspace_id,
    business_review_id,
    currency_code,
    revenue_amount,
    expense_amount,
    transaction_count
  )
  select
    review_record.workspace_id,
    review_record.id,
    account.currency_code,
    coalesce(sum(transaction_record.amount)
      filter (where transaction_record.type = 'sale'), 0),
    coalesce(sum(transaction_record.amount)
      filter (where transaction_record.type = 'expense'), 0),
    count(transaction_record.id)
  from public.transactions transaction_record
  join public.financial_accounts account
    on account.workspace_id = transaction_record.workspace_id
    and account.id = transaction_record.financial_account_id
  where transaction_record.workspace_id = review_record.workspace_id
    and transaction_record.transaction_date
      between review_record.period_start and review_record.period_end
  group by account.currency_code;

  insert into public.business_review_action_item_snapshots (
    workspace_id,
    business_review_id,
    total_count,
    todo_count,
    in_progress_count,
    blocked_count,
    completed_count,
    cancelled_count,
    overdue_count
  )
  select
    review_record.workspace_id,
    review_record.id,
    count(action.id),
    count(action.id) filter (where action.status = 'todo'),
    count(action.id) filter (where action.status = 'in_progress'),
    count(action.id) filter (where action.status = 'blocked'),
    count(action.id) filter (where action.status = 'completed'),
    count(action.id) filter (where action.status = 'cancelled'),
    count(action.id) filter (
      where action.due_on < review_record.period_end
        and action.status not in ('completed', 'cancelled')
    )
  from public.business_initiatives initiative
  left join public.action_items action
    on action.workspace_id = initiative.workspace_id
    and action.business_initiative_id = initiative.id
    and (
      action.starts_on is null
      or action.starts_on <= review_record.period_end
    )
  where initiative.workspace_id = review_record.workspace_id
    and initiative.business_plan_id = review_record.business_plan_id;

  update public.business_reviews
  set snapshot_refreshed_at = now()
  where id = review_record.id;
end;
$$;

revoke all on function private.refresh_business_review_snapshots(uuid, uuid)
from public, anon, authenticated;

create or replace function public.refresh_business_review_snapshots(
  target_business_review_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.refresh_business_review_snapshots(
    target_business_review_id,
    (select auth.uid())
  );
end;
$$;

create or replace function public.finalize_business_review(
  target_business_review_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
begin
  perform private.refresh_business_review_snapshots(
    target_business_review_id,
    actor_id
  );

  update public.business_reviews
  set
    status = 'finalized',
    finalized_at = now()
  where id = target_business_review_id
    and status = 'draft';

  if not found then
    raise exception 'Business review could not be finalized';
  end if;
end;
$$;

revoke all on function public.refresh_business_review_snapshots(uuid)
from public, anon;
revoke all on function public.finalize_business_review(uuid)
from public, anon;
grant execute on function public.refresh_business_review_snapshots(uuid)
to authenticated;
grant execute on function public.finalize_business_review(uuid)
to authenticated;

alter table public.business_review_goal_target_snapshots enable row level security;
alter table public.business_review_financial_snapshots enable row level security;
alter table public.business_review_action_item_snapshots enable row level security;

create policy "review_goal_snapshots_select_permitted"
on public.business_review_goal_target_snapshots
for select to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.read'));
create policy "review_financial_snapshots_select_permitted"
on public.business_review_financial_snapshots
for select to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.read'));
create policy "review_action_snapshots_select_permitted"
on public.business_review_action_item_snapshots
for select to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.read'));

revoke insert, update, delete
on public.business_review_goal_target_snapshots
from authenticated;
revoke insert, update, delete
on public.business_review_financial_snapshots
from authenticated;
revoke insert, update, delete
on public.business_review_action_item_snapshots
from authenticated;

revoke update on public.business_reviews from authenticated;
grant update (
  business_plan_id,
  period_type,
  period_start,
  period_end,
  summary,
  wins,
  challenges,
  next_steps,
  updated_at
) on public.business_reviews to authenticated;

drop policy if exists "business_reviews_update_permitted"
on public.business_reviews;
create policy "business_reviews_update_draft_permitted"
on public.business_reviews for update to authenticated
using (
  status = 'draft'
  and private.has_workspace_permission(workspace_id, 'plan.write')
)
with check (
  status = 'draft'
  and private.has_workspace_permission(workspace_id, 'plan.write')
);

drop policy if exists "business_reviews_delete_permitted"
on public.business_reviews;
create policy "business_reviews_delete_draft_permitted"
on public.business_reviews for delete to authenticated
using (
  status = 'draft'
  and private.has_workspace_permission(workspace_id, 'plan.delete')
);

create trigger business_review_goal_target_snapshots_audit
after insert or update or delete
on public.business_review_goal_target_snapshots
for each row execute function private.write_workspace_audit_log(
  'business_review_goal_target_snapshot'
);
create trigger business_review_financial_snapshots_audit
after insert or update or delete
on public.business_review_financial_snapshots
for each row execute function private.write_workspace_audit_log(
  'business_review_financial_snapshot'
);
create trigger business_review_action_item_snapshots_audit
after insert or update or delete
on public.business_review_action_item_snapshots
for each row execute function private.write_workspace_audit_log(
  'business_review_action_item_snapshot'
);

create view public.business_review_summaries
with (security_invoker = true)
as
select
  review.workspace_id,
  review.id as business_review_id,
  review.business_plan_id,
  review.period_type,
  review.period_start,
  review.period_end,
  review.status,
  review.snapshot_refreshed_at,
  review.finalized_at,
  coalesce(goal_snapshot.target_count, 0) as target_count,
  coalesce(goal_snapshot.measured_target_count, 0) as measured_target_count,
  coalesce(action_snapshot.total_count, 0) as action_item_count,
  coalesce(action_snapshot.completed_count, 0) as completed_action_item_count,
  coalesce(action_snapshot.overdue_count, 0) as overdue_action_item_count
from public.business_reviews review
left join (
  select
    business_review_id,
    count(*) as target_count,
    count(actual_value) as measured_target_count
  from public.business_review_goal_target_snapshots
  group by business_review_id
) goal_snapshot on goal_snapshot.business_review_id = review.id
left join public.business_review_action_item_snapshots action_snapshot
  on action_snapshot.business_review_id = review.id;

revoke all on public.business_review_summaries from anon;
grant select on public.business_review_summaries to authenticated;
