\set ON_ERROR_STOP on

begin;

select plan(1);

do $$
declare
  required_table text;
  required_index text;
begin
  foreach required_table in array array[
    'market_data_categories',
    'market_sources',
    'market_source_categories',
    'market_product_source_bindings',
    'market_observations',
    'market_source_documents',
    'market_source_sync_runs'
  ]
  loop
    if to_regclass('public.' || required_table) is null then
      raise exception 'Required factual-market table is missing: %', required_table;
    end if;

    if not exists (
      select 1
      from pg_catalog.pg_class relation
      join pg_catalog.pg_namespace namespace_record
        on namespace_record.oid = relation.relnamespace
      where namespace_record.nspname = 'public'
        and relation.relname = required_table
        and relation.relrowsecurity
    ) then
      raise exception 'Factual-market table lacks RLS: %', required_table;
    end if;
  end loop;

  foreach required_index in array array[
    'market_product_source_bindings_active_idx',
    'market_observations_product_time_idx',
    'market_observations_binding_time_idx',
    'market_source_documents_product_time_idx',
    'market_source_sync_runs_binding_time_idx'
  ]
  loop
    if to_regclass('public.' || required_index) is null then
      raise exception 'Required factual-market query index is missing: %', required_index;
    end if;
  end loop;

  if not has_table_privilege('authenticated', 'public.market_observations', 'select')
    or not has_table_privilege('authenticated', 'public.market_source_documents', 'select')
    or not has_table_privilege('authenticated', 'public.market_source_sync_runs', 'select')
  then
    raise exception 'Authenticated members lack RLS-gated factual-market reads';
  end if;

  if has_table_privilege('authenticated', 'public.market_observations', 'insert, update, delete')
    or has_table_privilege('authenticated', 'public.market_source_documents', 'insert, update, delete')
    or has_table_privilege('authenticated', 'public.market_source_sync_runs', 'insert, update, delete')
  then
    raise exception 'Browser roles can forge external market evidence or sync state';
  end if;

  if has_table_privilege('authenticated', 'public.market_sources', 'insert, update, delete')
    or has_table_privilege('authenticated', 'public.market_data_categories', 'insert, update, delete')
  then
    raise exception 'Browser roles can mutate controlled factual-market catalogs';
  end if;

  if not exists (
    select 1
    from public.market_data_categories
    where code = 'official_statistics'
  ) or not exists (
    select 1
    from public.market_data_categories
    where code = 'market_news'
  ) then
    raise exception 'Required factual-market categories are missing';
  end if;

  if exists (
    select 1
    from public.market_sources
    where lower(code) like '%grok%'
      or lower(name) like '%grok%'
  ) then
    raise exception 'An AI model was registered as a factual market source';
  end if;
end;
$$;

select pass('factual market data contracts passed');
select * from finish();

rollback;
