\set ON_ERROR_STOP on

begin;

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
  'a1900000-0000-0000-0000-000000000001',
  workspace.id,
  'Restricted Planning Contract',
  'Deterministic restricted plan used by the SQL permission matrix.',
  'draft',
  'restricted',
  current_date,
  current_date + 90,
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001'
from public.workspaces workspace
where workspace.slug = 'kedai-siapin-demo';

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
  'a1900000-0000-0000-0000-000000000002',
  workspace.id,
  'a1900000-0000-0000-0000-000000000001',
  'Restricted goal',
  'draft',
  current_date + 60,
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001'
from public.workspaces workspace
where workspace.slug = 'kedai-siapin-demo';

insert into public.business_initiatives (
  id,
  workspace_id,
  business_plan_id,
  business_goal_id,
  title,
  status,
  starts_on,
  ends_on,
  owner_id,
  created_by
)
select
  'a1900000-0000-0000-0000-000000000003',
  workspace.id,
  'a1900000-0000-0000-0000-000000000001',
  'a1900000-0000-0000-0000-000000000002',
  'Restricted initiative',
  'planned',
  current_date,
  current_date + 30,
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001'
from public.workspaces workspace
where workspace.slug = 'kedai-siapin-demo';

-- Assignees receive visibility before owner creates their restricted actions.
insert into public.business_plan_role_grants (
  workspace_id,
  business_plan_id,
  workspace_role_id,
  granted_by
)
select
  workspace.id,
  'a1900000-0000-0000-0000-000000000001',
  role_record.id,
  'a1000000-0000-0000-0000-000000000001'
from public.workspaces workspace
join public.workspace_roles role_record
  on role_record.workspace_id = workspace.id
  and role_record.code = 'manager'
where workspace.slug = 'kedai-siapin-demo';

insert into public.business_plan_member_grants (
  workspace_id,
  business_plan_id,
  user_id,
  granted_by
)
select
  workspace.id,
  'a1900000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000003',
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
  action_id,
  workspace.id,
  'a1900000-0000-0000-0000-000000000003',
  action_title,
  'todo',
  2,
  assignee_id,
  current_date + 14,
  'a1000000-0000-0000-0000-000000000001'
from public.workspaces workspace
cross join (
  values
    (
      'a1900000-0000-0000-0000-000000000004'::uuid,
      'Staff restricted action',
      'a1000000-0000-0000-0000-000000000003'::uuid
    ),
    (
      'a1900000-0000-0000-0000-000000000005'::uuid,
      'Manager restricted action',
      'a1000000-0000-0000-0000-000000000002'::uuid
    )
) as fixture(action_id, action_title, assignee_id)
where workspace.slug = 'kedai-siapin-demo';

-- Remove the setup grants to verify that manager has no implicit bypass.
delete from public.business_plan_role_grants
where business_plan_id = 'a1900000-0000-0000-0000-000000000001';

select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000002","role":"authenticated","email":"manager@siapin.local"}',
  true
);

do $$
begin
  if exists (
    select 1
    from public.business_plans
    where id = 'a1900000-0000-0000-0000-000000000001'
  ) then
    raise exception 'Manager bypassed restricted plan visibility';
  end if;
end;
$$;

-- Owner grants the manager role and individual viewer/staff/suspended members.
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@siapin.local"}',
  true
);

insert into public.business_plan_role_grants (
  workspace_id,
  business_plan_id,
  workspace_role_id,
  granted_by
)
select
  workspace.id,
  'a1900000-0000-0000-0000-000000000001',
  role_record.id,
  'a1000000-0000-0000-0000-000000000001'
from public.workspaces workspace
join public.workspace_roles role_record
  on role_record.workspace_id = workspace.id
  and role_record.code = 'manager'
where workspace.slug = 'kedai-siapin-demo';

insert into public.business_plan_member_grants (
  workspace_id,
  business_plan_id,
  user_id,
  granted_by
)
select
  workspace.id,
  'a1900000-0000-0000-0000-000000000001',
  member_id,
  'a1000000-0000-0000-0000-000000000001'
from public.workspaces workspace
cross join (
  values
    ('a1000000-0000-0000-0000-000000000003'::uuid),
    ('a1000000-0000-0000-0000-000000000004'::uuid),
    ('a1000000-0000-0000-0000-000000000005'::uuid)
) as fixture(member_id)
where workspace.slug = 'kedai-siapin-demo'
on conflict do nothing;

-- Role grants propagate through the complete plan hierarchy.
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000002","role":"authenticated","email":"manager@siapin.local"}',
  true
);

do $$
begin
  if not exists (
    select 1 from public.business_plans
    where id = 'a1900000-0000-0000-0000-000000000001'
  ) or not exists (
    select 1 from public.business_goals
    where id = 'a1900000-0000-0000-0000-000000000002'
  ) or not exists (
    select 1 from public.business_initiatives
    where id = 'a1900000-0000-0000-0000-000000000003'
  ) then
    raise exception 'Manager role grant did not propagate through the plan';
  end if;
end;
$$;

-- Staff receives plan context but only sees and updates its assigned action.
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000003","role":"authenticated","email":"staff@siapin.local"}',
  true
);

do $$
begin
  if (
    select count(*)
    from public.action_items
    where business_initiative_id =
      'a1900000-0000-0000-0000-000000000003'
  ) <> 1 then
    raise exception 'Staff can read actions outside its assignment';
  end if;
end;
$$;

select public.transition_action_item(
  'a1900000-0000-0000-0000-000000000004',
  'in_progress'
);

do $$
begin
  if (
    select status
    from public.action_items
    where id = 'a1900000-0000-0000-0000-000000000004'
  ) <> 'in_progress' then
    raise exception 'Staff could not update its assigned action';
  end if;
end;
$$;

-- Viewer has action.read_all and can see both actions after its member grant.
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000004","role":"authenticated","email":"viewer@siapin.local"}',
  true
);

do $$
begin
  if (
    select count(*)
    from public.action_items
    where business_initiative_id =
      'a1900000-0000-0000-0000-000000000003'
  ) <> 2 then
    raise exception 'Viewer member grant did not expose visible-plan actions';
  end if;
end;
$$;

-- A suspended member remains denied even with an explicit member grant.
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000005","role":"authenticated","email":"suspended@siapin.local"}',
  true
);

do $$
begin
  if exists (
    select 1
    from public.business_plans
    where id = 'a1900000-0000-0000-0000-000000000001'
  ) then
    raise exception 'Suspended member used a restricted-plan grant';
  end if;
end;
$$;

-- Default role permissions follow the frozen product matrix.
reset role;

do $$
declare
  target_workspace_id uuid;
begin
  select id into target_workspace_id
  from public.workspaces
  where slug = 'kedai-siapin-demo';

  if exists (
    select 1
    from public.workspace_role_permissions role_permission
    join public.workspace_roles role_record
      on role_record.id = role_permission.workspace_role_id
    where role_record.workspace_id = target_workspace_id
      and role_record.code = 'manager'
      and role_permission.permission_code = 'plan.delete'
  ) then
    raise exception 'Manager retained default plan.delete';
  end if;

  if not exists (
    select 1
    from public.workspace_role_permissions role_permission
    join public.workspace_roles role_record
      on role_record.id = role_permission.workspace_role_id
    where role_record.workspace_id = target_workspace_id
      and role_record.code = 'member'
      and role_permission.permission_code = 'action.update_own'
  ) then
    raise exception 'Staff lacks default action.update_own';
  end if;
end;
$$;

rollback;
