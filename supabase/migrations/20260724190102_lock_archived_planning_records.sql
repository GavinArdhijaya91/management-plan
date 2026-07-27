create or replace function private.lock_archived_planning_record()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.archived_at is not null and new.archived_at is not null then
    raise exception 'Restore an archived planning record before modifying it'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.lock_archived_planning_record()
from public, anon, authenticated;

create trigger business_plans_lock_archived_record
before update on public.business_plans
for each row execute function private.lock_archived_planning_record();
create trigger business_goals_lock_archived_record
before update on public.business_goals
for each row execute function private.lock_archived_planning_record();
create trigger business_initiatives_lock_archived_record
before update on public.business_initiatives
for each row execute function private.lock_archived_planning_record();
create trigger action_items_lock_archived_record
before update on public.action_items
for each row execute function private.lock_archived_planning_record();

comment on function private.lock_archived_planning_record() is
  'Makes archived planning records read-only until an archive RPC restores them.';
