\set ON_ERROR_STOP on

begin;

select plan(1);

insert into auth.users (
  id,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  email_confirmed_at,
  created_at,
  updated_at
)
values
  ('c1000000-0000-0000-0000-000000000001', 'community-owner-a@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Community Owner A"}', now(), now(), now()),
  ('c1000000-0000-0000-0000-000000000002', 'community-manager-a@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Community Manager A"}', now(), now(), now()),
  ('c1000000-0000-0000-0000-000000000003', 'community-manager-b@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Community Manager B"}', now(), now(), now()),
  ('c1000000-0000-0000-0000-000000000004', 'community-manager-c@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Community Manager C"}', now(), now(), now()),
  ('c1000000-0000-0000-0000-000000000005', 'community-manager-d@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Community Manager D"}', now(), now(), now()),
  ('c1000000-0000-0000-0000-000000000006', 'community-manager-e@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Community Manager E"}', now(), now(), now()),
  ('c1000000-0000-0000-0000-000000000007', 'community-outsider@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Community Outsider"}', now(), now(), now()),
  ('c1000000-0000-0000-0000-000000000008', 'community-owner-b@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Community Owner B"}', now(), now(), now());

insert into public.workspaces (id, name, slug, created_by)
values
  (
    'c2000000-0000-0000-0000-000000000001',
    'Community Workspace A',
    'community-contract-workspace-a',
    'c1000000-0000-0000-0000-000000000001'
  ),
  (
    'c2000000-0000-0000-0000-000000000002',
    'Community Workspace B',
    'community-contract-workspace-b',
    'c1000000-0000-0000-0000-000000000008'
  );

insert into public.workspace_members (workspace_id, user_id, role, status)
values
  ('c2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'owner', 'active'),
  ('c2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'manager', 'active'),
  ('c2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 'manager', 'active'),
  ('c2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 'manager', 'active'),
  ('c2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005', 'manager', 'active'),
  ('c2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000006', 'manager', 'active'),
  ('c2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000008', 'owner', 'active'),
  ('c2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'manager', 'active');

-- Keep the fixture explicit about the authoritative role relationship. The
-- compatibility `role` column is not the permission source.
update public.workspace_members member
set workspace_role_id = role_record.id
from public.workspace_roles role_record
where role_record.workspace_id = member.workspace_id
  and role_record.is_system
  and role_record.base_role = member.role
  and member.user_id in (
    'c1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000008'
  );

do $$
declare
  manager_permission_count integer;
  owner_permission_count integer;
  function_definition text;
begin
  select count(*)::integer
  into owner_permission_count
  from public.workspace_role_permissions role_permission
  join public.workspace_roles role_record
    on role_record.id = role_permission.workspace_role_id
  where role_record.workspace_id = 'c2000000-0000-0000-0000-000000000001'
    and role_record.is_system
    and role_record.base_role = 'owner'
    and role_permission.permission_code like 'community_post.%';

  select count(*)::integer
  into manager_permission_count
  from public.workspace_role_permissions role_permission
  join public.workspace_roles role_record
    on role_record.id = role_permission.workspace_role_id
  where role_record.workspace_id = 'c2000000-0000-0000-0000-000000000001'
    and role_record.is_system
    and role_record.base_role = 'manager'
    and role_permission.permission_code like 'community_post.%';

  if owner_permission_count <> 3 or manager_permission_count <> 2 then
    raise exception 'Default community permissions do not match owner and manager contracts';
  end if;

  if exists (
    select 1
    from public.workspace_role_permissions role_permission
    join public.workspace_roles role_record
      on role_record.id = role_permission.workspace_role_id
    where role_record.workspace_id = 'c2000000-0000-0000-0000-000000000001'
      and role_record.is_system
      and role_record.base_role in ('member', 'viewer')
      and role_permission.permission_code like 'community_post.%'
  ) then
    raise exception 'Member or viewer received a default community permission';
  end if;

  if has_table_privilege(
    'authenticated',
    'public.community_post_publication_events',
    'select,insert,update,delete'
  ) then
    raise exception 'Authenticated can access community publication events';
  end if;

  if has_table_privilege(
    'anon',
    'public.community_post_publication_events',
    'select,insert,update,delete'
  ) then
    raise exception 'Anonymous can access community publication events';
  end if;

  if has_column_privilege(
    'authenticated',
    'public.community_posts',
    'publication_status',
    'update'
  ) or has_column_privilege(
    'authenticated',
    'public.community_posts',
    'published_at',
    'update'
  ) or has_column_privilege(
    'authenticated',
    'public.community_posts',
    'archived_at',
    'update'
  ) or has_column_privilege(
    'authenticated',
    'public.community_posts',
    'archived_by',
    'update'
  ) then
    raise exception 'Authenticated can update a community lifecycle column directly';
  end if;

  if has_function_privilege(
    'anon',
    'public.publish_community_post(uuid)',
    'execute'
  ) or has_function_privilege(
    'anon',
    'public.archive_community_post(uuid,text)',
    'execute'
  ) or has_function_privilege(
    'anon',
    'public.get_own_publish_quota(uuid)',
    'execute'
  ) then
    raise exception 'Anonymous can execute a community lifecycle RPC';
  end if;

  select pg_catalog.pg_get_functiondef(procedure.oid)
  into function_definition
  from pg_catalog.pg_proc procedure
  join pg_catalog.pg_namespace namespace
    on namespace.oid = procedure.pronamespace
  where namespace.nspname = 'public'
    and procedure.proname = 'publish_community_post';

  if position('community_publish:actor:' in function_definition) = 0
    or position('community_publish:workspace:' in function_definition) = 0
    or position('community_publish:actor:' in function_definition)
      > position('community_publish:workspace:' in function_definition)
    or position('community_post_publication_events' in function_definition) = 0 then
    raise exception 'Community publication concurrency boundary is incomplete';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"c1000000-0000-0000-0000-000000000007","role":"authenticated","email":"community-outsider@siapin.test"}',
  true
);

do $$
declare
  blocked boolean := false;
begin
  begin
    insert into public.community_posts (
      workspace_id,
      created_by,
      post_kind,
      title,
      body,
      author_display_name,
      workspace_display_name
    )
    values (
      'c2000000-0000-0000-0000-000000000001',
      'c1000000-0000-0000-0000-000000000007',
      'insight',
      'Foreign workspace post',
      'This post must be rejected by workspace authorization.',
      'Community Outsider',
      'Community Workspace A'
    );
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'Outsider created a community post in a foreign workspace';
  end if;
end;
$$;

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"c1000000-0000-0000-0000-000000000002","role":"authenticated","email":"community-manager-a@siapin.test"}',
  true
);

do $$
begin
  if (select auth.uid()) is distinct from
      'c1000000-0000-0000-0000-000000000002'::uuid then
    raise exception 'Manager JWT actor was not installed for community tests';
  end if;

  if not exists (
    select 1
    from public.get_my_workspace_access() access
    where access.workspace_id =
        'c2000000-0000-0000-0000-000000000001'::uuid
      and access.membership_status = 'active'
      and 'community_post.create' = any(access.permission_codes)
  ) then
    raise exception 'Manager public access context is missing active community_post.create';
  end if;
end;
$$;

do $$
declare
  draft_id uuid;
  collaboration_post_id uuid;
  published_post_id uuid;
  affected_rows integer;
  blocked boolean := false;
begin
  insert into public.community_posts (
    workspace_id,
    created_by,
    post_kind,
    title,
    body,
    author_display_name,
    workspace_display_name
  )
  values (
    'c2000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'insight',
    'Manager draft',
    'A valid community draft that remains editable before publication.',
    'Community Manager A',
    'Community Workspace A'
  )
  returning id into draft_id;

  perform set_config('test.community_manager_draft_id', draft_id::text, true);

  begin
    update public.community_posts
    set publication_status = 'published', published_at = now()
    where id = draft_id;
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'Authenticated directly updated community lifecycle columns';
  end if;

  insert into public.community_posts (
    workspace_id,
    created_by,
    post_kind,
    title,
    body,
    author_display_name,
    workspace_display_name
  )
  values (
    'c2000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'collaboration_request',
    'Distribution partner wanted',
    'We are explicitly looking for a distribution collaboration partner.',
    'Community Manager A',
    'Community Workspace A'
  )
  returning id into collaboration_post_id;

  insert into public.collaboration_requests (
    workspace_id,
    community_post_id,
    created_by,
    collaboration_kind,
    partner_expectation,
    proposed_contribution
  )
  values (
    'c2000000-0000-0000-0000-000000000001',
    collaboration_post_id,
    'c1000000-0000-0000-0000-000000000002',
    'distribution',
    'An established partner with responsible regional distribution coverage.',
    'We provide documented products and an explicit wholesale collaboration offer.'
  );

  insert into public.community_post_categories (
    workspace_id,
    community_post_id,
    category_id
  )
  select
    'c2000000-0000-0000-0000-000000000001',
    collaboration_post_id,
    category.id
  from public.business_categories category
  where category.active
  order by category.id
  limit 1;

  perform public.publish_community_post(collaboration_post_id);
  published_post_id := collaboration_post_id;
  perform set_config('test.community_published_post_id', published_post_id::text, true);

  insert into public.community_posts (
    workspace_id,
    created_by,
    post_kind,
    title,
    body,
    author_display_name,
    workspace_display_name
  )
  values (
    'c2000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'insight',
    'Manager self-archive contract',
    'This published post remains available for the inactive-member archive test.',
    'Community Manager A',
    'Community Workspace A'
  )
  returning id into published_post_id;
  perform public.publish_community_post(published_post_id);
  perform set_config(
    'test.community_manager_published_post_id',
    published_post_id::text,
    true
  );

  update public.community_posts
  set title = 'Changed after publication'
  where id = collaboration_post_id;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'Published community post content remained directly editable';
  end if;

  update public.collaboration_requests
  set partner_expectation = 'Changed after publication'
  where community_post_id = collaboration_post_id;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'Published collaboration request content remained editable';
  end if;

  delete from public.community_post_categories
  where community_post_id = collaboration_post_id;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'Published community post category remained deletable';
  end if;

  delete from public.community_posts where id = collaboration_post_id;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'Published community post remained directly deletable';
  end if;
end;
$$;

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"c1000000-0000-0000-0000-000000000001","role":"authenticated","email":"community-owner-a@siapin.test"}',
  true
);

do $$
declare
  published_post_id uuid := current_setting('test.community_published_post_id')::uuid;
begin
  if not exists (
    select 1
    from public.community_posts post
    where post.id = published_post_id
      and post.publication_status = 'published'
  ) then
    raise exception 'Owner could not read a published community post';
  end if;

  perform public.archive_community_post(
    published_post_id,
    'Workspace owner moderation contract'
  );

  if not exists (
    select 1
    from public.community_posts post
    where post.id = published_post_id
      and post.publication_status = 'archived'
      and post.archived_by = 'c1000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'Moderated archive did not preserve immutable actor evidence';
  end if;
end;
$$;

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"c1000000-0000-0000-0000-000000000002","role":"authenticated","email":"community-manager-a@siapin.test"}',
  true
);

do $$
declare
  owner_post_id uuid;
  blocked boolean := false;
begin
  if not exists (
    select 1
    from public.community_posts post
    where post.id = current_setting('test.community_published_post_id')::uuid
      and post.publication_status = 'archived'
  ) then
    raise exception 'Archived author lost read access while still active';
  end if;

  perform set_config(
    'request.jwt.claims',
    '{"sub":"c1000000-0000-0000-0000-000000000001","role":"authenticated","email":"community-owner-a@siapin.test"}',
    true
  );

  insert into public.community_posts (
    workspace_id,
    created_by,
    post_kind,
    title,
    body,
    author_display_name,
    workspace_display_name
  )
  values (
    'c2000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'insight',
    'Owner publication',
    'An owner-authored post used to verify manager moderation boundaries.',
    'Community Owner A',
    'Community Workspace A'
  )
  returning id into owner_post_id;
  perform public.publish_community_post(owner_post_id);

  perform set_config(
    'request.jwt.claims',
    '{"sub":"c1000000-0000-0000-0000-000000000002","role":"authenticated","email":"community-manager-a@siapin.test"}',
    true
  );

  begin
    perform public.archive_community_post(
      owner_post_id,
      'Manager must not moderate by default'
    );
  exception
    when insufficient_privilege then blocked := true;
  end;

  if not blocked then
    raise exception 'Manager received community moderation by default';
  end if;
end;
$$;

reset role;

-- Existing publications plus three distinct actors fill the workspace limit.
-- A sixth workspace publication from another actor is rejected.
set local role authenticated;
do $$
declare
  actor_ids uuid[] := array[
    'c1000000-0000-0000-0000-000000000001'::uuid,
    'c1000000-0000-0000-0000-000000000003'::uuid,
    'c1000000-0000-0000-0000-000000000004'::uuid,
    'c1000000-0000-0000-0000-000000000005'::uuid,
    'c1000000-0000-0000-0000-000000000006'::uuid
  ];
  actor_names text[] := array[
    'Community Owner A',
    'Community Manager B',
    'Community Manager C',
    'Community Manager D',
    'Community Manager E'
  ];
  actor_id uuid;
  post_id uuid;
  index_value integer;
  blocked boolean := false;
begin
  -- Manager A published two posts and Owner A published one post in this
  -- workspace. Two more distinct actors bring the total to five.
  for index_value in 2..3 loop
    actor_id := actor_ids[index_value];
    perform set_config(
      'request.jwt.claims',
      jsonb_build_object(
        'sub', actor_id,
        'role', 'authenticated'
      )::text,
      true
    );

    insert into public.community_posts (
      workspace_id,
      created_by,
      post_kind,
      title,
      body,
      author_display_name,
      workspace_display_name
    )
    values (
      'c2000000-0000-0000-0000-000000000001',
      actor_id,
      'insight',
      'Workspace rate contract ' || index_value,
      'A valid publication used to fill the workspace publication window.',
      actor_names[index_value],
      'Community Workspace A'
    )
    returning id into post_id;

    perform public.publish_community_post(post_id);
  end loop;

  actor_id := 'c1000000-0000-0000-0000-000000000005';
  perform set_config(
    'request.jwt.claims',
    jsonb_build_object('sub', actor_id, 'role', 'authenticated')::text,
    true
  );
  insert into public.community_posts (
    workspace_id,
    created_by,
    post_kind,
    title,
    body,
    author_display_name,
    workspace_display_name
  )
  values (
    'c2000000-0000-0000-0000-000000000001',
    actor_id,
    'insight',
    'Workspace rate rejected post',
    'This valid draft must be rejected by the workspace publication limit.',
    'Community Manager D',
    'Community Workspace A'
  )
  returning id into post_id;

  begin
    perform public.publish_community_post(post_id);
  exception
    when raise_exception then blocked := true;
  end;

  if not blocked then
    raise exception 'Workspace publication rate limit was bypassed';
  end if;
end;
$$;

reset role;

-- Owner A has one publication event so far. Four publications in workspace B
-- bring the actor count to five; the next publication must be rejected even
-- though workspace B still has capacity.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"c1000000-0000-0000-0000-000000000001","role":"authenticated","email":"community-owner-a@siapin.test"}',
  true
);

do $$
declare
  post_id uuid;
  sequence_value integer;
  blocked boolean := false;
begin
  for sequence_value in 1..4 loop
    insert into public.community_posts (
      workspace_id,
      created_by,
      post_kind,
      title,
      body,
      author_display_name,
      workspace_display_name
    )
    values (
      'c2000000-0000-0000-0000-000000000002',
      'c1000000-0000-0000-0000-000000000001',
      'insight',
      'Actor rate contract ' || sequence_value,
      'A valid publication used to fill the actor publication window.',
      'Community Owner A',
      'Community Workspace B'
    )
    returning id into post_id;
    perform public.publish_community_post(post_id);
  end loop;

  insert into public.community_posts (
    workspace_id,
    created_by,
    post_kind,
    title,
    body,
    author_display_name,
    workspace_display_name
  )
  values (
    'c2000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'insight',
    'Actor rate rejected post',
    'This valid draft must be rejected by the actor publication limit.',
    'Community Owner A',
    'Community Workspace B'
  )
  returning id into post_id;

  begin
    perform public.publish_community_post(post_id);
  exception
    when raise_exception then blocked := true;
  end;

  if not blocked then
    raise exception 'Actor publication rate limit was bypassed across workspaces';
  end if;
end;
$$;

reset role;

-- Suspending the author removes every write path, including RPC lifecycle
-- access to records that still retain created_by attribution.
update public.workspace_members
set status = 'suspended'
where workspace_id = 'c2000000-0000-0000-0000-000000000001'
  and user_id = 'c1000000-0000-0000-0000-000000000002';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"c1000000-0000-0000-0000-000000000002","role":"authenticated","email":"community-manager-a@siapin.test"}',
  true
);

do $$
declare
  affected_rows integer;
  blocked boolean := false;
begin
  update public.community_posts
  set title = 'Suspended edit attempt'
  where id = current_setting('test.community_manager_draft_id')::uuid;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'Suspended author edited an existing draft';
  end if;

  delete from public.community_posts
  where id = current_setting('test.community_manager_draft_id')::uuid;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'Suspended author deleted an existing draft';
  end if;

  begin
    perform public.publish_community_post(
      current_setting('test.community_manager_draft_id')::uuid
    );
  exception
    when insufficient_privilege then blocked := true;
  end;
  if not blocked then
    raise exception 'Suspended author published an existing draft';
  end if;

  blocked := false;
  begin
    perform public.archive_community_post(
      current_setting('test.community_manager_published_post_id')::uuid,
      null
    );
  exception
    when insufficient_privilege then blocked := true;
  end;
  if not blocked then
    raise exception 'Suspended author archived an existing post';
  end if;

  blocked := false;
  begin
    perform 1 from public.community_post_publication_events limit 1;
  exception
    when insufficient_privilege then blocked := true;
  end;
  if not blocked then
    raise exception 'Authenticated browser read publication events';
  end if;
end;
$$;

reset role;

select pass(
  'Community feed is opt-in, immutable, permission-bound, dual-rate-limited, and isolated from inactive or foreign actors'
);

select * from finish();

rollback;
