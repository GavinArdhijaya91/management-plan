update public.market_source_sync_runs
set
  sync_outcome = 'failed',
  completed_at = now(),
  error_code = 'INGESTION_STALE_RUN_RECOVERED'
where sync_outcome = 'running'
  and started_at < now() - interval '30 minutes';

create unique index market_source_sync_runs_one_running_idx
on public.market_source_sync_runs (binding_id)
where sync_outcome = 'running';

comment on index public.market_source_sync_runs_one_running_idx is
  'Prevents concurrent scheduler or manual-retry jobs from ingesting one binding twice.';
