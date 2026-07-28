\set ON_ERROR_STOP on

begin;

select plan(1);

do $$
begin
  if (
    select count(*)
    from storage.buckets
    where id in ('avatars', 'workspace-logos', 'workspace-branding')
      and public
      and allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
      and file_size_limit = case id
        when 'workspace-branding' then 5242880
        else 2097152
      end
  ) <> 3 then
    raise exception 'Storage bucket security configuration drifted';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@siapin.local"}',
  true
);

do $$
declare
  primary_workspace_id uuid;
  secondary_workspace_id uuid;
  blocked boolean;
begin
  select id into primary_workspace_id
  from public.workspaces
  where slug = 'kedai-siapin-demo';

  select id into secondary_workspace_id
  from public.workspaces
  where slug = 'studio-siapin-demo';

  insert into storage.objects (bucket_id, name, owner_id)
  values (
    'avatars',
    'a1000000-0000-0000-0000-000000000001/avatar.webp',
    'a1000000-0000-0000-0000-000000000001'
  );

  blocked := false;
  begin
    update storage.objects
    set owner_id = 'a1000000-0000-0000-0000-000000000006'
    where bucket_id = 'avatars'
      and name = 'a1000000-0000-0000-0000-000000000001/avatar.webp';
  exception
    when insufficient_privilege or check_violation then blocked := true;
  end;
  if not blocked then
    raise exception 'Authenticated user forged avatar object ownership during update';
  end if;

  blocked := false;
  begin
    insert into storage.objects (bucket_id, name, owner_id)
    values (
      'avatars',
      'a1000000-0000-0000-0000-000000000006/forged.webp',
      'a1000000-0000-0000-0000-000000000001'
    );
  exception
    when insufficient_privilege or check_violation then blocked := true;
  end;
  if not blocked then
    raise exception 'Authenticated user uploaded an avatar into another identity folder';
  end if;

  blocked := false;
  begin
    insert into storage.objects (bucket_id, name, owner_id)
    values (
      'avatars',
      'a1000000-0000-0000-0000-000000000001/forged-owner.webp',
      'a1000000-0000-0000-0000-000000000006'
    );
  exception
    when insufficient_privilege or check_violation then blocked := true;
  end;
  if not blocked then
    raise exception 'Authenticated user forged storage object ownership';
  end if;

  insert into storage.objects (bucket_id, name, owner_id)
  values (
    'workspace-logos',
    primary_workspace_id::text || '/logo.webp',
    'a1000000-0000-0000-0000-000000000001'
  );

  insert into storage.objects (bucket_id, name, owner_id)
  values (
    'workspace-branding',
    primary_workspace_id::text || '/banner.webp',
    'a1000000-0000-0000-0000-000000000001'
  );

  update public.profiles
  set avatar_path = 'a1000000-0000-0000-0000-000000000001/avatar.webp'
  where user_id = 'a1000000-0000-0000-0000-000000000001';

  blocked := false;
  begin
    update public.profiles
    set avatar_path = 'a1000000-0000-0000-0000-000000000006/avatar.webp'
    where user_id = 'a1000000-0000-0000-0000-000000000001';
  exception
    when check_violation then blocked := true;
  end;
  if not blocked then
    raise exception 'Profile referenced another identity avatar';
  end if;

  update public.workspaces
  set
    logo_path = primary_workspace_id::text || '/logo.webp',
    banner_path = primary_workspace_id::text || '/banner.webp'
  where id = primary_workspace_id;

  blocked := false;
  begin
    update public.workspaces
    set logo_path = secondary_workspace_id::text || '/logo.webp'
    where id = primary_workspace_id;
  exception
    when check_violation then blocked := true;
  end;
  if not blocked then
    raise exception 'Workspace referenced another workspace asset';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000002","role":"authenticated","email":"manager@siapin.local"}',
  true
);

do $$
declare
  primary_workspace_id uuid;
  blocked boolean := false;
begin
  select id into primary_workspace_id
  from public.workspaces
  where slug = 'kedai-siapin-demo';

  if exists (
    select 1
    from storage.objects
    where bucket_id = 'avatars'
      and name = 'a1000000-0000-0000-0000-000000000001/avatar.webp'
  ) then
    raise exception 'Manager read another identity avatar metadata';
  end if;

  insert into storage.objects (bucket_id, name, owner_id)
  values (
    'workspace-logos',
    primary_workspace_id::text || '/manager-logo.webp',
    'a1000000-0000-0000-0000-000000000002'
  );

  begin
    insert into storage.objects (bucket_id, name, owner_id)
    values (
      'workspace-branding',
      primary_workspace_id::text || '/manager-banner.webp',
      'a1000000-0000-0000-0000-000000000002'
    );
  exception
    when insufficient_privilege or check_violation then blocked := true;
  end;
  if not blocked then
    raise exception 'Manager received owner-only workspace branding access';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000007","role":"authenticated","email":"other-owner@siapin.local"}',
  true
);

do $$
declare
  primary_workspace_id uuid;
  blocked boolean := false;
begin
  select id into primary_workspace_id
  from public.workspaces
  where slug = 'kedai-siapin-demo';

  begin
    insert into storage.objects (bucket_id, name, owner_id)
    values (
      'workspace-logos',
      primary_workspace_id::text || '/foreign-owner-logo.webp',
      'a1000000-0000-0000-0000-000000000007'
    );
  exception
    when insufficient_privilege or check_violation then blocked := true;
  end;
  if not blocked then
    raise exception 'Foreign workspace owner crossed the storage tenant boundary';
  end if;
end;
$$;

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
declare
  blocked boolean := false;
begin
  begin
    insert into storage.objects (bucket_id, name)
    values ('avatars', 'anonymous/avatar.webp');
  exception
    when insufficient_privilege or check_violation then blocked := true;
  end;
  if not blocked then
    raise exception 'Anonymous role received storage write access';
  end if;
end;
$$;

reset role;

select pass('storage asset authorization and integrity contracts passed');
select * from finish();

rollback;
