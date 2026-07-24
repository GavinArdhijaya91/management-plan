create table private.idempotency_records (
  actor_id uuid not null references auth.users(id) on delete cascade,
  operation_code text not null
    check (operation_code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  idempotency_key uuid not null,
  request_fingerprint text not null check (char_length(request_fingerprint) = 64),
  result_id uuid,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  primary key (actor_id, operation_code, idempotency_key),
  check (expires_at > created_at),
  check (
    (completed_at is null and result_id is null)
    or
    (completed_at is not null and result_id is not null)
  )
);

create index idempotency_records_expiry_idx
  on private.idempotency_records (expires_at);

comment on table private.idempotency_records is
  'Internal request deduplication records. These are transport safeguards, not business-domain entities.';

create or replace function public.create_workspace(
  workspace_name text,
  workspace_slug text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_actor_id uuid := (select auth.uid());
  normalized_name text := trim(workspace_name);
  normalized_slug text := lower(trim(workspace_slug));
  workspace_record public.workspaces%rowtype;
begin
  if current_actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  begin
    insert into public.workspaces (name, slug, created_by)
    values (normalized_name, normalized_slug, current_actor_id)
    returning * into workspace_record;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (workspace_record.id, current_actor_id, 'owner');
  exception
    when unique_violation then
      select * into workspace_record
      from public.workspaces
      where slug = normalized_slug;

      if workspace_record.id is null
        or workspace_record.created_by <> current_actor_id
        or workspace_record.name <> normalized_name then
        raise exception 'Workspace slug is already in use'
          using errcode = '23505';
      end if;
  end;

  return workspace_record.id;
end;
$$;

revoke all on function public.create_workspace(text, text) from public, anon;
grant execute on function public.create_workspace(text, text) to authenticated;

create or replace function public.accept_workspace_invitation(
  invitation_token text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_email text;
  actor_email_confirmed_at timestamptz;
  invitation_record public.workspace_invitations%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if char_length(invitation_token) <> 64 then
    raise exception 'Invalid or expired invitation' using errcode = '22023';
  end if;

  select lower(email), email_confirmed_at
  into actor_email, actor_email_confirmed_at
  from auth.users
  where id = actor_id;

  if actor_email_confirmed_at is null then
    raise exception 'Verify your email before accepting this invitation'
      using errcode = '42501';
  end if;

  select *
  into invitation_record
  from public.workspace_invitations
  where token_hash = encode(extensions.digest(invitation_token, 'sha256'), 'hex')
  for update;

  if invitation_record.status = 'accepted'
    and invitation_record.accepted_by = actor_id then
    return invitation_record.workspace_id;
  end if;

  if invitation_record.id is null
    or invitation_record.status <> 'pending'
    or invitation_record.expires_at <= now()
    or lower(invitation_record.email) <> actor_email then
    raise exception 'Invalid or expired invitation' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.workspace_members
    where workspace_id = invitation_record.workspace_id
      and user_id = actor_id
  ) then
    raise exception 'This user already belongs to the workspace'
      using errcode = '23505';
  end if;

  insert into public.workspace_members (
    workspace_id,
    user_id,
    role,
    workspace_role_id,
    status,
    joined_at
  )
  values (
    invitation_record.workspace_id,
    actor_id,
    invitation_record.role,
    invitation_record.workspace_role_id,
    'active',
    now()
  );

  update public.workspace_invitations
  set
    status = 'accepted',
    accepted_by = actor_id,
    accepted_at = now()
  where id = invitation_record.id;

  return invitation_record.workspace_id;
end;
$$;

revoke all on function public.accept_workspace_invitation(text)
from public, anon;
grant execute on function public.accept_workspace_invitation(text)
to authenticated;

create or replace function public.create_transaction(
  target_workspace_id uuid,
  transaction_type public.transaction_type,
  transaction_amount numeric,
  transaction_date date,
  idempotency_key uuid,
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
  if idempotency_key is null then
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
    idempotency_key,
    request_fingerprint
  )
  on conflict (actor_id, operation_code, idempotency_key) do nothing;

  select * into idempotency_record
  from private.idempotency_records record
  where record.actor_id = current_actor_id
    and record.operation_code = 'create_transaction'
    and record.idempotency_key = create_transaction.idempotency_key
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
    and record.idempotency_key = create_transaction.idempotency_key;

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

drop function public.transfer_workspace_ownership(uuid, uuid, uuid);

create or replace function public.transfer_workspace_ownership(
  target_workspace_id uuid,
  next_owner_user_id uuid,
  previous_owner_workspace_role_id uuid default null,
  idempotency_key uuid default null
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

  if idempotency_key is not null then
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
      idempotency_key,
      request_fingerprint
    )
    on conflict (actor_id, operation_code, idempotency_key) do nothing;

    select * into idempotency_record
    from private.idempotency_records record
    where record.actor_id = current_actor_id
      and record.operation_code = 'transfer_workspace_ownership'
      and record.idempotency_key = transfer_workspace_ownership.idempotency_key
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

  if idempotency_key is not null then
    update private.idempotency_records record
    set
      result_id = target_workspace_id,
      completed_at = now()
    where record.actor_id = current_actor_id
      and record.operation_code = 'transfer_workspace_ownership'
      and record.idempotency_key = transfer_workspace_ownership.idempotency_key;
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

create or replace function public.finalize_business_review(
  target_business_review_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  review_record public.business_reviews%rowtype;
begin
  select * into review_record
  from public.business_reviews
  where id = target_business_review_id
  for update;

  if review_record.id is null then
    raise exception 'Business review not found' using errcode = 'P0002';
  end if;
  if actor_id is null or not private.has_workspace_permission(
    review_record.workspace_id,
    'plan.write'
  ) then
    raise exception 'Not authorized to finalize this business review'
      using errcode = '42501';
  end if;
  if review_record.status = 'finalized' then
    return;
  end if;
  if review_record.status <> 'draft' then
    raise exception 'Only a draft business review can be finalized'
      using errcode = '23514';
  end if;

  perform private.refresh_business_review_snapshots(
    target_business_review_id,
    actor_id
  );

  update public.business_reviews
  set
    status = 'finalized',
    finalized_at = now()
  where id = target_business_review_id;

  perform private.evaluate_business_review_achievements(
    target_business_review_id
  );
end;
$$;

revoke all on function public.finalize_business_review(uuid)
from public, anon;
grant execute on function public.finalize_business_review(uuid)
to authenticated;

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
  'Creates one transaction per actor and idempotency key. Reuse with identical input returns the original transaction; reuse with different input is rejected.';

comment on function public.transfer_workspace_ownership(
  uuid,
  uuid,
  uuid,
  uuid
) is
  'Atomically transfers ownership. Supplying an idempotency key makes retries by the original owner return successfully after completion.';
