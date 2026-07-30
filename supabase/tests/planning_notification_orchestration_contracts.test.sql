\set ON_ERROR_STOP on

begin;

select plan(1);

select set_config('test.notification_workspace_id', id::text, true)
from public.workspaces
where slug = 'kedai-siapin-demo';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@siapin.local"}',
  true
);

do $$
declare
  action_id uuid;
  first_count integer;
  retry_count integer;
begin
  select action.id
  into action_id
  from public.action_items action
  where action.workspace_id =
      current_setting('test.notification_workspace_id')::uuid
    and action.assignee_id = 'a1000000-0000-0000-0000-000000000001'
  order by action.created_at
  limit 1;

  update public.action_items
  set due_on = current_date - 2
  where id = action_id;

  first_count := public.orchestrate_my_workspace_notifications(
    current_setting('test.notification_workspace_id')::uuid,
    now()
  );
  retry_count := public.orchestrate_my_workspace_notifications(
    current_setting('test.notification_workspace_id')::uuid,
    now()
  );

  if first_count < 1 or retry_count <> 0 then
    raise exception 'Overdue notification orchestration is not idempotent';
  end if;

  if not exists (
    select 1
    from public.notifications notification
    where notification.user_id =
        'a1000000-0000-0000-0000-000000000001'
      and notification.source_entity_id = action_id
      and notification.event_code = 'action_item_overdue'
      and notification.href = '/planning'
  ) then
    raise exception 'Overdue action notification has incorrect evidence or destination';
  end if;
end;
$$;

reset role;

select pass(
  'Planning notifications are preference-aware, idempotent, and route to canonical workflow pages'
);

select * from finish();

rollback;
