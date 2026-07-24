alter table public.business_plans
  add constraint business_plans_owner_workspace_member_fkey
    foreign key (workspace_id, owner_id)
    references public.workspace_members(workspace_id, user_id)
    on delete set null (owner_id)
    not valid;

alter table public.business_goals
  add constraint business_goals_owner_workspace_member_fkey
    foreign key (workspace_id, owner_id)
    references public.workspace_members(workspace_id, user_id)
    on delete set null (owner_id)
    not valid;

alter table public.business_initiatives
  add constraint business_initiatives_owner_workspace_member_fkey
    foreign key (workspace_id, owner_id)
    references public.workspace_members(workspace_id, user_id)
    on delete set null (owner_id)
    not valid;

alter table public.action_items
  add constraint action_items_assignee_workspace_member_fkey
    foreign key (workspace_id, assignee_id)
    references public.workspace_members(workspace_id, user_id)
    on delete set null (assignee_id)
    not valid;

alter table public.business_plans
  validate constraint business_plans_owner_workspace_member_fkey;
alter table public.business_goals
  validate constraint business_goals_owner_workspace_member_fkey;
alter table public.business_initiatives
  validate constraint business_initiatives_owner_workspace_member_fkey;
alter table public.action_items
  validate constraint action_items_assignee_workspace_member_fkey;

create or replace function private.validate_business_initiative_goal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.business_goal_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.business_goals goal
    where goal.workspace_id = new.workspace_id
      and goal.id = new.business_goal_id
      and goal.business_plan_id = new.business_plan_id
  ) then
    raise exception
      'A business initiative goal must belong to the same business plan'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_business_initiative_goal()
from public, anon, authenticated;

create trigger business_initiatives_validate_goal_plan
before insert or update of workspace_id, business_plan_id, business_goal_id
on public.business_initiatives
for each row execute function private.validate_business_initiative_goal();

create or replace function private.validate_transaction_category_parent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent_transaction_type public.transaction_type;
begin
  if new.parent_category_id is null then
    return new;
  end if;

  select transaction_type
  into parent_transaction_type
  from public.transaction_categories
  where workspace_id = new.workspace_id
    and id = new.parent_category_id;

  if parent_transaction_type is distinct from new.transaction_type then
    raise exception
      'Transaction category and its parent must use the same transaction type'
      using errcode = '23514';
  end if;

  if exists (
    with recursive category_ancestors as (
      select category.id, category.parent_category_id
      from public.transaction_categories category
      where category.workspace_id = new.workspace_id
        and category.id = new.parent_category_id

      union all

      select parent.id, parent.parent_category_id
      from public.transaction_categories parent
      join category_ancestors child
        on child.parent_category_id = parent.id
      where parent.workspace_id = new.workspace_id
    )
    select 1
    from category_ancestors
    where id = new.id
  ) then
    raise exception 'Transaction category hierarchy cannot contain a cycle'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_transaction_category_parent()
from public, anon, authenticated;

create or replace function public.get_workspace_member_directory(
  target_workspace_id uuid
)
returns table (
  user_id uuid,
  display_name text,
  avatar_path text,
  membership_status public.membership_status,
  job_title text,
  joined_at timestamptz,
  workspace_role_id uuid,
  role_code text,
  role_name text,
  hierarchy_rank smallint,
  base_role public.workspace_role,
  is_owner_role boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.has_workspace_permission(
    target_workspace_id,
    'member.read'
  ) then
    raise exception 'Not authorized to view the workspace member directory'
      using errcode = '42501';
  end if;

  return query
  select
    member.user_id,
    profile.display_name,
    profile.avatar_path,
    member.status,
    member.job_title,
    member.joined_at,
    member.workspace_role_id,
    role_record.code,
    role_record.name,
    role_record.hierarchy_rank,
    role_record.base_role,
    role_record.is_owner_role
  from public.workspace_members member
  join public.profiles profile
    on profile.user_id = member.user_id
  join public.workspace_roles role_record
    on role_record.workspace_id = member.workspace_id
    and role_record.id = member.workspace_role_id
  where member.workspace_id = target_workspace_id
  order by
    role_record.hierarchy_rank desc,
    profile.display_name,
    member.user_id;
end;
$$;

revoke all on function public.get_workspace_member_directory(uuid)
from public, anon;
grant execute on function public.get_workspace_member_directory(uuid)
to authenticated;

comment on function public.get_workspace_member_directory(uuid) is
  'Returns only safe member-directory fields after checking member.read; it does not expose profile email, phone, or bio.';
