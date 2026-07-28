\set ON_ERROR_STOP on

begin;

select plan(1);

-- Fixed identities make auth.uid() switching and failures reproducible.
insert into auth.users (
  id, email, raw_app_meta_data, raw_user_meta_data,
  email_confirmed_at, created_at, updated_at
)
values
  ('91000000-0000-0000-0000-000000000001', 'owner-a@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Owner A"}', now(), now(), now()),
  ('91000000-0000-0000-0000-000000000002', 'manager-a@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Manager A"}', now(), now(), now()),
  ('91000000-0000-0000-0000-000000000003', 'staff-a@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Staff A"}', now(), now(), now()),
  ('91000000-0000-0000-0000-000000000004', 'viewer-a@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Viewer A"}', now(), now(), now()),
  ('91000000-0000-0000-0000-000000000005', 'custom-a@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Custom A"}', now(), now(), now()),
  ('91000000-0000-0000-0000-000000000006', 'suspended-a@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Suspended A"}', now(), now(), now()),
  ('91000000-0000-0000-0000-000000000007', 'outsider@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Outsider"}', now(), now(), now()),
  ('91000000-0000-0000-0000-000000000008', 'owner-b@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Owner B"}', now(), now(), now());

insert into public.workspaces (id, name, slug, created_by)
values
  ('92000000-0000-0000-0000-000000000001', 'Workspace A', 'rls-workspace-a', '91000000-0000-0000-0000-000000000001'),
  ('92000000-0000-0000-0000-000000000002', 'Workspace B', 'rls-workspace-b', '91000000-0000-0000-0000-000000000008');

insert into public.workspace_members (workspace_id, user_id, role, status)
values
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 'owner', 'active'),
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000002', 'manager', 'active'),
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000003', 'member', 'active'),
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000004', 'viewer', 'active'),
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000006', 'member', 'suspended'),
  ('92000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000008', 'owner', 'active');

insert into public.workspace_roles (
  id, workspace_id, code, name, description, hierarchy_rank, base_role, created_by
)
values (
  '93000000-0000-0000-0000-000000000001',
  '92000000-0000-0000-0000-000000000001',
  'transaction_auditor',
  'Transaction Auditor',
  'Reads transactions without write access.',
  15,
  'viewer',
  '91000000-0000-0000-0000-000000000001'
);

insert into public.workspace_role_permissions (
  workspace_id, workspace_role_id, permission_code, granted_by
)
values (
  '92000000-0000-0000-0000-000000000001',
  '93000000-0000-0000-0000-000000000001',
  'transaction.read',
  '91000000-0000-0000-0000-000000000001'
);

insert into public.workspace_members (
  workspace_id, user_id, role, status, workspace_role_id
)
values (
  '92000000-0000-0000-0000-000000000001',
  '91000000-0000-0000-0000-000000000005',
  'viewer',
  'active',
  '93000000-0000-0000-0000-000000000001'
);

insert into public.transactions (
  id, workspace_id, created_by, type, amount, transaction_date, note
)
values
  ('94000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 'sale', 100000, current_date, 'Workspace A private transaction'),
  ('94000000-0000-0000-0000-000000000002', '92000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000008', 'sale', 200000, current_date, 'Workspace B private transaction');

insert into public.calendar_events (
  id,
  workspace_id,
  created_by,
  title,
  type,
  starts_at,
  ends_at
)
values (
  '94500000-0000-0000-0000-000000000001',
  '92000000-0000-0000-0000-000000000001',
  '91000000-0000-0000-0000-000000000001',
  'Restricted calendar event',
  'other',
  now() + interval '1 hour',
  now() + interval '2 hours'
);

set local role authenticated;

-- Outsider: no membership means no private rows or access context.
select set_config(
  'request.jwt.claims',
  '{"sub":"91000000-0000-0000-0000-000000000007","role":"authenticated","email":"outsider@siapin.test"}',
  true
);

do $$
begin
  if (select count(*) from public.workspaces) <> 0 then
    raise exception 'Outsider can read a private workspace';
  end if;
  if (select count(*) from public.transactions) <> 0 then
    raise exception 'Outsider can read a private transaction';
  end if;
  if (select count(*) from public.get_my_workspace_access()) <> 0 then
    raise exception 'Outsider received a workspace access context';
  end if;
end;
$$;

-- Manager: operations in A are allowed, authorization and B remain isolated.
select set_config(
  'request.jwt.claims',
  '{"sub":"91000000-0000-0000-0000-000000000002","role":"authenticated","email":"manager-a@siapin.test"}',
  true
);

do $$
declare
  affected_rows integer;
  blocked boolean := false;
begin
  if (select count(*) from public.workspaces) <> 1 then
    raise exception 'Manager workspace visibility is not isolated';
  end if;
  if (select count(*) from public.transactions) <> 1 then
    raise exception 'Manager transaction visibility crossed workspace boundaries';
  end if;
  if not coalesce((
    select 'transaction.delete' = any(permission_codes)
    from public.get_my_workspace_access()
    where workspace_id = '92000000-0000-0000-0000-000000000001'
  ), false) then
    raise exception 'Default manager lost transaction.delete';
  end if;
  if coalesce((
    select 'workspace.delete' = any(permission_codes)
    from public.get_my_workspace_access()
    where workspace_id = '92000000-0000-0000-0000-000000000001'
  ), false) then
    raise exception 'Manager unexpectedly received workspace.delete';
  end if;

  update public.workspaces
  set description = 'Updated through workspace.update'
  where id = '92000000-0000-0000-0000-000000000001';
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Manager could not use workspace.update';
  end if;

  begin
    insert into public.workspace_roles (
      workspace_id, code, name, hierarchy_rank, base_role, created_by
    )
    values (
      '92000000-0000-0000-0000-000000000001',
      'manager_escalation',
      'Manager Escalation',
      90,
      'manager',
      '91000000-0000-0000-0000-000000000002'
    );
  exception
    when insufficient_privilege then blocked := true;
  end;
  if not blocked then
    raise exception 'Manager bypassed owner-only role management';
  end if;
end;
$$;

-- Staff: read/write is allowed; delete and workspace update are filtered.
select set_config(
  'request.jwt.claims',
  '{"sub":"91000000-0000-0000-0000-000000000003","role":"authenticated","email":"staff-a@siapin.test"}',
  true
);

select public.create_transaction(
  '92000000-0000-0000-0000-000000000001',
  'expense',
  25000,
  current_date,
  '94000000-0000-0000-0000-000000000003',
  0,
  'Staff permitted write'
);

do $$
declare
  affected_rows integer;
begin
  if not exists (
    select 1 from public.transactions
    where id = '94000000-0000-0000-0000-000000000003'
  ) then
    raise exception 'Staff transaction.write did not persist a visible row';
  end if;

  delete from public.transactions
  where id = '94000000-0000-0000-0000-000000000001';
  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'Staff used transaction.delete without permission';
  end if;

  update public.workspaces
  set description = 'Staff must not update this'
  where id = '92000000-0000-0000-0000-000000000001';
  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'Staff used workspace.update without permission';
  end if;
end;
$$;

-- Viewer: read-only policies expose rows but reject inserts.
select set_config(
  'request.jwt.claims',
  '{"sub":"91000000-0000-0000-0000-000000000004","role":"authenticated","email":"viewer-a@siapin.test"}',
  true
);

do $$
declare
  blocked boolean := false;
begin
  if (select count(*) from public.transactions) <> 2 then
    raise exception 'Viewer cannot read all visible workspace transactions';
  end if;
  begin
    insert into public.transactions (
      workspace_id, created_by, type, amount, transaction_date
    )
    values (
      '92000000-0000-0000-0000-000000000001',
      '91000000-0000-0000-0000-000000000004',
      'expense',
      1000,
      current_date
    );
  exception
    when insufficient_privilege then blocked := true;
  end;
  if not blocked then
    raise exception 'Viewer used transaction.write without permission';
  end if;
end;
$$;

-- Custom role: explicit permission grants are authoritative.
select set_config(
  'request.jwt.claims',
  '{"sub":"91000000-0000-0000-0000-000000000005","role":"authenticated","email":"custom-a@siapin.test"}',
  true
);

do $$
declare
  blocked boolean := false;
  generated_reminders integer;
  forged_time_blocked boolean := false;
begin
  if (select count(*) from public.transactions) <> 2 then
    raise exception 'Custom transaction auditor cannot use transaction.read';
  end if;
  if coalesce((
    select 'transaction.write' = any(permission_codes)
    from public.get_my_workspace_access()
    where workspace_id = '92000000-0000-0000-0000-000000000001'
  ), false) then
    raise exception 'Custom transaction auditor inherited write from base_role';
  end if;
  if (
    select permission_codes
    from public.get_my_workspace_access()
    where workspace_id = '92000000-0000-0000-0000-000000000001'
  ) <> array['transaction.read']::text[] then
    raise exception 'Workspace context returned incorrect custom permissions';
  end if;

  if exists (
    select 1
    from public.calendar_events
    where id = '94500000-0000-0000-0000-000000000001'
  ) then
    raise exception 'Custom transaction auditor directly read a calendar event';
  end if;

  begin
    insert into public.transactions (
      workspace_id, created_by, type, amount, transaction_date
    )
    values (
      '92000000-0000-0000-0000-000000000001',
      '91000000-0000-0000-0000-000000000005',
      'expense',
      1000,
      current_date
    );
  exception
    when insufficient_privilege then blocked := true;
  end;
  if not blocked then
    raise exception 'Custom read-only role inserted a transaction';
  end if;

  generated_reminders := public.generate_my_workspace_reminders(
    '92000000-0000-0000-0000-000000000001',
    now()
  );

  if generated_reminders <> 0 or exists (
    select 1
    from public.notifications
    where user_id = '91000000-0000-0000-0000-000000000005'
      and source_entity_id = '94500000-0000-0000-0000-000000000001'
  ) then
    raise exception 'Reminder generation disclosed a restricted calendar event';
  end if;

  begin
    perform public.generate_my_workspace_reminders(
      '92000000-0000-0000-0000-000000000001',
      now() + interval '1 day'
    );
  exception
    when invalid_parameter_value then forged_time_blocked := true;
  end;

  if not forged_time_blocked then
    raise exception 'Reminder generation accepted a forged reference time';
  end if;
end;
$$;

-- Suspended membership is explainable through the context RPC but grants no
-- workspace RLS access.
select set_config(
  'request.jwt.claims',
  '{"sub":"91000000-0000-0000-0000-000000000006","role":"authenticated","email":"suspended-a@siapin.test"}',
  true
);

do $$
begin
  if (select count(*) from public.workspaces) <> 0 then
    raise exception 'Suspended member can still read its workspace';
  end if;
  if (select count(*) from public.transactions) <> 0 then
    raise exception 'Suspended member can still read transactions';
  end if;
  if not exists (
    select 1
    from public.get_my_workspace_access()
    where workspace_id = '92000000-0000-0000-0000-000000000001'
      and membership_status = 'suspended'
  ) then
    raise exception 'Suspended status is unavailable to session resolution';
  end if;
end;
$$;

-- Owner A has full authority only in A.
select set_config(
  'request.jwt.claims',
  '{"sub":"91000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner-a@siapin.test"}',
  true
);

do $$
begin
  if (select count(*) from public.workspaces) <> 1 then
    raise exception 'Owner can read another owner workspace';
  end if;
  if not coalesce((
    select 'workspace.delete' = any(permission_codes)
    from public.get_my_workspace_access()
    where workspace_id = '92000000-0000-0000-0000-000000000001'
  ), false) then
    raise exception 'Owner no longer receives immutable full access';
  end if;
  if exists (
    select 1
    from public.get_my_workspace_access()
    where workspace_id = '92000000-0000-0000-0000-000000000002'
      and 'workspace.read' = any(permission_codes)
  ) then
    raise exception 'Owner permission leaked into another workspace';
  end if;
end;
$$;

select pass('workspace RBAC and RLS contracts passed');
select * from finish();

rollback;
