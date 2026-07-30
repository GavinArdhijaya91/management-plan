create or replace function private.normalize_notification_destination()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.href := case new.source_entity_type
    when 'action_item' then '/planning'
    when 'business_review' then '/planning/reviews'
    when 'workspace_achievement' then '/portfolio'
    else new.href
  end;
  return new;
end;
$$;

revoke all on function private.normalize_notification_destination()
from public, anon, authenticated;

create trigger notifications_normalize_destination
before insert on public.notifications
for each row execute function private.normalize_notification_destination();

update public.notifications
set href = case source_entity_type
  when 'action_item' then '/planning'
  when 'business_review' then '/planning/reviews'
  when 'workspace_achievement' then '/portfolio'
  else href
end
where source_entity_type in (
  'action_item',
  'business_review',
  'workspace_achievement'
);

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
      case overdue_record.record_type
        when 'action_item' then 'action_item'
        else 'system'
      end,
      case overdue_record.record_type
        when 'action_item' then overdue_record.record_id
        else null
      end,
      reference_time,
      null
    ) then
      generated_count := generated_count + 1;
    end if;
  end loop;

  return generated_count;
end;
$$;

revoke all on function private.generate_user_overdue_notifications(
  uuid,
  uuid,
  timestamptz
) from public, anon, authenticated;

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

revoke all on function public.orchestrate_my_workspace_notifications(
  uuid,
  timestamptz
) from public, anon;
grant execute on function public.orchestrate_my_workspace_notifications(
  uuid,
  timestamptz
) to authenticated;

comment on function public.orchestrate_my_workspace_notifications(uuid, timestamptz) is
  'Idempotently generates preference-aware upcoming and overdue notifications for the authenticated workspace member.';
