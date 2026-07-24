create or replace function public.get_system_health_snapshot(
  stale_processing_after interval default interval '15 minutes'
)
returns table (
  captured_at timestamptz,
  expired_pending_invitations bigint,
  ready_email_deliveries bigint,
  stale_processing_deliveries bigint,
  expired_idempotency_records bigint,
  expired_notifications bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if stale_processing_after <= interval '0 seconds' then
    raise exception 'Stale processing threshold must be positive'
      using errcode = '22023';
  end if;

  return query
  select
    now(),
    (
      select count(*)
      from public.workspace_invitations invitation
      where invitation.status = 'pending'
        and invitation.expires_at <= now()
    ),
    (
      select count(*)
      from public.email_deliveries delivery
      where delivery.status = 'queued'
        and delivery.scheduled_at <= now()
    ),
    (
      select count(*)
      from public.email_deliveries delivery
      where delivery.status = 'processing'
        and delivery.processing_started_at
          <= now() - stale_processing_after
    ),
    (
      select count(*)
      from private.idempotency_records idempotency_record
      where idempotency_record.expires_at <= now()
    ),
    (
      select count(*)
      from public.notifications notification
      where notification.expires_at <= now()
    );
end;
$$;

create or replace function public.run_system_maintenance()
returns table (
  expired_invitations integer,
  deleted_idempotency_records integer,
  deleted_notifications integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_count integer;
  idempotency_count integer;
  notification_count integer;
begin
  invitation_count := private.expire_workspace_invitations();

  delete from private.idempotency_records idempotency_record
  where idempotency_record.expires_at <= now();
  get diagnostics idempotency_count = row_count;

  delete from public.notifications notification
  where notification.expires_at <= now();
  get diagnostics notification_count = row_count;

  return query
  select invitation_count, idempotency_count, notification_count;
end;
$$;

comment on function public.get_system_health_snapshot(interval) is
  'Service-role operational counters only; returns no tenant or recipient data.';
comment on function public.run_system_maintenance() is
  'Expires pending invitations and removes expired transport and notification records.';

revoke all on function public.get_system_health_snapshot(interval)
from public, anon, authenticated;
grant execute on function public.get_system_health_snapshot(interval)
to service_role;

revoke all on function public.run_system_maintenance()
from public, anon, authenticated;
grant execute on function public.run_system_maintenance()
to service_role;
