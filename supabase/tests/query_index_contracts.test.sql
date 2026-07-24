\set ON_ERROR_STOP on

begin;

do $$
declare
  required_index text;
  redundant_index text;
begin
  foreach required_index in array array[
    'workspace_invitations_pending_expiry_idx',
    'email_deliveries_queued_schedule_idx',
    'action_items_active_assignee_due_idx',
    'calendar_events_upcoming_idx',
    'business_reviews_draft_reviewer_period_idx',
    'notifications_unread_workspace_date_idx'
  ]
  loop
    if to_regclass('public.' || required_index) is null then
      raise exception 'Required query-path index is missing: %', required_index;
    end if;
  end loop;

  foreach redundant_index in array array[
    'market_snapshots_product_date_idx',
    'transaction_category_allocations_transaction_idx',
    'transaction_initiative_allocations_transaction_idx',
    'transaction_goal_target_contributions_transaction_idx'
  ]
  loop
    if to_regclass('public.' || redundant_index) is not null then
      raise exception 'Redundant index still exists: %', redundant_index;
    end if;
  end loop;
end;
$$;

-- Verify that the replacement unique indexes retain the leading-column lookup
-- needed by foreign-key checks and transaction-centric reads.
do $$
declare
  expected record;
begin
  for expected in
    values
      ('market_snapshots', array['product_id', 'observed_on']::text[]),
      (
        'transaction_category_allocations',
        array['transaction_id', 'transaction_category_id']::text[]
      ),
      (
        'transaction_initiative_allocations',
        array['transaction_id', 'business_initiative_id']::text[]
      ),
      (
        'transaction_goal_target_contributions',
        array['transaction_id', 'goal_target_id']::text[]
      )
  loop
    if not exists (
      select 1
      from pg_catalog.pg_constraint constraint_record
      join pg_catalog.pg_class table_record
        on table_record.oid = constraint_record.conrelid
      join pg_catalog.pg_namespace namespace_record
        on namespace_record.oid = table_record.relnamespace
      where namespace_record.nspname = 'public'
        and table_record.relname = expected.column1
        and constraint_record.contype = 'u'
        and (
          select array_agg(attribute_record.attname order by key_record.ordinality)
          from unnest(constraint_record.conkey)
            with ordinality as key_record(attnum, ordinality)
          join pg_catalog.pg_attribute attribute_record
            on attribute_record.attrelid = table_record.oid
            and attribute_record.attnum = key_record.attnum
        ) = expected.column2
    ) then
      raise exception
        'Unique replacement constraint is missing on %.%',
        expected.column1,
        expected.column2;
    end if;
  end loop;
end;
$$;

rollback;
