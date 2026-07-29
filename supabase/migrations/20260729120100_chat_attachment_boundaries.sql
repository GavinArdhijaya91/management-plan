insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'chat-attachments',
  'chat-attachments',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table public.chat_attachments (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  conversation_id uuid not null,
  message_id uuid not null,
  uploaded_by uuid not null,
  object_path text not null unique,
  original_file_name text not null,
  media_type text not null,
  byte_size bigint not null,
  created_at timestamptz not null default now(),
  foreign key (workspace_id, conversation_id, message_id)
    references public.chat_messages(workspace_id, conversation_id, id) on delete cascade,
  foreign key (uploaded_by)
    references auth.users(id) on delete restrict,
  constraint chat_attachment_path_check check (
    char_length(object_path) between 110 and 500
    and split_part(object_path, '/', 1) = workspace_id::text
    and split_part(object_path, '/', 2) = conversation_id::text
    and split_part(object_path, '/', 3) = uploaded_by::text
    and object_path not like '%..%'
  ),
  constraint chat_attachment_name_check check (
    char_length(trim(original_file_name)) between 1 and 255
    and original_file_name not like '%/%'
    and original_file_name not like '%\%'
  ),
  constraint chat_attachment_media_type_check check (
    media_type = any(array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ])
  ),
  constraint chat_attachment_size_check check (
    byte_size between 1 and 10485760
  )
);

create index chat_attachments_message_idx
  on public.chat_attachments (message_id, created_at);

create or replace function private.can_access_chat_attachment_path(
  object_name text,
  require_write boolean default false
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  path_parts text[] := storage.foldername(object_name);
  target_workspace_id uuid;
  target_conversation_id uuid;
begin
  if cardinality(path_parts) <> 3
    or object_name like '%..%' then
    return false;
  end if;

  begin
    target_workspace_id := path_parts[1]::uuid;
    target_conversation_id := path_parts[2]::uuid;
  exception
    when invalid_text_representation then return false;
  end;

  return private.can_access_chat_conversation(target_conversation_id)
    and exists (
      select 1
      from public.chat_conversations conversation
      where conversation.id = target_conversation_id
        and conversation.workspace_id = target_workspace_id
    )
    and case
      when require_write then
        private.has_workspace_permission(target_workspace_id, 'chat.write')
      else exists (
        select 1
        from public.chat_attachments attachment
        join public.chat_messages message
          on message.id = attachment.message_id
          and message.workspace_id = attachment.workspace_id
        where attachment.object_path = object_name
          and message.deleted_at is null
      )
    end;
end;
$$;

revoke all on function private.can_access_chat_attachment_path(text, boolean)
from public, anon;
grant execute on function private.can_access_chat_attachment_path(text, boolean)
to authenticated;

create or replace function public.register_chat_attachment(
  target_message_id uuid,
  target_object_path text,
  target_original_file_name text,
  target_media_type text,
  target_byte_size bigint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_message public.chat_messages%rowtype;
  created_attachment_id uuid;
begin
  select * into target_message
  from public.chat_messages
  where id = target_message_id
    and sender_id = actor_id
    and deleted_at is null;

  if target_message.id is null
    or not private.can_access_chat_conversation(target_message.conversation_id)
    or not private.has_workspace_permission(target_message.workspace_id, 'chat.write') then
    raise exception 'Attachable chat message not found' using errcode = '42501';
  end if;

  if split_part(target_object_path, '/', 1) <> target_message.workspace_id::text
    or split_part(target_object_path, '/', 2) <> target_message.conversation_id::text
    or split_part(target_object_path, '/', 3) <> actor_id::text then
    raise exception 'Chat attachment path does not match its message'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from storage.objects object
    where object.bucket_id = 'chat-attachments'
      and object.name = target_object_path
      and object.owner_id = actor_id::text
      and coalesce((object.metadata ->> 'size')::bigint, 0) = target_byte_size
      and object.metadata ->> 'mimetype' = target_media_type
  ) then
    raise exception 'Chat attachment object is unavailable'
      using errcode = '23503';
  end if;

  insert into public.chat_attachments (
    workspace_id,
    conversation_id,
    message_id,
    uploaded_by,
    object_path,
    original_file_name,
    media_type,
    byte_size
  )
  values (
    target_message.workspace_id,
    target_message.conversation_id,
    target_message.id,
    actor_id,
    target_object_path,
    trim(target_original_file_name),
    target_media_type,
    target_byte_size
  )
  returning id into created_attachment_id;

  return created_attachment_id;
end;
$$;

revoke all on function public.register_chat_attachment(uuid, text, text, text, bigint)
from public, anon, authenticated;
grant execute on function public.register_chat_attachment(uuid, text, text, text, bigint)
to authenticated;

alter table public.chat_attachments enable row level security;

create policy "chat_attachments_select_accessible"
on public.chat_attachments for select to authenticated
using (private.can_access_chat_conversation(conversation_id));

revoke all on public.chat_attachments from anon, authenticated;
grant select on public.chat_attachments to authenticated;

create policy "chat_attachment_objects_select_accessible"
on storage.objects for select to authenticated
using (
  bucket_id = 'chat-attachments'
  and private.can_access_chat_attachment_path(name, false)
);

create policy "chat_attachment_objects_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'chat-attachments'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[3] = (select auth.uid())::text
  and private.can_access_chat_attachment_path(name, true)
);

create policy "chat_attachment_objects_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'chat-attachments'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[3] = (select auth.uid())::text
  and private.can_access_chat_attachment_path(name, true)
  and not exists (
    select 1
    from public.chat_attachments attachment
    where attachment.object_path = name
  )
);

create or replace function private.delete_chat_attachment_object()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from storage.objects object
  where object.bucket_id = 'chat-attachments'
    and object.name = old.object_path;
  return old;
end;
$$;

revoke all on function private.delete_chat_attachment_object()
from public, anon, authenticated;

create trigger chat_attachments_delete_storage_object
after delete on public.chat_attachments
for each row execute function private.delete_chat_attachment_object();
