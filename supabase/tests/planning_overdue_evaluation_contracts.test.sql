\set ON_ERROR_STOP on

begin;

select plan(1);

select set_config('test.overdue_workspace_id', id::text, true)
from public.workspaces
where slug = 'kedai-siapin-demo';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@siapin.local"}',
  true
);

do $$
declare
  goal_id uuid;
  initiative_id uuid;
  action_id uuid;
begin
  select goal.id
  into goal_id
  from public.business_goals goal
  where goal.workspace_id = current_setting('test.overdue_workspace_id')::uuid
  order by goal.created_at
  limit 1;

  select initiative.id
  into initiative_id
  from public.business_initiatives initiative
  where initiative.workspace_id =
      current_setting('test.overdue_workspace_id')::uuid
  order by initiative.created_at
  limit 1;

  select action.id
  into action_id
  from public.action_items action
  where action.workspace_id =
      current_setting('test.overdue_workspace_id')::uuid
  order by action.created_at
  limit 1;

  update public.business_goals
  set
    target_date = current_date - 4
  where id = goal_id;
  perform public.transition_business_goal(goal_id, 'active');

  update public.business_initiatives
  set
    starts_on = current_date - 4,
    ends_on = current_date - 3
  where id = initiative_id;
  perform public.transition_business_initiative(initiative_id, 'active');

  update public.action_items
  set
    due_on = current_date - 2
  where id = action_id;

  if (
    select count(*)
    from public.planning_overdue_evaluations evaluation
    where evaluation.record_id in (goal_id, initiative_id, action_id)
      and evaluation.is_overdue
      and evaluation.days_overdue > 0
  ) <> 3 then
    raise exception 'Canonical overdue evaluation missed an open record';
  end if;

  if not exists (
    select 1
    from public.business_goals
    where id = goal_id
      and status = 'active'
  ) then
    raise exception 'Overdue evaluation mutated the goal lifecycle status';
  end if;

  perform public.transition_action_item(action_id, 'completed');

  if exists (
    select 1
    from public.planning_overdue_evaluations
    where record_id = action_id
      and is_overdue
  ) then
    raise exception 'A completed action item remained overdue';
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
    from public.planning_overdue_evaluations
    where workspace_id = current_setting('test.overdue_workspace_id')::uuid
  ) then
    raise exception 'Outsider read workspace overdue evaluations';
  end if;
end;
$$;

reset role;

select pass(
  'Overdue evaluation is derived, lifecycle-safe, and workspace-isolated'
);

select * from finish();

rollback;
