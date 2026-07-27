\set ON_ERROR_STOP on

begin;

select plan(1);

do $$
declare
  insecure_object text;
begin
  if has_schema_privilege('anon', 'private', 'usage')
    or has_schema_privilege('authenticated', 'private', 'usage') then
    raise exception 'A browser role can resolve objects in the private schema';
  end if;

  select format('%I.%I', table_schema, table_name)
  into insecure_object
  from information_schema.role_table_grants
  where grantee = 'anon'
    and table_schema = 'public'
  order by table_name
  limit 1;

  if insecure_object is not null then
    raise exception 'Anonymous table privilege leaked through %', insecure_object;
  end if;

  select format('%I.%I', namespace.nspname, procedure.proname)
  into insecure_object
  from pg_proc procedure
  join pg_namespace namespace on namespace.oid = procedure.pronamespace
  where namespace.nspname in ('public', 'private')
    and procedure.prosecdef
    and not exists (
      select 1
      from unnest(coalesce(procedure.proconfig, array[]::text[])) setting
      where setting in ('search_path=', 'search_path=""')
    )
  order by namespace.nspname, procedure.proname
  limit 1;

  if insecure_object is not null then
    raise exception
      'SECURITY DEFINER function % does not pin an empty search_path',
      insecure_object;
  end if;

  select format('%I.%I', namespace.nspname, relation.relname)
  into insecure_object
  from pg_class relation
  join pg_namespace namespace on namespace.oid = relation.relnamespace
  where namespace.nspname = 'public'
    and relation.relkind in ('r', 'p')
    and not relation.relrowsecurity
  order by relation.relname
  limit 1;

  if insecure_object is not null then
    raise exception 'Public table % does not enable RLS', insecure_object;
  end if;

  select format('%I.%I', namespace.nspname, relation.relname)
  into insecure_object
  from pg_class relation
  join pg_namespace namespace on namespace.oid = relation.relnamespace
  where namespace.nspname = 'public'
    and relation.relkind = 'v'
    and not coalesce(relation.reloptions, array[]::text[])
      @> array['security_invoker=true']
  order by relation.relname
  limit 1;

  if insecure_object is not null then
    raise exception 'Public view % does not enforce invoker security', insecure_object;
  end if;

  if has_function_privilege(
    'anon',
    'public.create_workspace(text,text)',
    'execute'
  ) or has_function_privilege(
    'anon',
    'public.accept_workspace_invitation(text)',
    'execute'
  ) or has_function_privilege(
    'anon',
    'public.transition_business_plan(uuid,public.business_plan_status,text)',
    'execute'
  ) or has_function_privilege(
    'anon',
    'public.get_system_health_snapshot(interval)',
    'execute'
  ) then
    raise exception 'Anonymous role can execute a sensitive application RPC';
  end if;

  if not has_function_privilege(
    'anon',
    'public.get_workspace_invitation_preview(text)',
    'execute'
  ) then
    raise exception 'Anonymous invitation preview capability was removed';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.get_system_health_snapshot(interval)',
    'execute'
  ) or has_function_privilege(
    'authenticated',
    'public.run_system_maintenance()',
    'execute'
  ) or has_function_privilege(
    'authenticated',
    'public.mark_email_delivery_processing(uuid)',
    'execute'
  ) or has_function_privilege(
    'authenticated',
    'public.mark_email_delivery_sent(uuid,text,text)',
    'execute'
  ) or has_function_privilege(
    'authenticated',
    'public.mark_email_delivery_failed(uuid,text)',
    'execute'
  ) then
    raise exception 'Authenticated can execute a service-role operation';
  end if;

  if has_table_privilege(
    'authenticated',
    'public.audit_logs',
    'insert,update,delete'
  ) or has_table_privilege(
    'authenticated',
    'public.workspace_achievements',
    'insert,update,delete'
  ) or has_table_privilege(
    'authenticated',
    'public.email_deliveries',
    'insert,update,delete'
  ) then
    raise exception 'Authenticated received direct mutation access to evidence or infrastructure state';
  end if;

  if has_column_privilege(
    'authenticated',
    'public.business_plans',
    'status',
    'update'
  ) or has_column_privilege(
    'authenticated',
    'public.business_reviews',
    'finalized_at',
    'update'
  ) or has_column_privilege(
    'authenticated',
    'public.notifications',
    'detail',
    'update'
  ) then
    raise exception 'Authenticated can directly mutate an RPC-only lifecycle column';
  end if;
end;
$$;

select pass('database security boundary contracts passed');
select * from finish();

rollback;
