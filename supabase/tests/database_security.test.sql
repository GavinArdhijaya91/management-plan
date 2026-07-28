\set ON_ERROR_STOP on

begin;

select plan(1);

do $$
begin
  if not has_table_privilege(
    'authenticated',
    'public.workspaces',
    'select'
  ) then
    raise exception 'Authenticated lacks RLS-gated workspace reads';
  end if;

  if has_table_privilege(
    'authenticated',
    'public.workspaces',
    'insert'
  ) then
    raise exception 'Authenticated received direct workspace creation';
  end if;

  if not has_table_privilege(
    'authenticated',
    'public.business_plans',
    'select'
  ) or not has_table_privilege(
    'authenticated',
    'public.business_plans',
    'insert'
  ) then
    raise exception 'Authenticated lacks RLS-gated Planning access';
  end if;

  if not has_column_privilege(
    'authenticated',
    'public.business_plans',
    'title',
    'update'
  ) or has_column_privilege(
    'authenticated',
    'public.business_plans',
    'status',
    'update'
  ) then
    raise exception 'Business-plan lifecycle columns are not RPC-only';
  end if;

  if not has_column_privilege(
    'authenticated',
    'public.notifications',
    'read_at',
    'update'
  ) or has_column_privilege(
    'authenticated',
    'public.notifications',
    'detail',
    'update'
  ) then
    raise exception 'Notification update privileges exceeded read state';
  end if;

  if has_table_privilege(
    'authenticated',
    'public.business_review_goal_target_snapshots',
    'insert, update, delete'
  ) then
    raise exception 'Authenticated received mutable review evidence';
  end if;
end;
$$;

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
  (
    '10000000-0000-0000-0000-000000000001',
    'owner@siapin.test',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Owner Test"}',
    now(),
    now(),
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'member@siapin.test',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Member Test"}',
    now(),
    now(),
    now()
  );

insert into public.workspaces (id, name, slug, created_by)
values (
  '20000000-0000-0000-0000-000000000001',
  'Workspace Security Test',
  'workspace-security-test',
  '10000000-0000-0000-0000-000000000001'
);

insert into public.workspace_members (workspace_id, user_id, role)
values (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'owner'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","email":"member@siapin.test"}',
  true
);

do $$
declare
  blocked boolean := false;
begin
  begin
    insert into public.workspace_members (workspace_id, user_id, role)
    values (
      '20000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000002',
      'owner'
    );
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'RLS allowed a non-member to promote itself to owner';
  end if;
end;
$$;

do $$
declare
  blocked boolean := false;
begin
  begin
    insert into public.workspaces (name, slug, created_by)
    values (
      'Orphan Workspace',
      'orphan-workspace',
      '10000000-0000-0000-0000-000000000002'
    );
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'Direct workspace insertion bypassed atomic workspace creation';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@siapin.test"}',
  true
);

create temporary table invitation_result (
  invitation_id uuid,
  invitation_token text,
  invitation_expires_at timestamptz,
  email_delivery_id uuid
) on commit drop;

insert into invitation_result
select *
from public.create_workspace_invitation(
  '20000000-0000-0000-0000-000000000001',
  'member@siapin.test',
  (
    select id
    from public.workspace_roles
    where workspace_id = '20000000-0000-0000-0000-000000000001'
      and code = 'member'
  ),
  7
);

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","email":"member@siapin.test"}',
  true
);

select public.accept_workspace_invitation(
  (select invitation_token from invitation_result)
);

do $$
begin
  if not exists (
    select 1
    from public.workspace_members
    where workspace_id = '20000000-0000-0000-0000-000000000001'
      and user_id = '10000000-0000-0000-0000-000000000002'
      and role = 'member'
      and status = 'active'
  ) then
    raise exception 'Invitation acceptance did not create an active member';
  end if;
end;
$$;

do $$
declare
  blocked boolean := false;
begin
  begin
    insert into public.workspace_roles (
      workspace_id,
      code,
      name,
      hierarchy_rank,
      base_role,
      created_by
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      'unauthorized_role',
      'Unauthorized Role',
      50,
      'member',
      '10000000-0000-0000-0000-000000000002'
    );
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'A non-owner created a workspace role';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@siapin.test"}',
  true
);

do $$
declare
  blocked boolean := false;
begin
  begin
    perform public.remove_workspace_member(
      '20000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001'
    );
  exception
    when check_violation then blocked := true;
  end;

  if not blocked then
    raise exception 'The final active workspace owner could be removed';
  end if;
end;
$$;

select public.create_transaction(
  '20000000-0000-0000-0000-000000000001',
  'sale',
  100000,
  current_date,
  '2f000000-0000-0000-0000-000000000001',
  0,
  'Audit test transaction'
);

-- The following records are fixtures for deferred allocation constraints, not
-- an RLS contract. Planning authorization is covered independently by
-- planning_visibility_permissions.test.sql, so create these fixtures with the
-- test runner role and restore the authenticated owner before user-flow checks.
reset role;

do $$
declare
  plan_id uuid;
  initiative_id uuid;
  transaction_id uuid;
  blocked boolean := false;
begin
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
    '20000000-0000-0000-0000-000000000001',
    'Allocation Constraint Test',
    'draft',
    current_date,
    current_date + 30,
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001'
  )
  returning id into plan_id;

  insert into public.business_initiatives (
    workspace_id,
    business_plan_id,
    title,
    unlinked_goal_context,
    status,
    owner_id,
    created_by
  )
  values (
    '20000000-0000-0000-0000-000000000001',
    plan_id,
    'Allocation Initiative Test',
    'Supports allocation-integrity tests without a goal relationship.',
    'planned',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001'
  )
  returning id into initiative_id;

  select id into transaction_id
  from public.transactions
  where workspace_id = '20000000-0000-0000-0000-000000000001'
    and note = 'Audit test transaction';

  begin
    insert into public.transaction_initiative_allocations (
      workspace_id,
      transaction_id,
      business_initiative_id,
      allocated_amount,
      created_by
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      transaction_id,
      initiative_id,
      100001,
      '10000000-0000-0000-0000-000000000001'
    );

    set constraints transaction_allocations_within_amount immediate;
  exception
    when check_violation then blocked := true;
  end;

  set constraints transaction_allocations_within_amount deferred;

  if not blocked then
    raise exception 'Initiative allocation exceeded its transaction amount';
  end if;
end;
$$;

do $$
declare
  transaction_id uuid;
  category_id uuid;
  blocked boolean := false;
begin
  select id into transaction_id
  from public.transactions
  where workspace_id = '20000000-0000-0000-0000-000000000001'
    and note = 'Audit test transaction';

  select id into category_id
  from public.transaction_categories
  where workspace_id = '20000000-0000-0000-0000-000000000001'
    and code = 'sales_revenue';

  begin
    insert into public.transaction_category_allocations (
      workspace_id,
      transaction_id,
      transaction_category_id,
      allocated_amount,
      created_by
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      transaction_id,
      category_id,
      100001,
      '10000000-0000-0000-0000-000000000001'
    );

    set constraints transaction_category_allocations_within_amount immediate;
  exception
    when check_violation then blocked := true;
  end;

  set constraints transaction_category_allocations_within_amount deferred;

  if not blocked then
    raise exception 'Category allocation exceeded its transaction amount';
  end if;
end;
$$;

do $$
declare
  plan_id uuid;
  review_id uuid;
  portfolio_id uuid;
begin
  select id into plan_id
  from public.business_plans
  where workspace_id = '20000000-0000-0000-0000-000000000001'
    and title = 'Allocation Constraint Test';

  insert into public.business_reviews (
    workspace_id,
    business_plan_id,
    period_type,
    period_start,
    period_end,
    summary,
    reviewed_by
  )
  values (
    '20000000-0000-0000-0000-000000000001',
    plan_id,
    'custom',
    current_date - 7,
    current_date,
    'Business review finalization security test.',
    '10000000-0000-0000-0000-000000000001'
  )
  returning id into review_id;

  perform public.finalize_business_review(review_id);

  if not exists (
    select 1
    from public.business_reviews
    where id = review_id
      and status = 'finalized'
      and finalized_at is not null
      and snapshot_refreshed_at is not null
  ) then
    raise exception 'Business review was not finalized with a snapshot timestamp';
  end if;

  if not exists (
    select 1
    from public.business_review_action_item_snapshots
    where business_review_id = review_id
  ) then
    raise exception 'Business review action-item snapshot was not captured';
  end if;

  if not exists (
    select 1
    from public.business_review_financial_snapshots
    where business_review_id = review_id
      and transaction_count > 0
  ) then
    raise exception 'Business review financial snapshot was not captured';
  end if;

  set local role authenticated;

  update public.business_reviews
  set summary = 'A finalized review must reject this direct rewrite.'
  where id = review_id;

  reset role;

  if exists (
    select 1
    from public.business_reviews
    where id = review_id
      and summary = 'A finalized review must reject this direct rewrite.'
  ) then
    raise exception 'A finalized business review was directly rewritten';
  end if;

  if not exists (
    select 1
    from public.workspace_achievements
    where workspace_id = '20000000-0000-0000-0000-000000000001'
      and achievement_code = 'first_finalized_review'
      and evidence_business_review_id = review_id
  ) then
    raise exception 'Finalization did not award its evidence-based achievement';
  end if;

  insert into public.business_portfolios (
    workspace_id,
    title,
    status,
    created_by
  )
  values (
    '20000000-0000-0000-0000-000000000001',
    'Security Test Portfolio',
    'active',
    '10000000-0000-0000-0000-000000000001'
  )
  returning id into portfolio_id;

  insert into public.business_portfolio_reviews (
    workspace_id,
    business_portfolio_id,
    business_review_id,
    added_by
  )
  values (
    '20000000-0000-0000-0000-000000000001',
    portfolio_id,
    review_id,
    '10000000-0000-0000-0000-000000000001'
  );

  if not exists (
    select 1
    from public.notifications
    where workspace_id = '20000000-0000-0000-0000-000000000001'
      and user_id = '10000000-0000-0000-0000-000000000001'
      and event_code = 'business_review_finalized'
      and source_entity_id = review_id
  ) then
    raise exception 'Review finalization did not create a notification';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@siapin.test"}',
  true
);

do $$
declare
  first_generated_count integer;
  repeated_generated_count integer;
begin
  insert into public.calendar_events (
    workspace_id,
    created_by,
    title,
    type,
    starts_at,
    ends_at
  )
  values (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Reminder Idempotency Test',
    'other',
    now() + interval '1 hour',
    now() + interval '2 hours'
  );

  first_generated_count := public.generate_my_workspace_reminders(
    '20000000-0000-0000-0000-000000000001',
    now()
  );
  repeated_generated_count := public.generate_my_workspace_reminders(
    '20000000-0000-0000-0000-000000000001',
    now()
  );

  if first_generated_count < 1 then
    raise exception 'Reminder generation did not create an upcoming event notification';
  end if;

  if repeated_generated_count <> 0 then
    raise exception 'Reminder generation created duplicate notifications';
  end if;
end;
$$;

-- Cross-plan and category-cycle records below are integrity fixtures. Their
-- authorization paths have dedicated contracts, so avoid coupling these
-- constraint checks to Planning RLS.
reset role;

do $$
declare
  first_plan_id uuid;
  second_plan_id uuid;
  second_plan_goal_id uuid;
  category_a_id uuid;
  category_b_id uuid;
  blocked boolean := false;
begin
  select id into first_plan_id
  from public.business_plans
  where workspace_id = '20000000-0000-0000-0000-000000000001'
    and title = 'Allocation Constraint Test';

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
    '20000000-0000-0000-0000-000000000001',
    'Cross Plan Integrity Test',
    'draft',
    current_date,
    current_date + 30,
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001'
  )
  returning id into second_plan_id;

  insert into public.business_goals (
    workspace_id,
    business_plan_id,
    title,
    status,
    owner_id,
    created_by
  )
  values (
    '20000000-0000-0000-0000-000000000001',
    second_plan_id,
    'Second Plan Goal',
    'draft',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001'
  )
  returning id into second_plan_goal_id;

  begin
    insert into public.business_initiatives (
      workspace_id,
      business_plan_id,
      business_goal_id,
      title,
      status,
      owner_id,
      created_by
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      first_plan_id,
      second_plan_goal_id,
      'Invalid Cross Plan Initiative',
      'planned',
      '10000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001'
    );
  exception
    when check_violation then blocked := true;
  end;

  if not blocked then
    raise exception 'An initiative linked a goal from a different business plan';
  end if;

  insert into public.transaction_categories (
    workspace_id,
    code,
    name,
    transaction_type,
    created_by
  )
  values
    (
      '20000000-0000-0000-0000-000000000001',
      'cycle_test_a',
      'Cycle Test A',
      'expense',
      '10000000-0000-0000-0000-000000000001'
    ),
    (
      '20000000-0000-0000-0000-000000000001',
      'cycle_test_b',
      'Cycle Test B',
      'expense',
      '10000000-0000-0000-0000-000000000001'
    );

  select id into category_a_id
  from public.transaction_categories
  where workspace_id = '20000000-0000-0000-0000-000000000001'
    and code = 'cycle_test_a';
  select id into category_b_id
  from public.transaction_categories
  where workspace_id = '20000000-0000-0000-0000-000000000001'
    and code = 'cycle_test_b';

  update public.transaction_categories
  set parent_category_id = category_b_id
  where id = category_a_id;

  blocked := false;
  begin
    update public.transaction_categories
    set parent_category_id = category_a_id
    where id = category_b_id;
  exception
    when check_violation then blocked := true;
  end;

  if not blocked then
    raise exception 'Transaction category hierarchy accepted an indirect cycle';
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
    from public.permission_definitions
    where code = 'contact.read'
  ) then
    raise exception 'Operator contact messages still expose a workspace permission';
  end if;

  if not exists (
    select 1
    from public.workspace_member_access
    where workspace_id = '20000000-0000-0000-0000-000000000001'
      and user_id = '10000000-0000-0000-0000-000000000001'
      and role_code = 'owner'
      and is_owner_role
  ) then
    raise exception 'Canonical workspace member access view lost the owner role';
  end if;

  if not exists (
    select 1
    from public.get_workspace_member_directory(
      '20000000-0000-0000-0000-000000000001'
    )
    where user_id = '10000000-0000-0000-0000-000000000001'
      and role_code = 'owner'
  ) then
    raise exception 'Safe workspace member directory lost the owner';
  end if;

  if not exists (
    select 1
    from public.transaction_financial_results
    where workspace_id = '20000000-0000-0000-0000-000000000001'
      and transaction_type = 'sale'
      and amount = 100000
      and cost_amount = 0
      and net_result = 100000
  ) then
    raise exception 'Canonical transaction financial result is inconsistent';
  end if;

  if not exists (
    select 1
    from public.audit_logs
    where workspace_id = '20000000-0000-0000-0000-000000000001'
      and actor_id = '10000000-0000-0000-0000-000000000001'
      and action = 'insert'
      and entity_type = 'transaction'
  ) then
    raise exception 'Transaction mutation did not produce an audit log';
  end if;
end;
$$;

select pass('database security contracts passed');
select * from finish();

rollback;
