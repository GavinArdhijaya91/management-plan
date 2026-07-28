\set ON_ERROR_STOP on

begin;

select plan(1);

insert into auth.users (
  id,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  email_confirmed_at,
  created_at,
  updated_at
)
values (
  'a9000000-0000-0000-0000-000000000001',
  'sensitive-owner@test.local',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Sensitive Owner"}',
  now(),
  now(),
  now()
);

insert into public.workspaces (id, name, slug, created_by)
values (
  'a9100000-0000-0000-0000-000000000001',
  'Sensitive Workspace',
  'sensitive-workspace',
  'a9000000-0000-0000-0000-000000000001'
);

insert into public.workspace_members (workspace_id, user_id, role, status)
values (
  'a9100000-0000-0000-0000-000000000001',
  'a9000000-0000-0000-0000-000000000001',
  'owner',
  'active'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a9000000-0000-0000-0000-000000000001","role":"authenticated","email":"sensitive-owner@test.local"}',
  true
);

do $$
declare
  deletion_request_id uuid;
  mismatch_blocked boolean := false;
  early_execution_blocked boolean := false;
  direct_delete_blocked boolean := false;
  cancelled_execution_blocked boolean := false;
begin
  begin
    perform public.request_workspace_deletion(
      'a9100000-0000-0000-0000-000000000001',
      'wrong confirmation'
    );
  exception
    when invalid_parameter_value then mismatch_blocked := true;
  end;

  deletion_request_id := public.request_workspace_deletion(
    'a9100000-0000-0000-0000-000000000001',
    'Sensitive Workspace'
  );

  begin
    perform public.execute_workspace_deletion(
      deletion_request_id,
      'Sensitive Workspace'
    );
  exception
    when object_not_in_prerequisite_state then early_execution_blocked := true;
  end;

  begin
    delete from public.workspaces
    where id = 'a9100000-0000-0000-0000-000000000001';
  exception
    when insufficient_privilege then direct_delete_blocked := true;
  end;

  perform public.cancel_workspace_deletion(deletion_request_id);

  begin
    perform public.execute_workspace_deletion(
      deletion_request_id,
      'Sensitive Workspace'
    );
  exception
    when check_violation then cancelled_execution_blocked := true;
  end;

  if not mismatch_blocked
    or not early_execution_blocked
    or not direct_delete_blocked
    or not cancelled_execution_blocked then
    raise exception 'A sensitive workspace deletion boundary was bypassed';
  end if;

  if not exists (
    select 1
    from public.workspace_deletion_requests
    where id = deletion_request_id
      and cancelled_at is not null
      and cancelled_by = 'a9000000-0000-0000-0000-000000000001'
      and scheduled_for >= requested_at + interval '72 hours'
  ) then
    raise exception 'Deletion cancellation or grace-period evidence is incomplete';
  end if;

  if not exists (
    select 1
    from public.audit_logs
    where workspace_id = 'a9100000-0000-0000-0000-000000000001'
      and actor_id = 'a9000000-0000-0000-0000-000000000001'
      and action = 'request_deletion'
      and entity_type = 'workspace'
  ) or not exists (
    select 1
    from public.audit_logs
    where workspace_id = 'a9100000-0000-0000-0000-000000000001'
      and actor_id = 'a9000000-0000-0000-0000-000000000001'
      and action = 'cancel_deletion'
      and entity_type = 'workspace'
  ) then
    raise exception 'Sensitive operation audit evidence is incomplete';
  end if;
end;
$$;

reset role;

select pass('sensitive operation contracts passed');
select * from finish();

rollback;
