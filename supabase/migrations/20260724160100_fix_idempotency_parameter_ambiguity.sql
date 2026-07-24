drop function public.create_transaction(
  uuid,
  public.transaction_type,
  numeric,
  date,
  uuid,
  numeric,
  text,
  uuid
);

create function public.create_transaction(
  target_workspace_id uuid,
  transaction_type public.transaction_type,
  transaction_amount numeric,
  transaction_date date,
  request_idempotency_key uuid,
  transaction_cost_amount numeric default 0,
  transaction_note text default null,
  target_financial_account_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_actor_id uuid := (select auth.uid());
  resolved_financial_account_id uuid;
  request_fingerprint text;
  idempotency_record private.idempotency_records%rowtype;
  new_transaction_id uuid;
begin
  if current_actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if request_idempotency_key is null then
    raise exception 'An idempotency key is required' using errcode = '22023';
  end if;
  if not private.has_workspace_permission(
    target_workspace_id,
    'transaction.write'
  ) then
    raise exception 'Transaction write permission required'
      using errcode = '42501';
  end if;

  if target_financial_account_id is null then
    select id into resolved_financial_account_id
    from public.financial_accounts
    where workspace_id = target_workspace_id
      and is_default
      and active;
  else
    select id into resolved_financial_account_id
    from public.financial_accounts
    where workspace_id = target_workspace_id
      and id = target_financial_account_id
      and active;
  end if;

  if resolved_financial_account_id is null then
    raise exception 'An active financial account is required'
      using errcode = '23503';
  end if;

  request_fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'workspace_id', target_workspace_id,
        'type', transaction_type,
        'amount', transaction_amount,
        'cost_amount', transaction_cost_amount,
        'transaction_date', transaction_date,
        'note', nullif(trim(transaction_note), ''),
        'financial_account_id', resolved_financial_account_id
      )::text,
      'sha256'
    ),
    'hex'
  );

  insert into private.idempotency_records (
    actor_id,
    operation_code,
    idempotency_key,
    request_fingerprint
  )
  values (
    current_actor_id,
    'create_transaction',
    request_idempotency_key,
    request_fingerprint
  )
  on conflict on constraint idempotency_records_pkey do nothing;

  select * into idempotency_record
  from private.idempotency_records record
  where record.actor_id = current_actor_id
    and record.operation_code = 'create_transaction'
    and record.idempotency_key = request_idempotency_key
  for update;

  if idempotency_record.request_fingerprint <> request_fingerprint then
    raise exception 'Idempotency key was reused with a different request'
      using errcode = '22023';
  end if;
  if idempotency_record.completed_at is not null then
    return idempotency_record.result_id;
  end if;

  insert into public.transactions (
    workspace_id,
    created_by,
    type,
    amount,
    cost_amount,
    transaction_date,
    note,
    financial_account_id
  )
  values (
    target_workspace_id,
    current_actor_id,
    transaction_type,
    transaction_amount,
    transaction_cost_amount,
    transaction_date,
    nullif(trim(transaction_note), ''),
    resolved_financial_account_id
  )
  returning id into new_transaction_id;

  update private.idempotency_records record
  set
    result_id = new_transaction_id,
    completed_at = now()
  where record.actor_id = current_actor_id
    and record.operation_code = 'create_transaction'
    and record.idempotency_key = request_idempotency_key;

  return new_transaction_id;
end;
$$;

revoke all on function public.create_transaction(
  uuid,
  public.transaction_type,
  numeric,
  date,
  uuid,
  numeric,
  text,
  uuid
) from public, anon;
grant execute on function public.create_transaction(
  uuid,
  public.transaction_type,
  numeric,
  date,
  uuid,
  numeric,
  text,
  uuid
) to authenticated;

drop function public.transfer_workspace_ownership(uuid, uuid, uuid, uuid);

create function public.transfer_workspace_ownership(
  target_workspace_id uuid,
  next_owner_user_id uuid,
  previous_owner_workspace_role_id uuid default null,
  request_idempotency_key uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_actor_id uuid := (select auth.uid());
  owner_role_id uuid;
  fallback_role public.workspace_roles%rowtype;
  next_owner public.workspace_members%rowtype;
  request_fingerprint text;
  idempotency_record private.idempotency_records%rowtype;
begin
  if current_actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if request_idempotency_key is not null then
    request_fingerprint := encode(
      extensions.digest(
        jsonb_build_object(
          'workspace_id', target_workspace_id,
          'next_owner_user_id', next_owner_user_id,
          'previous_owner_workspace_role_id', previous_owner_workspace_role_id
        )::text,
        'sha256'
      ),
      'hex'
    );

    insert into private.idempotency_records (
      actor_id,
      operation_code,
      idempotency_key,
      request_fingerprint
    )
    values (
      current_actor_id,
      'transfer_workspace_ownership',
      request_idempotency_key,
      request_fingerprint
    )
    on conflict on constraint idempotency_records_pkey do nothing;

    select * into idempotency_record
    from private.idempotency_records record
    where record.actor_id = current_actor_id
      and record.operation_code = 'transfer_workspace_ownership'
      and record.idempotency_key = request_idempotency_key
    for update;

    if idempotency_record.request_fingerprint <> request_fingerprint then
      raise exception 'Idempotency key was reused with a different request'
        using errcode = '22023';
    end if;
    if idempotency_record.completed_at is not null then
      return;
    end if;
  end if;

  perform private.require_workspace_owner(target_workspace_id);

  if current_actor_id = next_owner_user_id then
    raise exception 'The selected member is already the owner'
      using errcode = '22023';
  end if;

  perform 1
  from public.workspace_members
  where workspace_id = target_workspace_id
  order by user_id
  for update;

  select * into next_owner
  from public.workspace_members
  where workspace_id = target_workspace_id
    and user_id = next_owner_user_id
    and status = 'active';

  if next_owner.user_id is null then
    raise exception 'The next owner must be an active workspace member'
      using errcode = '23503';
  end if;

  select id into owner_role_id
  from public.workspace_roles
  where workspace_id = target_workspace_id
    and is_owner_role;

  if previous_owner_workspace_role_id is null then
    select * into fallback_role
    from public.workspace_roles
    where workspace_id = target_workspace_id
      and code = 'manager'
      and is_system;
  else
    select * into fallback_role
    from public.workspace_roles
    where workspace_id = target_workspace_id
      and id = previous_owner_workspace_role_id
      and not is_owner_role;
  end if;

  if owner_role_id is null or fallback_role.id is null then
    raise exception 'Owner or fallback role is not configured'
      using errcode = '23503';
  end if;

  update public.workspace_members
  set workspace_role_id = fallback_role.id
  where workspace_id = target_workspace_id
    and user_id = current_actor_id;

  update public.workspace_members
  set
    workspace_role_id = owner_role_id,
    status = 'active'
  where workspace_id = target_workspace_id
    and user_id = next_owner_user_id;

  if request_idempotency_key is not null then
    update private.idempotency_records record
    set
      result_id = target_workspace_id,
      completed_at = now()
    where record.actor_id = current_actor_id
      and record.operation_code = 'transfer_workspace_ownership'
      and record.idempotency_key = request_idempotency_key;
  end if;
end;
$$;

revoke all on function public.transfer_workspace_ownership(
  uuid,
  uuid,
  uuid,
  uuid
) from public, anon;
grant execute on function public.transfer_workspace_ownership(
  uuid,
  uuid,
  uuid,
  uuid
) to authenticated;

comment on function public.create_transaction(
  uuid,
  public.transaction_type,
  numeric,
  date,
  uuid,
  numeric,
  text,
  uuid
) is
  'Creates one transaction per actor and request idempotency key. Identical retries return the original transaction and payload mismatches are rejected.';

comment on function public.transfer_workspace_ownership(
  uuid,
  uuid,
  uuid,
  uuid
) is
  'Atomically transfers ownership. A request idempotency key lets the original owner safely retry after completion.';
