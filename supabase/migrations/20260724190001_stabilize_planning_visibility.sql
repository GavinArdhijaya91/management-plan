create or replace function private.user_can_read_business_plan(
  target_business_plan_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_plans plan
    join public.workspace_members member
      on member.workspace_id = plan.workspace_id
      and member.user_id = target_user_id
      and member.status = 'active'
    join public.workspace_roles role_record
      on role_record.workspace_id = member.workspace_id
      and role_record.id = member.workspace_role_id
    where plan.id = target_business_plan_id
      and (
        role_record.is_owner_role
        or exists (
          select 1
          from public.workspace_role_permissions role_permission
          where role_permission.workspace_id = plan.workspace_id
            and role_permission.workspace_role_id = member.workspace_role_id
            and role_permission.permission_code = 'plan.read'
        )
      )
      and (
        plan.visibility = 'workspace'
        or role_record.is_owner_role
        or exists (
          select 1
          from public.business_plan_role_grants role_grant
          where role_grant.workspace_id = plan.workspace_id
            and role_grant.business_plan_id = plan.id
            and role_grant.workspace_role_id = member.workspace_role_id
        )
        or exists (
          select 1
          from public.business_plan_member_grants member_grant
          where member_grant.workspace_id = plan.workspace_id
            and member_grant.business_plan_id = plan.id
            and member_grant.user_id = member.user_id
        )
      )
  );
$$;

create or replace function private.can_read_business_plan(
  target_business_plan_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.user_can_read_business_plan(
    target_business_plan_id,
    (select auth.uid())
  );
$$;

create or replace function private.can_read_action_item(
  target_action_item_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.action_items action
    where action.id = target_action_item_id
      and private.can_read_business_initiative(action.business_initiative_id)
      and (
        action.assignee_id = (select auth.uid())
        or private.has_workspace_permission(action.workspace_id, 'action.read_all')
      )
  );
$$;

create or replace function private.validate_action_item_assignee_visibility()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_business_plan_id uuid;
begin
  if new.assignee_id is null then
    return new;
  end if;

  select initiative.business_plan_id
  into target_business_plan_id
  from public.business_initiatives initiative
  where initiative.workspace_id = new.workspace_id
    and initiative.id = new.business_initiative_id;

  if target_business_plan_id is null
    or not private.user_can_read_business_plan(
      target_business_plan_id,
      new.assignee_id
    ) then
    raise exception
      'Action assignee must have access to the parent business plan'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.user_can_read_business_plan(uuid, uuid)
from public, anon, authenticated;
revoke all on function private.validate_action_item_assignee_visibility()
from public, anon, authenticated;

create trigger action_items_validate_assignee_visibility
before insert or update of workspace_id, business_initiative_id, assignee_id
on public.action_items
for each row execute function private.validate_action_item_assignee_visibility();

comment on function private.user_can_read_business_plan(uuid, uuid) is
  'Auth-independent visibility check for trusted assignment and lifecycle invariants.';
