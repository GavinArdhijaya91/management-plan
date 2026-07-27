\set ON_ERROR_STOP on

begin;

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
  ('99000000-0000-0000-0000-000000000001', 'owner@idempotency.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Idempotency Owner"}', now(), now(), now()),
  ('99000000-0000-0000-0000-000000000002', 'successor@idempotency.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Idempotency Successor"}', now(), now(), now()),
  ('99000000-0000-0000-0000-000000000003', 'manager@idempotency.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Idempotency Manager"}', now(), now(), now());

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"99000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@idempotency.test"}',
  true
);

-- Workspace slug is the natural idempotency key.
do $$
declare
  first_workspace_id uuid;
  retried_workspace_id uuid;
  mismatch_blocked boolean := false;
begin
  first_workspace_id := public.create_workspace(
    'Idempotency Workspace',
    'idempotency-workspace'
  );
  retried_workspace_id := public.create_workspace(
    'Idempotency Workspace',
    'idempotency-workspace'
  );

  if first_workspace_id <> retried_workspace_id then
    raise exception 'Workspace retry returned a different resource';
  end if;

  begin
    perform public.create_workspace(
      'Different Workspace Payload',
      'idempotency-workspace'
    );
  exception
    when unique_violation then mismatch_blocked := true;
  end;

  if not mismatch_blocked then
    raise exception 'Workspace slug was reused with a different payload';
  end if;
end;
$$;

reset role;

insert into public.workspace_members (workspace_id, user_id, role, status)
select workspace.id, user_record.id, role_name, 'active'
from public.workspaces workspace
cross join (
  values
    ('99000000-0000-0000-0000-000000000002'::uuid, 'member'::public.workspace_role),
    ('99000000-0000-0000-0000-000000000003'::uuid, 'manager'::public.workspace_role)
) as user_record(id, role_name)
where workspace.slug = 'idempotency-workspace';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"99000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@idempotency.test"}',
  true
);

-- Transaction retries return one resource; a key/payload mismatch is rejected.
do $$
declare
  target_workspace_id uuid;
  first_transaction_id uuid;
  retried_transaction_id uuid;
  mismatch_blocked boolean := false;
begin
  select id into target_workspace_id
  from public.workspaces
  where slug = 'idempotency-workspace';

  first_transaction_id := public.create_transaction(
    target_workspace_id,
    'sale',
    100000,
    current_date,
    '9a000000-0000-0000-0000-000000000001',
    20000,
    'Idempotent transaction'
  );
  retried_transaction_id := public.create_transaction(
    target_workspace_id,
    'sale',
    100000,
    current_date,
    '9a000000-0000-0000-0000-000000000001',
    20000,
    'Idempotent transaction'
  );

  if first_transaction_id <> retried_transaction_id then
    raise exception 'Transaction retry returned a different resource';
  end if;
  if (
    select count(*) from public.transactions
    where workspace_id = target_workspace_id
      and note = 'Idempotent transaction'
  ) <> 1 then
    raise exception 'Transaction retry created duplicate business rows';
  end if;

  begin
    perform public.create_transaction(
      target_workspace_id,
      'sale',
      100001,
      current_date,
      '9a000000-0000-0000-0000-000000000001',
      20000,
      'Idempotent transaction'
    );
  exception
    when invalid_parameter_value then mismatch_blocked := true;
  end;

  if not mismatch_blocked then
    raise exception 'Transaction idempotency key accepted a payload mismatch';
  end if;
end;
$$;

-- Ownership transfer retries succeed for the original caller even after that
-- caller has been demoted. Reusing the key for another target is rejected.
do $$
declare
  target_workspace_id uuid;
  mismatch_blocked boolean := false;
begin
  select id into target_workspace_id
  from public.workspaces
  where slug = 'idempotency-workspace';

  perform public.transfer_workspace_ownership(
    target_workspace_id,
    '99000000-0000-0000-0000-000000000002',
    null,
    '9b000000-0000-0000-0000-000000000001'
  );
  perform public.transfer_workspace_ownership(
    target_workspace_id,
    '99000000-0000-0000-0000-000000000002',
    null,
    '9b000000-0000-0000-0000-000000000001'
  );

  begin
    perform public.transfer_workspace_ownership(
      target_workspace_id,
      '99000000-0000-0000-0000-000000000003',
      null,
      '9b000000-0000-0000-0000-000000000001'
    );
  exception
    when invalid_parameter_value then mismatch_blocked := true;
  end;

  if not mismatch_blocked then
    raise exception 'Ownership idempotency key accepted a payload mismatch';
  end if;
end;
$$;

reset role;

do $$
declare
  target_workspace_id uuid;
  target_plan_id uuid;
begin
  select id into target_workspace_id
  from public.workspaces
  where slug = 'idempotency-workspace';

  if (
    select count(*) from public.workspace_members
    where workspace_id = target_workspace_id
      and role = 'owner'
      and status = 'active'
  ) <> 1 then
    raise exception 'Ownership retry broke the single-owner invariant';
  end if;

  if (
    select count(*) from private.idempotency_records
    where operation_code in (
      'create_transaction',
      'transfer_workspace_ownership'
    )
      and completed_at is not null
  ) <> 2 then
    raise exception 'Completed operations did not retain one idempotency record each';
  end if;

  insert into public.business_plans (
    workspace_id,
    title,
    status,
    starts_on,
    ends_on,
    owner_id,
    created_by
  )
  values (
    target_workspace_id,
    'Idempotent Review Plan',
    'draft',
    current_date,
    current_date + 30,
    '99000000-0000-0000-0000-000000000002',
    '99000000-0000-0000-0000-000000000002'
  )
  returning id into target_plan_id;

  insert into public.business_reviews (
    id,
    workspace_id,
    business_plan_id,
    period_type,
    period_start,
    period_end,
    summary,
    reviewed_by
  )
  values (
    '9c000000-0000-0000-0000-000000000001',
    target_workspace_id,
    target_plan_id,
    'custom',
    current_date - 7,
    current_date,
    'Idempotent finalization review.',
    '99000000-0000-0000-0000-000000000002'
  );
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"99000000-0000-0000-0000-000000000002","role":"authenticated","email":"successor@idempotency.test"}',
  true
);

-- Finalization is intrinsically idempotent under a row lock.
do $$
declare
  first_finalized_at timestamptz;
  retried_finalized_at timestamptz;
begin
  perform public.finalize_business_review(
    '9c000000-0000-0000-0000-000000000001'
  );
  select finalized_at into first_finalized_at
  from public.business_reviews
  where id = '9c000000-0000-0000-0000-000000000001';

  perform public.finalize_business_review(
    '9c000000-0000-0000-0000-000000000001'
  );
  select finalized_at into retried_finalized_at
  from public.business_reviews
  where id = '9c000000-0000-0000-0000-000000000001';

  if first_finalized_at is distinct from retried_finalized_at then
    raise exception 'Finalization retry changed finalized_at';
  end if;
  if (
    select count(*) from public.notifications
    where event_key =
      'business_review_finalized:9c000000-0000-0000-0000-000000000001'
      and user_id = '99000000-0000-0000-0000-000000000002'
  ) <> 1 then
    raise exception 'Finalization retry duplicated its notification';
  end if;
end;
$$;

rollback;
