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
values
  ('97000000-0000-0000-0000-000000000001', 'owner@ownership.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Original Owner"}', now(), now(), now()),
  ('97000000-0000-0000-0000-000000000002', 'manager@ownership.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Manager Member"}', now(), now(), now()),
  ('97000000-0000-0000-0000-000000000003', 'successor@ownership.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Successor Member"}', now(), now(), now()),
  ('97000000-0000-0000-0000-000000000004', 'suspended@ownership.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Suspended Member"}', now(), now(), now()),
  ('97000000-0000-0000-0000-000000000005', 'outsider@ownership.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Outsider"}', now(), now(), now()),
  ('97000000-0000-0000-0000-000000000006', 'other-owner@ownership.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Other Owner"}', now(), now(), now());

insert into public.workspaces (id, name, slug, created_by)
values
  ('98000000-0000-0000-0000-000000000001', 'Ownership Workspace', 'ownership-workspace', '97000000-0000-0000-0000-000000000001'),
  ('98000000-0000-0000-0000-000000000002', 'Other Ownership Workspace', 'other-ownership-workspace', '97000000-0000-0000-0000-000000000006');

insert into public.workspace_members (workspace_id, user_id, role, status)
values
  ('98000000-0000-0000-0000-000000000001', '97000000-0000-0000-0000-000000000001', 'owner', 'active'),
  ('98000000-0000-0000-0000-000000000001', '97000000-0000-0000-0000-000000000002', 'manager', 'active'),
  ('98000000-0000-0000-0000-000000000001', '97000000-0000-0000-0000-000000000003', 'member', 'active'),
  ('98000000-0000-0000-0000-000000000001', '97000000-0000-0000-0000-000000000004', 'member', 'suspended'),
  ('98000000-0000-0000-0000-000000000002', '97000000-0000-0000-0000-000000000006', 'owner', 'active');

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"97000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@ownership.test"}',
  true
);

-- Owner lifecycle RPCs cannot suspend, remove, or re-role the active owner.
do $$
declare
  suspend_blocked boolean := false;
  removal_blocked boolean := false;
  role_change_blocked boolean := false;
begin
  begin
    perform public.set_workspace_member_status(
      '98000000-0000-0000-0000-000000000001',
      '97000000-0000-0000-0000-000000000001',
      'suspended'
    );
  exception
    when check_violation then suspend_blocked := true;
  end;

  begin
    perform public.remove_workspace_member(
      '98000000-0000-0000-0000-000000000001',
      '97000000-0000-0000-0000-000000000001'
    );
  exception
    when check_violation then removal_blocked := true;
  end;

  begin
    perform public.change_workspace_member_role(
      '98000000-0000-0000-0000-000000000001',
      '97000000-0000-0000-0000-000000000001',
      (
        select id from public.workspace_roles
        where workspace_id = '98000000-0000-0000-0000-000000000001'
          and code = 'manager'
      )
    );
  exception
    when check_violation then role_change_blocked := true;
  end;

  if not suspend_blocked or not removal_blocked or not role_change_blocked then
    raise exception 'An owner lifecycle RPC bypassed ownership transfer';
  end if;
end;
$$;

-- Invalid transfer targets and fallback roles must leave all memberships
-- unchanged.
do $$
declare
  self_blocked boolean := false;
  outsider_blocked boolean := false;
  suspended_blocked boolean := false;
  foreign_fallback_blocked boolean := false;
begin
  begin
    perform public.transfer_workspace_ownership(
      '98000000-0000-0000-0000-000000000001',
      '97000000-0000-0000-0000-000000000001'
    );
  exception
    when invalid_parameter_value then self_blocked := true;
  end;

  begin
    perform public.transfer_workspace_ownership(
      '98000000-0000-0000-0000-000000000001',
      '97000000-0000-0000-0000-000000000005'
    );
  exception
    when foreign_key_violation then outsider_blocked := true;
  end;

  begin
    perform public.transfer_workspace_ownership(
      '98000000-0000-0000-0000-000000000001',
      '97000000-0000-0000-0000-000000000004'
    );
  exception
    when foreign_key_violation then suspended_blocked := true;
  end;

  begin
    perform public.transfer_workspace_ownership(
      '98000000-0000-0000-0000-000000000001',
      '97000000-0000-0000-0000-000000000003',
      (
        select id from public.workspace_roles
        where workspace_id = '98000000-0000-0000-0000-000000000002'
          and code = 'manager'
      )
    );
  exception
    when foreign_key_violation then foreign_fallback_blocked := true;
  end;

  if not self_blocked
    or not outsider_blocked
    or not suspended_blocked
    or not foreign_fallback_blocked then
    raise exception 'An invalid ownership transfer was not rejected';
  end if;

  if not exists (
    select 1
    from public.workspace_members member
    join public.workspace_roles role_record
      on role_record.id = member.workspace_role_id
     and role_record.workspace_id = member.workspace_id
    where member.workspace_id = '98000000-0000-0000-0000-000000000001'
      and member.user_id = '97000000-0000-0000-0000-000000000001'
      and member.status = 'active'
      and role_record.is_owner_role
  ) then
    raise exception 'Failed transfer changed the original owner';
  end if;

  if not exists (
    select 1
    from public.workspace_members member
    join public.workspace_roles role_record
      on role_record.id = member.workspace_role_id
     and role_record.workspace_id = member.workspace_id
    where member.workspace_id = '98000000-0000-0000-0000-000000000001'
      and member.user_id = '97000000-0000-0000-0000-000000000003'
      and role_record.code = 'member'
  ) then
    raise exception 'Failed transfer partially changed its successor';
  end if;
end;
$$;

-- The partial unique index prevents two active owner memberships even when a
-- privileged database actor bypasses application RPCs.
reset role;

do $$
declare
  duplicate_owner_blocked boolean := false;
begin
  begin
    insert into public.workspace_members (
      workspace_id,
      user_id,
      role,
      status
    )
    values (
      '98000000-0000-0000-0000-000000000001',
      '97000000-0000-0000-0000-000000000005',
      'owner',
      'active'
    );
  exception
    when unique_violation then duplicate_owner_blocked := true;
  end;

  if not duplicate_owner_blocked then
    raise exception 'Workspace accepted two active owners';
  end if;
end;
$$;

-- The deferred constraint prevents a privileged actor from committing a
-- workspace without an active owner.
do $$
declare
  missing_owner_blocked boolean := false;
begin
  begin
    update public.workspace_members
    set status = 'suspended'
    where workspace_id = '98000000-0000-0000-0000-000000000001'
      and user_id = '97000000-0000-0000-0000-000000000001';

    set constraints workspace_members_require_owner immediate;
  exception
    when check_violation then missing_owner_blocked := true;
  end;

  set constraints workspace_members_require_owner deferred;

  if not missing_owner_blocked then
    raise exception 'Workspace was left without an active owner';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"97000000-0000-0000-0000-000000000002","role":"authenticated","email":"manager@ownership.test"}',
  true
);

do $$
declare
  blocked boolean := false;
begin
  begin
    perform public.transfer_workspace_ownership(
      '98000000-0000-0000-0000-000000000001',
      '97000000-0000-0000-0000-000000000003'
    );
  exception
    when insufficient_privilege then blocked := true;
  end;
  if not blocked then
    raise exception 'Non-owner initiated an ownership transfer';
  end if;
end;
$$;

-- A successful transfer demotes the previous owner to the default manager and
-- promotes exactly one active successor atomically.
select set_config(
  'request.jwt.claims',
  '{"sub":"97000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@ownership.test"}',
  true
);

select public.transfer_workspace_ownership(
  '98000000-0000-0000-0000-000000000001',
  '97000000-0000-0000-0000-000000000003'
);

reset role;

do $$
begin
  if (
    select count(*)
    from public.workspace_members
    where workspace_id = '98000000-0000-0000-0000-000000000001'
      and role = 'owner'
      and status = 'active'
  ) <> 1 then
    raise exception 'Successful transfer did not preserve exactly one active owner';
  end if;

  if not exists (
    select 1
    from public.workspace_members member
    join public.workspace_roles role_record
      on role_record.id = member.workspace_role_id
     and role_record.workspace_id = member.workspace_id
    where member.workspace_id = '98000000-0000-0000-0000-000000000001'
      and member.user_id = '97000000-0000-0000-0000-000000000001'
      and role_record.code = 'manager'
      and not role_record.is_owner_role
  ) then
    raise exception 'Previous owner did not receive the default manager role';
  end if;

  if not exists (
    select 1
    from public.workspace_members member
    join public.workspace_roles role_record
      on role_record.id = member.workspace_role_id
     and role_record.workspace_id = member.workspace_id
    where member.workspace_id = '98000000-0000-0000-0000-000000000001'
      and member.user_id = '97000000-0000-0000-0000-000000000003'
      and member.status = 'active'
      and role_record.is_owner_role
  ) then
    raise exception 'Successor did not receive the canonical owner role';
  end if;
end;
$$;

-- Authority changes immediately: the former owner cannot transfer again, and
-- the successor receives immutable owner permissions.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"97000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@ownership.test"}',
  true
);

do $$
declare
  blocked boolean := false;
begin
  if private.has_workspace_permission(
    '98000000-0000-0000-0000-000000000001',
    'workspace.delete'
  ) then
    raise exception 'Former owner retained owner-only permission';
  end if;

  begin
    perform public.transfer_workspace_ownership(
      '98000000-0000-0000-0000-000000000001',
      '97000000-0000-0000-0000-000000000002'
    );
  exception
    when insufficient_privilege then blocked := true;
  end;
  if not blocked then
    raise exception 'Former owner retained ownership-transfer authority';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"97000000-0000-0000-0000-000000000003","role":"authenticated","email":"successor@ownership.test"}',
  true
);

do $$
begin
  if not private.has_workspace_permission(
    '98000000-0000-0000-0000-000000000001',
    'workspace.delete'
  ) then
    raise exception 'Successor did not receive owner-only permission';
  end if;
end;
$$;

-- A later transfer may explicitly choose the outgoing owner's fallback role.
select public.transfer_workspace_ownership(
  '98000000-0000-0000-0000-000000000001',
  '97000000-0000-0000-0000-000000000001',
  (
    select id from public.workspace_roles
    where workspace_id = '98000000-0000-0000-0000-000000000001'
      and code = 'viewer'
  )
);

reset role;

do $$
begin
  if (
    select count(*)
    from public.workspace_members
    where workspace_id = '98000000-0000-0000-0000-000000000001'
      and role = 'owner'
      and status = 'active'
  ) <> 1 then
    raise exception 'Return transfer broke the single-owner invariant';
  end if;

  if not exists (
    select 1
    from public.workspace_members member
    join public.workspace_roles role_record
      on role_record.id = member.workspace_role_id
     and role_record.workspace_id = member.workspace_id
    where member.workspace_id = '98000000-0000-0000-0000-000000000001'
      and member.user_id = '97000000-0000-0000-0000-000000000003'
      and role_record.code = 'viewer'
  ) then
    raise exception 'Explicit outgoing-owner fallback role was ignored';
  end if;

  if not exists (
    select 1
    from public.workspace_members member
    join public.workspace_roles role_record
      on role_record.id = member.workspace_role_id
     and role_record.workspace_id = member.workspace_id
    where member.workspace_id = '98000000-0000-0000-0000-000000000001'
      and member.user_id = '97000000-0000-0000-0000-000000000001'
      and role_record.is_owner_role
  ) then
    raise exception 'Return transfer did not restore the original owner';
  end if;
end;
$$;

select pass('workspace ownership invariant contracts passed');
select * from finish();

rollback;
