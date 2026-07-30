create type public.metric_actual_source as enum (
  'manual',
  'transaction'
);

create type public.metric_reconciliation_status as enum (
  'missing_authoritative',
  'missing_comparison',
  'reconciled',
  'attention'
);

alter table public.metric_definitions
  add column authoritative_source public.metric_actual_source
    not null default 'manual',
  add column reconciliation_tolerance_percent numeric(7, 4)
    not null default 5
    check (
      reconciliation_tolerance_percent >= 0
      and reconciliation_tolerance_percent <= 100
    );

alter table public.business_review_goal_target_snapshots
  add column manual_actual_value numeric(18, 4),
  add column transaction_actual_value numeric(18, 4),
  add column authoritative_source public.metric_actual_source,
  add column comparison_value numeric(18, 4),
  add column reconciliation_variance numeric(18, 4),
  add column reconciliation_variance_percent numeric(11, 4),
  add column reconciliation_status public.metric_reconciliation_status;

create or replace function public.calculate_goal_target_actual_reconciliation(
  target_goal_target_id uuid,
  target_period_start date default null,
  target_period_end date default null
)
returns table (
  workspace_id uuid,
  goal_target_id uuid,
  authoritative_source public.metric_actual_source,
  reconciliation_tolerance_percent numeric,
  manual_actual_value numeric,
  transaction_actual_value numeric,
  actual_value numeric,
  comparison_value numeric,
  reconciliation_variance numeric,
  reconciliation_variance_percent numeric,
  reconciliation_status public.metric_reconciliation_status,
  target_value numeric,
  target_variance numeric,
  progress_percent numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
  with actual_sources as (
    select
      target.workspace_id,
      target.id as goal_target_id,
      target.starting_value,
      target.target_value,
      target.direction,
      metric.authoritative_source,
      metric.reconciliation_tolerance_percent,
      case metric.aggregation
        when 'sum' then manual_source.sum_value
        when 'average' then manual_source.average_value
        when 'latest' then manual_source.latest_value
        when 'minimum' then manual_source.minimum_value
        when 'maximum' then manual_source.maximum_value
        when 'count' then manual_source.source_count
      end::numeric(18, 4) as manual_actual_value,
      case metric.aggregation
        when 'sum' then transaction_source.sum_value
        when 'average' then transaction_source.average_value
        when 'latest' then transaction_source.latest_value
        when 'minimum' then transaction_source.minimum_value
        when 'maximum' then transaction_source.maximum_value
        when 'count' then transaction_source.source_count
      end::numeric(18, 4) as transaction_actual_value
    from public.goal_targets target
    join public.metric_definitions metric
      on metric.workspace_id = target.workspace_id
      and metric.id = target.metric_definition_id
    left join lateral (
      select
        sum(measurement.measured_value)::numeric(18, 4) as sum_value,
        avg(measurement.measured_value)::numeric(18, 4) as average_value,
        min(measurement.measured_value)::numeric(18, 4) as minimum_value,
        max(measurement.measured_value)::numeric(18, 4) as maximum_value,
        case when count(measurement.id) = 0 then null
          else count(measurement.id)::numeric(18, 4)
        end as source_count,
        (array_agg(
          measurement.measured_value
          order by measurement.measured_at desc, measurement.created_at desc
        ))[1]::numeric(18, 4) as latest_value
      from public.metric_measurements measurement
      where measurement.workspace_id = target.workspace_id
        and measurement.goal_target_id = target.id
        and (
          target_period_end is null
          or measurement.measured_at < target_period_end + interval '1 day'
        )
        and (
          metric.aggregation = 'latest'
          or target_period_start is null
          or measurement.measured_at >= target_period_start
        )
    ) manual_source on true
    left join lateral (
      select
        sum(contribution.contribution_value)::numeric(18, 4) as sum_value,
        avg(contribution.contribution_value)::numeric(18, 4) as average_value,
        min(contribution.contribution_value)::numeric(18, 4) as minimum_value,
        max(contribution.contribution_value)::numeric(18, 4) as maximum_value,
        case when count(contribution.id) = 0 then null
          else count(contribution.id)::numeric(18, 4)
        end as source_count,
        (array_agg(
          contribution.contribution_value
          order by transaction_record.transaction_date desc,
            transaction_record.created_at desc,
            contribution.created_at desc
        ))[1]::numeric(18, 4) as latest_value
      from public.transaction_goal_target_contributions contribution
      join public.transactions transaction_record
        on transaction_record.workspace_id = contribution.workspace_id
        and transaction_record.id = contribution.transaction_id
      where contribution.workspace_id = target.workspace_id
        and contribution.goal_target_id = target.id
        and (
          target_period_end is null
          or transaction_record.transaction_date <= target_period_end
        )
        and (
          metric.aggregation = 'latest'
          or target_period_start is null
          or transaction_record.transaction_date >= target_period_start
        )
    ) transaction_source on true
    where target.id = target_goal_target_id
  ),
  selected_sources as (
    select
      source.*,
      case source.authoritative_source
        when 'manual' then source.manual_actual_value
        when 'transaction' then source.transaction_actual_value
      end::numeric(18, 4) as actual_value,
      case source.authoritative_source
        when 'manual' then source.transaction_actual_value
        when 'transaction' then source.manual_actual_value
      end::numeric(18, 4) as comparison_value
    from actual_sources source
  ),
  reconciled_sources as (
    select
      source.*,
      (source.actual_value - source.comparison_value)::numeric(18, 4)
        as reconciliation_variance,
      case
        when source.actual_value is null or source.comparison_value is null
          then null
        when source.actual_value = 0 and source.comparison_value = 0
          then 0
        when source.actual_value = 0
          then null
        else (
          abs(source.actual_value - source.comparison_value)
          / abs(source.actual_value)
          * 100
        )::numeric(11, 4)
      end as reconciliation_variance_percent
    from selected_sources source
  )
  select
    source.workspace_id,
    source.goal_target_id,
    source.authoritative_source,
    source.reconciliation_tolerance_percent,
    source.manual_actual_value,
    source.transaction_actual_value,
    source.actual_value,
    source.comparison_value,
    source.reconciliation_variance,
    source.reconciliation_variance_percent,
    case
      when source.actual_value is null
        then 'missing_authoritative'::public.metric_reconciliation_status
      when source.comparison_value is null
        then 'missing_comparison'::public.metric_reconciliation_status
      when source.actual_value = 0 and source.comparison_value = 0
        then 'reconciled'::public.metric_reconciliation_status
      when source.reconciliation_variance_percent is not null
        and source.reconciliation_variance_percent
          <= source.reconciliation_tolerance_percent
        then 'reconciled'::public.metric_reconciliation_status
      else 'attention'::public.metric_reconciliation_status
    end,
    source.target_value,
    (source.actual_value - source.target_value)::numeric(18, 4)
      as target_variance,
    case
      when source.direction = 'maintain'
        or source.actual_value is null
        or source.starting_value is null
        or source.target_value = source.starting_value
        then null
      else (
        (source.actual_value - source.starting_value)
        / (source.target_value - source.starting_value)
        * 100
      )::numeric(11, 4)
    end as progress_percent
  from reconciled_sources source;
$$;

revoke all on function public.calculate_goal_target_actual_reconciliation(
  uuid,
  date,
  date
) from public, anon;
grant execute on function public.calculate_goal_target_actual_reconciliation(
  uuid,
  date,
  date
) to authenticated;

create view public.goal_target_actual_reconciliation
with (security_invoker = true)
as
select reconciliation.*
from public.goal_targets target
cross join lateral public.calculate_goal_target_actual_reconciliation(
  target.id,
  null,
  null
) reconciliation;

revoke all on public.goal_target_actual_reconciliation from public, anon;
grant select on public.goal_target_actual_reconciliation to authenticated;

create or replace function private.populate_business_review_goal_reconciliation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  review_record public.business_reviews%rowtype;
  reconciliation_record record;
begin
  select *
  into review_record
  from public.business_reviews
  where id = new.business_review_id
    and workspace_id = new.workspace_id;

  select *
  into reconciliation_record
  from public.calculate_goal_target_actual_reconciliation(
    new.goal_target_id,
    review_record.period_start,
    review_record.period_end
  );

  if reconciliation_record.goal_target_id is null then
    raise exception 'Goal target reconciliation is unavailable'
      using errcode = '23514';
  end if;

  new.manual_actual_value := reconciliation_record.manual_actual_value;
  new.transaction_actual_value := reconciliation_record.transaction_actual_value;
  new.authoritative_source := reconciliation_record.authoritative_source;
  new.actual_value := reconciliation_record.actual_value;
  new.comparison_value := reconciliation_record.comparison_value;
  new.reconciliation_variance := reconciliation_record.reconciliation_variance;
  new.reconciliation_variance_percent :=
    reconciliation_record.reconciliation_variance_percent;
  new.reconciliation_status := reconciliation_record.reconciliation_status;

  return new;
end;
$$;

revoke all on function private.populate_business_review_goal_reconciliation()
from public, anon, authenticated;

create trigger business_review_goal_snapshots_reconcile
before insert
on public.business_review_goal_target_snapshots
for each row
execute function private.populate_business_review_goal_reconciliation();

comment on column public.metric_definitions.authoritative_source is
  'The hybrid metric source used as the canonical actual; the other source is retained for reconciliation.';
comment on column public.metric_definitions.reconciliation_tolerance_percent is
  'Maximum percentage difference between hybrid sources that is considered reconciled.';
comment on view public.goal_target_actual_reconciliation is
  'Canonical hybrid plan-to-actual result with manual and transaction evidence, variance, reconciliation state, and target progress.';
