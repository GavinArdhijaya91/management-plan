create function private.preserve_archived_planning_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.archived_at is not null then
    raise exception 'Restore the archived planning record before deleting it'
      using errcode = '23514';
  end if;

  return old;
end;
$$;

revoke all on function private.preserve_archived_planning_evidence()
from public, anon, authenticated;

create trigger business_plans_preserve_archived_evidence
before delete on public.business_plans
for each row execute function private.preserve_archived_planning_evidence();

create trigger business_goals_preserve_archived_evidence
before delete on public.business_goals
for each row execute function private.preserve_archived_planning_evidence();

create trigger business_initiatives_preserve_archived_evidence
before delete on public.business_initiatives
for each row execute function private.preserve_archived_planning_evidence();

create trigger action_items_preserve_archived_evidence
before delete on public.action_items
for each row execute function private.preserve_archived_planning_evidence();

comment on function private.preserve_archived_planning_evidence() is
  'Prevents permanent deletion of archived plan, goal, initiative, and action evidence until an authorized restore.';
