create type public.business_review_readiness_severity as enum (
  'blocking',
  'warning'
);

create or replace function private.business_review_readiness_issues(
  target_business_review_id uuid
)
returns table (
  severity public.business_review_readiness_severity,
  issue_code text,
  issue_message text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    'blocking'::public.business_review_readiness_severity,
    'evidence_not_captured',
    'Evidence evaluasi belum diperbarui.'
  from public.business_reviews review
  where review.id = target_business_review_id
    and review.snapshot_refreshed_at is null

  union all

  select
    'blocking'::public.business_review_readiness_severity,
    'review_period_in_future',
    'Periode evaluasi belum berakhir.'
  from public.business_reviews review
  where review.id = target_business_review_id
    and review.period_end > current_date

  union all

  select
    'warning'::public.business_review_readiness_severity,
    'missing_goal_targets',
    'Rencana belum memiliki target metrik yang dapat dievaluasi.'
  from public.business_reviews review
  where review.id = target_business_review_id
    and not exists (
      select 1
      from public.business_goals goal
      join public.goal_targets target
        on target.workspace_id = goal.workspace_id
        and target.business_goal_id = goal.id
      where goal.workspace_id = review.workspace_id
        and goal.business_plan_id = review.business_plan_id
    )

  union all

  select
    'blocking'::public.business_review_readiness_severity,
    'missing_authoritative_actual',
    'Satu atau lebih target belum memiliki actual dari sumber authoritative.'
  from public.business_review_goal_target_snapshots snapshot
  where snapshot.business_review_id = target_business_review_id
    and snapshot.reconciliation_status = 'missing_authoritative'
  having count(*) > 0

  union all

  select
    'warning'::public.business_review_readiness_severity,
    'missing_comparison_actual',
    'Satu atau lebih target belum memiliki sumber pembanding.'
  from public.business_review_goal_target_snapshots snapshot
  where snapshot.business_review_id = target_business_review_id
    and snapshot.reconciliation_status = 'missing_comparison'
  having count(*) > 0

  union all

  select
    'warning'::public.business_review_readiness_severity,
    'metric_reconciliation_attention',
    'Selisih sumber hybrid pada satu atau lebih target melewati toleransi.'
  from public.business_review_goal_target_snapshots snapshot
  where snapshot.business_review_id = target_business_review_id
    and snapshot.reconciliation_status = 'attention'
  having count(*) > 0

  union all

  select
    'warning'::public.business_review_readiness_severity,
    'unfinished_action_items',
    'Masih ada action item yang belum selesai pada akhir periode evaluasi.'
  from public.business_review_action_item_snapshots snapshot
  where snapshot.business_review_id = target_business_review_id
    and (
      snapshot.todo_count
      + snapshot.in_progress_count
      + snapshot.blocked_count
    ) > 0

  union all

  select
    'warning'::public.business_review_readiness_severity,
    'missing_next_steps',
    'Tindak lanjut evaluasi belum dijelaskan.'
  from public.business_reviews review
  where review.id = target_business_review_id
    and nullif(trim(review.next_steps), '') is null;
$$;

revoke all on function private.business_review_readiness_issues(uuid)
from public, anon, authenticated;

create or replace function public.get_business_review_readiness(
  target_business_review_id uuid
)
returns table (
  severity public.business_review_readiness_severity,
  issue_code text,
  issue_message text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  review_record public.business_reviews%rowtype;
begin
  select *
  into review_record
  from public.business_reviews
  where id = target_business_review_id;

  if review_record.id is null then
    raise exception 'Business review not found' using errcode = 'P0002';
  end if;

  if actor_id is null
    or not private.can_read_business_review(review_record.id)
  then
    raise exception 'Not authorized to inspect this business review'
      using errcode = '42501';
  end if;

  return query
  select issue.severity, issue.issue_code, issue.issue_message
  from private.business_review_readiness_issues(review_record.id) issue
  order by issue.severity, issue.issue_code;
end;
$$;

revoke all on function public.get_business_review_readiness(uuid)
from public, anon;
grant execute on function public.get_business_review_readiness(uuid)
to authenticated;

drop function public.finalize_business_review(uuid);

create or replace function public.finalize_business_review(
  target_business_review_id uuid,
  acknowledge_warnings boolean default true
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  review_record public.business_reviews%rowtype;
  blocking_issue_codes text[];
  warning_issue_codes text[];
begin
  select *
  into review_record
  from public.business_reviews
  where id = target_business_review_id
  for update;

  if review_record.id is null then
    raise exception 'Business review not found' using errcode = 'P0002';
  end if;

  if actor_id is null
    or not private.can_read_business_review(review_record.id)
    or not private.has_workspace_permission(
      review_record.workspace_id,
      'review.finalize'
    )
  then
    raise exception 'Not authorized to finalize this business review'
      using errcode = '42501';
  end if;

  if review_record.status = 'finalized' then
    return;
  end if;

  if review_record.status <> 'draft' then
    raise exception 'Only a draft business review can be finalized'
      using errcode = '23514';
  end if;

  perform private.refresh_business_review_snapshots(
    target_business_review_id,
    actor_id
  );

  select
    array_agg(issue.issue_code order by issue.issue_code)
      filter (where issue.severity = 'blocking'),
    array_agg(issue.issue_code order by issue.issue_code)
      filter (where issue.severity = 'warning')
  into blocking_issue_codes, warning_issue_codes
  from private.business_review_readiness_issues(
    target_business_review_id
  ) issue;

  if coalesce(cardinality(blocking_issue_codes), 0) > 0 then
    raise exception 'Business review has blocking readiness issues: %',
      array_to_string(blocking_issue_codes, ', ')
      using errcode = '23514';
  end if;

  if coalesce(cardinality(warning_issue_codes), 0) > 0
    and not acknowledge_warnings
  then
    raise exception 'Business review warnings require acknowledgement: %',
      array_to_string(warning_issue_codes, ', ')
      using errcode = 'P0001';
  end if;

  update public.business_reviews
  set
    status = 'finalized',
    finalized_at = now()
  where id = target_business_review_id;

  perform private.evaluate_business_review_achievements(
    target_business_review_id
  );
end;
$$;

revoke all on function public.finalize_business_review(uuid, boolean)
from public, anon;
grant execute on function public.finalize_business_review(uuid, boolean)
to authenticated;

comment on function public.get_business_review_readiness(uuid) is
  'Returns structured blockers and warnings from the latest captured review evidence.';
comment on function public.finalize_business_review(uuid, boolean) is
  'Refreshes evidence atomically, rejects blockers, supports explicit warning acknowledgement, and finalizes idempotently. The true default preserves the original one-argument RPC contract.';
