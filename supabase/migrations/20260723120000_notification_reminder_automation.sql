alter table public.profile_preferences
  add column action_due_notifications boolean not null default true,
  add column calendar_notifications boolean not null default true,
  add column review_notifications boolean not null default true,
  add column achievement_notifications boolean not null default true,
  add column reminder_lead_hours smallint not null default 24
    check (reminder_lead_hours in (1, 6, 12, 24, 48, 72, 168));

alter table public.notifications
  add column event_code text not null default 'legacy_notification'
    check (event_code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  add column event_key text,
  add column source_entity_type text check (
    source_entity_type is null
    or source_entity_type in (
      'action_item',
      'calendar_event',
      'business_review',
      'workspace_achievement',
      'system'
    )
  ),
  add column source_entity_id uuid,
  add column occurred_at timestamptz not null default now(),
  add column expires_at timestamptz,
  add constraint notifications_event_key_check check (
    event_key is null or char_length(event_key) between 3 and 300
  ),
  add constraint notifications_expiry_check check (
    expires_at is null or expires_at > occurred_at
  );

update public.notifications
set event_key = 'legacy_notification:' || id::text
where event_key is null;

alter table public.notifications
  alter column event_key set not null,
  add constraint notifications_user_event_key_unique
    unique (user_id, event_key);

create index notifications_workspace_event_idx
  on public.notifications (workspace_id, event_code, occurred_at desc);
create index notifications_unread_expiry_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;

create or replace function private.create_notification(
  target_workspace_id uuid,
  target_user_id uuid,
  target_type public.notification_type,
  target_event_code text,
  target_event_key text,
  target_title text,
  target_detail text,
  target_href text,
  target_source_entity_type text,
  target_source_entity_id uuid,
  target_occurred_at timestamptz,
  target_expires_at timestamptz default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
begin
  insert into public.notifications (
    workspace_id,
    user_id,
    type,
    event_code,
    event_key,
    title,
    detail,
    href,
    source_entity_type,
    source_entity_id,
    occurred_at,
    expires_at
  )
  values (
    target_workspace_id,
    target_user_id,
    target_type,
    target_event_code,
    target_event_key,
    target_title,
    target_detail,
    target_href,
    target_source_entity_type,
    target_source_entity_id,
    target_occurred_at,
    target_expires_at
  )
  on conflict (user_id, event_key) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count = 1;
end;
$$;

revoke all on function private.create_notification(
  uuid,
  uuid,
  public.notification_type,
  text,
  text,
  text,
  text,
  text,
  text,
  uuid,
  timestamptz,
  timestamptz
) from public, anon, authenticated;

create or replace function private.generate_user_workspace_reminders(
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
  reminder_record record;
  generated_count integer := 0;
begin
  if not exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = target_user_id
      and status = 'active'
  ) then
    raise exception 'Active workspace membership required';
  end if;

  select *
  into preference_record
  from public.profile_preferences
  where user_id = target_user_id;

  if preference_record.action_due_notifications then
    for reminder_record in
      select action.id, action.title, action.due_on
      from public.action_items action
      where action.workspace_id = target_workspace_id
        and action.assignee_id = target_user_id
        and action.status not in ('completed', 'cancelled')
        and action.due_on >= reference_time::date
        and action.due_on <= (
          reference_time + make_interval(hours => preference_record.reminder_lead_hours)
        )::date
    loop
      if private.create_notification(
        target_workspace_id,
        target_user_id,
        'target',
        'action_item_due',
        'action_item_due:' || reminder_record.id::text || ':' ||
          reminder_record.due_on::text,
        'Tindakan mendekati tenggat',
        reminder_record.title || ' jatuh tempo pada ' ||
          reminder_record.due_on::text || '.',
        '/manajemen',
        'action_item',
        reminder_record.id,
        reference_time,
        reminder_record.due_on + interval '1 day'
      ) then
        generated_count := generated_count + 1;
      end if;
    end loop;
  end if;

  if preference_record.calendar_notifications then
    for reminder_record in
      select event.id, event.title, event.starts_at
      from public.calendar_events event
      where event.workspace_id = target_workspace_id
        and event.completed_at is null
        and event.starts_at >= reference_time
        and event.starts_at <=
          reference_time + make_interval(hours => preference_record.reminder_lead_hours)
    loop
      if private.create_notification(
        target_workspace_id,
        target_user_id,
        'schedule',
        'calendar_event_upcoming',
        'calendar_event_upcoming:' || reminder_record.id::text || ':' ||
          extract(epoch from reminder_record.starts_at)::bigint::text,
        'Agenda akan dimulai',
        reminder_record.title || ' dijadwalkan pada ' ||
          reminder_record.starts_at::text || '.',
        '/kalender',
        'calendar_event',
        reminder_record.id,
        reference_time,
        reminder_record.starts_at + interval '1 day'
      ) then
        generated_count := generated_count + 1;
      end if;
    end loop;
  end if;

  if preference_record.review_notifications then
    for reminder_record in
      select review.id, review.period_end
      from public.business_reviews review
      where review.workspace_id = target_workspace_id
        and review.reviewed_by = target_user_id
        and review.status = 'draft'
        and review.period_end >= reference_time::date
        and review.period_end <= (
          reference_time + make_interval(hours => preference_record.reminder_lead_hours)
        )::date
    loop
      if private.create_notification(
        target_workspace_id,
        target_user_id,
        'target',
        'business_review_due',
        'business_review_due:' || reminder_record.id::text || ':' ||
          reminder_record.period_end::text,
        'Evaluasi perlu diselesaikan',
        'Periode evaluasi berakhir pada ' ||
          reminder_record.period_end::text || '.',
        '/manajemen',
        'business_review',
        reminder_record.id,
        reference_time,
        reminder_record.period_end + interval '1 day'
      ) then
        generated_count := generated_count + 1;
      end if;
    end loop;
  end if;

  return generated_count;
end;
$$;

revoke all on function private.generate_user_workspace_reminders(
  uuid,
  uuid,
  timestamptz
) from public, anon, authenticated;

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
    raise exception 'Authentication required';
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

create or replace function public.mark_notification_read(
  target_notification_id uuid
)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = target_notification_id
    and user_id = (select auth.uid());
$$;

create or replace function public.mark_all_notifications_read(
  target_workspace_id uuid default null
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated_count integer;
begin
  update public.notifications
  set read_at = now()
  where user_id = (select auth.uid())
    and read_at is null
    and (
      target_workspace_id is null
      or workspace_id = target_workspace_id
    );

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

revoke all on function public.mark_notification_read(uuid) from public, anon;
revoke all on function public.mark_all_notifications_read(uuid)
from public, anon;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read(uuid)
to authenticated;

create or replace function private.notify_workspace_achievement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient record;
  definition_record public.achievement_definitions%rowtype;
begin
  select *
  into definition_record
  from public.achievement_definitions
  where code = new.achievement_code;

  for recipient in
    select member.user_id
    from public.workspace_members member
    join public.profile_preferences preference
      on preference.user_id = member.user_id
    where member.workspace_id = new.workspace_id
      and member.status = 'active'
      and preference.achievement_notifications
  loop
    perform private.create_notification(
      new.workspace_id,
      recipient.user_id,
      'system',
      'workspace_achievement_awarded',
      'workspace_achievement_awarded:' || new.id::text,
      'Pencapaian usaha baru',
      definition_record.name || ': ' || definition_record.description,
      '/profil',
      'workspace_achievement',
      new.id,
      new.awarded_at,
      null
    );
  end loop;

  return new;
end;
$$;

create trigger workspace_achievements_notify_members
after insert on public.workspace_achievements
for each row execute function private.notify_workspace_achievement();

create or replace function private.notify_finalized_business_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient record;
begin
  if old.status = new.status or new.status <> 'finalized' then
    return new;
  end if;

  for recipient in
    select member.user_id
    from public.workspace_members member
    join public.profile_preferences preference
      on preference.user_id = member.user_id
    where member.workspace_id = new.workspace_id
      and member.status = 'active'
      and preference.review_notifications
  loop
    perform private.create_notification(
      new.workspace_id,
      recipient.user_id,
      'target',
      'business_review_finalized',
      'business_review_finalized:' || new.id::text,
      'Evaluasi bisnis difinalisasi',
      'Evaluasi periode ' || new.period_start::text || ' sampai ' ||
        new.period_end::text || ' telah difinalisasi.',
      '/manajemen',
      'business_review',
      new.id,
      coalesce(new.finalized_at, now()),
      null
    );
  end loop;

  return new;
end;
$$;

create trigger business_reviews_notify_finalization
after update of status on public.business_reviews
for each row execute function private.notify_finalized_business_review();

revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;
