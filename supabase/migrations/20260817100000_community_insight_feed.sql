create type public.community_post_kind as enum (
  'insight',
  'collaboration_request'
);

create type public.community_post_publication_status as enum (
  'draft',
  'published',
  'archived'
);

create type public.collaboration_request_kind as enum (
  'marketing',
  'distribution',
  'supplier',
  'event',
  'production',
  'other'
);

insert into public.permission_definitions (code, resource, action, description)
values
  (
    'community_post.create',
    'community_post',
    'create',
    'Create, edit, and delete own community post drafts.'
  ),
  (
    'community_post.publish',
    'community_post',
    'publish',
    'Publish own community post drafts through the controlled lifecycle.'
  ),
  (
    'community_post.moderate',
    'community_post',
    'moderate',
    'Read archived workspace posts and archive community posts in the workspace.'
  )
on conflict (code) do update
set description = excluded.description;

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
      when 'owner' then array[
        'community_post.create',
        'community_post.publish',
        'community_post.moderate'
      ]
      when 'manager' then array[
        'community_post.create',
        'community_post.publish'
      ]
      else array[]::text[]
    end
  )
on conflict do nothing;

create or replace function private.grant_default_community_permissions()
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
      when 'owner' then array[
        'community_post.create',
        'community_post.publish',
        'community_post.moderate'
      ]
      when 'manager' then array[
        'community_post.create',
        'community_post.publish'
      ]
      else array[]::text[]
    end
  )
  on conflict do nothing;

  return new;
end;
$$;

revoke all on function private.grant_default_community_permissions()
from public, anon, authenticated;

create trigger workspace_roles_grant_default_community_permissions
after insert on public.workspace_roles
for each row execute function private.grant_default_community_permissions();

create table public.community_posts (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id)
    on delete cascade,
  created_by uuid not null references public.profiles(user_id)
    on delete restrict,
  post_kind public.community_post_kind not null,
  publication_status public.community_post_publication_status
    not null default 'draft',
  audience text not null default 'authenticated',
  title text not null
    check (char_length(trim(title)) between 2 and 160),
  body text not null
    check (char_length(trim(body)) between 10 and 10000),
  author_display_name text not null
    check (char_length(trim(author_display_name)) between 2 and 100),
  workspace_display_name text not null
    check (char_length(trim(workspace_display_name)) between 2 and 120),
  published_at timestamptz,
  archived_at timestamptz,
  archived_by uuid references public.profiles(user_id) on delete restrict,
  archive_reason text
    check (
      archive_reason is null
      or char_length(trim(archive_reason)) between 1 and 500
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_posts_audience_check check (
    audience in ('authenticated')
  ),
  constraint community_posts_lifecycle_check check (
    (
      publication_status = 'draft'
      and published_at is null
      and archived_at is null
      and archived_by is null
      and archive_reason is null
    )
    or
    (
      publication_status = 'published'
      and published_at is not null
      and archived_at is null
      and archived_by is null
      and archive_reason is null
    )
    or
    (
      publication_status = 'archived'
      and published_at is not null
      and archived_at is not null
      and archived_by is not null
    )
  ),
  constraint community_posts_published_at_check check (
    published_at is null or published_at >= created_at
  ),
  constraint community_posts_archived_at_check check (
    archived_at is null
    or (published_at is not null and archived_at >= published_at)
  ),
  unique (workspace_id, id),
  unique (workspace_id, id, created_by)
);

create table public.community_post_categories (
  workspace_id uuid not null references public.workspaces(id)
    on delete cascade,
  community_post_id uuid not null,
  category_id smallint not null references public.business_categories(id)
    on delete restrict,
  created_at timestamptz not null default now(),
  primary key (community_post_id, category_id),
  foreign key (workspace_id, community_post_id)
    references public.community_posts(workspace_id, id) on delete cascade
);

create table public.collaboration_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id)
    on delete cascade,
  community_post_id uuid not null unique,
  created_by uuid not null references public.profiles(user_id)
    on delete restrict,
  collaboration_kind public.collaboration_request_kind not null,
  partner_expectation text not null
    check (char_length(trim(partner_expectation)) between 10 and 2000),
  proposed_contribution text not null
    check (char_length(trim(proposed_contribution)) between 10 and 2000),
  location_scope text
    check (
      location_scope is null
      or char_length(trim(location_scope)) between 2 and 200
    ),
  response_instructions text
    check (
      response_instructions is null
      or char_length(trim(response_instructions)) between 2 and 1000
    ),
  closes_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collaboration_requests_closes_at_check check (
    closes_at is null or closes_at > created_at
  ),
  unique (workspace_id, id),
  foreign key (workspace_id, community_post_id, created_by)
    references public.community_posts(workspace_id, id, created_by)
    on delete cascade
);

create table public.community_post_publication_events (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id)
    on delete restrict,
  community_post_id uuid not null unique,
  created_by uuid not null references public.profiles(user_id)
    on delete restrict,
  published_at timestamptz not null default now(),
  foreign key (workspace_id, community_post_id, created_by)
    references public.community_posts(workspace_id, id, created_by)
    on delete restrict
);

create index community_posts_workspace_feed_idx
  on public.community_posts (
    workspace_id,
    publication_status,
    published_at desc
  );
create index community_posts_authenticated_feed_idx
  on public.community_posts (
    publication_status,
    audience,
    published_at desc,
    id
  );
create index community_posts_author_drafts_idx
  on public.community_posts (
    created_by,
    publication_status,
    updated_at desc
  );
create index community_post_categories_workspace_category_idx
  on public.community_post_categories (
    workspace_id,
    category_id,
    community_post_id
  );
create index collaboration_requests_workspace_post_idx
  on public.collaboration_requests (workspace_id, community_post_id);
create index community_publication_events_workspace_time_idx
  on public.community_post_publication_events (
    workspace_id,
    published_at desc
  );
create index community_publication_events_actor_time_idx
  on public.community_post_publication_events (
    created_by,
    published_at desc
  );

create or replace function private.can_read_community_post(
  target_community_post_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.community_posts post
    where post.id = target_community_post_id
      and (select auth.uid()) is not null
      and (
        (
          post.publication_status = 'published'
          and post.audience = 'authenticated'
        )
        or
        (
          post.created_by = (select auth.uid())
          and private.is_workspace_member(post.workspace_id)
        )
        or
        (
          post.publication_status = 'archived'
          and private.has_workspace_permission(
            post.workspace_id,
            'community_post.moderate'
          )
        )
      )
  );
$$;

revoke all on function private.can_read_community_post(uuid)
from public, anon, authenticated;
grant execute on function private.can_read_community_post(uuid)
to authenticated;

create or replace function private.protect_community_post()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
    or new.workspace_id is distinct from old.workspace_id
    or new.created_by is distinct from old.created_by
    or new.post_kind is distinct from old.post_kind
    or new.created_at is distinct from old.created_at then
    raise exception 'Community post identity cannot be changed'
      using errcode = '23514';
  end if;

  if old.publication_status = 'draft' then
    if new.publication_status = 'draft' then
      if new.published_at is not null
        or new.archived_at is not null
        or new.archived_by is not null
        or new.archive_reason is not null then
        raise exception 'Draft community post cannot have lifecycle evidence'
          using errcode = '23514';
      end if;
    elsif new.publication_status = 'published' then
      if new.published_at is null
        or new.archived_at is not null
        or new.archived_by is not null
        or new.archive_reason is not null then
        raise exception 'Community post publication evidence is invalid'
          using errcode = '23514';
      end if;
    else
      raise exception 'Community post must be published before it is archived'
        using errcode = '23514';
    end if;

    return new;
  end if;

  if new.title is distinct from old.title
    or new.body is distinct from old.body
    or new.post_kind is distinct from old.post_kind
    or new.audience is distinct from old.audience
    or new.author_display_name is distinct from old.author_display_name
    or new.workspace_display_name is distinct from old.workspace_display_name
    or new.published_at is distinct from old.published_at then
    raise exception 'Published community post content is immutable'
      using errcode = '23514';
  end if;

  if old.publication_status = 'published'
    and new.publication_status = 'archived'
    and new.archived_at is not null
    and new.archived_by is not null then
    return new;
  end if;

  raise exception 'Published or archived community post cannot be modified'
    using errcode = '23514';
end;
$$;

revoke all on function private.protect_community_post()
from public, anon, authenticated;

create or replace function private.preserve_published_community_post()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.publication_status <> 'draft' or old.published_at is not null then
    raise exception 'Published community posts cannot be deleted'
      using errcode = '23514';
  end if;

  return old;
end;
$$;

revoke all on function private.preserve_published_community_post()
from public, anon, authenticated;

create or replace function private.protect_community_post_category()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_post_id uuid := case
    when tg_op = 'DELETE' then old.community_post_id
    else new.community_post_id
  end;
  parent_status public.community_post_publication_status;
begin
  if tg_op = 'UPDATE'
    and (
      new.workspace_id is distinct from old.workspace_id
      or new.community_post_id is distinct from old.community_post_id
      or new.category_id is distinct from old.category_id
      or new.created_at is distinct from old.created_at
    ) then
    raise exception 'Community post category identity cannot be changed'
      using errcode = '23514';
  end if;

  select post.publication_status
  into parent_status
  from public.community_posts post
  where post.id = parent_post_id;

  -- The parent row is already gone when this trigger runs as part of an
  -- approved ON DELETE CASCADE from a draft community post.
  if tg_op = 'DELETE' and parent_status is null then
    return old;
  end if;

  if parent_status is distinct from 'draft' then
    raise exception 'Published community post categories are immutable'
      using errcode = '23514';
  end if;

  if tg_op = 'INSERT' and not exists (
    select 1
    from public.business_categories category
    where category.id = new.category_id
      and category.active
  ) then
    raise exception 'Community post category must be active'
      using errcode = '23514';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.protect_community_post_category()
from public, anon, authenticated;

create or replace function private.protect_collaboration_request()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_post_id uuid := case
    when tg_op = 'DELETE' then old.community_post_id
    else new.community_post_id
  end;
  parent_status public.community_post_publication_status;
  parent_kind public.community_post_kind;
begin
  select post.publication_status, post.post_kind
  into parent_status, parent_kind
  from public.community_posts post
  where post.id = parent_post_id;

  -- The parent row is already gone when this trigger runs as part of an
  -- approved ON DELETE CASCADE from a draft community post.
  if tg_op = 'DELETE' and parent_status is null then
    return old;
  end if;

  if parent_status is distinct from 'draft' then
    raise exception 'Published collaboration request content is immutable'
      using errcode = '23514';
  end if;

  if parent_kind is distinct from 'collaboration_request' then
    raise exception 'Collaboration request requires a collaboration post'
      using errcode = '23514';
  end if;

  if tg_op = 'UPDATE'
    and (
      new.id is distinct from old.id
      or new.workspace_id is distinct from old.workspace_id
      or new.community_post_id is distinct from old.community_post_id
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at
    ) then
    raise exception 'Collaboration request identity cannot be changed'
      using errcode = '23514';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.protect_collaboration_request()
from public, anon, authenticated;

create or replace function private.preserve_community_publication_event()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Community publication events are immutable'
    using errcode = '23514';
end;
$$;

revoke all on function private.preserve_community_publication_event()
from public, anon, authenticated;

create trigger community_posts_protect_content
before update on public.community_posts
for each row execute function private.protect_community_post();
create trigger community_posts_preserve_published
before delete on public.community_posts
for each row execute function private.preserve_published_community_post();
create trigger community_posts_set_updated_at
before update on public.community_posts
for each row execute function private.set_updated_at();
create trigger community_post_categories_protect_content
before insert or update or delete on public.community_post_categories
for each row execute function private.protect_community_post_category();
create trigger collaboration_requests_protect_content
before insert or update or delete on public.collaboration_requests
for each row execute function private.protect_collaboration_request();
create trigger collaboration_requests_set_updated_at
before update on public.collaboration_requests
for each row execute function private.set_updated_at();
create trigger community_publication_events_preserve_evidence
before update or delete on public.community_post_publication_events
for each row execute function private.preserve_community_publication_event();

create or replace function public.publish_community_post(
  target_community_post_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  post_record public.community_posts%rowtype;
  profile_name text;
  workspace_name text;
  recent_actor_publication_count integer;
  recent_workspace_publication_count integer;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select *
  into post_record
  from public.community_posts post
  where post.id = target_community_post_id
  for update;

  if post_record.id is null
    or post_record.publication_status <> 'draft'
    or post_record.created_by <> actor_id then
    raise exception 'Publishable community post not found'
      using errcode = '42501';
  end if;

  if not private.is_workspace_member(post_record.workspace_id)
    or not private.has_workspace_permission(
      post_record.workspace_id,
      'community_post.publish'
    ) then
    raise exception 'Community post publication permission required'
      using errcode = '42501';
  end if;

  -- Actor is always locked before workspace. Distinct namespaces prevent an
  -- actor UUID from sharing a lock key with an equal workspace UUID.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'community_publish:actor:' || actor_id::text,
      0
    )
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'community_publish:workspace:' || post_record.workspace_id::text,
      0
    )
  );

  select count(*)::integer
  into recent_actor_publication_count
  from public.community_post_publication_events event
  where event.created_by = actor_id
    and event.published_at >= pg_catalog.now() - interval '60 minutes';

  select count(*)::integer
  into recent_workspace_publication_count
  from public.community_post_publication_events event
  where event.workspace_id = post_record.workspace_id
    and event.published_at >= pg_catalog.now() - interval '60 minutes';

  if recent_actor_publication_count >= 5
    or recent_workspace_publication_count >= 5 then
    raise exception 'Community post publication rate limit exceeded'
      using errcode = 'P0001';
  end if;

  select profile.full_name, workspace.name
  into profile_name, workspace_name
  from public.profiles profile
  join public.workspaces workspace
    on workspace.id = post_record.workspace_id
  where profile.user_id = actor_id;

  if profile_name is null
    or workspace_name is null
    or normalize(trim(post_record.author_display_name), NFC)
      is distinct from normalize(trim(profile_name), NFC)
    or normalize(trim(post_record.workspace_display_name), NFC)
      is distinct from normalize(trim(workspace_name), NFC) then
    raise exception 'Community display identity does not match current identity'
      using errcode = '23514';
  end if;

  if post_record.post_kind = 'collaboration_request' and not exists (
    select 1
    from public.collaboration_requests request
    where request.community_post_id = post_record.id
  ) then
    raise exception 'Collaboration post requires collaboration request details'
      using errcode = '23514';
  end if;

  if post_record.post_kind = 'insight' and exists (
    select 1
    from public.collaboration_requests request
    where request.community_post_id = post_record.id
  ) then
    raise exception 'Insight post cannot have collaboration request details'
      using errcode = '23514';
  end if;

  update public.community_posts
  set
    publication_status = 'published',
    published_at = pg_catalog.now(),
    updated_at = pg_catalog.now()
  where id = post_record.id;

  insert into public.community_post_publication_events (
    workspace_id,
    community_post_id,
    created_by,
    published_at
  )
  select
    post.workspace_id,
    post.id,
    post.created_by,
    post.published_at
  from public.community_posts post
  where post.id = post_record.id;
end;
$$;

create or replace function public.archive_community_post(
  target_community_post_id uuid,
  reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  post_record public.community_posts%rowtype;
  normalized_reason text := nullif(trim(reason), '');
  is_author boolean;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select *
  into post_record
  from public.community_posts post
  where post.id = target_community_post_id
  for update;

  is_author := post_record.created_by = actor_id;

  if post_record.id is null
    or post_record.publication_status <> 'published'
    or not private.is_workspace_member(post_record.workspace_id)
    or (
      not is_author
      and not private.has_workspace_permission(
        post_record.workspace_id,
        'community_post.moderate'
      )
    ) then
    raise exception 'Archivable community post not found'
      using errcode = '42501';
  end if;

  if not is_author and normalized_reason is null then
    raise exception 'Moderated archive requires a reason'
      using errcode = '22023';
  end if;

  if normalized_reason is not null
    and char_length(normalized_reason) > 500 then
    raise exception 'Archive reason is too long' using errcode = '22023';
  end if;

  update public.community_posts
  set
    publication_status = 'archived',
    archived_at = pg_catalog.now(),
    archived_by = actor_id,
    archive_reason = normalized_reason,
    updated_at = pg_catalog.now()
  where id = post_record.id;
end;
$$;

create or replace function public.get_own_publish_quota(
  target_workspace_id uuid
)
returns table (
  actor_remaining integer,
  workspace_remaining integer,
  window_ends_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_count integer;
  workspace_count integer;
  actor_window_end timestamptz;
  workspace_window_end timestamptz;
begin
  if actor_id is null
    or not private.is_workspace_member(target_workspace_id) then
    raise exception 'Active workspace membership required'
      using errcode = '42501';
  end if;

  select count(*)::integer, min(event.published_at) + interval '60 minutes'
  into actor_count, actor_window_end
  from public.community_post_publication_events event
  where event.created_by = actor_id
    and event.published_at >= pg_catalog.now() - interval '60 minutes';

  select count(*)::integer, min(event.published_at) + interval '60 minutes'
  into workspace_count, workspace_window_end
  from public.community_post_publication_events event
  where event.workspace_id = target_workspace_id
    and event.published_at >= pg_catalog.now() - interval '60 minutes';

  return query select
    greatest(0, 5 - actor_count),
    greatest(0, 5 - workspace_count),
    greatest(
      coalesce(actor_window_end, pg_catalog.now()),
      coalesce(workspace_window_end, pg_catalog.now())
    );
end;
$$;

revoke all on function public.publish_community_post(uuid)
from public, anon, authenticated;
revoke all on function public.archive_community_post(uuid, text)
from public, anon, authenticated;
revoke all on function public.get_own_publish_quota(uuid)
from public, anon, authenticated;
grant execute on function public.publish_community_post(uuid)
to authenticated;
grant execute on function public.archive_community_post(uuid, text)
to authenticated;
grant execute on function public.get_own_publish_quota(uuid)
to authenticated;

alter table public.community_posts enable row level security;
alter table public.community_post_categories enable row level security;
alter table public.collaboration_requests enable row level security;
alter table public.community_post_publication_events enable row level security;

create policy "community_posts_select_readable"
on public.community_posts for select to authenticated
using (private.can_read_community_post(id));

create policy "community_posts_insert_own_draft"
on public.community_posts for insert to authenticated
with check (
  created_by = (select auth.uid())
  and publication_status = 'draft'
  and published_at is null
  and archived_at is null
  and private.is_workspace_member(workspace_id)
  and private.has_workspace_permission(
    workspace_id,
    'community_post.create'
  )
);

create policy "community_posts_update_own_draft"
on public.community_posts for update to authenticated
using (
  created_by = (select auth.uid())
  and publication_status = 'draft'
  and private.is_workspace_member(workspace_id)
  and private.has_workspace_permission(
    workspace_id,
    'community_post.create'
  )
)
with check (
  created_by = (select auth.uid())
  and publication_status = 'draft'
  and published_at is null
  and archived_at is null
  and private.is_workspace_member(workspace_id)
  and private.has_workspace_permission(
    workspace_id,
    'community_post.create'
  )
);

create policy "community_posts_delete_own_draft"
on public.community_posts for delete to authenticated
using (
  created_by = (select auth.uid())
  and publication_status = 'draft'
  and published_at is null
  and private.is_workspace_member(workspace_id)
  and private.has_workspace_permission(
    workspace_id,
    'community_post.create'
  )
);

create policy "community_post_categories_select_readable"
on public.community_post_categories for select to authenticated
using (private.can_read_community_post(community_post_id));

create policy "community_post_categories_insert_own_draft"
on public.community_post_categories for insert to authenticated
with check (
  exists (
    select 1
    from public.community_posts post
    where post.id = community_post_id
      and post.workspace_id = workspace_id
      and post.created_by = (select auth.uid())
      and post.publication_status = 'draft'
      and private.is_workspace_member(post.workspace_id)
      and private.has_workspace_permission(
        post.workspace_id,
        'community_post.create'
      )
  )
  and exists (
    select 1
    from public.business_categories category
    where category.id = category_id
      and category.active
  )
);

create policy "community_post_categories_delete_own_draft"
on public.community_post_categories for delete to authenticated
using (
  exists (
    select 1
    from public.community_posts post
    where post.id = community_post_id
      and post.workspace_id = workspace_id
      and post.created_by = (select auth.uid())
      and post.publication_status = 'draft'
      and private.is_workspace_member(post.workspace_id)
      and private.has_workspace_permission(
        post.workspace_id,
        'community_post.create'
      )
  )
);

create policy "collaboration_requests_select_readable"
on public.collaboration_requests for select to authenticated
using (private.can_read_community_post(community_post_id));

create policy "collaboration_requests_insert_own_draft"
on public.collaboration_requests for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.community_posts post
    where post.id = community_post_id
      and post.workspace_id = workspace_id
      and post.created_by = (select auth.uid())
      and post.post_kind = 'collaboration_request'
      and post.publication_status = 'draft'
      and private.is_workspace_member(post.workspace_id)
      and private.has_workspace_permission(
        post.workspace_id,
        'community_post.create'
      )
  )
);

create policy "collaboration_requests_update_own_draft"
on public.collaboration_requests for update to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.community_posts post
    where post.id = community_post_id
      and post.workspace_id = workspace_id
      and post.created_by = (select auth.uid())
      and post.publication_status = 'draft'
      and private.is_workspace_member(post.workspace_id)
      and private.has_workspace_permission(
        post.workspace_id,
        'community_post.create'
      )
  )
)
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.community_posts post
    where post.id = community_post_id
      and post.workspace_id = workspace_id
      and post.created_by = (select auth.uid())
      and post.post_kind = 'collaboration_request'
      and post.publication_status = 'draft'
      and private.is_workspace_member(post.workspace_id)
      and private.has_workspace_permission(
        post.workspace_id,
        'community_post.create'
      )
  )
);

create policy "collaboration_requests_delete_own_draft"
on public.collaboration_requests for delete to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.community_posts post
    where post.id = community_post_id
      and post.workspace_id = workspace_id
      and post.created_by = (select auth.uid())
      and post.publication_status = 'draft'
      and private.is_workspace_member(post.workspace_id)
      and private.has_workspace_permission(
        post.workspace_id,
        'community_post.create'
      )
  )
);

revoke all on public.community_posts from public, anon, authenticated;
revoke all on public.community_post_categories from public, anon, authenticated;
revoke all on public.collaboration_requests from public, anon, authenticated;
revoke all on public.community_post_publication_events
from public, anon, authenticated;
revoke select on public.community_post_publication_events
from anon, authenticated;

grant select on public.community_posts to authenticated;
grant insert (
  workspace_id,
  created_by,
  post_kind,
  audience,
  title,
  body,
  author_display_name,
  workspace_display_name
) on public.community_posts to authenticated;
revoke update on public.community_posts from authenticated;
revoke update (
  publication_status,
  published_at,
  archived_at
) on public.community_posts from authenticated;
grant update (
  title,
  body,
  audience,
  author_display_name,
  workspace_display_name
) on public.community_posts to authenticated;
grant delete on public.community_posts to authenticated;

grant select on public.community_post_categories to authenticated;
grant insert (
  workspace_id,
  community_post_id,
  category_id
) on public.community_post_categories to authenticated;
grant delete on public.community_post_categories to authenticated;

grant select on public.collaboration_requests to authenticated;
grant insert (
  workspace_id,
  community_post_id,
  created_by,
  collaboration_kind,
  partner_expectation,
  proposed_contribution,
  location_scope,
  response_instructions,
  closes_at
) on public.collaboration_requests to authenticated;
grant update (
  collaboration_kind,
  partner_expectation,
  proposed_contribution,
  location_scope,
  response_instructions,
  closes_at
) on public.collaboration_requests to authenticated;
grant delete on public.collaboration_requests to authenticated;

comment on table public.community_posts is
  'Explicit opt-in community content; no content is derived from private workspace records.';
comment on table public.community_post_publication_events is
  'Browser-inaccessible publication evidence for atomic actor and workspace rate limits; restrictive foreign keys require review before account-erasure workflows.';
comment on function public.publish_community_post(uuid) is
  'Publishes an owned draft after permission, identity, content, and atomic dual-rate-limit checks.';
comment on function public.archive_community_post(uuid, text) is
  'Archives an immutable published community post as its active author or an authorized workspace moderator.';
comment on function public.get_own_publish_quota(uuid) is
  'Returns only aggregate actor and workspace publication capacity for an active member.';
