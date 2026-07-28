\set ON_ERROR_STOP on

begin;

select plan(1);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@siapin.local"}',
  true
);

insert into public.business_plans (
  id,
  workspace_id,
  title,
  description,
  status,
  visibility,
  starts_on,
  ends_on,
  owner_id,
  created_by
)
select
  'a1910000-0000-0000-0000-000000000001',
  workspace.id,
  'Planning lifecycle contract',
  'Deterministic plan used to verify canonical lifecycle transitions.',
  'draft',
  'workspace',
  current_date,
  current_date + 90,
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001'
from public.workspaces workspace
where workspace.slug = 'kedai-siapin-demo';

do $$
declare
  blocked boolean := false;
begin
  begin
    perform public.transition_business_plan(
      'a1910000-0000-0000-0000-000000000001',
      'active'
    );
  exception
    when check_violation then blocked := true;
  end;

  if not blocked then
    raise exception 'A plan without a goal was activated';
  end if;
end;
$$;

insert into public.business_goals (
  id,
  workspace_id,
  business_plan_id,
  title,
  status,
  target_date,
  owner_id,
  created_by
)
select
  'a1910000-0000-0000-0000-000000000002',
  workspace.id,
  'a1910000-0000-0000-0000-000000000001',
  'Validate lifecycle invariants',
  'draft',
  current_date + 60,
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001'
from public.workspaces workspace
where workspace.slug = 'kedai-siapin-demo';

select public.transition_business_plan(
  'a1910000-0000-0000-0000-000000000001',
  'active'
);
select public.transition_business_goal(
  'a1910000-0000-0000-0000-000000000002',
  'active'
);
select public.transition_business_goal(
  'a1910000-0000-0000-0000-000000000002',
  'missed',
  'The original target date elapsed.'
);

do $$
declare
  blocked boolean := false;
begin
  begin
    perform public.transition_business_goal(
      'a1910000-0000-0000-0000-000000000002',
      'active'
    );
  exception
    when check_violation then blocked := true;
  end;

  if not blocked then
    raise exception 'A missed goal reopened without a replacement target date';
  end if;
end;
$$;

select public.transition_business_goal(
  'a1910000-0000-0000-0000-000000000002',
  'active',
  null,
  current_date + 120
);

insert into public.business_initiatives (
  id,
  workspace_id,
  business_plan_id,
  business_goal_id,
  title,
  status,
  owner_id,
  created_by
)
select
  'a1910000-0000-0000-0000-000000000003',
  workspace.id,
  'a1910000-0000-0000-0000-000000000001',
  'a1910000-0000-0000-0000-000000000002',
  'Exercise lifecycle RPCs',
  'planned',
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001'
from public.workspaces workspace
where workspace.slug = 'kedai-siapin-demo';

insert into public.action_items (
  id,
  workspace_id,
  business_initiative_id,
  title,
  status,
  priority,
  assignee_id,
  due_on,
  created_by
)
select
  'a1910000-0000-0000-0000-000000000004',
  workspace.id,
  'a1910000-0000-0000-0000-000000000003',
  'Run the lifecycle contract',
  'todo',
  2,
  'a1000000-0000-0000-0000-000000000001',
  current_date + 14,
  'a1000000-0000-0000-0000-000000000001'
from public.workspaces workspace
where workspace.slug = 'kedai-siapin-demo';

do $$
declare
  blocked boolean := false;
begin
  begin
    update public.action_items
    set status = 'in_progress'
    where id = 'a1910000-0000-0000-0000-000000000004';
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'A lifecycle status bypassed its canonical RPC';
  end if;
end;
$$;

select public.transition_business_initiative(
  'a1910000-0000-0000-0000-000000000003',
  'active'
);
select public.transition_action_item(
  'a1910000-0000-0000-0000-000000000004',
  'in_progress'
);

do $$
declare
  blocked boolean := false;
begin
  begin
    perform public.transition_action_item(
      'a1910000-0000-0000-0000-000000000004',
      'blocked'
    );
  exception
    when check_violation then blocked := true;
  end;

  if not blocked then
    raise exception 'An action was blocked without a reason';
  end if;
end;
$$;

select public.transition_action_item(
  'a1910000-0000-0000-0000-000000000004',
  'blocked',
  'Waiting for a required external decision.'
);
select public.transition_action_item(
  'a1910000-0000-0000-0000-000000000004',
  'in_progress'
);
select public.transition_action_item(
  'a1910000-0000-0000-0000-000000000004',
  'completed'
);
select public.transition_action_item(
  'a1910000-0000-0000-0000-000000000004',
  'in_progress'
);

do $$
declare
  blocked boolean := false;
begin
  begin
    perform public.transition_business_initiative(
      'a1910000-0000-0000-0000-000000000003',
      'cancelled',
      'The initiative is no longer required.'
    );
  exception
    when check_violation then blocked := true;
  end;

  if not blocked then
    raise exception 'An initiative was cancelled with an unresolved action';
  end if;
end;
$$;

select public.transition_action_item(
  'a1910000-0000-0000-0000-000000000004',
  'cancelled',
  'Action intentionally discontinued.'
);
select public.transition_business_initiative(
  'a1910000-0000-0000-0000-000000000003',
  'cancelled',
  'All dependent actions have been resolved.'
);

select public.set_planning_record_archived(
  'action_item',
  'a1910000-0000-0000-0000-000000000004',
  true
);

do $$
declare
  update_blocked boolean := false;
  delete_blocked boolean := false;
  cascade_blocked boolean := false;
begin
  begin
    update public.action_items
    set title = 'Archived records must remain immutable'
    where id = 'a1910000-0000-0000-0000-000000000004';
  exception
    when check_violation then update_blocked := true;
  end;

  begin
    delete from public.action_items
    where id = 'a1910000-0000-0000-0000-000000000004';
  exception
    when check_violation then delete_blocked := true;
  end;

  begin
    delete from public.business_plans
    where id = 'a1910000-0000-0000-0000-000000000001';
  exception
    when check_violation then cascade_blocked := true;
  end;

  if not update_blocked then
    raise exception 'An archived action accepted a content update';
  end if;

  if not delete_blocked then
    raise exception 'An archived action was permanently deleted';
  end if;

  if not cascade_blocked then
    raise exception 'A parent cascade permanently deleted archived planning evidence';
  end if;
end;
$$;

select public.set_planning_record_archived(
  'action_item',
  'a1910000-0000-0000-0000-000000000004',
  false
);

do $$
begin
  if (
    select status
    from public.action_items
    where id = 'a1910000-0000-0000-0000-000000000004'
  ) <> 'todo' then
    raise exception 'Restoring an archived action did not return it to todo';
  end if;

  if not exists (
    select 1
    from public.action_items
    where id = 'a1910000-0000-0000-0000-000000000004'
      and reopened_at is not null
      and reopened_by = 'a1000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'Reopening a completed action did not preserve audit metadata';
  end if;
end;
$$;

select public.transition_business_plan(
  'a1910000-0000-0000-0000-000000000001',
  'archived'
);

do $$
declare
  blocked boolean := false;
begin
  begin
    update public.business_goals
    set title = 'Archived plan hierarchy must remain immutable'
    where id = 'a1910000-0000-0000-0000-000000000002';
  exception
    when check_violation then blocked := true;
  end;

  if not blocked then
    raise exception 'An archived plan accepted a child-record update';
  end if;
end;
$$;

select pass('planning lifecycle contracts passed');
select * from finish();

rollback;
