create or replace function private.lock_archived_plan_hierarchy()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent_plan_status public.business_plan_status;
  initiative_id uuid;
  plan_id uuid;
begin
  if tg_table_name = 'business_goals' then
    plan_id := case when tg_op = 'DELETE' then old.business_plan_id else new.business_plan_id end;
  elsif tg_table_name = 'business_initiatives' then
    plan_id := case when tg_op = 'DELETE' then old.business_plan_id else new.business_plan_id end;
  elsif tg_table_name = 'action_items' then
    initiative_id := case
      when tg_op = 'DELETE' then old.business_initiative_id
      else new.business_initiative_id
    end;

    select initiative.business_plan_id into plan_id
    from public.business_initiatives initiative
    where initiative.id = initiative_id;
  end if;

  select plan.status into parent_plan_status
  from public.business_plans plan
  where plan.id = plan_id;

  if parent_plan_status = 'archived' then
    raise exception 'Restore the archived business plan before modifying its hierarchy'
      using errcode = '23514';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.lock_archived_plan_hierarchy()
from public, anon, authenticated;

create trigger business_goals_lock_archived_plan
before insert or update or delete on public.business_goals
for each row execute function private.lock_archived_plan_hierarchy();
create trigger business_initiatives_lock_archived_plan
before insert or update or delete on public.business_initiatives
for each row execute function private.lock_archived_plan_hierarchy();
create trigger action_items_lock_archived_plan
before insert or update or delete on public.action_items
for each row execute function private.lock_archived_plan_hierarchy();

comment on function private.lock_archived_plan_hierarchy() is
  'Freezes the complete goal, initiative, and action hierarchy while its plan is archived.';
