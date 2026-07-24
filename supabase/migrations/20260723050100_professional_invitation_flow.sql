create type public.invitation_delivery_status as enum (
  'not_sent',
  'queued',
  'sent',
  'failed'
);

alter table public.workspaces
  add column banner_path text,
  add column brand_primary_color text not null default '#18181B',
  add column brand_accent_color text not null default '#84CC16',
  add constraint workspaces_banner_path_check
    check (banner_path is null or char_length(banner_path) <= 500),
  add constraint workspaces_brand_primary_color_check
    check (brand_primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  add constraint workspaces_brand_accent_color_check
    check (brand_accent_color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.workspace_invitations
  add column delivery_status public.invitation_delivery_status not null default 'not_sent',
  add column delivery_attempts smallint not null default 0
    check (delivery_attempts between 0 and 20),
  add column last_sent_at timestamptz,
  add column delivery_error_code text
    check (delivery_error_code is null or char_length(delivery_error_code) <= 100),
  add column declined_at timestamptz,
  add column revoked_at timestamptz,
  add constraint workspace_invitations_declined_check check (
    (status = 'declined' and declined_at is not null)
    or
    (status <> 'declined' and declined_at is null)
  ),
  add constraint workspace_invitations_revoked_check check (
    (status = 'revoked' and revoked_at is not null)
    or
    (status <> 'revoked' and revoked_at is null)
  );

create or replace function private.protect_workspace_owner_settings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    new.banner_path is distinct from old.banner_path
    or new.brand_primary_color is distinct from old.brand_primary_color
    or new.brand_accent_color is distinct from old.brand_accent_color
  ) and (select auth.uid()) is not null
    and not private.has_workspace_role(
      old.id,
      array['owner']::public.workspace_role[]
    ) then
    raise exception 'Only the workspace owner can change invitation branding'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.protect_workspace_owner_settings()
from public, anon, authenticated;

create trigger workspaces_protect_owner_settings
before update on public.workspaces
for each row execute function private.protect_workspace_owner_settings();

drop function public.create_workspace_invitation(
  uuid,
  text,
  public.workspace_role,
  integer
);

create or replace function public.create_workspace_invitation(
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

  if normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
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

revoke all on function public.create_workspace_invitation(uuid, text, uuid, integer)
from public, anon;
grant execute on function public.create_workspace_invitation(uuid, text, uuid, integer)
to authenticated;

create or replace function public.accept_workspace_invitation(invitation_token text)
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

create or replace function public.decline_workspace_invitation(invitation_token text)
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

  select lower(email) into actor_email
  from auth.users where id = actor_id;

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

  update public.workspace_invitations
  set status = 'declined', declined_at = now()
  where id = invitation_record.id;

  return invitation_record.workspace_id;
end;
$$;

revoke all on function public.decline_workspace_invitation(text) from public, anon;
grant execute on function public.decline_workspace_invitation(text) to authenticated;

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

  if target_workspace_id is null or not private.has_workspace_role(
    target_workspace_id,
    array['owner']::public.workspace_role[]
  ) then
    raise exception 'Invitation not found or permission denied'
      using errcode = '42501';
  end if;

  update public.workspace_invitations
  set status = 'revoked', revoked_at = now()
  where id = invitation_id;
end;
$$;

revoke all on function public.revoke_workspace_invitation(uuid) from public, anon;
grant execute on function public.revoke_workspace_invitation(uuid) to authenticated;

create or replace function public.get_workspace_invitation_preview(invitation_token text)
returns table (
  workspace_name text,
  workspace_logo_path text,
  workspace_banner_path text,
  workspace_primary_color text,
  workspace_accent_color text,
  inviter_display_name text,
  role_name text,
  role_description text,
  permission_codes text[],
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    workspace.name,
    workspace.logo_path,
    workspace.banner_path,
    workspace.brand_primary_color,
    workspace.brand_accent_color,
    inviter.display_name,
    role_record.name,
    role_record.description,
    coalesce(
      array_agg(role_permission.permission_code order by role_permission.permission_code)
        filter (where role_permission.permission_code is not null),
      array[]::text[]
    ),
    invitation.expires_at
  from public.workspace_invitations invitation
  join public.workspaces workspace on workspace.id = invitation.workspace_id
  join public.profiles inviter on inviter.user_id = invitation.invited_by
  join public.workspace_roles role_record on role_record.id = invitation.workspace_role_id
  left join public.workspace_role_permissions role_permission
    on role_permission.workspace_role_id = role_record.id
  where invitation.token_hash = encode(
      extensions.digest(invitation_token, 'sha256'),
      'hex'
    )
    and invitation.status = 'pending'
    and invitation.expires_at > now()
  group by
    workspace.name,
    workspace.logo_path,
    workspace.banner_path,
    workspace.brand_primary_color,
    workspace.brand_accent_color,
    inviter.display_name,
    role_record.name,
    role_record.description,
    invitation.expires_at;
$$;

revoke all on function public.get_workspace_invitation_preview(text)
from public;
grant execute on function public.get_workspace_invitation_preview(text)
to anon, authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'workspace-branding',
  'workspace-branding',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "workspace_branding_insert_owner"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'workspace-branding'
  and private.has_workspace_role(
    private.storage_workspace_id(name),
    array['owner']::public.workspace_role[]
  )
);

create policy "workspace_branding_update_owner"
on storage.objects for update to authenticated
using (
  bucket_id = 'workspace-branding'
  and private.has_workspace_role(
    private.storage_workspace_id(name),
    array['owner']::public.workspace_role[]
  )
)
with check (
  bucket_id = 'workspace-branding'
  and private.has_workspace_role(
    private.storage_workspace_id(name),
    array['owner']::public.workspace_role[]
  )
);

create policy "workspace_branding_delete_owner"
on storage.objects for delete to authenticated
using (
  bucket_id = 'workspace-branding'
  and private.has_workspace_role(
    private.storage_workspace_id(name),
    array['owner']::public.workspace_role[]
  )
);
