create type public.business_plan_visibility as enum (
  'workspace',
  'restricted'
);

alter table public.business_plans
  add column visibility public.business_plan_visibility
    not null default 'workspace';

insert into public.permission_definitions (code, resource, action, description)
values
  ('plan.create', 'plan', 'create', 'Create business plans.'),
  ('plan.update', 'plan', 'update', 'Update visible business plans.'),
  ('goal.manage', 'goal', 'manage', 'Create and update goals and targets.'),
  ('metric.manage', 'metric', 'manage', 'Create and update metric definitions and measurements.'),
  ('metric.reconcile', 'metric', 'reconcile', 'Resolve metric source differences.'),
  ('initiative.manage', 'initiative', 'manage', 'Create and update business initiatives.'),
  ('action.read_all', 'action', 'read_all', 'View every action item in visible plans.'),
  ('action.create', 'action', 'create', 'Create action items in visible plans.'),
  ('action.assign', 'action', 'assign', 'Assign action items to workspace members.'),
  ('action.update_own', 'action', 'update_own', 'Update assigned action items.'),
  ('action.update_all', 'action', 'update_all', 'Update every action item in visible plans.'),
  ('review.finalize', 'review', 'finalize', 'Finalize business reviews.')
on conflict (code) do update
set description = excluded.description;

-- Preserve the effective access of custom roles that used the legacy
-- plan.write umbrella before granular planning permissions existed.
insert into public.workspace_role_permissions (
  workspace_id,
  workspace_role_id,
  permission_code,
  granted_by
)
select
  legacy.workspace_id,
  legacy.workspace_role_id,
  new_permission.code,
  legacy.granted_by
from public.workspace_role_permissions legacy
cross join unnest(array[
  'plan.create',
  'plan.update',
  'goal.manage',
  'metric.manage',
  'initiative.manage',
  'action.read_all',
  'action.create',
  'action.assign',
  'action.update_all'
]) as new_permission(code)
where legacy.permission_code = 'plan.write'
on conflict do nothing;

-- System-role defaults are intentionally less permissive than the legacy
-- plan.write mapping. Owner access remains implicit and immutable.
delete from public.workspace_role_permissions role_permission
using public.workspace_roles role_record
where role_record.id = role_permission.workspace_role_id
  and role_record.workspace_id = role_permission.workspace_id
  and role_record.is_system
  and role_record.code in ('manager', 'member', 'viewer')
  and role_permission.permission_code in (
    'plan.create',
    'plan.update',
    'goal.manage',
    'metric.manage',
    'metric.reconcile',
    'initiative.manage',
    'action.read_all',
    'action.create',
    'action.assign',
    'action.update_own',
    'action.update_all',
    'review.finalize'
  );

insert into public.workspace_role_permissions (
  workspace_id,
  workspace_role_id,
  permission_code,
  granted_by
)
select
  role_record.workspace_id,
  role_record.id,
  default_permission.code,
  role_record.created_by
from public.workspace_roles role_record
cross join lateral unnest(
  case role_record.code
    when 'manager' then array[
      'plan.create',
      'plan.update',
      'goal.manage',
      'metric.manage',
      'initiative.manage',
      'action.read_all',
      'action.create',
      'action.assign',
      'action.update_all'
    ]
    when 'member' then array['action.update_own']
    when 'viewer' then array['action.read_all']
    else array[]::text[]
  end
) as default_permission(code)
where role_record.is_system
  and role_record.code in ('manager', 'member', 'viewer')
on conflict do nothing;

delete from public.workspace_role_permissions role_permission
using public.workspace_roles role_record
where role_record.id = role_permission.workspace_role_id
  and role_record.workspace_id = role_permission.workspace_id
  and role_record.is_system
  and (
    (role_record.code = 'manager' and role_permission.permission_code = 'plan.delete')
    or (
      role_record.code in ('member', 'viewer')
      and role_permission.permission_code in ('plan.write', 'plan.delete')
    )
  );

create or replace function private.apply_planning_role_defaults(
  target_workspace_id uuid,
  actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.workspace_role_permissions role_permission
  using public.workspace_roles role_record
  where role_record.id = role_permission.workspace_role_id
    and role_record.workspace_id = role_permission.workspace_id
    and role_record.workspace_id = target_workspace_id
    and role_record.is_system
    and (
      (
        role_record.code = 'manager'
        and role_permission.permission_code = 'plan.delete'
      )
      or (
        role_record.code in ('member', 'viewer')
        and role_permission.permission_code in ('plan.write', 'plan.delete')
      )
    );

  insert into public.workspace_role_permissions (
    workspace_id,
    workspace_role_id,
    permission_code,
    granted_by
  )
  select
    role_record.workspace_id,
    role_record.id,
    default_permission.code,
    actor_id
  from public.workspace_roles role_record
  cross join lateral unnest(
    case role_record.code
      when 'manager' then array[
        'plan.create',
        'plan.update',
        'goal.manage',
        'metric.manage',
        'initiative.manage',
        'action.read_all',
        'action.create',
        'action.assign',
        'action.update_all'
      ]
      when 'member' then array['action.update_own']
      when 'viewer' then array['action.read_all']
      else array[]::text[]
    end
  ) as default_permission(code)
  where role_record.workspace_id = target_workspace_id
    and role_record.is_system
    and role_record.code in ('manager', 'member', 'viewer')
  on conflict do nothing;
end;
$$;

revoke all on function private.apply_planning_role_defaults(uuid, uuid)
from public, anon, authenticated;

create or replace function private.handle_planning_role_defaults()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.apply_planning_role_defaults(new.id, new.created_by);
  return new;
end;
$$;

revoke all on function private.handle_planning_role_defaults()
from public, anon, authenticated;

create trigger zz_workspace_created_apply_planning_role_defaults
after insert on public.workspaces
for each row execute function private.handle_planning_role_defaults();

create or replace function private.sync_planning_compatibility_permission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.permission_code = 'review.finalize' then
    insert into public.workspace_role_permissions (
      workspace_id,
      workspace_role_id,
      permission_code,
      granted_by
    )
    values (
      new.workspace_id,
      new.workspace_role_id,
      'plan.write',
      new.granted_by
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

revoke all on function private.sync_planning_compatibility_permission()
from public, anon, authenticated;

create trigger workspace_role_permissions_sync_planning_compatibility
after insert on public.workspace_role_permissions
for each row execute function private.sync_planning_compatibility_permission();

create table public.business_plan_role_grants (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  business_plan_id uuid not null,
  workspace_role_id uuid not null,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (business_plan_id, workspace_role_id),
  foreign key (workspace_id, business_plan_id)
    references public.business_plans(workspace_id, id) on delete cascade,
  foreign key (workspace_id, workspace_role_id)
    references public.workspace_roles(workspace_id, id) on delete cascade
);

create table public.business_plan_member_grants (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  business_plan_id uuid not null,
  user_id uuid not null,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (business_plan_id, user_id),
  foreign key (workspace_id, business_plan_id)
    references public.business_plans(workspace_id, id) on delete cascade,
  foreign key (workspace_id, user_id)
    references public.workspace_members(workspace_id, user_id) on delete cascade
);

create index business_plan_role_grants_role_idx
  on public.business_plan_role_grants (workspace_id, workspace_role_id);
create index business_plan_member_grants_user_idx
  on public.business_plan_member_grants (workspace_id, user_id);

create or replace function private.is_workspace_owner(
  target_workspace_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members member
    join public.workspace_roles role_record
      on role_record.workspace_id = member.workspace_id
      and role_record.id = member.workspace_role_id
    where member.workspace_id = target_workspace_id
      and member.user_id = (select auth.uid())
      and member.status = 'active'
      and role_record.is_owner_role
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
  select exists (
    select 1
    from public.business_plans plan
    join public.workspace_members member
      on member.workspace_id = plan.workspace_id
      and member.user_id = (select auth.uid())
      and member.status = 'active'
    join public.workspace_roles role_record
      on role_record.workspace_id = member.workspace_id
      and role_record.id = member.workspace_role_id
    where plan.id = target_business_plan_id
      and private.has_workspace_permission(plan.workspace_id, 'plan.read')
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

create or replace function private.can_read_business_goal(
  target_business_goal_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_goals goal
    where goal.id = target_business_goal_id
      and private.can_read_business_plan(goal.business_plan_id)
  );
$$;

create or replace function private.can_read_goal_target(
  target_goal_target_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.goal_targets target
    where target.id = target_goal_target_id
      and private.can_read_business_goal(target.business_goal_id)
  );
$$;

create or replace function private.can_read_business_initiative(
  target_business_initiative_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_initiatives initiative
    where initiative.id = target_business_initiative_id
      and private.can_read_business_plan(initiative.business_plan_id)
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
        or action.created_by = (select auth.uid())
        or private.has_workspace_permission(action.workspace_id, 'action.read_all')
      )
  );
$$;

create or replace function private.can_update_action_item(
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
        private.has_workspace_permission(action.workspace_id, 'action.update_all')
        or (
          action.assignee_id = (select auth.uid())
          and private.has_workspace_permission(
            action.workspace_id,
            'action.update_own'
          )
        )
      )
  );
$$;

create or replace function private.can_read_business_review(
  target_business_review_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_reviews review
    where review.id = target_business_review_id
      and private.can_read_business_plan(review.business_plan_id)
  );
$$;

revoke all on function private.is_workspace_owner(uuid)
from public, anon;
revoke all on function private.can_read_business_plan(uuid)
from public, anon;
revoke all on function private.can_read_business_goal(uuid)
from public, anon;
revoke all on function private.can_read_goal_target(uuid)
from public, anon;
revoke all on function private.can_read_business_initiative(uuid)
from public, anon;
revoke all on function private.can_read_action_item(uuid)
from public, anon;
revoke all on function private.can_update_action_item(uuid)
from public, anon;
revoke all on function private.can_read_business_review(uuid)
from public, anon;

grant execute on function private.is_workspace_owner(uuid) to authenticated;
grant execute on function private.can_read_business_plan(uuid) to authenticated;
grant execute on function private.can_read_business_goal(uuid) to authenticated;
grant execute on function private.can_read_goal_target(uuid) to authenticated;
grant execute on function private.can_read_business_initiative(uuid) to authenticated;
grant execute on function private.can_read_action_item(uuid) to authenticated;
grant execute on function private.can_update_action_item(uuid) to authenticated;
grant execute on function private.can_read_business_review(uuid) to authenticated;

create or replace function private.protect_business_plan_visibility()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.visibility is distinct from old.visibility
    and not private.is_workspace_owner(old.workspace_id) then
    raise exception 'Only the workspace owner can change plan visibility'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.protect_business_plan_visibility()
from public, anon, authenticated;

create trigger business_plans_protect_visibility
before update of visibility on public.business_plans
for each row execute function private.protect_business_plan_visibility();

alter table public.business_plan_role_grants enable row level security;
alter table public.business_plan_member_grants enable row level security;

create policy "business_plan_role_grants_owner_all"
on public.business_plan_role_grants for all to authenticated
using (private.is_workspace_owner(workspace_id))
with check (
  granted_by = (select auth.uid())
  and private.is_workspace_owner(workspace_id)
);

create policy "business_plan_member_grants_owner_all"
on public.business_plan_member_grants for all to authenticated
using (private.is_workspace_owner(workspace_id))
with check (
  granted_by = (select auth.uid())
  and private.is_workspace_owner(workspace_id)
);

create trigger business_plan_role_grants_audit
after insert or update or delete on public.business_plan_role_grants
for each row execute function private.write_workspace_audit_log(
  'business_plan_role_grant'
);
create trigger business_plan_member_grants_audit
after insert or update or delete on public.business_plan_member_grants
for each row execute function private.write_workspace_audit_log(
  'business_plan_member_grant'
);

drop policy if exists "business_plans_select_permitted"
on public.business_plans;
drop policy if exists "business_plans_insert_permitted"
on public.business_plans;
drop policy if exists "business_plans_update_permitted"
on public.business_plans;
drop policy if exists "business_plans_delete_permitted"
on public.business_plans;

create policy "business_plans_select_visible"
on public.business_plans for select to authenticated
using (private.can_read_business_plan(id));
create policy "business_plans_insert_granular"
on public.business_plans for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'plan.create')
);
create policy "business_plans_update_granular"
on public.business_plans for update to authenticated
using (
  private.can_read_business_plan(id)
  and private.has_workspace_permission(workspace_id, 'plan.update')
)
with check (
  private.can_read_business_plan(id)
  and private.has_workspace_permission(workspace_id, 'plan.update')
);
create policy "business_plans_delete_granular"
on public.business_plans for delete to authenticated
using (
  private.can_read_business_plan(id)
  and private.has_workspace_permission(workspace_id, 'plan.delete')
);

drop policy if exists "business_goals_select_permitted"
on public.business_goals;
drop policy if exists "business_goals_insert_permitted"
on public.business_goals;
drop policy if exists "business_goals_update_permitted"
on public.business_goals;
drop policy if exists "business_goals_delete_permitted"
on public.business_goals;

create policy "business_goals_select_visible"
on public.business_goals for select to authenticated
using (private.can_read_business_goal(id));
create policy "business_goals_insert_granular"
on public.business_goals for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.can_read_business_plan(business_plan_id)
  and private.has_workspace_permission(workspace_id, 'goal.manage')
);
create policy "business_goals_update_granular"
on public.business_goals for update to authenticated
using (
  private.can_read_business_goal(id)
  and private.has_workspace_permission(workspace_id, 'goal.manage')
)
with check (
  private.can_read_business_goal(id)
  and private.has_workspace_permission(workspace_id, 'goal.manage')
);
create policy "business_goals_delete_granular"
on public.business_goals for delete to authenticated
using (
  private.can_read_business_goal(id)
  and private.has_workspace_permission(workspace_id, 'plan.delete')
);

drop policy if exists "metric_definitions_select_permitted"
on public.metric_definitions;
drop policy if exists "metric_definitions_insert_permitted"
on public.metric_definitions;
drop policy if exists "metric_definitions_update_permitted"
on public.metric_definitions;
drop policy if exists "metric_definitions_delete_permitted"
on public.metric_definitions;

create policy "metric_definitions_select_granular"
on public.metric_definitions for select to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.read'));
create policy "metric_definitions_insert_granular"
on public.metric_definitions for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'metric.manage')
);
create policy "metric_definitions_update_granular"
on public.metric_definitions for update to authenticated
using (private.has_workspace_permission(workspace_id, 'metric.manage'))
with check (private.has_workspace_permission(workspace_id, 'metric.manage'));
create policy "metric_definitions_delete_granular"
on public.metric_definitions for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.delete'));

drop policy if exists "goal_targets_select_permitted"
on public.goal_targets;
drop policy if exists "goal_targets_insert_permitted"
on public.goal_targets;
drop policy if exists "goal_targets_update_permitted"
on public.goal_targets;
drop policy if exists "goal_targets_delete_permitted"
on public.goal_targets;

create policy "goal_targets_select_visible"
on public.goal_targets for select to authenticated
using (private.can_read_goal_target(id));
create policy "goal_targets_insert_granular"
on public.goal_targets for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.can_read_business_goal(business_goal_id)
  and private.has_workspace_permission(workspace_id, 'metric.manage')
);
create policy "goal_targets_update_granular"
on public.goal_targets for update to authenticated
using (
  private.can_read_goal_target(id)
  and private.has_workspace_permission(workspace_id, 'metric.manage')
)
with check (
  private.can_read_goal_target(id)
  and private.has_workspace_permission(workspace_id, 'metric.manage')
);
create policy "goal_targets_delete_granular"
on public.goal_targets for delete to authenticated
using (
  private.can_read_goal_target(id)
  and private.has_workspace_permission(workspace_id, 'plan.delete')
);

drop policy if exists "metric_measurements_select_permitted"
on public.metric_measurements;
drop policy if exists "metric_measurements_insert_permitted"
on public.metric_measurements;
drop policy if exists "metric_measurements_update_permitted"
on public.metric_measurements;
drop policy if exists "metric_measurements_delete_permitted"
on public.metric_measurements;

create policy "metric_measurements_select_visible"
on public.metric_measurements for select to authenticated
using (private.can_read_goal_target(goal_target_id));
create policy "metric_measurements_insert_granular"
on public.metric_measurements for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.can_read_goal_target(goal_target_id)
  and private.has_workspace_permission(workspace_id, 'metric.manage')
);
create policy "metric_measurements_update_granular"
on public.metric_measurements for update to authenticated
using (
  private.can_read_goal_target(goal_target_id)
  and private.has_workspace_permission(workspace_id, 'metric.manage')
)
with check (
  private.can_read_goal_target(goal_target_id)
  and private.has_workspace_permission(workspace_id, 'metric.manage')
);
create policy "metric_measurements_delete_granular"
on public.metric_measurements for delete to authenticated
using (
  private.can_read_goal_target(goal_target_id)
  and private.has_workspace_permission(workspace_id, 'plan.delete')
);

drop policy if exists "business_initiatives_select_permitted"
on public.business_initiatives;
drop policy if exists "business_initiatives_insert_permitted"
on public.business_initiatives;
drop policy if exists "business_initiatives_update_permitted"
on public.business_initiatives;
drop policy if exists "business_initiatives_delete_permitted"
on public.business_initiatives;

create policy "business_initiatives_select_visible"
on public.business_initiatives for select to authenticated
using (private.can_read_business_initiative(id));
create policy "business_initiatives_insert_granular"
on public.business_initiatives for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.can_read_business_plan(business_plan_id)
  and private.has_workspace_permission(workspace_id, 'initiative.manage')
);
create policy "business_initiatives_update_granular"
on public.business_initiatives for update to authenticated
using (
  private.can_read_business_initiative(id)
  and private.has_workspace_permission(workspace_id, 'initiative.manage')
)
with check (
  private.can_read_business_initiative(id)
  and private.has_workspace_permission(workspace_id, 'initiative.manage')
);
create policy "business_initiatives_delete_granular"
on public.business_initiatives for delete to authenticated
using (
  private.can_read_business_initiative(id)
  and private.has_workspace_permission(workspace_id, 'plan.delete')
);

drop policy if exists "action_items_select_permitted"
on public.action_items;
drop policy if exists "action_items_insert_permitted"
on public.action_items;
drop policy if exists "action_items_update_permitted"
on public.action_items;
drop policy if exists "action_items_delete_permitted"
on public.action_items;

create policy "action_items_select_visible"
on public.action_items for select to authenticated
using (private.can_read_action_item(id));
create policy "action_items_insert_granular"
on public.action_items for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.can_read_business_initiative(business_initiative_id)
  and private.has_workspace_permission(workspace_id, 'action.create')
  and (
    assignee_id = (select auth.uid())
    or private.has_workspace_permission(workspace_id, 'action.assign')
  )
);
create policy "action_items_update_granular"
on public.action_items for update to authenticated
using (private.can_update_action_item(id))
with check (
  private.can_read_business_initiative(business_initiative_id)
  and (
    private.has_workspace_permission(workspace_id, 'action.update_all')
    or (
      assignee_id = (select auth.uid())
      and private.has_workspace_permission(workspace_id, 'action.update_own')
    )
  )
);
create policy "action_items_delete_granular"
on public.action_items for delete to authenticated
using (
  private.can_read_action_item(id)
  and private.has_workspace_permission(workspace_id, 'plan.delete')
);

drop policy if exists "business_reviews_select_permitted"
on public.business_reviews;
drop policy if exists "business_reviews_insert_permitted"
on public.business_reviews;
drop policy if exists "business_reviews_update_draft_permitted"
on public.business_reviews;
drop policy if exists "business_reviews_delete_draft_permitted"
on public.business_reviews;

create policy "business_reviews_select_visible"
on public.business_reviews for select to authenticated
using (private.can_read_business_review(id));
create policy "business_reviews_insert_granular"
on public.business_reviews for insert to authenticated
with check (
  reviewed_by = (select auth.uid())
  and private.can_read_business_plan(business_plan_id)
  and private.has_workspace_permission(workspace_id, 'plan.update')
);
create policy "business_reviews_update_draft_granular"
on public.business_reviews for update to authenticated
using (
  status = 'draft'
  and private.can_read_business_review(id)
  and private.has_workspace_permission(workspace_id, 'plan.update')
)
with check (
  status = 'draft'
  and private.can_read_business_review(id)
  and private.has_workspace_permission(workspace_id, 'plan.update')
);
create policy "business_reviews_delete_draft_granular"
on public.business_reviews for delete to authenticated
using (
  status = 'draft'
  and private.can_read_business_review(id)
  and private.has_workspace_permission(workspace_id, 'plan.delete')
);

drop policy if exists "review_goal_snapshots_select_permitted"
on public.business_review_goal_target_snapshots;
drop policy if exists "review_financial_snapshots_select_permitted"
on public.business_review_financial_snapshots;
drop policy if exists "review_action_snapshots_select_permitted"
on public.business_review_action_item_snapshots;

create policy "review_goal_snapshots_select_visible"
on public.business_review_goal_target_snapshots for select to authenticated
using (private.can_read_business_review(business_review_id));
create policy "review_financial_snapshots_select_visible"
on public.business_review_financial_snapshots for select to authenticated
using (private.can_read_business_review(business_review_id));
create policy "review_action_snapshots_select_visible"
on public.business_review_action_item_snapshots for select to authenticated
using (private.can_read_business_review(business_review_id));

drop policy if exists "action_calendar_links_select_permitted"
on public.action_item_calendar_events;
drop policy if exists "action_calendar_links_insert_permitted"
on public.action_item_calendar_events;
drop policy if exists "action_calendar_links_delete_permitted"
on public.action_item_calendar_events;

create policy "action_calendar_links_select_visible"
on public.action_item_calendar_events for select to authenticated
using (
  private.can_read_action_item(action_item_id)
  and private.has_workspace_permission(workspace_id, 'calendar.read')
);
create policy "action_calendar_links_insert_granular"
on public.action_item_calendar_events for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.can_update_action_item(action_item_id)
  and private.has_workspace_permission(workspace_id, 'calendar.write')
);
create policy "action_calendar_links_delete_granular"
on public.action_item_calendar_events for delete to authenticated
using (
  private.can_update_action_item(action_item_id)
  and private.has_workspace_permission(workspace_id, 'calendar.write')
);

drop policy if exists "initiative_allocations_select_permitted"
on public.transaction_initiative_allocations;
drop policy if exists "initiative_allocations_insert_permitted"
on public.transaction_initiative_allocations;
drop policy if exists "initiative_allocations_update_permitted"
on public.transaction_initiative_allocations;
drop policy if exists "initiative_allocations_delete_permitted"
on public.transaction_initiative_allocations;

create policy "initiative_allocations_select_visible"
on public.transaction_initiative_allocations for select to authenticated
using (
  private.can_read_business_initiative(business_initiative_id)
  and private.has_workspace_permission(workspace_id, 'transaction.read')
);
create policy "initiative_allocations_insert_granular"
on public.transaction_initiative_allocations for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.can_read_business_initiative(business_initiative_id)
  and private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'initiative.manage')
);
create policy "initiative_allocations_update_granular"
on public.transaction_initiative_allocations for update to authenticated
using (
  private.can_read_business_initiative(business_initiative_id)
  and private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'initiative.manage')
)
with check (
  private.can_read_business_initiative(business_initiative_id)
  and private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'initiative.manage')
);
create policy "initiative_allocations_delete_granular"
on public.transaction_initiative_allocations for delete to authenticated
using (
  private.can_read_business_initiative(business_initiative_id)
  and private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'initiative.manage')
);

drop policy if exists "goal_contributions_select_permitted"
on public.transaction_goal_target_contributions;
drop policy if exists "goal_contributions_insert_permitted"
on public.transaction_goal_target_contributions;
drop policy if exists "goal_contributions_update_permitted"
on public.transaction_goal_target_contributions;
drop policy if exists "goal_contributions_delete_permitted"
on public.transaction_goal_target_contributions;

create policy "goal_contributions_select_visible"
on public.transaction_goal_target_contributions for select to authenticated
using (
  private.can_read_goal_target(goal_target_id)
  and private.has_workspace_permission(workspace_id, 'transaction.read')
);
create policy "goal_contributions_insert_granular"
on public.transaction_goal_target_contributions for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.can_read_goal_target(goal_target_id)
  and private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'metric.manage')
);
create policy "goal_contributions_update_granular"
on public.transaction_goal_target_contributions for update to authenticated
using (
  private.can_read_goal_target(goal_target_id)
  and private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'metric.manage')
)
with check (
  private.can_read_goal_target(goal_target_id)
  and private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'metric.manage')
);
create policy "goal_contributions_delete_granular"
on public.transaction_goal_target_contributions for delete to authenticated
using (
  private.can_read_goal_target(goal_target_id)
  and private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'metric.manage')
);

drop policy if exists "measurement_transactions_select_permitted"
on public.metric_measurement_transactions;
drop policy if exists "measurement_transactions_insert_permitted"
on public.metric_measurement_transactions;
drop policy if exists "measurement_transactions_delete_permitted"
on public.metric_measurement_transactions;

create policy "measurement_transactions_select_visible"
on public.metric_measurement_transactions for select to authenticated
using (
  exists (
    select 1
    from public.metric_measurements measurement
    where measurement.id = metric_measurement_id
      and private.can_read_goal_target(measurement.goal_target_id)
  )
  and private.has_workspace_permission(workspace_id, 'transaction.read')
);
create policy "measurement_transactions_insert_granular"
on public.metric_measurement_transactions for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.metric_measurements measurement
    where measurement.id = metric_measurement_id
      and private.can_read_goal_target(measurement.goal_target_id)
  )
  and private.has_workspace_permission(workspace_id, 'transaction.read')
  and private.has_workspace_permission(workspace_id, 'metric.manage')
);
create policy "measurement_transactions_delete_granular"
on public.metric_measurement_transactions for delete to authenticated
using (
  exists (
    select 1
    from public.metric_measurements measurement
    where measurement.id = metric_measurement_id
      and private.can_read_goal_target(measurement.goal_target_id)
  )
  and private.has_workspace_permission(workspace_id, 'transaction.read')
  and private.has_workspace_permission(workspace_id, 'metric.manage')
);

drop policy if exists "business_portfolio_reviews_select_permitted"
on public.business_portfolio_reviews;
drop policy if exists "business_portfolio_reviews_insert_permitted"
on public.business_portfolio_reviews;
drop policy if exists "business_portfolio_reviews_update_permitted"
on public.business_portfolio_reviews;
drop policy if exists "business_portfolio_reviews_delete_permitted"
on public.business_portfolio_reviews;

create policy "business_portfolio_reviews_select_visible"
on public.business_portfolio_reviews for select to authenticated
using (
  private.has_workspace_permission(workspace_id, 'portfolio.read')
  and private.can_read_business_review(business_review_id)
);
create policy "business_portfolio_reviews_insert_visible"
on public.business_portfolio_reviews for insert to authenticated
with check (
  added_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'portfolio.manage')
  and private.can_read_business_review(business_review_id)
);
create policy "business_portfolio_reviews_update_visible"
on public.business_portfolio_reviews for update to authenticated
using (
  private.has_workspace_permission(workspace_id, 'portfolio.manage')
  and private.can_read_business_review(business_review_id)
)
with check (
  private.has_workspace_permission(workspace_id, 'portfolio.manage')
  and private.can_read_business_review(business_review_id)
);
create policy "business_portfolio_reviews_delete_visible"
on public.business_portfolio_reviews for delete to authenticated
using (
  private.has_workspace_permission(workspace_id, 'portfolio.manage')
  and private.can_read_business_review(business_review_id)
);

drop policy if exists "workspace_achievements_select_permitted"
on public.workspace_achievements;
create policy "workspace_achievements_select_visible"
on public.workspace_achievements for select to authenticated
using (
  private.has_workspace_permission(workspace_id, 'portfolio.read')
  and private.can_read_business_review(evidence_business_review_id)
);

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
  review_record public.business_reviews%rowtype;
begin
  select * into review_record
  from public.business_reviews
  where id = target_business_review_id
  for update;

  if review_record.id is null then
    raise exception 'Business review not found' using errcode = 'P0002';
  end if;
  if actor_id is null
    or not private.can_read_business_review(review_record.id)
    or not private.has_workspace_permission(
      review_record.workspace_id,
      'review.finalize'
    ) then
    raise exception 'Not authorized to finalize this business review'
      using errcode = '42501';
  end if;
  if review_record.status = 'finalized' then
    return;
  end if;
  if review_record.status <> 'draft' then
    raise exception 'Only a draft business review can be finalized'
      using errcode = '23514';
  end if;

  perform private.refresh_business_review_snapshots(
    target_business_review_id,
    actor_id
  );

  update public.business_reviews
  set
    status = 'finalized',
    finalized_at = now()
  where id = target_business_review_id;

  perform private.evaluate_business_review_achievements(
    target_business_review_id
  );
end;
$$;

revoke all on function public.finalize_business_review(uuid)
from public, anon;
grant execute on function public.finalize_business_review(uuid)
to authenticated;

comment on column public.business_plans.visibility is
  'Workspace plans follow role permissions; restricted plans also require an explicit role or member grant. Owners always retain access.';
comment on table public.business_plan_role_grants is
  'Owner-managed visibility grants. These do not grant mutation permissions.';
comment on table public.business_plan_member_grants is
  'Owner-managed visibility grants. Suspended members remain unable to access plans.';
comment on table public.permission_definitions is
  'Canonical permission catalog. plan.write remains a compatibility permission and must not be used by new Planning policies.';
