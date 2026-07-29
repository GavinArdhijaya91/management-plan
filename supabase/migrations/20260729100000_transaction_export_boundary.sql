alter table public.audit_logs
  drop constraint audit_logs_action_check,
  add constraint audit_logs_action_check
    check (
      action in (
        'insert',
        'update',
        'delete',
        'export',
        'request_deletion',
        'cancel_deletion',
        'permanent_delete'
      )
    );

create or replace function public.prepare_transaction_export(
  target_workspace_id uuid,
  target_format text,
  period_start date default null,
  period_end date default null
)
returns table (
  transaction_id uuid,
  transaction_type public.transaction_type,
  transaction_date date,
  amount numeric,
  cost_amount numeric,
  net_result numeric,
  currency_code text,
  financial_account_name text,
  note text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  exported_row_count integer;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if target_format is null
    or target_format not in ('xlsx', 'pdf', 'docx') then
    raise exception 'Unsupported transaction export format'
      using errcode = '22023';
  end if;

  if period_start is not null
    and period_end is not null
    and period_start > period_end then
    raise exception 'Export period start must not exceed period end'
      using errcode = '22023';
  end if;

  if not private.has_workspace_permission(
    target_workspace_id,
    'transaction.export'
  ) then
    raise exception 'Transaction export permission required'
      using errcode = '42501';
  end if;

  select count(*)::integer
  into exported_row_count
  from public.transactions transaction_record
  where transaction_record.workspace_id = target_workspace_id
    and (
      period_start is null
      or transaction_record.transaction_date >= period_start
    )
    and (
      period_end is null
      or transaction_record.transaction_date <= period_end
    );

  if exported_row_count > 10000 then
    raise exception 'Synchronous transaction export is limited to 10000 rows'
      using errcode = '54000';
  end if;

  insert into public.audit_logs (
    workspace_id,
    actor_id,
    action,
    entity_type,
    metadata
  )
  values (
    target_workspace_id,
    actor_id,
    'export',
    'transaction_export',
    jsonb_build_object(
      'source',
      'canonical_rpc',
      'format',
      target_format,
      'row_count',
      exported_row_count
    )
  );

  return query
  select
    transaction_record.id,
    transaction_record.type,
    transaction_record.transaction_date,
    transaction_record.amount,
    transaction_record.cost_amount,
    case
      when transaction_record.type = 'sale'
        then transaction_record.amount - transaction_record.cost_amount
      else -transaction_record.amount
    end,
    account.currency_code,
    account.name,
    transaction_record.note
  from public.transactions transaction_record
  join public.financial_accounts account
    on account.workspace_id = transaction_record.workspace_id
    and account.id = transaction_record.financial_account_id
  where transaction_record.workspace_id = target_workspace_id
    and (
      period_start is null
      or transaction_record.transaction_date >= period_start
    )
    and (
      period_end is null
      or transaction_record.transaction_date <= period_end
    )
  order by transaction_record.transaction_date desc, transaction_record.id;
end;
$$;

revoke all on function public.prepare_transaction_export(uuid, text, date, date)
from public, anon, authenticated;
grant execute on function public.prepare_transaction_export(uuid, text, date, date)
to authenticated;

comment on function public.prepare_transaction_export(uuid, text, date, date) is
  'Returns a bounded workspace transaction export only to explicitly permitted members and records structural audit evidence.';
