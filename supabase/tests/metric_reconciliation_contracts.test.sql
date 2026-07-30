\set ON_ERROR_STOP on

begin;

select plan(1);

select set_config('test.reconciliation_workspace_id', id::text, true)
from public.workspaces
where slug = 'kedai-siapin-demo';

select set_config('test.reconciliation_target_id', target.id::text, true)
from public.goal_targets target
join public.metric_definitions metric
  on metric.workspace_id = target.workspace_id
  and metric.id = target.metric_definition_id
where target.workspace_id =
    current_setting('test.reconciliation_workspace_id')::uuid
  and metric.code = 'monthly_revenue';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@siapin.local"}',
  true
);

do $$
declare
  target_id uuid;
  metric_id uuid;
  result_record record;
  review_id uuid;
  snapshot_record record;
begin
  select target.id, metric.id
  into target_id, metric_id
  from public.goal_targets target
  join public.metric_definitions metric
    on metric.workspace_id = target.workspace_id
    and metric.id = target.metric_definition_id
  where target.workspace_id =
      current_setting('test.reconciliation_workspace_id')::uuid
    and metric.code = 'monthly_revenue';

  select *
  into result_record
  from public.calculate_goal_target_actual_reconciliation(
    target_id,
    current_date,
    current_date
  );

  if result_record.actual_value <> 1250000
    or result_record.comparison_value <> 1250000
    or result_record.reconciliation_status <> 'reconciled'
  then
    raise exception 'Matching hybrid evidence was not reconciled';
  end if;

  update public.metric_definitions
  set
    authoritative_source = 'transaction',
    reconciliation_tolerance_percent = 1
  where id = metric_id;

  insert into public.metric_measurements (
    workspace_id,
    goal_target_id,
    measured_value,
    measured_at,
    source,
    note,
    created_by
  )
  values (
    current_setting('test.reconciliation_workspace_id')::uuid,
    target_id,
    250000,
    now(),
    'manual',
    'Hybrid reconciliation divergence contract',
    'a1000000-0000-0000-0000-000000000001'
  );

  select *
  into result_record
  from public.calculate_goal_target_actual_reconciliation(
    target_id,
    current_date,
    current_date
  );

  if result_record.actual_value <> 1250000
    or result_record.comparison_value <> 1500000
    or result_record.reconciliation_variance <> -250000
    or result_record.reconciliation_status <> 'attention'
  then
    raise exception 'Authoritative transaction evidence or divergence was incorrect';
  end if;

  insert into public.business_reviews (
    workspace_id,
    business_plan_id,
    period_type,
    period_start,
    period_end,
    summary,
    reviewed_by
  )
  select
    plan.workspace_id,
    plan.id,
    'custom',
    current_date,
    current_date,
    'Hybrid metric snapshot contract',
    'a1000000-0000-0000-0000-000000000001'
  from public.business_plans plan
  where plan.workspace_id =
      current_setting('test.reconciliation_workspace_id')::uuid
    and plan.title = 'Rencana Pertumbuhan Kedai'
  returning id into review_id;

  perform public.refresh_business_review_snapshots(review_id);

  select *
  into snapshot_record
  from public.business_review_goal_target_snapshots
  where business_review_id = review_id
    and goal_target_id = target_id;

  if snapshot_record.actual_value <> result_record.actual_value
    or snapshot_record.manual_actual_value <> result_record.manual_actual_value
    or snapshot_record.transaction_actual_value
      <> result_record.transaction_actual_value
    or snapshot_record.reconciliation_status <> 'attention'
  then
    raise exception 'Business review did not preserve canonical hybrid evidence';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000006","role":"authenticated","email":"outsider@siapin.local"}',
  true
);

do $$
begin
  if exists (
    select 1
    from public.calculate_goal_target_actual_reconciliation(
      current_setting('test.reconciliation_target_id')::uuid,
      null,
      null
    )
  ) then
    raise exception 'Outsider read hybrid reconciliation evidence';
  end if;
end;
$$;

reset role;

select pass(
  'Hybrid metrics select one authoritative actual and preserve reconciliation evidence'
);

select * from finish();

rollback;
