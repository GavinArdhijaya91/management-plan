create type public.chat_conversation_kind as enum ('channel', 'direct');
create type public.chat_channel_visibility as enum ('public', 'private');

insert into public.permission_definitions (code, resource, action, description)
values
  ('chat.read', 'chat', 'read', 'Read accessible workspace conversations and messages.'),
  ('chat.write', 'chat', 'write', 'Send and manage own messages in accessible workspace conversations.'),
  ('chat.manage', 'chat', 'manage', 'Create channels and manage channel membership and settings.'),
  ('chat.moderate', 'chat', 'moderate', 'Remove messages and moderate workspace conversations.')
on conflict (code) do nothing;

insert into public.workspace_role_permissions (
  workspace_id,
  workspace_role_id,
  permission_code,
  granted_by
)
select
  role_record.workspace_id,
  role_record.id,
  permission.code,
  role_record.created_by
from public.workspace_roles role_record
cross join public.permission_definitions permission
where role_record.is_system
  and permission.code = any(
  case role_record.base_role
    when 'owner' then array['chat.read', 'chat.write', 'chat.manage', 'chat.moderate']
    when 'manager' then array['chat.read', 'chat.write', 'chat.manage', 'chat.moderate']
    when 'member' then array['chat.read', 'chat.write']
    when 'viewer' then array['chat.read', 'chat.write']
  end
)
on conflict do nothing;

create or replace function private.grant_default_chat_permissions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not new.is_system then
    return new;
  end if;

  insert into public.workspace_role_permissions (
    workspace_id,
    workspace_role_id,
    permission_code,
    granted_by
  )
  select
    new.workspace_id,
    new.id,
    permission.code,
    new.created_by
  from public.permission_definitions permission
  where permission.code = any(
    case new.base_role
      when 'owner' then array['chat.read', 'chat.write', 'chat.manage', 'chat.moderate']
      when 'manager' then array['chat.read', 'chat.write', 'chat.manage', 'chat.moderate']
      when 'member' then array['chat.read', 'chat.write']
      when 'viewer' then array['chat.read', 'chat.write']
    end
  )
  on conflict do nothing;

  return new;
end;
$$;

revoke all on function private.grant_default_chat_permissions()
from public, anon, authenticated;

create trigger workspace_roles_grant_default_chat_permissions
after insert on public.workspace_roles
for each row execute function private.grant_default_chat_permissions();

create table public.chat_conversations (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind public.chat_conversation_kind not null,
  channel_visibility public.chat_channel_visibility,
  name text,
  slug text,
  description text,
  is_general boolean not null default false,
  direct_participant_low uuid,
  direct_participant_high uuid,
  created_by uuid not null references auth.users(id) on delete restrict,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, id),
  unique (workspace_id, conversation_id, id),
  foreign key (direct_participant_low)
    references auth.users(id) on delete restrict,
  foreign key (direct_participant_high)
    references auth.users(id) on delete restrict,
  constraint chat_conversations_shape_check check (
    (
      kind = 'channel'
      and channel_visibility is not null
      and char_length(trim(name)) between 2 and 80
      and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      and direct_participant_low is null
      and direct_participant_high is null
    )
    or (
      kind = 'direct'
      and channel_visibility is null
      and name is null
      and slug is null
      and not is_general
      and direct_participant_low is not null
      and direct_participant_high is not null
      and direct_participant_low::text < direct_participant_high::text
    )
  ),
  constraint chat_conversations_description_check check (
    description is null or char_length(description) <= 500
  ),
  constraint chat_conversations_general_check check (
    not is_general
    or (
      kind = 'channel'
      and channel_visibility = 'public'
      and slug = 'general'
      and archived_at is null
    )
  )
);

create unique index chat_conversations_workspace_slug_unique
  on public.chat_conversations (workspace_id, slug)
  where kind = 'channel';
create unique index chat_conversations_workspace_general_unique
  on public.chat_conversations (workspace_id)
  where is_general;
create unique index chat_conversations_direct_pair_unique
  on public.chat_conversations (
    workspace_id,
    direct_participant_low,
    direct_participant_high
  )
  where kind = 'direct';
create index chat_conversations_workspace_updated_idx
  on public.chat_conversations (workspace_id, updated_at desc)
  where archived_at is null;

create table public.chat_conversation_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  conversation_id uuid not null,
  user_id uuid not null,
  joined_at timestamptz not null default now(),
  last_delivered_at timestamptz,
  last_read_at timestamptz,
  notifications_muted boolean not null default false,
  primary key (conversation_id, user_id),
  foreign key (workspace_id, conversation_id)
    references public.chat_conversations(workspace_id, id) on delete cascade,
  foreign key (workspace_id, user_id)
    references public.workspace_members(workspace_id, user_id) on delete cascade,
  constraint chat_member_receipt_order_check check (
    last_delivered_at is null
    or last_read_at is null
    or last_delivered_at >= last_read_at
  )
);

create index chat_conversation_members_user_idx
  on public.chat_conversation_members (workspace_id, user_id, conversation_id);

create table public.chat_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  conversation_id uuid not null,
  sender_id uuid not null,
  client_request_id uuid not null,
  reply_to_message_id uuid,
  body text,
  edited_at timestamptz,
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, id),
  unique (sender_id, client_request_id),
  foreign key (workspace_id, conversation_id)
    references public.chat_conversations(workspace_id, id) on delete cascade,
  foreign key (sender_id)
    references auth.users(id) on delete restrict,
  foreign key (workspace_id, reply_to_message_id)
    references public.chat_messages(workspace_id, id) on delete restrict,
  constraint chat_messages_content_check check (
    (deleted_at is null and char_length(trim(body)) between 1 and 4000 and deleted_by is null)
    or (deleted_at is not null and body is null and deleted_by is not null)
  ),
  constraint chat_messages_edit_check check (
    edited_at is null or (deleted_at is null and edited_at >= created_at)
  )
);

create index chat_messages_conversation_date_idx
  on public.chat_messages (conversation_id, created_at desc, id desc);
create index chat_messages_reply_idx
  on public.chat_messages (reply_to_message_id)
  where reply_to_message_id is not null;

create table public.chat_message_reactions (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  conversation_id uuid not null,
  message_id uuid not null,
  user_id uuid not null,
  emoji text not null check (char_length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji),
  foreign key (workspace_id, conversation_id, message_id)
    references public.chat_messages(workspace_id, conversation_id, id) on delete cascade,
  foreign key (workspace_id, user_id)
    references public.workspace_members(workspace_id, user_id) on delete cascade
);

create table public.chat_message_mentions (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  message_id uuid not null,
  mentioned_user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (message_id, mentioned_user_id),
  foreign key (workspace_id, message_id)
    references public.chat_messages(workspace_id, id) on delete cascade,
  foreign key (workspace_id, mentioned_user_id)
    references public.workspace_members(workspace_id, user_id) on delete cascade
);

alter table public.notifications
  drop constraint notifications_source_entity_type_check,
  add constraint notifications_source_entity_type_check check (
    source_entity_type is null
    or source_entity_type in (
      'action_item',
      'calendar_event',
      'business_review',
      'workspace_achievement',
      'chat_message',
      'system'
    )
  );

create or replace function private.is_active_workspace_member(
  target_workspace_id uuid,
  target_user_id uuid default (select auth.uid())
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members member
    where member.workspace_id = target_workspace_id
      and member.user_id = target_user_id
      and member.status = 'active'
  );
$$;

create or replace function private.can_access_chat_conversation(
  target_conversation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.chat_conversations conversation
    where conversation.id = target_conversation_id
      and conversation.archived_at is null
      and private.has_workspace_permission(conversation.workspace_id, 'chat.read')
      and (
        (
          conversation.kind = 'channel'
          and conversation.channel_visibility = 'public'
        )
        or exists (
          select 1
          from public.chat_conversation_members member
          where member.conversation_id = conversation.id
            and member.user_id = (select auth.uid())
            and private.is_active_workspace_member(
              conversation.workspace_id,
              member.user_id
            )
        )
      )
  );
$$;

revoke all on function private.is_active_workspace_member(uuid, uuid)
from public, anon;
revoke all on function private.can_access_chat_conversation(uuid)
from public, anon;
grant execute on function private.is_active_workspace_member(uuid, uuid)
to authenticated;
grant execute on function private.can_access_chat_conversation(uuid)
to authenticated;

create or replace function private.create_general_chat_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.chat_conversations (
    workspace_id,
    kind,
    channel_visibility,
    name,
    slug,
    description,
    is_general,
    created_by
  )
  values (
    new.id,
    'channel',
    'public',
    'General',
    'general',
    'Percakapan utama untuk seluruh anggota aktif workspace.',
    true,
    new.created_by
  )
  on conflict do nothing;

  return new;
end;
$$;

revoke all on function private.create_general_chat_conversation()
from public, anon, authenticated;

create trigger workspaces_create_general_chat
after insert on public.workspaces
for each row execute function private.create_general_chat_conversation();

insert into public.chat_conversations (
  workspace_id,
  kind,
  channel_visibility,
  name,
  slug,
  description,
  is_general,
  created_by
)
select
  workspace.id,
  'channel',
  'public',
  'General',
  'general',
  'Percakapan utama untuk seluruh anggota aktif workspace.',
  true,
  workspace.created_by
from public.workspaces workspace
on conflict do nothing;

create or replace function public.create_chat_channel(
  target_workspace_id uuid,
  channel_name text,
  channel_slug text,
  channel_visibility public.chat_channel_visibility default 'public',
  channel_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  created_conversation_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not private.has_workspace_permission(target_workspace_id, 'chat.manage') then
    raise exception 'Chat management permission required' using errcode = '42501';
  end if;

  insert into public.chat_conversations (
    workspace_id,
    kind,
    channel_visibility,
    name,
    slug,
    description,
    created_by
  )
  values (
    target_workspace_id,
    'channel',
    channel_visibility,
    trim(channel_name),
    lower(trim(channel_slug)),
    nullif(trim(channel_description), ''),
    actor_id
  )
  returning id into created_conversation_id;

  if channel_visibility = 'private' then
    insert into public.chat_conversation_members (
      workspace_id,
      conversation_id,
      user_id
    )
    values (target_workspace_id, created_conversation_id, actor_id);
  end if;

  return created_conversation_id;
end;
$$;

create or replace function public.start_direct_chat(
  target_workspace_id uuid,
  target_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  participant_low uuid;
  participant_high uuid;
  conversation_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if actor_id = target_user_id then
    raise exception 'Direct conversation requires another member'
      using errcode = '22023';
  end if;
  if not private.has_workspace_permission(target_workspace_id, 'chat.read')
    or not private.is_active_workspace_member(target_workspace_id, target_user_id) then
    raise exception 'Direct conversation participant unavailable'
      using errcode = '42501';
  end if;

  participant_low := least(actor_id, target_user_id);
  participant_high := greatest(actor_id, target_user_id);

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      target_workspace_id::text || ':' || participant_low::text || ':' || participant_high::text,
      0
    )
  );

  select conversation.id
  into conversation_id
  from public.chat_conversations conversation
  where conversation.workspace_id = target_workspace_id
    and conversation.kind = 'direct'
    and conversation.direct_participant_low = participant_low
    and conversation.direct_participant_high = participant_high;

  if conversation_id is null then
    insert into public.chat_conversations (
      workspace_id,
      kind,
      direct_participant_low,
      direct_participant_high,
      created_by
    )
    values (
      target_workspace_id,
      'direct',
      participant_low,
      participant_high,
      actor_id
    )
    returning id into conversation_id;

  end if;

  insert into public.chat_conversation_members (
    workspace_id,
    conversation_id,
    user_id
  )
  values
    (target_workspace_id, conversation_id, actor_id),
    (target_workspace_id, conversation_id, target_user_id)
  on conflict do nothing;

  return conversation_id;
end;
$$;

create or replace function public.send_chat_message(
  target_conversation_id uuid,
  message_body text,
  request_id uuid,
  reply_to_id uuid default null,
  mentioned_user_ids uuid[] default array[]::uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_conversation public.chat_conversations%rowtype;
  created_message_id uuid;
  existing_message public.chat_messages%rowtype;
  recent_message_count integer;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into target_conversation
  from public.chat_conversations
  where id = target_conversation_id;

  if target_conversation.id is null
    or not private.can_access_chat_conversation(target_conversation_id)
    or not private.has_workspace_permission(target_conversation.workspace_id, 'chat.write') then
    raise exception 'Chat write permission required' using errcode = '42501';
  end if;

  select * into existing_message
  from public.chat_messages message
  where message.sender_id = actor_id
    and message.client_request_id = request_id;

  if existing_message.id is not null then
    if existing_message.conversation_id <> target_conversation_id
      or existing_message.body is distinct from trim(message_body)
      or existing_message.reply_to_message_id is distinct from reply_to_id
      or (
        select coalesce(array_agg(value order by value), array[]::uuid[])
        from (select distinct unnest(mentioned_user_ids) as value) requested_mentions
      ) is distinct from (
        select coalesce(
          array_agg(mention.mentioned_user_id order by mention.mentioned_user_id),
          array[]::uuid[]
        )
        from public.chat_message_mentions mention
        where mention.message_id = existing_message.id
      ) then
      raise exception 'Chat idempotency key reused with different payload'
        using errcode = '22023';
    end if;

    return existing_message.id;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      actor_id::text || ':' || target_conversation.workspace_id::text || ':chat_send',
      0
    )
  );

  select count(*)::integer
  into recent_message_count
  from public.chat_messages message
  where message.workspace_id = target_conversation.workspace_id
    and message.sender_id = actor_id
    and message.created_at >= pg_catalog.now() - interval '1 minute';

  if recent_message_count >= 60 then
    raise exception 'Chat message rate limit exceeded' using errcode = 'P0001';
  end if;

  if reply_to_id is not null
    and not exists (
      select 1 from public.chat_messages reply
      where reply.id = reply_to_id
        and reply.conversation_id = target_conversation_id
        and reply.deleted_at is null
    ) then
    raise exception 'Reply target is unavailable' using errcode = '23503';
  end if;

  insert into public.chat_messages (
    workspace_id,
    conversation_id,
    sender_id,
    client_request_id,
    reply_to_message_id,
    body
  )
  values (
    target_conversation.workspace_id,
    target_conversation_id,
    actor_id,
    request_id,
    reply_to_id,
    trim(message_body)
  )
  on conflict (sender_id, client_request_id)
  do nothing
  returning id into created_message_id;

  if created_message_id is null then
    select * into existing_message
    from public.chat_messages message
    where message.sender_id = actor_id
      and message.client_request_id = request_id;

    if existing_message.conversation_id <> target_conversation_id
      or existing_message.body is distinct from trim(message_body)
      or existing_message.reply_to_message_id is distinct from reply_to_id
      or (
        select coalesce(array_agg(value order by value), array[]::uuid[])
        from (select distinct unnest(mentioned_user_ids) as value) requested_mentions
      ) is distinct from (
        select coalesce(
          array_agg(mention.mentioned_user_id order by mention.mentioned_user_id),
          array[]::uuid[]
        )
        from public.chat_message_mentions mention
        where mention.message_id = existing_message.id
      ) then
      raise exception 'Chat idempotency key reused with different payload'
        using errcode = '22023';
    end if;

    return existing_message.id;
  end if;

  if exists (
    select 1
    from unnest(mentioned_user_ids) mentioned_user_id
    where mentioned_user_id = actor_id
      or not private.is_active_workspace_member(
        target_conversation.workspace_id,
        mentioned_user_id
      )
      or (
        target_conversation.channel_visibility = 'private'
        and not exists (
          select 1
          from public.chat_conversation_members member
          where member.conversation_id = target_conversation_id
            and member.user_id = mentioned_user_id
        )
      )
      or (
        target_conversation.kind = 'direct'
        and mentioned_user_id not in (
          target_conversation.direct_participant_low,
          target_conversation.direct_participant_high
        )
      )
  ) then
    raise exception 'Mentioned chat member is unavailable'
      using errcode = '42501';
  end if;

  insert into public.chat_message_mentions (
    workspace_id,
    message_id,
    mentioned_user_id
  )
  select
    target_conversation.workspace_id,
    created_message_id,
    mentioned_user_id
  from (
    select distinct unnest(mentioned_user_ids) as mentioned_user_id
  ) mention
  on conflict do nothing;

  perform private.create_notification(
    target_conversation.workspace_id,
    mention.mentioned_user_id,
    'system',
    'chat_mention',
    'chat_mention:' || created_message_id::text,
    'Anda disebut dalam percakapan',
    'Seorang anggota menyebut Anda dalam percakapan workspace.',
    '/kolaborasi?conversation=' || target_conversation_id::text,
    'chat_message',
    created_message_id,
    now(),
    null
  )
  from (
    select distinct mentioned_user_id
    from public.chat_message_mentions
    where message_id = created_message_id
  ) mention
  join public.profile_preferences preference
    on preference.user_id = mention.mentioned_user_id
    and preference.collaboration_notifications;

  update public.chat_conversations
  set updated_at = now()
  where id = target_conversation_id;

  return created_message_id;
end;
$$;

create or replace function public.get_chat_unread_counts(
  target_workspace_id uuid
)
returns table (
  conversation_id uuid,
  unread_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    conversation.id,
    count(message.id) filter (
      where message.sender_id <> (select auth.uid())
        and message.created_at > coalesce(
          member.last_read_at,
          '-infinity'::timestamptz
        )
    )
  from public.chat_conversations conversation
  left join public.chat_conversation_members member
    on member.conversation_id = conversation.id
    and member.user_id = (select auth.uid())
  left join public.chat_messages message
    on message.conversation_id = conversation.id
  where conversation.workspace_id = target_workspace_id
    and conversation.archived_at is null
    and private.can_access_chat_conversation(conversation.id)
  group by conversation.id, member.last_read_at;
$$;

create or replace function public.set_chat_conversation_membership(
  target_conversation_id uuid,
  target_user_id uuid,
  should_join boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_conversation public.chat_conversations%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into target_conversation
  from public.chat_conversations
  where id = target_conversation_id
    and kind = 'channel'
    and archived_at is null;

  if target_conversation.id is null
    or not private.is_active_workspace_member(
      target_conversation.workspace_id,
      target_user_id
    ) then
    raise exception 'Chat channel membership target unavailable'
      using errcode = '42501';
  end if;

  if target_conversation.channel_visibility = 'private'
    and not private.has_workspace_permission(
      target_conversation.workspace_id,
      'chat.manage'
    ) then
    raise exception 'Chat management permission required'
      using errcode = '42501';
  end if;

  if target_conversation.channel_visibility = 'public'
    and target_user_id <> actor_id
    and not private.has_workspace_permission(
      target_conversation.workspace_id,
      'chat.manage'
    ) then
    raise exception 'Members may only change their own public channel membership'
      using errcode = '42501';
  end if;

  if not should_join and target_conversation.is_general then
    raise exception 'General channel membership cannot be removed'
      using errcode = '23514';
  end if;

  if should_join then
    insert into public.chat_conversation_members (
      workspace_id,
      conversation_id,
      user_id
    )
    values (
      target_conversation.workspace_id,
      target_conversation_id,
      target_user_id
    )
    on conflict do nothing;
  else
    delete from public.chat_conversation_members member
    where member.conversation_id = target_conversation_id
      and member.user_id = target_user_id;
  end if;
end;
$$;

create or replace function public.toggle_chat_message_reaction(
  target_message_id uuid,
  reaction_emoji text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_message public.chat_messages%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into target_message
  from public.chat_messages
  where id = target_message_id
    and deleted_at is null;

  if target_message.id is null
    or not private.can_access_chat_conversation(target_message.conversation_id)
    or not private.has_workspace_permission(target_message.workspace_id, 'chat.write') then
    raise exception 'Reactable chat message not found' using errcode = '42501';
  end if;

  if char_length(reaction_emoji) not between 1 and 16 then
    raise exception 'Invalid chat reaction' using errcode = '22023';
  end if;

  delete from public.chat_message_reactions reaction
  where reaction.message_id = target_message_id
    and reaction.user_id = actor_id
    and reaction.emoji = reaction_emoji;

  if found then
    return false;
  end if;

  insert into public.chat_message_reactions (
    workspace_id,
    conversation_id,
    message_id,
    user_id,
    emoji
  )
  values (
    target_message.workspace_id,
    target_message.conversation_id,
    target_message_id,
    actor_id,
    reaction_emoji
  );

  return true;
end;
$$;

create or replace function public.edit_chat_message(
  target_message_id uuid,
  message_body text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chat_messages message
  set
    body = trim(message_body),
    edited_at = now(),
    updated_at = now()
  where message.id = target_message_id
    and message.sender_id = (select auth.uid())
    and message.deleted_at is null
    and private.can_access_chat_conversation(message.conversation_id)
    and private.has_workspace_permission(message.workspace_id, 'chat.write');

  if not found then
    raise exception 'Editable chat message not found' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.delete_chat_message(
  target_message_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_message public.chat_messages%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into target_message
  from public.chat_messages
  where id = target_message_id
  for update;

  if target_message.id is null
    or target_message.deleted_at is not null
    or not private.can_access_chat_conversation(target_message.conversation_id)
    or (
      target_message.sender_id <> actor_id
      and not private.has_workspace_permission(target_message.workspace_id, 'chat.moderate')
    ) then
    raise exception 'Deletable chat message not found' using errcode = '42501';
  end if;

  update public.chat_messages
  set
    body = null,
    deleted_at = now(),
    deleted_by = actor_id,
    updated_at = now()
  where id = target_message_id;

  insert into public.audit_logs (
    workspace_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    target_message.workspace_id,
    actor_id,
    'delete',
    'chat_message',
    target_message.id,
    jsonb_build_object(
      'source',
      'chat_moderation',
      'conversation_id',
      target_message.conversation_id,
      'deleted_own_message',
      target_message.sender_id = actor_id
    )
  );
end;
$$;

create or replace function public.mark_chat_conversation_read(
  target_conversation_id uuid,
  delivered_through timestamptz,
  read_through timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_workspace_id uuid;
  newest_message_at timestamptz;
begin
  if not private.can_access_chat_conversation(target_conversation_id) then
    raise exception 'Chat conversation unavailable' using errcode = '42501';
  end if;
  if read_through > delivered_through then
    raise exception 'Read cursor cannot exceed delivery cursor' using errcode = '22023';
  end if;

  select conversation.workspace_id
  into target_workspace_id
  from public.chat_conversations conversation
  where conversation.id = target_conversation_id;

  select max(message.created_at)
  into newest_message_at
  from public.chat_messages message
  where message.conversation_id = target_conversation_id;

  if newest_message_at is not null
    and (delivered_through > newest_message_at or read_through > newest_message_at) then
    raise exception 'Chat receipt cursor exceeds conversation history'
      using errcode = '22023';
  end if;

  insert into public.chat_conversation_members (
    workspace_id,
    conversation_id,
    user_id,
    last_delivered_at,
    last_read_at
  )
  values (
    target_workspace_id,
    target_conversation_id,
    actor_id,
    delivered_through,
    read_through
  )
  on conflict (conversation_id, user_id)
  do update set
    last_delivered_at = greatest(
      chat_conversation_members.last_delivered_at,
      excluded.last_delivered_at
    ),
    last_read_at = greatest(
      chat_conversation_members.last_read_at,
      excluded.last_read_at
    );
end;
$$;

revoke all on function public.create_chat_channel(uuid, text, text, public.chat_channel_visibility, text)
from public, anon, authenticated;
revoke all on function public.get_chat_unread_counts(uuid)
from public, anon, authenticated;
revoke all on function public.start_direct_chat(uuid, uuid)
from public, anon, authenticated;
revoke all on function public.send_chat_message(uuid, text, uuid, uuid, uuid[])
from public, anon, authenticated;
revoke all on function public.set_chat_conversation_membership(uuid, uuid, boolean)
from public, anon, authenticated;
revoke all on function public.toggle_chat_message_reaction(uuid, text)
from public, anon, authenticated;
revoke all on function public.edit_chat_message(uuid, text)
from public, anon, authenticated;
revoke all on function public.delete_chat_message(uuid)
from public, anon, authenticated;
revoke all on function public.mark_chat_conversation_read(uuid, timestamptz, timestamptz)
from public, anon, authenticated;

grant execute on function public.create_chat_channel(uuid, text, text, public.chat_channel_visibility, text)
to authenticated;
grant execute on function public.get_chat_unread_counts(uuid)
to authenticated;
grant execute on function public.start_direct_chat(uuid, uuid)
to authenticated;
grant execute on function public.send_chat_message(uuid, text, uuid, uuid, uuid[])
to authenticated;
grant execute on function public.set_chat_conversation_membership(uuid, uuid, boolean)
to authenticated;
grant execute on function public.toggle_chat_message_reaction(uuid, text)
to authenticated;
grant execute on function public.edit_chat_message(uuid, text)
to authenticated;
grant execute on function public.delete_chat_message(uuid)
to authenticated;
grant execute on function public.mark_chat_conversation_read(uuid, timestamptz, timestamptz)
to authenticated;

alter table public.chat_conversations enable row level security;
alter table public.chat_conversation_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_message_reactions enable row level security;
alter table public.chat_message_mentions enable row level security;

create policy "chat_conversations_select_accessible"
on public.chat_conversations for select to authenticated
using (private.can_access_chat_conversation(id));

create policy "chat_members_select_accessible"
on public.chat_conversation_members for select to authenticated
using (private.can_access_chat_conversation(conversation_id));

create policy "chat_messages_select_accessible"
on public.chat_messages for select to authenticated
using (private.can_access_chat_conversation(conversation_id));

create policy "chat_reactions_select_accessible"
on public.chat_message_reactions for select to authenticated
using (
  exists (
    select 1 from public.chat_messages message
    where message.id = message_id
      and private.can_access_chat_conversation(message.conversation_id)
  )
);

create policy "chat_mentions_select_own_or_accessible"
on public.chat_message_mentions for select to authenticated
using (
  mentioned_user_id = (select auth.uid())
  or exists (
    select 1 from public.chat_messages message
    where message.id = message_id
      and private.can_access_chat_conversation(message.conversation_id)
  )
);

revoke all on public.chat_conversations from anon, authenticated;
revoke all on public.chat_conversation_members from anon, authenticated;
revoke all on public.chat_messages from anon, authenticated;
revoke all on public.chat_message_reactions from anon, authenticated;
revoke all on public.chat_message_mentions from anon, authenticated;

grant select on public.chat_conversations to authenticated;
grant select on public.chat_conversation_members to authenticated;
grant select on public.chat_messages to authenticated;
grant select on public.chat_message_reactions to authenticated;
grant select on public.chat_message_mentions to authenticated;

create trigger chat_conversations_set_updated_at
before update on public.chat_conversations
for each row execute function private.set_updated_at();

alter table public.chat_conversations replica identity full;
alter table public.chat_conversation_members replica identity full;
alter table public.chat_messages replica identity full;
alter table public.chat_message_reactions replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime
      add table public.chat_messages;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_conversation_members'
  ) then
    alter publication supabase_realtime
      add table public.chat_conversation_members;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_message_reactions'
  ) then
    alter publication supabase_realtime
      add table public.chat_message_reactions;
  end if;
end;
$$;
