\set ON_ERROR_STOP on

begin;

select plan(1);

select set_config('test.review_workspace_id', id::text, true)
from public.workspaces
where slug = 'kedai-siapin-demo';

select set_config('test.review_plan_id', plan.id::text, true)
from public.business_plans plan
where plan.workspace_id =
    current_setting('test.review_workspace_id')::uuid
  and plan.title = 'Rencana Pertumbuhan Kedai';

with inserted_review as (
  insert into public.business_reviews (
    workspace_id,
    business_plan_id,
    period_type,
    period_start,
    period_end,
    summary,
    next_steps,
    reviewed_by
  )
  values (
    current_setting('test.review_workspace_id')::uuid,
    current_setting('test.review_plan_id')::uuid,
    'custom',
    current_date - 2,
    current_date,
    'Evaluasi dengan perbedaan sumber hybrid.',
    'Rekonsiliasi bukti dan tindak lanjuti action yang terbuka.',
    'a1000000-0000-0000-0000-000000000001'
  )
  returning id
)
select set_config('test.warning_review_id', id::text, true)
from inserted_review;

with inserted_review as (
  insert into public.business_reviews (
    workspace_id,
    business_plan_id,
    period_type,
    period_start,
    period_end,
    summary,
    next_steps,
    reviewed_by
  )
  values (
    current_setting('test.review_workspace_id')::uuid,
    current_setting('test.review_plan_id')::uuid,
    'custom',
    current_date + 1,
    current_date + 7,
    'Evaluasi yang periodenya belum selesai.',
    'Tunggu periode evaluasi berakhir.',
    'a1000000-0000-0000-0000-000000000001'
  )
  returning id
)
select set_config('test.future_review_id', id::text, true)
from inserted_review;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@siapin.local"}',
  true
);

do $$
declare
  plan_id uuid;
  review_id uuid;
  target_id uuid;
  metric_id uuid;
  warning_rejected boolean := false;
  blocker_rejected boolean := false;
begin
  plan_id := current_setting('test.review_plan_id')::uuid;
  review_id := current_setting('test.warning_review_id')::uuid;

  select target.id, metric.id
  into target_id, metric_id
  from public.goal_targets target
  join public.metric_definitions metric
    on metric.workspace_id = target.workspace_id
    and metric.id = target.metric_definition_id
  join public.business_goals goal
    on goal.workspace_id = target.workspace_id
    and goal.id = target.business_goal_id
  where goal.business_plan_id = plan_id
    and metric.code = 'monthly_revenue';

  update public.metric_definitions
  set reconciliation_tolerance_percent = 0
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
    current_setting('test.review_workspace_id')::uuid,
    target_id,
    100,
    now(),
    'manual',
    'Finalization warning contract',
    'a1000000-0000-0000-0000-000000000001'
  );

  begin
    perform public.finalize_business_review(review_id, false);
  exception
    when raise_exception then warning_rejected := true;
  end;

  if not warning_rejected then
    raise exception 'Finalization ignored unacknowledged warnings';
  end if;

  perform public.finalize_business_review(review_id, true);

  if not exists (
    select 1
    from public.business_reviews
    where id = review_id
      and status = 'finalized'
      and finalized_at is not null
  ) then
    raise exception 'Acknowledged review was not finalized';
  end if;

  perform public.finalize_business_review(review_id, false);

  review_id := current_setting('test.future_review_id')::uuid;

  begin
    perform public.finalize_business_review(review_id, true);
  exception
    when check_violation then blocker_rejected := true;
  end;

  if not blocker_rejected then
    raise exception 'Future review period bypassed a blocking readiness issue';
  end if;
end;
$$;

select set_config('test.review_id', review.id::text, true)
from public.business_reviews review
where review.workspace_id =
    current_setting('test.review_workspace_id')::uuid
order by review.created_at desc
limit 1;

select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000006","role":"authenticated","email":"outsider@siapin.local"}',
  true
);

do $$
declare
  access_rejected boolean := false;
begin
  begin
    perform public.get_business_review_readiness(
      current_setting('test.review_id')::uuid
    );
  exception
    when insufficient_privilege then access_rejected := true;
  end;

  if not access_rejected then
    raise exception 'Outsider inspected business review readiness';
  end if;
end;
$$;

reset role;

select pass(
  'Business review finalization enforces blockers, warning acknowledgement, idempotency, and workspace isolation'
);

select * from finish();

rollback;
