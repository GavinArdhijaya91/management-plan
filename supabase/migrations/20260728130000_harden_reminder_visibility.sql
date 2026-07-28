create function private.enforce_notification_source_visibility()
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

  return new;
end;
$$;

revoke all on function private.enforce_notification_source_visibility()
from public, anon, authenticated;

create trigger notifications_enforce_source_visibility
before insert on public.notifications
for each row execute function private.enforce_notification_source_visibility();

create or replace function public.generate_my_workspace_reminders(
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
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if reference_time is null
    or reference_time < now() - interval '5 minutes'
    or reference_time > now() + interval '5 minutes' then
    raise exception 'Reminder reference time must match the current request time'
      using errcode = '22023';
  end if;

  return private.generate_user_workspace_reminders(
    target_workspace_id,
    actor_id,
    reference_time
  );
end;
$$;

revoke all on function public.generate_my_workspace_reminders(uuid, timestamptz)
from public, anon;
grant execute on function public.generate_my_workspace_reminders(uuid, timestamptz)
to authenticated;

comment on function private.enforce_notification_source_visibility() is
  'Prevents SECURITY DEFINER notification writers from disclosing calendar events to users without calendar.read.';
comment on function public.generate_my_workspace_reminders(uuid, timestamptz) is
  'Generates caller-owned reminders with source visibility enforcement and a bounded request-time reference.';
