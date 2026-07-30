alter table public.notifications
  drop constraint notifications_source_entity_type_check,
  add constraint notifications_source_entity_type_check check (
    source_entity_type is null
    or source_entity_type in (
      'action_item',
      'business_goal',
      'business_initiative',
      'calendar_event',
      'business_review',
      'workspace_achievement',
      'chat_message',
      'system'
    )
  );

create or replace function private.enforce_notification_source_visibility()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.source_entity_type = 'calendar_event'
    and not exists (
      select 1
      from public.workspace_members member
      join public.workspace_role_permissions role_permission
        on role_permission.workspace_id = member.workspace_id
       and role_permission.workspace_role_id = member.workspace_role_id
       and role_permission.permission_code = 'calendar.read'
      where member.workspace_id = new.workspace_id
        and member.user_id = new.user_id
        and member.status = 'active'
    ) then
    return null;
  end if;

  if new.source_entity_type in (
    'action_item',
    'business_goal',
    'business_initiative'
  ) and (
    new.user_id is distinct from (select auth.uid())
    or case new.source_entity_type
      when 'action_item'
        then not private.can_read_action_item(new.source_entity_id)
      when 'business_goal'
        then not private.can_read_business_goal(new.source_entity_id)
      when 'business_initiative'
        then not private.can_read_business_initiative(new.source_entity_id)
      else true
    end
  ) then
    return null;
  end if;

  return new;
end;
$$;

create or replace function private.generate_user_overdue_notifications(
  target_workspace_id uuid,
  target_user_id uuid,
  reference_time timestamptz
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  preference_record public.profile_preferences%rowtype;
  overdue_record record;
  generated_count integer := 0;
begin
  if not exists (
    select 1
    from public.workspace_members member
    where member.workspace_id = target_workspace_id
      and member.user_id = target_user_id
      and member.status = 'active'
  ) then
    raise exception 'Active workspace membership required'
      using errcode = '42501';
  end if;

  select *
  into preference_record
  from public.profile_preferences preference
  where preference.user_id = target_user_id;

  if not coalesce(preference_record.action_due_notifications, true) then
    return 0;
  end if;

  for overdue_record in
    select evaluation.*
    from public.planning_overdue_evaluations evaluation
    left join public.action_items action
      on evaluation.record_type = 'action_item'
      and action.id = evaluation.record_id
    left join public.business_goals goal
      on evaluation.record_type = 'business_goal'
      and goal.id = evaluation.record_id
    left join public.business_initiatives initiative
      on evaluation.record_type = 'business_initiative'
      and initiative.id = evaluation.record_id
    where evaluation.workspace_id = target_workspace_id
      and evaluation.is_overdue
      and (
        action.assignee_id = target_user_id
        or goal.owner_id = target_user_id
        or initiative.owner_id = target_user_id
      )
  loop
    if private.create_notification(
      target_workspace_id,
      target_user_id,
      'target',
      overdue_record.record_type::text || '_overdue',
      overdue_record.record_type::text || '_overdue:' ||
        overdue_record.record_id::text || ':' ||
        overdue_record.deadline::text,
      'Rencana melewati tenggat',
      overdue_record.title || ' terlambat ' ||
        overdue_record.days_overdue::text || ' hari.',
      '/planning',
      overdue_record.record_type::text,
      overdue_record.record_id,
      reference_time,
      null
    ) then
      generated_count := generated_count + 1;
    end if;
  end loop;

  return generated_count;
end;
$$;

create or replace function public.orchestrate_my_workspace_notifications(
  target_workspace_id uuid,
  reference_time timestamptz default now()
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  generated_count integer := 0;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if reference_time is null
    or reference_time < now() - interval '5 minutes'
    or reference_time > now() + interval '5 minutes'
  then
    raise exception 'Notification reference time must match the current request time'
      using errcode = '22023';
  end if;

  generated_count := private.generate_user_workspace_reminders(
    target_workspace_id,
    actor_id,
    reference_time
  );
  generated_count := generated_count
    + private.generate_user_overdue_notifications(
      target_workspace_id,
      actor_id,
      reference_time
    );

  return generated_count;
end;
$$;

comment on function public.orchestrate_my_workspace_notifications(uuid, timestamptz) is
  'Idempotently generates caller-owned upcoming and overdue notifications with source visibility and bounded request time.';
