create unique index workspace_members_single_active_owner_idx
  on public.workspace_members (workspace_id)
  where role = 'owner' and status = 'active';

drop policy if exists "members_insert_owner" on public.workspace_members;
drop policy if exists "members_update_owner" on public.workspace_members;
drop policy if exists "members_delete_owner" on public.workspace_members;
drop policy if exists "workspace_roles_insert_owner" on public.workspace_roles;
drop policy if exists "workspace_roles_update_owner" on public.workspace_roles;
drop policy if exists "workspace_roles_delete_owner" on public.workspace_roles;
drop policy if exists "role_permissions_insert_owner"
  on public.workspace_role_permissions;
drop policy if exists "role_permissions_delete_owner"
  on public.workspace_role_permissions;
drop policy if exists "invitations_delete_owner"
  on public.workspace_invitations;

create or replace function private.require_workspace_owner(target_workspace_id uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not private.has_workspace_role(
    target_workspace_id,
    array['owner']::public.workspace_role[]
  ) then
    raise exception 'Only the workspace owner can perform this action'
      using errcode = '42501';
  end if;

  return actor_id;
end;
$$;

revoke all on function private.require_workspace_owner(uuid)
from public, anon, authenticated;

create or replace function private.validate_permission_codes(permission_codes text[])
returns text[]
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_codes text[];
  unknown_codes text[];
begin
  select coalesce(array_agg(distinct code order by code), array[]::text[])
  into normalized_codes
  from unnest(coalesce(permission_codes, array[]::text[])) as code;

  select array_agg(code order by code)
  into unknown_codes
  from unnest(normalized_codes) as code
  where not exists (
    select 1
    from public.permission_definitions definition
    where definition.code = code
  );

  if cardinality(unknown_codes) > 0 then
    raise exception 'Unknown permission codes: %', array_to_string(unknown_codes, ', ')
      using errcode = '22023';
  end if;

  return normalized_codes;
end;
$$;

revoke all on function private.validate_permission_codes(text[])
from public, anon, authenticated;

create or replace function public.create_workspace_role(
  target_workspace_id uuid,
  role_name text,
  role_code text,
  role_description text,
  role_hierarchy_rank smallint,
  role_base_role public.workspace_role,
  permission_codes text[] default array[]::text[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  new_role_id uuid;
  normalized_permissions text[];
begin
  actor_id := private.require_workspace_owner(target_workspace_id);

  if role_base_role not in ('member', 'viewer') then
    raise exception 'Custom roles must use member or viewer as their compatibility tier'
      using errcode = '22023';
  end if;

  normalized_permissions := private.validate_permission_codes(permission_codes);

  insert into public.workspace_roles (
    workspace_id,
    code,
    name,
    description,
    hierarchy_rank,
    base_role,
    is_system,
    is_owner_role,
    created_by
  )
  values (
    target_workspace_id,
    lower(trim(role_code)),
    trim(role_name),
    nullif(trim(role_description), ''),
    role_hierarchy_rank,
    role_base_role,
    false,
    false,
    actor_id
  )
  returning id into new_role_id;

  insert into public.workspace_role_permissions (
    workspace_id,
    workspace_role_id,
    permission_code,
    granted_by
  )
  select target_workspace_id, new_role_id, code, actor_id
  from unnest(normalized_permissions) as code;

  return new_role_id;
end;
$$;

create or replace function public.update_workspace_role(
  target_workspace_role_id uuid,
  role_name text,
  role_description text,
  role_hierarchy_rank smallint,
  permission_codes text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  target_role public.workspace_roles%rowtype;
  normalized_permissions text[];
begin
  select * into target_role
  from public.workspace_roles
  where id = target_workspace_role_id
  for update;

  if target_role.id is null then
    raise exception 'Workspace role not found' using errcode = 'P0002';
  end if;

  actor_id := private.require_workspace_owner(target_role.workspace_id);

  if target_role.is_owner_role then
    raise exception 'The owner role is immutable' using errcode = '23514';
  end if;

  normalized_permissions := private.validate_permission_codes(permission_codes);

  update public.workspace_roles
  set
    name = trim(role_name),
    description = nullif(trim(role_description), ''),
    hierarchy_rank = role_hierarchy_rank
  where id = target_role.id;

  delete from public.workspace_role_permissions
  where workspace_role_id = target_role.id;

  insert into public.workspace_role_permissions (
    workspace_id,
    workspace_role_id,
    permission_code,
    granted_by
  )
  select target_role.workspace_id, target_role.id, code, actor_id
  from unnest(normalized_permissions) as code;
end;
$$;

create or replace function public.delete_workspace_role(target_workspace_role_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_role public.workspace_roles%rowtype;
begin
  select * into target_role
  from public.workspace_roles
  where id = target_workspace_role_id
  for update;

  if target_role.id is null then
    raise exception 'Workspace role not found' using errcode = 'P0002';
  end if;

  perform private.require_workspace_owner(target_role.workspace_id);

  if target_role.is_system then
    raise exception 'System roles cannot be deleted' using errcode = '23514';
  end if;

  if exists (
    select 1 from public.workspace_members
    where workspace_role_id = target_role.id
  ) then
    raise exception 'Move all members to another role before deleting this role'
      using errcode = '23503';
  end if;

  if exists (
    select 1 from public.workspace_invitations
    where workspace_role_id = target_role.id
      and status = 'pending'
  ) then
    raise exception 'Revoke pending invitations before deleting this role'
      using errcode = '23503';
  end if;

  delete from public.workspace_roles where id = target_role.id;
end;
$$;

create or replace function public.change_workspace_member_role(
  target_workspace_id uuid,
  target_user_id uuid,
  target_workspace_role_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_member public.workspace_members%rowtype;
  target_role public.workspace_roles%rowtype;
begin
  perform private.require_workspace_owner(target_workspace_id);

  select * into target_member
  from public.workspace_members
  where workspace_id = target_workspace_id
    and user_id = target_user_id
  for update;

  select * into target_role
  from public.workspace_roles
  where workspace_id = target_workspace_id
    and id = target_workspace_role_id;

  if target_member.user_id is null or target_role.id is null then
    raise exception 'Member or workspace role not found' using errcode = 'P0002';
  end if;

  if target_member.role = 'owner' or target_role.is_owner_role then
    raise exception 'Use ownership transfer for owner changes'
      using errcode = '23514';
  end if;

  update public.workspace_members
  set workspace_role_id = target_role.id
  where workspace_id = target_workspace_id
    and user_id = target_user_id;
end;
$$;

create or replace function public.set_workspace_member_status(
  target_workspace_id uuid,
  target_user_id uuid,
  target_status public.membership_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_member public.workspace_members%rowtype;
begin
  perform private.require_workspace_owner(target_workspace_id);

  select * into target_member
  from public.workspace_members
  where workspace_id = target_workspace_id
    and user_id = target_user_id
  for update;

  if target_member.user_id is null then
    raise exception 'Workspace member not found' using errcode = 'P0002';
  end if;

  if target_member.role = 'owner' then
    raise exception 'The owner cannot be suspended' using errcode = '23514';
  end if;

  update public.workspace_members
  set status = target_status
  where workspace_id = target_workspace_id
    and user_id = target_user_id;
end;
$$;

create or replace function public.remove_workspace_member(
  target_workspace_id uuid,
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_member public.workspace_members%rowtype;
begin
  perform private.require_workspace_owner(target_workspace_id);

  select * into target_member
  from public.workspace_members
  where workspace_id = target_workspace_id
    and user_id = target_user_id
  for update;

  if target_member.user_id is null then
    raise exception 'Workspace member not found' using errcode = 'P0002';
  end if;

  if target_member.role = 'owner' then
    raise exception 'Transfer ownership before removing the owner'
      using errcode = '23514';
  end if;

  delete from public.workspace_members
  where workspace_id = target_workspace_id
    and user_id = target_user_id;
end;
$$;

create or replace function public.transfer_workspace_ownership(
  target_workspace_id uuid,
  next_owner_user_id uuid,
  previous_owner_workspace_role_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  owner_role_id uuid;
  fallback_role public.workspace_roles%rowtype;
  next_owner public.workspace_members%rowtype;
begin
  actor_id := private.require_workspace_owner(target_workspace_id);

  if actor_id = next_owner_user_id then
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
    and user_id = actor_id;

  update public.workspace_members
  set
    workspace_role_id = owner_role_id,
    status = 'active'
  where workspace_id = target_workspace_id
    and user_id = next_owner_user_id;
end;
$$;

create or replace function public.resend_workspace_invitation(
  target_invitation_id uuid,
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
  invitation_record public.workspace_invitations%rowtype;
  raw_token text := encode(extensions.gen_random_bytes(32), 'hex');
begin
  select * into invitation_record
  from public.workspace_invitations
  where id = target_invitation_id
  for update;

  if invitation_record.id is null then
    raise exception 'Invitation not found' using errcode = 'P0002';
  end if;

  perform private.require_workspace_owner(invitation_record.workspace_id);

  if invitation_record.status not in ('pending', 'expired') then
    raise exception 'Only pending or expired invitations can be resent'
      using errcode = '23514';
  end if;

  if valid_for_days < 1 or valid_for_days > 30 then
    raise exception 'Invitation validity must be between 1 and 30 days'
      using errcode = '22023';
  end if;

  return query
  update public.workspace_invitations
  set
    status = 'pending',
    token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex'),
    expires_at = now() + make_interval(days => valid_for_days),
    delivery_status = 'queued',
    delivery_attempts = 0,
    delivery_error_code = null,
    last_sent_at = null,
    declined_at = null,
    revoked_at = null
  where id = invitation_record.id
  returning id, raw_token, expires_at;
end;
$$;

create or replace function private.expire_workspace_invitations()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_rows integer;
begin
  update public.workspace_invitations
  set status = 'expired'
  where status = 'pending'
    and expires_at <= now();

  get diagnostics affected_rows = row_count;
  return affected_rows;
end;
$$;

revoke all on function private.expire_workspace_invitations()
from public, anon, authenticated;

revoke all on function public.create_workspace_role(
  uuid,
  text,
  text,
  text,
  smallint,
  public.workspace_role,
  text[]
) from public, anon;
grant execute on function public.create_workspace_role(
  uuid,
  text,
  text,
  text,
  smallint,
  public.workspace_role,
  text[]
) to authenticated;

revoke all on function public.update_workspace_role(uuid, text, text, smallint, text[])
from public, anon;
grant execute on function public.update_workspace_role(uuid, text, text, smallint, text[])
to authenticated;

revoke all on function public.delete_workspace_role(uuid) from public, anon;
grant execute on function public.delete_workspace_role(uuid) to authenticated;
revoke all on function public.change_workspace_member_role(uuid, uuid, uuid)
from public, anon;
grant execute on function public.change_workspace_member_role(uuid, uuid, uuid)
to authenticated;
revoke all on function public.set_workspace_member_status(
  uuid,
  uuid,
  public.membership_status
) from public, anon;
grant execute on function public.set_workspace_member_status(
  uuid,
  uuid,
  public.membership_status
) to authenticated;
revoke all on function public.remove_workspace_member(uuid, uuid) from public, anon;
grant execute on function public.remove_workspace_member(uuid, uuid) to authenticated;
revoke all on function public.transfer_workspace_ownership(uuid, uuid, uuid)
from public, anon;
grant execute on function public.transfer_workspace_ownership(uuid, uuid, uuid)
to authenticated;
revoke all on function public.resend_workspace_invitation(uuid, integer)
from public, anon;
grant execute on function public.resend_workspace_invitation(uuid, integer)
to authenticated;

create trigger workspace_role_permissions_audit
after insert or update or delete on public.workspace_role_permissions
for each row execute function private.write_workspace_audit_log('workspace_role_permission');
