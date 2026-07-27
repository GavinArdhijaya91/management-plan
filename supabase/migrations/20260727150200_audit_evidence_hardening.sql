alter table public.audit_logs
  add constraint audit_logs_action_check
    check (action in ('insert', 'update', 'delete')),
  add constraint audit_logs_entity_type_check
    check (entity_type ~ '^[a-z][a-z0-9_]{1,62}$'),
  add constraint audit_logs_metadata_object_check
    check (
      jsonb_typeof(metadata) = 'object'
      and octet_length(metadata::text) <= 4096
    );

create index audit_logs_workspace_entity_date_idx
  on public.audit_logs (
    workspace_id,
    entity_type,
    entity_id,
    created_at desc
  );

create or replace function private.write_workspace_audit_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  record_data jsonb;
  previous_data jsonb;
  current_data jsonb;
  changed_fields jsonb := '[]'::jsonb;
  target_workspace_id uuid;
  target_entity_id uuid;
  target_user_id uuid;
begin
  previous_data := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end;
  current_data := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end;
  record_data := coalesce(current_data, previous_data);

  target_workspace_id := nullif(record_data ->> 'workspace_id', '')::uuid;
  target_entity_id := nullif(record_data ->> 'id', '')::uuid;
  target_user_id := nullif(record_data ->> 'user_id', '')::uuid;

  if tg_op = 'UPDATE' then
    select coalesce(jsonb_agg(field_name order by field_name), '[]'::jsonb)
    into changed_fields
    from jsonb_object_keys(current_data) field_name
    where (previous_data -> field_name) is distinct from (current_data -> field_name);
  end if;

  insert into public.audit_logs (
    workspace_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    target_workspace_id,
    (select auth.uid()),
    lower(tg_op),
    tg_argv[0],
    coalesce(target_entity_id, target_user_id),
    jsonb_build_object(
      'source',
      'database_trigger',
      'changed_fields',
      changed_fields,
      'transaction_id',
      txid_current()
    )
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.write_workspace_audit_log()
from public, anon, authenticated;

comment on column public.audit_logs.metadata is
  'Bounded structural evidence only. Business values, credentials, tokens, recipients, and error payloads are forbidden.';
