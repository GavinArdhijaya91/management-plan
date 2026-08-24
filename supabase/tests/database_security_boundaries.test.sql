\set ON_ERROR_STOP on

begin;

select plan(1);

do $$
declare
  insecure_object text;
  actual_authenticated_definer_functions text[];
  expected_authenticated_definer_functions constant text[] := array[
    'accept_workspace_invitation(invitation_token text)',
    'archive_community_post(target_community_post_id uuid, reason text)',
    'cancel_workspace_deletion(target_deletion_request_id uuid)',
    'change_workspace_member_role(target_workspace_id uuid, target_user_id uuid, target_workspace_role_id uuid)',
    'create_chat_channel(target_workspace_id uuid, channel_name text, channel_slug text, channel_visibility chat_channel_visibility, channel_description text)',
    'create_transaction(target_workspace_id uuid, transaction_type transaction_type, transaction_amount numeric, transaction_date date, request_idempotency_key uuid, transaction_cost_amount numeric, transaction_note text, target_financial_account_id uuid)',
    'create_workspace(workspace_name text, workspace_slug text)',
    'create_workspace_invitation(target_workspace_id uuid, invited_email text, target_workspace_role_id uuid, valid_for_days integer)',
    'create_workspace_role(target_workspace_id uuid, role_name text, role_code text, role_description text, role_hierarchy_rank smallint, role_base_role workspace_role, permission_codes text[])',
    'decline_workspace_invitation(invitation_token text)',
    'delete_chat_message(target_message_id uuid)',
    'delete_workspace_role(target_workspace_role_id uuid)',
    'edit_chat_message(target_message_id uuid, message_body text)',
    'execute_workspace_deletion(target_deletion_request_id uuid, confirmation_workspace_name text)',
    'finalize_business_review(target_business_review_id uuid, acknowledge_warnings boolean)',
    'generate_my_workspace_reminders(target_workspace_id uuid, reference_time timestamp with time zone)',
    'get_business_review_readiness(target_business_review_id uuid)',
    'get_chat_unread_counts(target_workspace_id uuid)',
    'get_my_workspace_access()',
    'get_own_publish_quota(target_workspace_id uuid)',
    'get_public_business_portfolio(requested_public_slug text)',
    'get_workspace_invitation_preview(invitation_token text)',
    'get_workspace_member_directory(target_workspace_id uuid)',
    'mark_all_notifications_read(target_workspace_id uuid)',
    'mark_chat_conversation_read(target_conversation_id uuid, delivered_through timestamp with time zone, read_through timestamp with time zone)',
    'mark_notification_read(target_notification_id uuid)',
    'orchestrate_my_workspace_notifications(target_workspace_id uuid, reference_time timestamp with time zone)',
    'prepare_transaction_export(target_workspace_id uuid, target_format text, period_start date, period_end date)',
    'publish_business_portfolio(target_business_portfolio_id uuid, requested_public_slug text, should_publish boolean)',
    'publish_community_post(target_community_post_id uuid)',
    'refresh_business_review_snapshots(target_business_review_id uuid)',
    'register_chat_attachment(target_message_id uuid, target_object_path text, target_original_file_name text, target_media_type text, target_byte_size bigint)',
    'remove_workspace_member(target_workspace_id uuid, target_user_id uuid)',
    'request_workspace_deletion(target_workspace_id uuid, confirmation_workspace_name text)',
    'resend_workspace_invitation(target_invitation_id uuid, valid_for_days integer)',
    'revoke_workspace_invitation(invitation_id uuid)',
    'send_chat_message(target_conversation_id uuid, message_body text, request_id uuid, reply_to_id uuid, mentioned_user_ids uuid[])',
    'set_chat_conversation_membership(target_conversation_id uuid, target_user_id uuid, should_join boolean)',
    'set_planning_record_archived(target_record_type planning_record_type, target_record_id uuid, should_archive boolean)',
    'set_workspace_member_status(target_workspace_id uuid, target_user_id uuid, target_status membership_status)',
    'start_direct_chat(target_workspace_id uuid, target_user_id uuid)',
    'toggle_chat_message_reaction(target_message_id uuid, reaction_emoji text)',
    'transfer_workspace_ownership(target_workspace_id uuid, next_owner_user_id uuid, previous_owner_workspace_role_id uuid, request_idempotency_key uuid)',
    'transition_action_item(target_action_item_id uuid, target_status action_item_status, transition_reason text)',
    'transition_business_goal(target_business_goal_id uuid, target_status business_goal_status, transition_reason text, replacement_target_date date)',
    'transition_business_initiative(target_business_initiative_id uuid, target_status business_initiative_status, transition_reason text)',
    'transition_business_plan(target_business_plan_id uuid, target_status business_plan_status, transition_reason text)',
    'update_workspace_role(target_workspace_role_id uuid, role_name text, role_description text, role_hierarchy_rank smallint, permission_codes text[])'
  ];
begin
  if has_schema_privilege('anon', 'private', 'usage')
    or has_schema_privilege('authenticated', 'private', 'usage') then
    raise exception 'A browser role can resolve objects in the private schema';
  end if;

  if not has_function_privilege(
    'authenticated',
    'private.is_workspace_member(uuid)',
    'execute'
  ) or not has_function_privilege(
    'authenticated',
    'private.has_workspace_permission(uuid,text)',
    'execute'
  ) or not has_function_privilege(
    'authenticated',
    'private.can_read_business_plan(uuid)',
    'execute'
  ) then
    raise exception 'Authenticated cannot evaluate a required RLS predicate';
  end if;

  if has_function_privilege(
    'anon',
    'private.is_workspace_member(uuid)',
    'execute'
  ) or has_function_privilege(
    'anon',
    'private.has_workspace_permission(uuid,text)',
    'execute'
  ) or has_function_privilege(
    'anon',
    'private.can_read_business_plan(uuid)',
    'execute'
  ) then
    raise exception 'Anonymous role can execute a private RLS predicate';
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

  select format(
    '%I.%I(%s)',
    namespace.nspname,
    procedure.proname,
    pg_get_function_identity_arguments(procedure.oid)
  )
  into insecure_object
  from pg_proc procedure
  join pg_namespace namespace on namespace.oid = procedure.pronamespace
  where namespace.nspname = 'public'
    and procedure.prosecdef
    and has_function_privilege('anon', procedure.oid, 'execute')
    and not (
      (
        procedure.proname = 'get_workspace_invitation_preview'
        and pg_get_function_identity_arguments(procedure.oid) =
          'invitation_token text'
      )
      or (
        procedure.proname = 'get_public_business_portfolio'
        and pg_get_function_identity_arguments(procedure.oid) =
          'requested_public_slug text'
      )
    )
  order by procedure.proname, procedure.oid
  limit 1;

  if insecure_object is not null then
    raise exception
      'Anonymous role can execute SECURITY DEFINER function %',
      insecure_object;
  end if;

  if not has_function_privilege(
    'anon',
    'public.get_workspace_invitation_preview(text)',
    'execute'
  ) then
    raise exception 'Anonymous invitation preview capability was removed';
  end if;

  if not has_function_privilege(
    'anon',
    'public.get_public_business_portfolio(text)',
    'execute'
  ) then
    raise exception 'Anonymous public portfolio capability was removed';
  end if;

  select coalesce(
    array_agg(
      format(
        '%I(%s)',
        procedure.proname,
        -- PostgreSQL omits a type's schema when it is visible in the
        -- session search_path. Normalize public types so CI and linked
        -- Advisor sessions compare the same identity signature.
        regexp_replace(
          pg_get_function_identity_arguments(procedure.oid),
          'public\.',
          '',
          'g'
        )
      )
      order by procedure.proname, pg_get_function_identity_arguments(procedure.oid)
    ),
    array[]::text[]
  )
  into actual_authenticated_definer_functions
  from pg_proc procedure
  join pg_namespace namespace on namespace.oid = procedure.pronamespace
  where namespace.nspname = 'public'
    and procedure.prosecdef
    and has_function_privilege('authenticated', procedure.oid, 'execute');

  if actual_authenticated_definer_functions is distinct from
    expected_authenticated_definer_functions then
    raise exception E'Authenticated SECURITY DEFINER allowlist changed.\nExpected: %\nActual: %',
      expected_authenticated_definer_functions,
      actual_authenticated_definer_functions;
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

  if has_table_privilege(
    'authenticated',
    'public.transactions',
    'insert'
  ) then
    raise exception 'Authenticated can bypass idempotent transaction creation';
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
  ) or has_column_privilege(
    'authenticated',
    'public.notifications',
    'read_at',
    'update'
  ) then
    raise exception 'Authenticated can directly mutate an RPC-only lifecycle column';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.mark_notification_read(uuid)',
    'execute'
  ) or not has_function_privilege(
    'authenticated',
    'public.mark_all_notifications_read(uuid)',
    'execute'
  ) then
    raise exception 'Authenticated lost the canonical notification-state RPC';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.prepare_transaction_export(uuid,text,date,date)',
    'execute'
  ) or has_function_privilege(
    'anon',
    'public.prepare_transaction_export(uuid,text,date,date)',
    'execute'
  ) then
    raise exception 'Transaction export RPC execution boundary is invalid';
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and cmd = 'UPDATE'
  ) then
    raise exception 'Notifications retained a direct UPDATE policy outside the RPC boundary';
  end if;
end;
$$;

select pass('database security boundary contracts passed');
select * from finish();

rollback;
