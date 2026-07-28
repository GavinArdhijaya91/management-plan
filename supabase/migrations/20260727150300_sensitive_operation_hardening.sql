create table public.workspace_deletion_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete restrict,
  requested_at timestamptz not null default now(),
  scheduled_for timestamptz not null,
  cancelled_at timestamptz,
  cancelled_by uuid references auth.users(id) on delete restrict,
  constraint workspace_deletion_requests_grace_period_check
    check (scheduled_for >= requested_at + interval '72 hours'),
  constraint workspace_deletion_requests_cancellation_check
    check (
      (cancelled_at is null and cancelled_by is null)
      or (cancelled_at is not null and cancelled_by is not null)
    )
);

create unique index workspace_deletion_requests_pending_workspace_idx
on public.workspace_deletion_requests (workspace_id)
where cancelled_at is null;

create index workspace_deletion_requests_schedule_idx
on public.workspace_deletion_requests (scheduled_for)
where cancelled_at is null;

alter table public.workspace_deletion_requests enable row level security;

create policy "workspace_deletion_requests_select_owner"
on public.workspace_deletion_requests for select to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
);

drop policy if exists "workspaces_delete_permitted" on public.workspaces;
revoke delete on public.workspaces from public, anon, authenticated;

create function public.request_workspace_deletion(
  target_workspace_id uuid,
  confirmation_workspace_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_actor_id uuid;
  target_workspace public.workspaces%rowtype;
  deletion_request_id uuid;
begin
  current_actor_id := private.require_workspace_owner(target_workspace_id);

  select * into target_workspace
  from public.workspaces
  where id = target_workspace_id
  for update;

  if target_workspace.id is null then
    raise exception 'Workspace not found' using errcode = 'P0002';
  end if;

  if confirmation_workspace_name is null
    or confirmation_workspace_name <> target_workspace.name then
    raise exception 'Workspace name confirmation does not match'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.workspace_deletion_requests
    where workspace_id = target_workspace_id
      and cancelled_at is null
  ) then
    raise exception 'Workspace deletion is already scheduled'
      using errcode = '23505';
  end if;

  insert into public.workspace_deletion_requests (
    workspace_id,
    requested_by,
    scheduled_for
  )
  values (
    target_workspace_id,
    current_actor_id,
    now() + interval '72 hours'
  )
  returning id into deletion_request_id;

  insert into public.audit_logs (
    workspace_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    target_workspace_id,
    current_actor_id,
    'request_deletion',
    'workspace',
    target_workspace_id,
    jsonb_build_object(
      'deletion_request_id', deletion_request_id,
      'grace_period_hours', 72
    )
  );

  return deletion_request_id;
end;
$$;

create function public.cancel_workspace_deletion(
  target_deletion_request_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_actor_id uuid := (select auth.uid());
  deletion_request public.workspace_deletion_requests%rowtype;
begin
  if current_actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into deletion_request
  from public.workspace_deletion_requests
  where id = target_deletion_request_id
  for update;

  if deletion_request.id is null then
    raise exception 'Workspace deletion request not found' using errcode = 'P0002';
  end if;

  perform private.require_workspace_owner(deletion_request.workspace_id);

  if deletion_request.cancelled_at is not null then
    return;
  end if;

  update public.workspace_deletion_requests
  set
    cancelled_at = now(),
    cancelled_by = current_actor_id
  where id = target_deletion_request_id;

  insert into public.audit_logs (
    workspace_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    deletion_request.workspace_id,
    current_actor_id,
    'cancel_deletion',
    'workspace',
    deletion_request.workspace_id,
    jsonb_build_object('deletion_request_id', target_deletion_request_id)
  );
end;
$$;

create function public.execute_workspace_deletion(
  target_deletion_request_id uuid,
  confirmation_workspace_name text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_actor_id uuid := (select auth.uid());
  deletion_request public.workspace_deletion_requests%rowtype;
  target_workspace public.workspaces%rowtype;
begin
  if current_actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into deletion_request
  from public.workspace_deletion_requests
  where id = target_deletion_request_id
  for update;

  if deletion_request.id is null then
    raise exception 'Workspace deletion request not found' using errcode = 'P0002';
  end if;

  perform private.require_workspace_owner(deletion_request.workspace_id);

  select * into target_workspace
  from public.workspaces
  where id = deletion_request.workspace_id
  for update;

  if deletion_request.cancelled_at is not null then
    raise exception 'Workspace deletion request was cancelled'
      using errcode = '23514';
  end if;

  if now() < deletion_request.scheduled_for then
    raise exception 'Workspace deletion grace period has not elapsed'
      using errcode = '55000';
  end if;

  if confirmation_workspace_name is null
    or confirmation_workspace_name <> target_workspace.name then
    raise exception 'Workspace name confirmation does not match'
      using errcode = '22023';
  end if;

  delete from public.workspaces
  where id = deletion_request.workspace_id;

  insert into public.audit_logs (
    workspace_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    null,
    current_actor_id,
    'permanent_delete',
    'workspace',
    deletion_request.workspace_id,
    jsonb_build_object(
      'deletion_request_id', target_deletion_request_id,
      'requested_at', deletion_request.requested_at,
      'scheduled_for', deletion_request.scheduled_for
    )
  );
end;
$$;

revoke all on table public.workspace_deletion_requests from public, anon;
grant select on table public.workspace_deletion_requests to authenticated;

revoke all on function public.request_workspace_deletion(uuid, text)
from public, anon;
grant execute on function public.request_workspace_deletion(uuid, text)
to authenticated;

revoke all on function public.cancel_workspace_deletion(uuid)
from public, anon;
grant execute on function public.cancel_workspace_deletion(uuid)
to authenticated;

revoke all on function public.execute_workspace_deletion(uuid, text)
from public, anon;
grant execute on function public.execute_workspace_deletion(uuid, text)
to authenticated;

comment on table public.workspace_deletion_requests is
  'Owner-requested workspace deletion lifecycle with a mandatory 72-hour cancellation window.';
comment on function public.request_workspace_deletion(uuid, text) is
  'Schedules permanent workspace deletion after exact-name confirmation and a 72-hour grace period.';
comment on function public.cancel_workspace_deletion(uuid) is
  'Cancels a pending workspace deletion request while preserving its audit history.';
comment on function public.execute_workspace_deletion(uuid, text) is
  'Permanently deletes a workspace only after its grace period and a second exact-name confirmation.';
