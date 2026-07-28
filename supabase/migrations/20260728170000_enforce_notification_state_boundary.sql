create or replace function public.mark_notification_read(
  target_notification_id uuid
)
returns void
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

  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = target_notification_id
    and user_id = actor_id;
end;
$$;

create or replace function public.mark_all_notifications_read(
  target_workspace_id uuid default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  updated_count integer;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  update public.notifications
  set read_at = now()
  where user_id = actor_id
    and read_at is null
    and (
      target_workspace_id is null
      or workspace_id = target_workspace_id
    );

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

revoke update on public.notifications from authenticated;

revoke all on function public.mark_notification_read(uuid)
from public, anon, authenticated;
revoke all on function public.mark_all_notifications_read(uuid)
from public, anon, authenticated;

grant execute on function public.mark_notification_read(uuid)
to authenticated;
grant execute on function public.mark_all_notifications_read(uuid)
to authenticated;

comment on function public.mark_notification_read(uuid) is
  'Marks only the authenticated recipient notification as read and preserves the first read timestamp.';
comment on function public.mark_all_notifications_read(uuid) is
  'Marks unread notifications belonging to the authenticated recipient as read, optionally within one workspace.';
