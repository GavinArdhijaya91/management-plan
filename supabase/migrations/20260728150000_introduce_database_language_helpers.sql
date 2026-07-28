create function private.is_valid_email_address(candidate_email text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    trim(candidate_email) ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$',
    false
  );
$$;

revoke all on function private.is_valid_email_address(text)
from public, anon, authenticated;

comment on function private.is_valid_email_address(text) is
  'Readable helper for a basic local-part@domain.tld shape without whitespace. Auth confirmation, not this regex, proves mailbox ownership.';

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

  if not private.has_workspace_role(
    target_workspace_id,
    array['owner']::public.workspace_role[]
  ) then
    raise exception 'Only the workspace owner can send role invitations'
      using errcode = '42501';
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
    raise exception 'A valid invitation email is required'
      using errcode = '22023';
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

revoke all on function private.create_workspace_invitation_record(
  uuid,
  text,
  uuid,
  integer
) from public, anon, authenticated;

comment on function private.create_workspace_invitation_record(
  uuid,
  text,
  uuid,
  integer
) is
  'Owner-only canonical invitation record creation using named validation helpers for domain readability.';
