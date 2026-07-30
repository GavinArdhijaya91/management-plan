create view public.planning_overdue_evaluations
with (security_invoker = true)
as
select
  goal.workspace_id,
  goal.business_plan_id,
  'business_goal'::public.planning_record_type as record_type,
  goal.id as record_id,
  goal.title,
  goal.status::text as lifecycle_status,
  goal.target_date as deadline,
  (
    goal.status = 'active'
    and goal.target_date is not null
    and goal.target_date < current_date
  ) as is_overdue,
  (
    goal.status = 'active'
    and goal.target_date = current_date
  ) as is_due_today,
  case
    when goal.status = 'active'
      and goal.target_date is not null
      and goal.target_date < current_date
      then current_date - goal.target_date
    else 0
  end as days_overdue
from public.business_goals goal

union all

select
  initiative.workspace_id,
  initiative.business_plan_id,
  'business_initiative'::public.planning_record_type,
  initiative.id,
  initiative.title,
  initiative.status::text,
  initiative.ends_on,
  (
    initiative.status in ('active', 'paused')
    and initiative.ends_on is not null
    and initiative.ends_on < current_date
  ),
  (
    initiative.status in ('active', 'paused')
    and initiative.ends_on = current_date
  ),
  case
    when initiative.status in ('active', 'paused')
      and initiative.ends_on is not null
      and initiative.ends_on < current_date
      then current_date - initiative.ends_on
    else 0
  end
from public.business_initiatives initiative

union all

select
  action.workspace_id,
  initiative.business_plan_id,
  'action_item'::public.planning_record_type,
  action.id,
  action.title,
  action.status::text,
  action.due_on,
  (
    action.status in ('todo', 'in_progress', 'blocked')
    and action.due_on < current_date
  ),
  (
    action.status in ('todo', 'in_progress', 'blocked')
    and action.due_on = current_date
  ),
  case
    when action.status in ('todo', 'in_progress', 'blocked')
      and action.due_on < current_date
      then current_date - action.due_on
    else 0
  end
from public.action_items action
join public.business_initiatives initiative
  on initiative.workspace_id = action.workspace_id
  and initiative.id = action.business_initiative_id;

revoke all on public.planning_overdue_evaluations from public, anon;
grant select on public.planning_overdue_evaluations to authenticated;

comment on view public.planning_overdue_evaluations is
  'Canonical derived deadline evaluation. Overdue never mutates lifecycle status; a review or explicit transition decides the next status.';
