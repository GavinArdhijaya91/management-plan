create or replace function private.can_access_chat_realtime_topic(
  target_topic text,
  require_write boolean default false
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_conversation_id uuid;
  target_workspace_id uuid;
begin
  if split_part(target_topic, ':', 1) = 'workspace'
    and split_part(target_topic, ':', 3) = '' then
    begin
      target_workspace_id := split_part(target_topic, ':', 2)::uuid;
    exception
      when invalid_text_representation then return false;
    end;

    return private.has_workspace_permission(
      target_workspace_id,
      case when require_write then 'chat.write' else 'chat.read' end
    );
  end if;

  if split_part(target_topic, ':', 1) <> 'chat'
    or split_part(target_topic, ':', 3) <> '' then
    return false;
  end if;

  begin
    target_conversation_id := split_part(target_topic, ':', 2)::uuid;
  exception
    when invalid_text_representation then return false;
  end;

  if not private.can_access_chat_conversation(target_conversation_id) then
    return false;
  end if;

  if not require_write then
    return true;
  end if;

  select conversation.workspace_id
  into target_workspace_id
  from public.chat_conversations conversation
  where conversation.id = target_conversation_id;

  return private.has_workspace_permission(target_workspace_id, 'chat.write');
end;
$$;

revoke all on function private.can_access_chat_realtime_topic(text, boolean)
from public, anon;
grant execute on function private.can_access_chat_realtime_topic(text, boolean)
to authenticated;

create policy "workspace_chat_realtime_receive"
on realtime.messages for select to authenticated
using (
  realtime.messages.extension in ('broadcast', 'presence')
  and private.can_access_chat_realtime_topic(
    (select realtime.topic()),
    false
  )
);

create policy "workspace_chat_realtime_send"
on realtime.messages for insert to authenticated
with check (
  realtime.messages.extension in ('broadcast', 'presence')
  and private.can_access_chat_realtime_topic(
    (select realtime.topic()),
    true
  )
);
