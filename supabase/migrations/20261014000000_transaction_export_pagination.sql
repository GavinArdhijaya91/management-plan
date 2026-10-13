-- B1: paginated transaction export so PostgREST max_rows can never
-- silently truncate a financial report. The legacy single-shot
-- prepare_transaction_export() is kept for compatibility; new callers
-- must use prepare_transaction_export_page() in a loop and compare the
-- returned total_count with the rows actually received.

create or replace function public.prepare_transaction_export_page(
  target_workspace_id uuid,
  target_format text,
  period_start date default null,
  period_end date default null,
  result_offset integer default 0,
  result_limit integer default 500
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_actor_id uuid := (select auth.uid());
  exported_row_count integer;
  format_row_limit integer;
  recent_export_count integer;
  export_rows jsonb;
begin
  if request_actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if result_offset is null or result_offset < 0 then
    raise exception 'Export offset must be zero or positive' using errcode = '22023';
  end if;

  if result_limit is null or result_limit < 1 or result_limit > 1000 then
    raise exception 'Export page size must be between 1 and 1000' using errcode = '22023';
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
      using errcode = 'P0001', hint = 'EXPORT_RATE_LIMITED';
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

  -- Audit once per full export (first page only) to keep rate limiting stable.
  if result_offset = 0 then
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
        'paginated_rpc',
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
  end if;

  select pg_catalog.coalesce(pg_catalog.jsonb_agg(row), '[]'::jsonb)
  into export_rows
  from (
    select
      pg_catalog.jsonb_build_object(
        'transaction_id', transaction_record.id,
        'transaction_type', transaction_record.type,
        'transaction_date', transaction_record.transaction_date,
        'amount', transaction_record.amount,
        'cost_amount', transaction_record.cost_amount,
        'net_result', case
          when transaction_record.type = 'sale'
            then transaction_record.amount - transaction_record.cost_amount
          else -transaction_record.amount
        end,
        'currency_code', account.currency_code,
        'financial_account_name', account.name,
        'note', transaction_record.note
      ) as row
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
    order by transaction_record.transaction_date desc, transaction_record.id
    offset greatest(result_offset, 0)
    limit least(result_limit, 1000)
  ) ordered_rows;

  return pg_catalog.jsonb_build_object(
    'total_count', exported_row_count,
    'offset', result_offset,
    'limit', result_limit,
    'rows', export_rows
  );
end;
$$;

revoke all on function public.prepare_transaction_export_page(uuid, text, date, date, integer, integer)
from public, anon, authenticated;
grant execute on function public.prepare_transaction_export_page(uuid, text, date, date, integer, integer)
to authenticated;

comment on function public.prepare_transaction_export_page(uuid, text, date, date, integer, integer) is
  'Paginated, count-checked workspace transaction export. Callers must loop until all total_count rows are received.';
