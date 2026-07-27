\set ON_ERROR_STOP on

begin;

select plan(1);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@siapin.local"}',
  true
);

do $$
declare
  target_transaction_id uuid;
  target_workspace_id uuid;
  sensitive_note text := 'AUDIT_SECRET_VALUE_4cfa27';
  evidence public.audit_logs%rowtype;
  mutation_blocked boolean := false;
begin
  select transaction_record.id, transaction_record.workspace_id
  into target_transaction_id, target_workspace_id
  from public.transactions transaction_record
  join public.workspaces workspace
    on workspace.id = transaction_record.workspace_id
  where workspace.slug = 'kedai-siapin-demo'
  order by transaction_record.created_at
  limit 1;

  update public.transactions
  set note = sensitive_note
  where id = target_transaction_id;

  select *
  into evidence
  from public.audit_logs
  where workspace_id = target_workspace_id
    and actor_id = 'a1000000-0000-0000-0000-000000000001'
    and action = 'update'
    and entity_type = 'transaction'
    and entity_id = target_transaction_id
  order by created_at desc, id desc
  limit 1;

  if evidence.id is null then
    raise exception 'Transaction update did not create attributable audit evidence';
  end if;

  if not (evidence.metadata -> 'changed_fields') ? 'note' then
    raise exception 'Audit evidence omitted the changed field name';
  end if;

  if evidence.metadata::text like '%' || sensitive_note || '%' then
    raise exception 'Audit evidence copied a sensitive business value';
  end if;

  if not evidence.metadata ? 'transaction_id'
    or jsonb_typeof(evidence.metadata -> 'transaction_id') <> 'number' then
    raise exception 'Audit evidence omitted its transaction correlation';
  end if;

  if exists (
    select 1
    from public.audit_logs
    where entity_type in ('workspace_invitation', 'email_delivery')
      and (
        metadata::text ilike '%token_hash%'
        or metadata::text ilike '%recipient_email%'
        or metadata::text ilike '%last_error%'
        or metadata::text ilike '%provider_message_id%'
      )
  ) then
    raise exception 'Audit metadata contains invitation or delivery secrets';
  end if;

  begin
    update public.audit_logs
    set metadata = '{"source":"forged"}'::jsonb
    where id = evidence.id;
  exception
    when insufficient_privilege then mutation_blocked := true;
  end;

  if not mutation_blocked then
    raise exception 'Authenticated user mutated audit evidence';
  end if;
end;
$$;

reset role;

do $$
begin
  if exists (
    select 1
    from public.audit_logs
    where jsonb_typeof(metadata) <> 'object'
      or octet_length(metadata::text) > 4096
  ) then
    raise exception 'Audit metadata violated its structural boundary';
  end if;
end;
$$;

select pass('audit evidence attribution, minimization, and immutability contracts passed');
select * from finish();

rollback;
