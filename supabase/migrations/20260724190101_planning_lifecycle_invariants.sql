create type public.planning_record_type as enum (
  'business_goal',
  'business_initiative',
  'action_item'
);

alter table public.business_plans
  add column status_reason text
    check (status_reason is null or char_length(trim(status_reason)) between 3 and 1000),
  add column archived_at timestamptz,
  add column archived_by uuid references auth.users(id) on delete restrict,
  add constraint business_plans_archive_state_check check (
    (
      status = 'archived'
      and archived_at is not null
      and archived_by is not null
    )
    or
    (
      status <> 'archived'
      and archived_at is null
      and archived_by is null
    )
  ),
  add constraint business_plans_status_reason_required_check check (
    status not in ('cancelled') or status_reason is not null
  );

alter table public.business_goals
  add column status_reason text
    check (status_reason is null or char_length(trim(status_reason)) between 3 and 1000),
  add column archived_at timestamptz,
  add column archived_by uuid references auth.users(id) on delete restrict,
  add constraint business_goals_archive_state_check check (
    (archived_at is null and archived_by is null)
    or
    (archived_at is not null and archived_by is not null)
  ),
  add constraint business_goals_status_reason_required_check check (
    status not in ('missed', 'cancelled') or status_reason is not null
  );

alter table public.business_initiatives
  add column unlinked_goal_context text
    check (
      unlinked_goal_context is null
      or char_length(trim(unlinked_goal_context)) between 5 and 1000
    ),
  add column status_reason text
    check (status_reason is null or char_length(trim(status_reason)) between 3 and 1000),
  add column archived_at timestamptz,
  add column archived_by uuid references auth.users(id) on delete restrict,
  add constraint business_initiatives_goal_context_check check (
    (
      business_goal_id is null
      and unlinked_goal_context is not null
    )
    or
    (
      business_goal_id is not null
      and unlinked_goal_context is null
    )
  ),
  add constraint business_initiatives_archive_state_check check (
    (archived_at is null and archived_by is null)
    or
    (archived_at is not null and archived_by is not null)
  ),
  add constraint business_initiatives_status_reason_required_check check (
    status <> 'cancelled' or status_reason is not null
  );

alter table public.action_items
  add column blocked_reason text
    check (
      blocked_reason is null
      or char_length(trim(blocked_reason)) between 3 and 1000
    ),
  add column blocked_at timestamptz,
  add column reopened_at timestamptz,
  add column reopened_by uuid references auth.users(id) on delete set null,
  add column status_reason text
    check (status_reason is null or char_length(trim(status_reason)) between 3 and 1000),
  add column archived_at timestamptz,
  add column archived_by uuid references auth.users(id) on delete restrict,
  add constraint action_items_blocked_state_check check (
    (
      status = 'blocked'
      and blocked_reason is not null
      and blocked_at is not null
    )
    or
    (
      status <> 'blocked'
      and blocked_reason is null
      and blocked_at is null
    )
  ),
  add constraint action_items_archive_state_check check (
    (archived_at is null and archived_by is null)
    or
    (archived_at is not null and archived_by is not null)
  ),
  add constraint action_items_status_reason_required_check check (
    status <> 'cancelled' or status_reason is not null
  );

do $$
begin
  if exists (
    select 1
    from public.action_items
    where assignee_id is null or due_on is null
  ) then
    raise exception
      'Action items require explicit assignees and deadlines before lifecycle migration'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.business_initiatives
    where business_goal_id is null
      and unlinked_goal_context is null
  ) then
    raise exception
      'Goal-independent initiatives require explicit context before lifecycle migration'
      using errcode = '23514';
  end if;
end;
$$;

alter table public.action_items
  drop constraint action_items_assignee_id_fkey,
  add constraint action_items_assignee_id_fkey
    foreign key (assignee_id) references auth.users(id) on delete restrict,
  alter column assignee_id set not null,
  alter column due_on set not null;

create index business_plans_workspace_archive_idx
  on public.business_plans (workspace_id, archived_at, updated_at desc);
create index business_goals_plan_archive_idx
  on public.business_goals (business_plan_id, archived_at, target_date);
create index business_initiatives_plan_archive_idx
  on public.business_initiatives (business_plan_id, archived_at, status);
create index action_items_initiative_archive_idx
  on public.action_items (business_initiative_id, archived_at, status);

revoke update on public.business_plans from authenticated;
grant update (
  title,
  description,
  starts_on,
  ends_on,
  owner_id,
  visibility
) on public.business_plans to authenticated;

revoke update on public.business_goals from authenticated;
grant update (
  title,
  description,
  target_date,
  owner_id
) on public.business_goals to authenticated;

revoke update on public.business_initiatives from authenticated;
grant update (
  business_goal_id,
  title,
  description,
  starts_on,
  ends_on,
  budget_amount,
  owner_id,
  unlinked_goal_context
) on public.business_initiatives to authenticated;

revoke update on public.action_items from authenticated;
grant update (
  title,
  description,
  priority,
  assignee_id,
  starts_on,
  due_on
) on public.action_items to authenticated;

create or replace function private.validate_planning_insert_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'business_plans' and (
    new.status <> 'draft'
    or new.status_reason is not null
    or new.archived_at is not null
    or new.archived_by is not null
  ) then
    raise exception 'A business plan must be created as an unarchived draft'
      using errcode = '23514';
  elsif tg_table_name = 'business_goals' and (
    new.status <> 'draft'
    or new.status_reason is not null
    or new.archived_at is not null
    or new.archived_by is not null
  ) then
    raise exception 'A business goal must be created as an unarchived draft'
      using errcode = '23514';
  elsif tg_table_name = 'business_initiatives' and (
    new.status <> 'planned'
    or new.status_reason is not null
    or new.archived_at is not null
    or new.archived_by is not null
  ) then
    raise exception 'A business initiative must be created as unarchived and planned'
      using errcode = '23514';
  elsif tg_table_name = 'action_items' and (
    new.status <> 'todo'
    or new.blocked_reason is not null
    or new.blocked_at is not null
    or new.completed_at is not null
    or new.reopened_at is not null
    or new.reopened_by is not null
    or new.status_reason is not null
    or new.archived_at is not null
    or new.archived_by is not null
  ) then
    raise exception 'An action item must be created as an unarchived todo'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_planning_insert_state()
from public, anon, authenticated;

create trigger business_plans_validate_insert_state
before insert on public.business_plans
for each row execute function private.validate_planning_insert_state();
create trigger business_goals_validate_insert_state
before insert on public.business_goals
for each row execute function private.validate_planning_insert_state();
create trigger business_initiatives_validate_insert_state
before insert on public.business_initiatives
for each row execute function private.validate_planning_insert_state();
create trigger action_items_validate_insert_state
before insert on public.action_items
for each row execute function private.validate_planning_insert_state();

create or replace function private.validate_action_assignment_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.assignee_id is distinct from old.assignee_id
    and not private.has_workspace_permission(new.workspace_id, 'action.assign') then
    raise exception 'Not authorized to reassign this action item'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_action_assignment_change()
from public, anon, authenticated;

create trigger action_items_validate_assignment_change
before update of assignee_id on public.action_items
for each row execute function private.validate_action_assignment_change();

create or replace function public.transition_business_plan(
  target_business_plan_id uuid,
  target_status public.business_plan_status,
  transition_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  plan_record public.business_plans%rowtype;
  normalized_reason text := nullif(trim(transition_reason), '');
begin
  select * into plan_record
  from public.business_plans
  where id = target_business_plan_id
  for update;

  if plan_record.id is null then
    raise exception 'Business plan not found' using errcode = 'P0002';
  end if;
  if actor_id is null
    or not private.can_read_business_plan(plan_record.id)
    or not private.has_workspace_permission(plan_record.workspace_id, 'plan.update') then
    raise exception 'Not authorized to transition this business plan'
      using errcode = '42501';
  end if;
  if plan_record.status = target_status then
    return;
  end if;
  if not (
    (plan_record.status = 'draft' and target_status in ('active', 'cancelled', 'archived'))
    or (plan_record.status = 'active' and target_status in ('completed', 'cancelled', 'archived'))
    or (plan_record.status = 'completed' and target_status in ('active', 'archived'))
    or (plan_record.status = 'cancelled' and target_status = 'archived')
    or (plan_record.status = 'archived' and target_status = 'draft')
  ) then
    raise exception 'Invalid business plan status transition'
      using errcode = '23514';
  end if;
  if target_status = 'active' and not exists (
    select 1
    from public.business_goals goal
    where goal.business_plan_id = plan_record.id
      and goal.archived_at is null
  ) then
    raise exception 'A business plan requires at least one goal before activation'
      using errcode = '23514';
  end if;
  if target_status = 'cancelled' and normalized_reason is null then
    raise exception 'Cancelling a business plan requires a reason'
      using errcode = '23514';
  end if;

  update public.business_plans
  set
    status = target_status,
    status_reason = case
      when target_status = 'cancelled' then normalized_reason
      else null
    end,
    archived_at = case when target_status = 'archived' then now() else null end,
    archived_by = case when target_status = 'archived' then actor_id else null end,
    updated_at = now()
  where id = plan_record.id;
end;
$$;

create or replace function public.transition_business_goal(
  target_business_goal_id uuid,
  target_status public.business_goal_status,
  transition_reason text default null,
  replacement_target_date date default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  goal_record public.business_goals%rowtype;
  normalized_reason text := nullif(trim(transition_reason), '');
begin
  select * into goal_record
  from public.business_goals
  where id = target_business_goal_id
  for update;

  if goal_record.id is null then
    raise exception 'Business goal not found' using errcode = 'P0002';
  end if;
  if not private.can_read_business_goal(goal_record.id)
    or not private.has_workspace_permission(goal_record.workspace_id, 'goal.manage') then
    raise exception 'Not authorized to transition this business goal'
      using errcode = '42501';
  end if;
  if goal_record.status = target_status then
    return;
  end if;
  if not (
    (goal_record.status = 'draft' and target_status in ('active', 'cancelled'))
    or (goal_record.status = 'active' and target_status in ('achieved', 'missed', 'cancelled'))
    or (goal_record.status in ('achieved', 'missed') and target_status = 'active')
  ) then
    raise exception 'Invalid business goal status transition'
      using errcode = '23514';
  end if;
  if target_status in ('missed', 'cancelled') and normalized_reason is null then
    raise exception 'This business goal transition requires a reason'
      using errcode = '23514';
  end if;
  if goal_record.status = 'missed'
    and target_status = 'active'
    and replacement_target_date is null then
    raise exception 'Reopening a missed goal requires a new target date'
      using errcode = '23514';
  end if;

  update public.business_goals
  set
    status = target_status,
    status_reason = case
      when target_status in ('missed', 'cancelled') then normalized_reason
      else null
    end,
    target_date = coalesce(replacement_target_date, target_date),
    updated_at = now()
  where id = goal_record.id;
end;
$$;

create or replace function public.transition_business_initiative(
  target_business_initiative_id uuid,
  target_status public.business_initiative_status,
  transition_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  initiative_record public.business_initiatives%rowtype;
  normalized_reason text := nullif(trim(transition_reason), '');
begin
  select * into initiative_record
  from public.business_initiatives
  where id = target_business_initiative_id
  for update;

  if initiative_record.id is null then
    raise exception 'Business initiative not found' using errcode = 'P0002';
  end if;
  if not private.can_read_business_initiative(initiative_record.id)
    or not private.has_workspace_permission(
      initiative_record.workspace_id,
      'initiative.manage'
    ) then
    raise exception 'Not authorized to transition this business initiative'
      using errcode = '42501';
  end if;
  if initiative_record.status = target_status then
    return;
  end if;
  if not (
    (initiative_record.status = 'planned' and target_status in ('active', 'cancelled'))
    or (initiative_record.status = 'active' and target_status in ('paused', 'completed', 'cancelled'))
    or (initiative_record.status = 'paused' and target_status in ('active', 'cancelled'))
    or (initiative_record.status = 'completed' and target_status = 'active')
  ) then
    raise exception 'Invalid business initiative status transition'
      using errcode = '23514';
  end if;
  if target_status = 'cancelled' and normalized_reason is null then
    raise exception 'Cancelling a business initiative requires a reason'
      using errcode = '23514';
  end if;
  if target_status = 'cancelled' and exists (
    select 1
    from public.action_items action
    where action.business_initiative_id = initiative_record.id
      and action.status not in ('completed', 'cancelled')
  ) then
    raise exception
      'Resolve, move, or cancel active action items before cancelling the initiative'
      using errcode = '23514';
  end if;

  update public.business_initiatives
  set
    status = target_status,
    status_reason = case
      when target_status = 'cancelled' then normalized_reason
      else null
    end,
    updated_at = now()
  where id = initiative_record.id;
end;
$$;

create or replace function public.transition_action_item(
  target_action_item_id uuid,
  target_status public.action_item_status,
  transition_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  action_record public.action_items%rowtype;
  normalized_reason text := nullif(trim(transition_reason), '');
begin
  select * into action_record
  from public.action_items
  where id = target_action_item_id
  for update;

  if action_record.id is null then
    raise exception 'Action item not found' using errcode = 'P0002';
  end if;
  if not private.can_update_action_item(action_record.id) then
    raise exception 'Not authorized to transition this action item'
      using errcode = '42501';
  end if;
  if action_record.status = target_status then
    return;
  end if;
  if not (
    (action_record.status = 'todo' and target_status in ('in_progress', 'cancelled'))
    or (action_record.status = 'in_progress' and target_status in ('blocked', 'completed', 'cancelled'))
    or (action_record.status = 'blocked' and target_status in ('in_progress', 'cancelled'))
    or (action_record.status = 'completed' and target_status = 'in_progress')
  ) then
    raise exception 'Invalid action item status transition'
      using errcode = '23514';
  end if;
  if target_status in ('blocked', 'cancelled') and normalized_reason is null then
    raise exception 'This action item transition requires a reason'
      using errcode = '23514';
  end if;

  update public.action_items
  set
    status = target_status,
    blocked_reason = case when target_status = 'blocked' then normalized_reason else null end,
    blocked_at = case when target_status = 'blocked' then now() else null end,
    completed_at = case when target_status = 'completed' then now() else null end,
    reopened_at = case
      when action_record.status = 'completed' and target_status = 'in_progress'
        then now()
      else reopened_at
    end,
    reopened_by = case
      when action_record.status = 'completed' and target_status = 'in_progress'
        then actor_id
      else reopened_by
    end,
    status_reason = case when target_status = 'cancelled' then normalized_reason else null end,
    updated_at = now()
  where id = action_record.id;
end;
$$;

create or replace function public.set_planning_record_archived(
  target_record_type public.planning_record_type,
  target_record_id uuid,
  should_archive boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_workspace_id uuid;
begin
  case target_record_type
    when 'business_goal' then
      select workspace_id into target_workspace_id
      from public.business_goals
      where id = target_record_id
        and private.can_read_business_goal(id)
      for update;
    when 'business_initiative' then
      select workspace_id into target_workspace_id
      from public.business_initiatives
      where id = target_record_id
        and private.can_read_business_initiative(id)
      for update;
    when 'action_item' then
      select workspace_id into target_workspace_id
      from public.action_items
      where id = target_record_id
        and private.can_read_action_item(id)
      for update;
  end case;

  if target_workspace_id is null then
    raise exception 'Planning record not found or unavailable'
      using errcode = 'P0002';
  end if;
  if not private.has_workspace_permission(target_workspace_id, 'plan.update') then
    raise exception 'Not authorized to archive this planning record'
      using errcode = '42501';
  end if;

  case target_record_type
    when 'business_goal' then
      update public.business_goals
      set
        archived_at = case when should_archive then now() else null end,
        archived_by = case when should_archive then actor_id else null end,
        status = case when should_archive then status else 'draft' end,
        status_reason = case when should_archive then status_reason else null end,
        updated_at = now()
      where id = target_record_id;
    when 'business_initiative' then
      update public.business_initiatives
      set
        archived_at = case when should_archive then now() else null end,
        archived_by = case when should_archive then actor_id else null end,
        status = case when should_archive then status else 'planned' end,
        status_reason = case when should_archive then status_reason else null end,
        updated_at = now()
      where id = target_record_id;
    when 'action_item' then
      update public.action_items
      set
        archived_at = case when should_archive then now() else null end,
        archived_by = case when should_archive then actor_id else null end,
        status = case when should_archive then status else 'todo' end,
        blocked_reason = case when should_archive then blocked_reason else null end,
        blocked_at = case when should_archive then blocked_at else null end,
        completed_at = case when should_archive then completed_at else null end,
        status_reason = case when should_archive then status_reason else null end,
        updated_at = now()
      where id = target_record_id;
  end case;
end;
$$;

revoke all on function public.transition_business_plan(uuid, public.business_plan_status, text)
from public, anon;
revoke all on function public.transition_business_goal(uuid, public.business_goal_status, text, date)
from public, anon;
revoke all on function public.transition_business_initiative(uuid, public.business_initiative_status, text)
from public, anon;
revoke all on function public.transition_action_item(uuid, public.action_item_status, text)
from public, anon;
revoke all on function public.set_planning_record_archived(public.planning_record_type, uuid, boolean)
from public, anon;

grant execute on function public.transition_business_plan(uuid, public.business_plan_status, text)
to authenticated;
grant execute on function public.transition_business_goal(uuid, public.business_goal_status, text, date)
to authenticated;
grant execute on function public.transition_business_initiative(uuid, public.business_initiative_status, text)
to authenticated;
grant execute on function public.transition_action_item(uuid, public.action_item_status, text)
to authenticated;
grant execute on function public.set_planning_record_archived(public.planning_record_type, uuid, boolean)
to authenticated;

comment on function public.transition_business_plan(uuid, public.business_plan_status, text) is
  'Canonical locked business-plan lifecycle transition.';
comment on function public.transition_business_goal(uuid, public.business_goal_status, text, date) is
  'Canonical locked goal lifecycle transition; overdue remains derived, not a status.';
comment on function public.transition_business_initiative(uuid, public.business_initiative_status, text) is
  'Canonical locked initiative lifecycle transition.';
comment on function public.transition_action_item(uuid, public.action_item_status, text) is
  'Canonical locked action lifecycle transition.';
