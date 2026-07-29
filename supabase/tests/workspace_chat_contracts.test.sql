\set ON_ERROR_STOP on

begin;

select plan(1);

select set_config('test.chat_workspace_id', id::text, true)
from public.workspaces
where slug = 'kedai-siapin-demo';

select set_config('test.other_workspace_id', id::text, true)
from public.workspaces
where slug = 'studio-siapin-demo';

do $$
begin
  if (
    select count(*)
    from public.chat_conversations conversation
    where conversation.workspace_id = current_setting('test.chat_workspace_id')::uuid
      and conversation.is_general
      and conversation.kind = 'channel'
      and conversation.channel_visibility = 'public'
      and conversation.slug = 'general'
  ) <> 1 then
    raise exception 'Workspace does not have exactly one canonical General channel';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000002","role":"authenticated","email":"manager@siapin.local"}',
  true
);

select set_config(
  'test.private_channel_id',
  public.create_chat_channel(
    current_setting('test.chat_workspace_id')::uuid,
    'Leadership',
    'leadership',
    'private',
    'Private management coordination.'
  )::text,
  true
);

select set_config(
  'test.manager_message_id',
  public.send_chat_message(
    current_setting('test.private_channel_id')::uuid,
    'Private coordination message',
    'ca000000-0000-0000-0000-000000000001',
    null
  )::text,
  true
);

select public.set_chat_conversation_membership(
  current_setting('test.private_channel_id')::uuid,
  'a1000000-0000-0000-0000-000000000003',
  true
);

reset role;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000003","role":"authenticated","email":"staff@siapin.local"}',
  true
);

do $$
declare
  first_message_id uuid;
  retried_message_id uuid;
  payload_reuse_blocked boolean := false;
  cross_workspace_blocked boolean := false;
begin
  if not private.can_access_chat_conversation(
    current_setting('test.private_channel_id')::uuid
  ) then
    raise exception 'Explicit private channel member could not access the channel';
  end if;

  first_message_id := public.send_chat_message(
    current_setting('test.private_channel_id')::uuid,
    'Idempotent staff message',
    'ca000000-0000-0000-0000-000000000002',
    current_setting('test.manager_message_id')::uuid
  );
  retried_message_id := public.send_chat_message(
    current_setting('test.private_channel_id')::uuid,
    'Idempotent staff message',
    'ca000000-0000-0000-0000-000000000002',
    current_setting('test.manager_message_id')::uuid
  );

  if first_message_id <> retried_message_id then
    raise exception 'Chat retry created a duplicate message';
  end if;

  begin
    perform public.send_chat_message(
      current_setting('test.private_channel_id')::uuid,
      'Different payload',
      'ca000000-0000-0000-0000-000000000002',
      null
    );
  exception
    when invalid_parameter_value then payload_reuse_blocked := true;
  end;

  begin
    perform public.start_direct_chat(
      current_setting('test.other_workspace_id')::uuid,
      'a1000000-0000-0000-0000-000000000001'
    );
  exception
    when insufficient_privilege then cross_workspace_blocked := true;
  end;

  if not payload_reuse_blocked or not cross_workspace_blocked then
    raise exception 'Chat idempotency or workspace isolation was bypassed';
  end if;
end;
$$;

select set_config(
  'test.direct_conversation_id',
  public.start_direct_chat(
    current_setting('test.chat_workspace_id')::uuid,
    'a1000000-0000-0000-0000-000000000002'
  )::text,
  true
);

reset role;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000002","role":"authenticated","email":"manager@siapin.local"}',
  true
);
select public.delete_chat_message(
  current_setting('test.manager_message_id')::uuid
);
reset role;

do $$
declare
  message_body text;
  audit_metadata jsonb;
begin
  if (
    select count(*)
    from public.chat_conversation_members member
    where member.conversation_id = current_setting('test.direct_conversation_id')::uuid
  ) <> 2 then
    raise exception 'Direct conversation did not preserve exactly two workspace participants';
  end if;

  if exists (
    select 1
    from information_schema.role_table_grants grant_record
    where grant_record.grantee = 'authenticated'
      and grant_record.table_schema = 'public'
      and grant_record.table_name like 'chat_%'
      and grant_record.privilege_type <> 'SELECT'
  ) then
    raise exception 'Authenticated role can mutate chat tables outside RPC boundaries';
  end if;

  if (
    select count(*)
    from pg_catalog.pg_policies policy
    where policy.schemaname = 'realtime'
      and policy.tablename = 'messages'
      and policy.policyname in (
        'workspace_chat_realtime_receive',
        'workspace_chat_realtime_send'
      )
  ) <> 2 then
    raise exception 'Private chat Realtime authorization policies are incomplete';
  end if;

  if has_function_privilege(
    'anon',
    'public.send_chat_message(uuid,text,uuid,uuid,uuid[])',
    'EXECUTE'
  ) then
    raise exception 'Anonymous role can execute the chat message boundary';
  end if;

  select body into message_body
  from public.chat_messages
  where id = current_setting('test.manager_message_id')::uuid;

  select metadata into audit_metadata
  from public.audit_logs
  where entity_type = 'chat_message'
    and entity_id = current_setting('test.manager_message_id')::uuid
    and action = 'delete'
  order by created_at desc
  limit 1;

  if message_body is not null
    or audit_metadata is null
    or audit_metadata::text like '%Private coordination message%' then
    raise exception 'Deleted chat content or privacy-safe audit evidence is invalid';
  end if;
end;
$$;

update public.workspace_members
set status = 'suspended'
where workspace_id = current_setting('test.chat_workspace_id')::uuid
  and user_id = 'a1000000-0000-0000-0000-000000000003';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000003","role":"authenticated","email":"staff@siapin.local"}',
  true
);

do $$
begin
  if private.can_access_chat_conversation(
    current_setting('test.private_channel_id')::uuid
  ) then
    raise exception 'Suspended member retained chat or Realtime access';
  end if;
end;
$$;

reset role;

select pass('workspace chat is private, permission-bound, idempotent, moderated, and audit-minimal');
select * from finish();

rollback;
