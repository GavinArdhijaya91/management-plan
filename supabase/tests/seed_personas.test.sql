\set ON_ERROR_STOP on

begin;

do $$
begin
  if (
    select count(*)
    from auth.users
    where id between
      'a1000000-0000-0000-0000-000000000001'
      and 'a1000000-0000-0000-0000-000000000007'
  ) <> 7 then
    raise exception 'Local seed does not contain all seven deterministic personas';
  end if;

  if (
    select count(*)
    from public.workspaces
    where slug in ('kedai-siapin-demo', 'studio-siapin-demo')
  ) <> 2 then
    raise exception 'Local seed does not contain both isolated workspaces';
  end if;

  if exists (
    select 1 from public.workspace_members
    where user_id = 'a1000000-0000-0000-0000-000000000006'
  ) then
    raise exception 'Outsider persona unexpectedly has a workspace membership';
  end if;

  if not exists (
    select 1
    from public.workspace_members member
    join public.workspaces workspace on workspace.id = member.workspace_id
    join public.workspace_roles role_record
      on role_record.id = member.workspace_role_id
     and role_record.workspace_id = member.workspace_id
    where workspace.slug = 'kedai-siapin-demo'
      and member.user_id = 'a1000000-0000-0000-0000-000000000005'
      and member.status = 'suspended'
      and role_record.code = 'member'
  ) then
    raise exception 'Suspended persona has an incorrect membership contract';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000002","role":"authenticated","email":"manager@siapin.local"}',
  true
);

do $$
begin
  if (select count(*) from public.workspaces) <> 1 then
    raise exception 'Manager persona can cross the seeded workspace boundary';
  end if;
  if exists (
    select 1 from public.transactions
    where note = 'Proyek desain workspace pembanding'
  ) then
    raise exception 'Manager persona can read the secondary workspace transaction';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000006","role":"authenticated","email":"outsider@siapin.local"}',
  true
);

do $$
begin
  if (select count(*) from public.workspaces) <> 0 then
    raise exception 'Outsider persona can read a seeded workspace';
  end if;
  if (select count(*) from public.transactions) <> 0 then
    raise exception 'Outsider persona can read seeded transactions';
  end if;
end;
$$;

rollback;
