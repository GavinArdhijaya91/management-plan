\set ON_ERROR_STOP on

begin;

select plan(1);

do $$
begin
  if has_function_privilege(
    'authenticated',
    'public.get_system_health_snapshot(interval)',
    'execute'
  ) then
    raise exception 'Authenticated users can read system health';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.run_system_maintenance()',
    'execute'
  ) then
    raise exception 'Authenticated users can run system maintenance';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.get_system_health_snapshot(interval)',
    'execute'
  ) then
    raise exception 'Service role cannot read system health';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.run_system_maintenance()',
    'execute'
  ) then
    raise exception 'Service role cannot run system maintenance';
  end if;
end;
$$;

insert into private.idempotency_records (
  actor_id,
  operation_code,
  idempotency_key,
  request_fingerprint,
  created_at,
  expires_at
)
select
  user_id,
  'system_maintenance_test',
  '98000000-0000-0000-0000-000000000001',
  repeat('a', 64),
  now() - interval '2 days',
  now() - interval '1 day'
from public.profiles
order by user_id
limit 1;

insert into public.notifications (
  user_id,
  event_key,
  type,
  title,
  detail,
  occurred_at,
  expires_at
)
select
  user_id,
  'system_maintenance_test:expired_notification',
  'system',
  'Expired maintenance fixture',
  'This notification must be removed by system maintenance.',
  now() - interval '2 days',
  now() - interval '1 day'
from public.profiles
order by user_id
limit 1;

set local role service_role;

do $$
declare
  health_record record;
  maintenance_record record;
begin
  select *
  into health_record
  from public.get_system_health_snapshot();

  if health_record.expired_idempotency_records < 1
    or health_record.expired_notifications < 1 then
    raise exception 'System health did not detect expired fixtures';
  end if;

  select *
  into maintenance_record
  from public.run_system_maintenance();

  if maintenance_record.deleted_idempotency_records < 1
    or maintenance_record.deleted_notifications < 1 then
    raise exception 'System maintenance did not delete expired fixtures';
  end if;

  select *
  into maintenance_record
  from public.run_system_maintenance();

  if maintenance_record.deleted_idempotency_records <> 0
    or maintenance_record.deleted_notifications <> 0 then
    raise exception 'System maintenance retry was not idempotent';
  end if;
end;
$$;

reset role;

select pass('system operations contracts passed');
select * from finish();

rollback;
