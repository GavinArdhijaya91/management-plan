-- S1: selaraskan model izin member.manage dengan implementasi.
-- Sebelumnya Manager diberi permission member.manage di seed, tapi semua
-- alur undangan memakai require_workspace_owner (hardcode role owner).
-- Migrasi ini:
-- 1. Menambah helper require_member_manager() berbasis permission.
-- 2. Mengalihkan create/resend/cancel invitation ke permission check,
--    dengan guard: hanya owner yang boleh mengundang ke role owner.

create or replace function private.require_member_manager(target_workspace_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not private.has_workspace_permission(target_workspace_id, 'member.manage') then
    raise exception 'Member management permission required'
      using errcode = '42501', hint = 'MEMBER_MANAGE_REQUIRED';
  end if;

  return actor_id;
end;
$$;

revoke all on function private.require_member_manager(uuid)
from public, anon, authenticated;

comment on function private.require_member_manager(uuid) is
  'Permission-based gate for member invitation lifecycle (member.manage). Replaces hardcoded owner checks.';

-- Resend: owner-only -> member.manage. Menolak resend undangan role owner
-- bila pemanggil bukan owner (fail-closed terhadap eskalasi).
create or replace function private.resend_workspace_invitation_record(
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
  actor_is_owner boolean;
begin
  select * into invitation_record
  from public.workspace_invitations
  where id = target_invitation_id
  for update;

  if invitation_record.id is null then
    raise exception 'Invitation not found' using errcode = 'P0002';
  end if;

  perform private.require_member_manager(invitation_record.workspace_id);

  if invitation_record.status not in ('pending', 'expired') then
    raise exception 'Only pending or expired invitations can be resent'
      using errcode = '23514';
  end if;

  -- Guard: undangan menuju role owner hanya boleh di-resend oleh owner.
  select private.has_workspace_role(invitation_record.workspace_id, array['owner']::public.workspace_role[])
    into actor_is_owner;
  if invitation_record.role = 'owner' and not actor_is_owner then
    raise exception 'Only owners can manage owner invitations'
      using errcode = '42501', hint = 'OWNER_INVITATION_OWNER_ONLY';
  end if;

  if valid_for_days < 1 or valid_for_days > 30 then
    raise exception 'Invitation validity must be between 1 and 30 days'
      using errcode = '22023';
  end if;

  if invitation_record.last_resend_requested_at is not null
    and invitation_record.last_resend_requested_at > now() - interval '60 seconds' then
    raise exception 'Wait before resending this invitation again'
      using errcode = '55000',
      hint = 'Retry after the 60-second invitation resend cooldown.';
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
    last_resend_requested_at = now(),
    declined_at = null,
    revoked_at = null
  where id = invitation_record.id
  returning id, raw_token, expires_at;
end;
$$;

revoke all on function private.resend_workspace_invitation_record(uuid, integer)
from public, anon, authenticated;

comment on function private.resend_workspace_invitation_record(uuid, integer) is
  'Rotates a pending or expired invitation token gated by member.manage with a 60-second resend cooldown.';

-- Create: owner-only -> member.manage (owner-role invites tetap dilarang).
-- Sasaran yang benar adalah private.create_workspace_invitation_record,
-- tempat pemeriksaan owner hidup. Wrapper public (dengan email_delivery_id)
-- tidak berubah tanda tangannya.
create or replace function private.create_workspace_invitation_record(
  target_workspace_id uuid,
  invited_email text,
  target_workspace_role_id uuid,
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
  selected_role public.workspace_roles%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not private.has_workspace_permission(target_workspace_id, 'member.manage') then
    raise exception 'Member management permission required'
      using errcode = '42501', hint = 'MEMBER_MANAGE_REQUIRED';
  end if;

  select *
  into selected_role
  from public.workspace_roles
  where workspace_id = target_workspace_id
    and id = target_workspace_role_id;

  if selected_role.id is null or selected_role.is_owner_role then
    raise exception 'The selected workspace role cannot be invited'
      using errcode = '22023';
  end if;

  if not private.is_valid_email_address(normalized_email) then
    raise exception 'A valid invitation email is required' using errcode = '22023';
  end if;

  if valid_for_days < 1 or valid_for_days > 30 then
    raise exception 'Invitation validity must be between 1 and 30 days'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.workspace_members member
    join public.profiles profile on profile.user_id = member.user_id
    where member.workspace_id = target_workspace_id
      and lower(profile.email) = normalized_email
      and member.status = 'active'
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
      workspace_role_id,
      token_hash,
      invited_by,
      expires_at,
      delivery_status
    )
    values (
      target_workspace_id,
      normalized_email,
      selected_role.base_role,
      selected_role.id,
      encode(extensions.digest(raw_token, 'sha256'), 'hex'),
      actor_id,
      now() + make_interval(days => valid_for_days),
      'queued'
    )
    returning id, expires_at
  )
  select inserted.id, raw_token, inserted.expires_at
  from inserted;
end;
$$;

revoke all on function private.create_workspace_invitation_record(uuid, text, uuid, integer)
from public, anon, authenticated;

comment on function private.create_workspace_invitation_record(uuid, text, uuid, integer) is
  'Canonical invitation record creation gated by member.manage using named validation helpers for domain readability.';

-- Revoke: owner-only -> member.manage.
create or replace function public.revoke_workspace_invitation(invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_workspace_id uuid;
begin
  select workspace_id into target_workspace_id
  from public.workspace_invitations
  where id = invitation_id and status = 'pending'
  for update;

  if target_workspace_id is null
    or not private.has_workspace_permission(target_workspace_id, 'member.manage') then
    raise exception 'Invitation not found or permission denied'
      using errcode = '42501', hint = 'MEMBER_MANAGE_REQUIRED';
  end if;

  update public.workspace_invitations
  set status = 'revoked', revoked_at = now()
  where id = invitation_id;
end;
$$;

revoke all on function public.revoke_workspace_invitation(uuid) from public, anon;
grant execute on function public.revoke_workspace_invitation(uuid) to authenticated;
