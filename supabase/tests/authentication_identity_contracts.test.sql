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
values (
  'aa000000-0000-0000-0000-000000000001',
  'identity-contract@siapin.test',
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('full_name', repeat('A', 200)),
  now(),
  now(),
  now()
);

do $$
begin
  if not exists (
    select 1
    from public.profiles
    where user_id = 'aa000000-0000-0000-0000-000000000001'
      and char_length(full_name) = 100
      and char_length(display_name) = 50
      and email = 'identity-contract@siapin.test'
  ) then
    raise exception 'Auth identity did not provision a bounded profile';
  end if;

  if not exists (
    select 1
    from public.profile_preferences
    where user_id = 'aa000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'Auth identity did not provision default profile preferences';
  end if;

  if exists (
    select 1
    from public.workspace_members
    where user_id = 'aa000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'Auth identity received an implicit workspace membership';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"aa000000-0000-0000-0000-000000000001","role":"authenticated","email":"identity-contract@siapin.test"}',
  true
);

do $$
declare
  identity_update_blocked boolean := false;
begin
  if (select count(*) from public.profiles) <> 1 then
    raise exception 'Authenticated identity can read another user profile';
  end if;

  if (select count(*) from public.profile_preferences) <> 1 then
    raise exception 'Authenticated identity can read another user preferences';
  end if;

  if exists (select 1 from public.workspaces) then
    raise exception 'Authenticated identity without membership can read a workspace';
  end if;

  begin
    update public.profiles
    set email = 'forged-identity@siapin.test'
    where user_id = 'aa000000-0000-0000-0000-000000000001';
  exception
    when check_violation then identity_update_blocked := true;
  end;

  if not identity_update_blocked then
    raise exception 'Authenticated identity changed its authentication-owned email';
  end if;
end;
$$;

reset role;

select pass('authentication identity provisioning and isolation contracts passed');
select * from finish();

rollback;
