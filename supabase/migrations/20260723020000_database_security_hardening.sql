drop policy if exists "workspaces_insert_owner" on public.workspaces;
drop policy if exists "members_insert_owner" on public.workspace_members;
drop policy if exists "invitations_insert_manager" on public.workspace_invitations;
drop policy if exists "invitations_update_manager" on public.workspace_invitations;

create policy "members_insert_manager"
on public.workspace_members for insert to authenticated
with check (
  (
    private.has_workspace_role(
      workspace_id,
      array['owner']::public.workspace_role[]
    )
  )
  or
  (
    role in ('member', 'viewer')
    and private.has_workspace_role(
      workspace_id,
      array['manager']::public.workspace_role[]
    )
  )
);

alter table public.market_products
  add constraint market_products_workspace_id_id_key
    unique (workspace_id, id);

alter table public.market_snapshots
  drop constraint market_snapshots_product_id_fkey,
  add constraint market_snapshots_workspace_product_fkey
    foreign key (workspace_id, product_id)
    references public.market_products(workspace_id, id)
    on delete cascade;

create or replace function private.prevent_column_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  protected_column text;
begin
  foreach protected_column in array tg_argv
  loop
    if (to_jsonb(new) -> protected_column)
      is distinct from
      (to_jsonb(old) -> protected_column) then
      raise exception 'Column "%" cannot be changed', protected_column
        using errcode = '23514';
    end if;
  end loop;

  return new;
end;
$$;

revoke all on function private.prevent_column_changes() from public, anon, authenticated;

create or replace function private.enforce_profile_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  authentication_email text;
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'Profile user_id cannot be changed' using errcode = '23514';
  end if;

  select coalesce(email, '')
  into authentication_email
  from auth.users
  where id = new.user_id;

  if new.email is distinct from authentication_email then
    raise exception 'Profile email must match the authentication identity'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function private.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = coalesce(new.email, '')
  where user_id = new.id;

  return new;
end;
$$;

revoke all on function private.enforce_profile_identity() from public, anon, authenticated;
revoke all on function private.sync_profile_email() from public, anon, authenticated;

create trigger profiles_protect_identity
before update on public.profiles
for each row execute function private.enforce_profile_identity();

create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
when (old.email is distinct from new.email)
execute function private.sync_profile_email();

create trigger workspaces_protect_identity
before update on public.workspaces
for each row execute function private.prevent_column_changes('id', 'created_by');

create trigger workspace_members_protect_identity
before update on public.workspace_members
for each row execute function private.prevent_column_changes('workspace_id', 'user_id');

create trigger transactions_protect_identity
before update on public.transactions
for each row execute function private.prevent_column_changes('id', 'workspace_id', 'created_by');

create trigger calendar_events_protect_identity
before update on public.calendar_events
for each row execute function private.prevent_column_changes('id', 'workspace_id', 'created_by');

create trigger market_products_protect_identity
before update on public.market_products
for each row execute function private.prevent_column_changes('id', 'workspace_id', 'created_by');

create trigger market_snapshots_protect_identity
before update on public.market_snapshots
for each row execute function private.prevent_column_changes('id', 'workspace_id', 'created_by');

create trigger business_plans_protect_identity
before update on public.business_plans
for each row execute function private.prevent_column_changes('id', 'workspace_id', 'created_by');

create trigger business_goals_protect_identity
before update on public.business_goals
for each row execute function private.prevent_column_changes('id', 'workspace_id', 'created_by');

create trigger metric_definitions_protect_identity
before update on public.metric_definitions
for each row execute function private.prevent_column_changes('id', 'workspace_id', 'created_by');

create trigger goal_targets_protect_identity
before update on public.goal_targets
for each row execute function private.prevent_column_changes('id', 'workspace_id', 'created_by');

create trigger metric_measurements_protect_identity
before update on public.metric_measurements
for each row execute function private.prevent_column_changes('id', 'workspace_id', 'created_by');

create trigger business_initiatives_protect_identity
before update on public.business_initiatives
for each row execute function private.prevent_column_changes('id', 'workspace_id', 'created_by');

create trigger action_items_protect_identity
before update on public.action_items
for each row execute function private.prevent_column_changes('id', 'workspace_id', 'created_by');

create trigger business_reviews_protect_identity
before update on public.business_reviews
for each row execute function private.prevent_column_changes('id', 'workspace_id', 'reviewed_by');

create trigger business_partners_protect_identity
before update on public.business_partners
for each row execute function private.prevent_column_changes('id', 'workspace_id', 'created_by');

create or replace function private.enforce_active_workspace_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  workspace_value uuid;
  user_column text;
  user_value uuid;
begin
  workspace_value := (to_jsonb(new) ->> 'workspace_id')::uuid;

  foreach user_column in array tg_argv
  loop
    user_value := nullif(to_jsonb(new) ->> user_column, '')::uuid;

    if user_value is not null and not exists (
      select 1
      from public.workspace_members
      where workspace_id = workspace_value
        and user_id = user_value
        and status = 'active'
    ) then
      raise exception 'Column "%" must reference an active workspace member', user_column
        using errcode = '23503';
    end if;
  end loop;

  return new;
end;
$$;

revoke all on function private.enforce_active_workspace_users() from public, anon, authenticated;

create trigger business_plans_enforce_members
before insert or update of owner_id on public.business_plans
for each row execute function private.enforce_active_workspace_users('owner_id');

create trigger business_goals_enforce_members
before insert or update of owner_id on public.business_goals
for each row execute function private.enforce_active_workspace_users('owner_id');

create trigger business_initiatives_enforce_members
before insert or update of owner_id on public.business_initiatives
for each row execute function private.enforce_active_workspace_users('owner_id');

create trigger action_items_enforce_members
before insert or update of assignee_id on public.action_items
for each row execute function private.enforce_active_workspace_users('assignee_id');

create or replace function private.ensure_workspace_has_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_workspace_id uuid := old.workspace_id;
begin
  if exists (
    select 1 from public.workspaces where id = target_workspace_id
  ) and not exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and role = 'owner'
      and status = 'active'
  ) then
    raise exception 'A workspace must have at least one active owner'
      using errcode = '23514';
  end if;

  return null;
end;
$$;

revoke all on function private.ensure_workspace_has_owner() from public, anon, authenticated;

create constraint trigger workspace_members_require_owner
after delete or update of role, status on public.workspace_members
deferrable initially deferred
for each row execute function private.ensure_workspace_has_owner();

create or replace function public.create_workspace_invitation(
  target_workspace_id uuid,
  invited_email text,
  invited_role public.workspace_role default 'member',
  valid_for_days integer default 7
)
returns table (
  invitation_id uuid,
  invitation_token text,
  invitation_expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  normalized_email text := lower(trim(invited_email));
  raw_token text := encode(extensions.gen_random_bytes(32), 'hex');
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not private.has_workspace_role(
    target_workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  ) then
    raise exception 'Insufficient workspace permission' using errcode = '42501';
  end if;

  if invited_role = 'owner' then
    raise exception 'Owner access must be granted by an existing owner'
      using errcode = '23514';
  end if;

  if invited_role = 'manager' and not private.has_workspace_role(
    target_workspace_id,
    array['owner']::public.workspace_role[]
  ) then
    raise exception 'Only an owner can invite a manager' using errcode = '42501';
  end if;

  if normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'A valid invitation email is required' using errcode = '22023';
  end if;

  if valid_for_days < 1 or valid_for_days > 30 then
    raise exception 'Invitation validity must be between 1 and 30 days'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.workspace_members wm
    join public.profiles p on p.user_id = wm.user_id
    where wm.workspace_id = target_workspace_id
      and lower(p.email) = normalized_email
      and wm.status = 'active'
  ) then
    raise exception 'This user is already an active workspace member'
      using errcode = '23505';
  end if;

  return query
  with inserted as (
    insert into public.workspace_invitations (
      workspace_id,
      email,
      role,
      token_hash,
      invited_by,
      expires_at
    )
    values (
      target_workspace_id,
      normalized_email,
      invited_role,
      encode(extensions.digest(raw_token, 'sha256'), 'hex'),
      actor_id,
      now() + make_interval(days => valid_for_days)
    )
    returning id, expires_at
  )
  select inserted.id, raw_token, inserted.expires_at
  from inserted;
end;
$$;

create or replace function public.accept_workspace_invitation(invitation_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_email text;
  invitation_record public.workspace_invitations%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if char_length(invitation_token) <> 64 then
    raise exception 'Invalid or expired invitation' using errcode = '22023';
  end if;

  select lower(email)
  into actor_email
  from auth.users
  where id = actor_id;

  select *
  into invitation_record
  from public.workspace_invitations
  where token_hash = encode(extensions.digest(invitation_token, 'sha256'), 'hex')
    and status = 'pending'
  for update;

  if invitation_record.id is null
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
    status,
    joined_at
  )
  values (
    invitation_record.workspace_id,
    actor_id,
    invitation_record.role,
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

revoke all on function public.create_workspace_invitation(
  uuid,
  text,
  public.workspace_role,
  integer
) from public, anon;
grant execute on function public.create_workspace_invitation(
  uuid,
  text,
  public.workspace_role,
  integer
) to authenticated;

revoke all on function public.accept_workspace_invitation(text) from public, anon;
grant execute on function public.accept_workspace_invitation(text) to authenticated;

create or replace function private.write_workspace_audit_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  record_data jsonb;
  target_workspace_id uuid;
  target_entity_id uuid;
  target_user_id uuid;
begin
  record_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  target_workspace_id := nullif(record_data ->> 'workspace_id', '')::uuid;
  target_entity_id := nullif(record_data ->> 'id', '')::uuid;
  target_user_id := nullif(record_data ->> 'user_id', '')::uuid;

  insert into public.audit_logs (
    workspace_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    target_workspace_id,
    (select auth.uid()),
    lower(tg_op),
    tg_argv[0],
    coalesce(target_entity_id, target_user_id),
    jsonb_build_object('source', 'database_trigger')
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.write_workspace_audit_log() from public, anon, authenticated;

create trigger workspace_members_audit
after insert or update or delete on public.workspace_members
for each row execute function private.write_workspace_audit_log('workspace_member');
create trigger workspace_invitations_audit
after insert or update or delete on public.workspace_invitations
for each row execute function private.write_workspace_audit_log('workspace_invitation');
create trigger transactions_audit
after insert or update or delete on public.transactions
for each row execute function private.write_workspace_audit_log('transaction');
create trigger calendar_events_audit
after insert or update or delete on public.calendar_events
for each row execute function private.write_workspace_audit_log('calendar_event');
create trigger business_plans_audit
after insert or update or delete on public.business_plans
for each row execute function private.write_workspace_audit_log('business_plan');
create trigger business_goals_audit
after insert or update or delete on public.business_goals
for each row execute function private.write_workspace_audit_log('business_goal');
create trigger goal_targets_audit
after insert or update or delete on public.goal_targets
for each row execute function private.write_workspace_audit_log('goal_target');
create trigger metric_measurements_audit
after insert or update or delete on public.metric_measurements
for each row execute function private.write_workspace_audit_log('metric_measurement');
create trigger business_initiatives_audit
after insert or update or delete on public.business_initiatives
for each row execute function private.write_workspace_audit_log('business_initiative');
create trigger action_items_audit
after insert or update or delete on public.action_items
for each row execute function private.write_workspace_audit_log('action_item');
create trigger business_reviews_audit
after insert or update or delete on public.business_reviews
for each row execute function private.write_workspace_audit_log('business_review');
create trigger business_partners_audit
after insert or update or delete on public.business_partners
for each row execute function private.write_workspace_audit_log('business_partner');
