create or replace function private.validate_planning_insert_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'business_plans' then
    if new.status::text <> 'draft'
      or new.status_reason is not null
      or new.archived_at is not null
      or new.archived_by is not null then
      raise exception 'A business plan must be created as an unarchived draft'
        using errcode = '23514';
    end if;
  elsif tg_table_name = 'business_goals' then
    if new.status::text <> 'draft'
      or new.status_reason is not null
      or new.archived_at is not null
      or new.archived_by is not null then
      raise exception 'A business goal must be created as an unarchived draft'
        using errcode = '23514';
    end if;
  elsif tg_table_name = 'business_initiatives' then
    if new.status::text <> 'planned'
      or new.status_reason is not null
      or new.archived_at is not null
      or new.archived_by is not null then
      raise exception 'A business initiative must be created as unarchived and planned'
        using errcode = '23514';
    end if;
  elsif tg_table_name = 'action_items' then
    if new.status::text <> 'todo'
      or new.blocked_reason is not null
      or new.blocked_at is not null
      or new.completed_at is not null
      or new.reopened_at is not null
      or new.reopened_by is not null
      or new.status_reason is not null
      or new.archived_at is not null
      or new.archived_by is not null then
      raise exception 'An action item must be created as an unarchived todo'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.validate_planning_insert_state()
from public, anon, authenticated;

comment on function private.validate_planning_insert_state() is
  'Validates each Planning insert against its table-specific initial lifecycle state.';
