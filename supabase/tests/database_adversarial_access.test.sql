\set ON_ERROR_STOP on

begin;

select plan(1);

create temporary table adversarial_targets (
  primary_workspace_id uuid not null,
  secondary_workspace_id uuid not null,
  primary_plan_id uuid not null,
  secondary_manager_role_id uuid not null
) on commit drop;

insert into adversarial_targets
select
  primary_workspace.id,
  secondary_workspace.id,
  primary_plan.id,
  secondary_manager_role.id
from public.workspaces primary_workspace
join public.business_plans primary_plan
  on primary_plan.workspace_id = primary_workspace.id
join public.workspaces secondary_workspace
  on secondary_workspace.slug = 'studio-siapin-demo'
join public.workspace_roles secondary_manager_role
  on secondary_manager_role.workspace_id = secondary_workspace.id
  and secondary_manager_role.code = 'manager'
where primary_workspace.slug = 'kedai-siapin-demo'
  and primary_plan.title = 'Rencana Pertumbuhan Kedai'
limit 1;

grant select on adversarial_targets to authenticated;

do $$
begin
  if (select count(*) from adversarial_targets) <> 1 then
    raise exception 'Adversarial security fixtures are incomplete';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000007","role":"authenticated","email":"other-owner@siapin.local"}',
  true
);

-- Owning workspace B must not grant any authority over workspace A, even when
-- the attacker submits valid identifiers discovered outside the database API.
do $$
declare
  target adversarial_targets%rowtype;
  affected_rows integer;
  blocked boolean;
begin
  select * into target from adversarial_targets;

  if exists (
    select 1
    from public.business_plans
    where id = target.primary_plan_id
  ) then
    raise exception 'A foreign workspace owner read another workspace plan';
  end if;

  update public.workspaces
  set description = 'Cross-workspace overwrite attempt'
  where id = target.primary_workspace_id;
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'A foreign workspace owner updated another workspace';
  end if;

  blocked := false;
  begin
    perform public.create_transaction(
      target.primary_workspace_id,
      'expense',
      1000,
      current_date,
      'd1000000-0000-0000-0000-000000000001',
      0,
      'Cross-workspace RPC attempt',
      null
    );
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'Transaction RPC accepted a foreign workspace identifier';
  end if;

  blocked := false;
  begin
    perform public.transition_business_plan(
      target.primary_plan_id,
      'active'
    );
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'Planning lifecycle RPC accepted a foreign plan identifier';
  end if;

  blocked := false;
  begin
    perform public.get_workspace_member_directory(target.primary_workspace_id);
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'Member directory RPC disclosed another workspace';
  end if;

  if exists (
    select 1
    from public.audit_logs
    where workspace_id = target.primary_workspace_id
  ) then
    raise exception 'Audit history crossed workspace boundaries';
  end if;

  blocked := false;
  begin
    execute format(
      'select private.has_workspace_permission(%L, %L)',
      target.secondary_workspace_id,
      'workspace.read'
    );
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'Authenticated called an internal authorization helper';
  end if;
end;
$$;

-- RLS must bind actor-owned identity columns to auth.uid(), not merely accept
-- a workspace where the current user has write permission.
do $$
declare
  target adversarial_targets%rowtype;
  blocked boolean := false;
begin
  select * into target from adversarial_targets;

  begin
    insert into public.transactions (
      workspace_id,
      created_by,
      type,
      amount,
      transaction_date,
      note
    )
    values (
      target.secondary_workspace_id,
      'a1000000-0000-0000-0000-000000000001',
      'expense',
      1000,
      current_date,
      'Forged creator attempt'
    );
  exception
    when insufficient_privilege or check_violation then blocked := true;
  end;

  if not blocked then
    raise exception 'Workspace owner forged another user as transaction creator';
  end if;
end;
$$;

-- Owner A also has no administrative authority over workspace B.
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@siapin.local"}',
  true
);

do $$
declare
  target adversarial_targets%rowtype;
  blocked boolean;
begin
  select * into target from adversarial_targets;

  blocked := false;
  begin
    perform public.set_workspace_member_status(
      target.secondary_workspace_id,
      'a1000000-0000-0000-0000-000000000007',
      'suspended'
    );
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'Foreign owner changed another workspace membership';
  end if;

  blocked := false;
  begin
    perform public.create_workspace_invitation(
      target.secondary_workspace_id,
      'attacker-invite@siapin.test',
      target.secondary_manager_role_id,
      7
    );
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'Foreign owner created an invitation for another workspace';
  end if;

  blocked := false;
  begin
    delete from public.audit_logs
    where workspace_id = target.primary_workspace_id;
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'Workspace owner received direct audit-log mutation access';
  end if;
end;
$$;

select pass('database adversarial access contracts passed');
select * from finish();

rollback;
