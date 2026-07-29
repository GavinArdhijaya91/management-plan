\set ON_ERROR_STOP on

begin;

select plan(1);

select set_config('test.export_workspace_id', id::text, true)
from public.workspaces
where slug = 'kedai-siapin-demo';

select set_config('test.other_workspace_id', id::text, true)
from public.workspaces
where slug = 'studio-siapin-demo';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000002","role":"authenticated","email":"manager@siapin.local"}',
  true
);

create temporary table transaction_export_result on commit drop as
select *
from public.prepare_transaction_export(
  current_setting('test.export_workspace_id')::uuid,
  'xlsx',
  null,
  null
);

do $$
begin
  if not exists (select 1 from transaction_export_result) then
    raise exception 'Permitted manager received an empty transaction export fixture';
  end if;

  if exists (
    select 1
    from transaction_export_result
    where currency_code is null
      or financial_account_name is null
      or amount <= 0
  ) then
    raise exception 'Transaction export returned incomplete financial context';
  end if;
end;
$$;

reset role;

do $$
declare
  exported_row_count integer;
  audit_row_count integer;
begin
  select count(*) into exported_row_count
  from transaction_export_result;

  select count(*) into audit_row_count
  from public.audit_logs
  where workspace_id = current_setting('test.export_workspace_id')::uuid
    and actor_id = 'a1000000-0000-0000-0000-000000000002'
    and action = 'export'
    and entity_type = 'transaction_export'
    and metadata ->> 'format' = 'xlsx'
    and (metadata ->> 'row_count')::integer = exported_row_count;

  if audit_row_count <> 1 then
    raise exception 'Transaction export did not preserve exactly one audit record';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000003","role":"authenticated","email":"staff@siapin.local"}',
  true
);

do $$
declare
  staff_blocked boolean := false;
  other_workspace_blocked boolean := false;
  invalid_format_blocked boolean := false;
begin
  begin
    perform public.prepare_transaction_export(
      current_setting('test.export_workspace_id')::uuid,
      'pdf',
      null,
      null
    );
  exception
    when insufficient_privilege then staff_blocked := true;
  end;

  begin
    perform public.prepare_transaction_export(
      current_setting('test.other_workspace_id')::uuid,
      'pdf',
      null,
      null
    );
  exception
    when insufficient_privilege then other_workspace_blocked := true;
  end;

  begin
    perform public.prepare_transaction_export(
      current_setting('test.export_workspace_id')::uuid,
      'html',
      null,
      null
    );
  exception
    when invalid_parameter_value then invalid_format_blocked := true;
  end;

  if not staff_blocked
    or not other_workspace_blocked
    or not invalid_format_blocked then
    raise exception 'Transaction export authorization or input boundary was bypassed';
  end if;
end;
$$;

select pass('transaction export is permission-bound, tenant-isolated, validated, and audited');
select * from finish();

rollback;
