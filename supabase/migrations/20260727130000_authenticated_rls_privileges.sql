grant usage on schema public to authenticated;

do $$
declare
  policy_table record;
  granted_operations text;
begin
  for policy_table in
    select
      schemaname,
      tablename,
      string_agg(distinct lower(cmd), ', ' order by lower(cmd)) as policy_commands
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and (
        'authenticated' = any(roles)
        or 'public' = any(roles)
      )
    group by schemaname, tablename
  loop
    select string_agg(operation_name, ', ' order by operation_name)
    into granted_operations
    from (
      select distinct operation_name
      from unnest(
        case
          when position('all' in policy_table.policy_commands) > 0 then
            array['select', 'insert', 'update', 'delete']
          else string_to_array(policy_table.policy_commands, ', ')
        end
      ) as operation_name
    ) operations;

    if granted_operations is not null then
      execute format(
        'grant %s on table %I.%I to authenticated',
        granted_operations,
        policy_table.schemaname,
        policy_table.tablename
      );
    end if;
  end loop;
end;
$$;

-- Lifecycle and immutable-evidence columns remain RPC-only even though their
-- tables expose other RLS-protected updates.
revoke update on public.business_plans from authenticated;
grant update (
  title,
  description,
  starts_on,
  ends_on,
  owner_id,
  visibility
) on public.business_plans to authenticated;

revoke update on public.business_goals from authenticated;
grant update (
  title,
  description,
  target_date,
  owner_id
) on public.business_goals to authenticated;

revoke update on public.business_initiatives from authenticated;
grant update (
  business_goal_id,
  title,
  description,
  starts_on,
  ends_on,
  budget_amount,
  owner_id,
  unlinked_goal_context
) on public.business_initiatives to authenticated;

revoke update on public.action_items from authenticated;
grant update (
  title,
  description,
  priority,
  assignee_id,
  starts_on,
  due_on
) on public.action_items to authenticated;

revoke update on public.business_reviews from authenticated;
grant update (
  business_plan_id,
  period_type,
  period_start,
  period_end,
  summary,
  wins,
  challenges,
  next_steps,
  updated_at
) on public.business_reviews to authenticated;

revoke insert, update, delete
on public.business_review_goal_target_snapshots
from authenticated;
revoke insert, update, delete
on public.business_review_financial_snapshots
from authenticated;
revoke insert, update, delete
on public.business_review_action_item_snapshots
from authenticated;

revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;
