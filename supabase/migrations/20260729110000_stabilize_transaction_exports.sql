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
  request_actor_id uuid := (select auth.uid());
  exported_row_count integer;
  format_row_limit integer;
  recent_export_count integer;
begin
  if request_actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  format_row_limit := case target_format
    when 'xlsx' then 10000
    when 'pdf' then 2000
    when 'docx' then 2000
    else null
  end;

  if format_row_limit is null then
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

  -- Serialize export preparation for one actor and workspace so concurrent
  -- requests cannot race past the audit-based rate limit.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      request_actor_id::text || ':' || target_workspace_id::text || ':transaction_export',
      0
    )
  );

  select count(*)::integer
  into recent_export_count
  from public.audit_logs audit_record
  where audit_record.workspace_id = target_workspace_id
    and audit_record.actor_id = request_actor_id
    and audit_record.action = 'export'
    and audit_record.entity_type = 'transaction_export'
    and audit_record.created_at >= pg_catalog.now() - interval '10 minutes';

  if recent_export_count >= 10 then
    raise exception 'Transaction export rate limit exceeded'
      using errcode = 'P0001';
  end if;

  select count(*)::integer
  into exported_row_count
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
    );

  if exported_row_count > format_row_limit then
    raise exception 'Transaction export exceeds the selected format row limit'
      using errcode = '54000',
        detail = pg_catalog.format(
          '%s supports at most %s synchronous rows',
          target_format,
          format_row_limit
        );
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
    request_actor_id,
    'export',
    'transaction_export',
    jsonb_build_object(
      'source',
      'canonical_rpc',
      'format',
      target_format,
      'row_count',
      exported_row_count,
      'period_start',
      period_start,
      'period_end',
      period_end
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
  'Returns a permission-bound, format-bounded, rate-limited workspace transaction export and records structural audit evidence.';
