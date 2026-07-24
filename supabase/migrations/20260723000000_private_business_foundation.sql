create type public.profile_theme as enum ('system', 'light', 'dark');
create type public.membership_status as enum ('active', 'suspended');
create type public.invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');

alter table public.profiles
  add column display_name text,
  add column avatar_path text,
  add column bio text,
  add constraint profiles_display_name_check
    check (display_name is null or char_length(trim(display_name)) between 2 and 50),
  add constraint profiles_avatar_path_check
    check (avatar_path is null or char_length(avatar_path) <= 500),
  add constraint profiles_bio_check
    check (bio is null or char_length(bio) <= 300);

update public.profiles
set display_name = full_name
where display_name is null;

alter table public.profiles
  alter column display_name set not null;

create table public.profile_preferences (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  locale text not null default 'id-ID'
    check (locale ~ '^[a-z]{2}(?:-[A-Z]{2})?$'),
  timezone text not null default 'Asia/Jakarta'
    check (char_length(trim(timezone)) between 3 and 64),
  theme public.profile_theme not null default 'system',
  date_format text not null default 'DD/MM/YYYY'
    check (date_format in ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')),
  marketing_notifications boolean not null default false,
  collaboration_notifications boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.profile_preferences (user_id)
select user_id from public.profiles
on conflict (user_id) do nothing;

create table public.business_categories (
  id smallint generated always as identity primary key,
  code text not null unique check (code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  name text not null unique check (char_length(trim(name)) between 2 and 80),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.business_categories (code, name)
values
  ('culinary', 'Kuliner'),
  ('fashion', 'Fashion'),
  ('retail', 'Retail'),
  ('services', 'Jasa'),
  ('creative', 'Industri Kreatif'),
  ('agriculture', 'Pertanian'),
  ('manufacturing', 'Manufaktur'),
  ('technology', 'Teknologi'),
  ('education', 'Pendidikan'),
  ('other', 'Lainnya');

alter table public.workspaces
  add column logo_path text,
  add column description text,
  add column business_email text,
  add column business_phone text,
  add column address_line text,
  add column city text,
  add column province text,
  add column postal_code text,
  add column country_code text not null default 'ID',
  add column currency_code text not null default 'IDR',
  add column timezone text not null default 'Asia/Jakarta',
  add column latitude double precision,
  add column longitude double precision,
  add constraint workspaces_logo_path_check
    check (logo_path is null or char_length(logo_path) <= 500),
  add constraint workspaces_description_check
    check (description is null or char_length(description) <= 500),
  add constraint workspaces_business_email_check
    check (business_email is null or char_length(trim(business_email)) between 3 and 254),
  add constraint workspaces_business_phone_check
    check (business_phone is null or char_length(trim(business_phone)) between 7 and 30),
  add constraint workspaces_address_line_check
    check (address_line is null or char_length(address_line) <= 300),
  add constraint workspaces_city_check
    check (city is null or char_length(trim(city)) between 2 and 100),
  add constraint workspaces_province_check
    check (province is null or char_length(trim(province)) between 2 and 100),
  add constraint workspaces_postal_code_check
    check (postal_code is null or char_length(trim(postal_code)) between 3 and 20),
  add constraint workspaces_country_code_check
    check (country_code ~ '^[A-Z]{2}$'),
  add constraint workspaces_currency_code_check
    check (currency_code ~ '^[A-Z]{3}$'),
  add constraint workspaces_timezone_check
    check (char_length(trim(timezone)) between 3 and 64),
  add constraint workspaces_latitude_check
    check (latitude is null or latitude between -90 and 90),
  add constraint workspaces_longitude_check
    check (longitude is null or longitude between -180 and 180),
  add constraint workspaces_coordinates_pair_check
    check ((latitude is null) = (longitude is null));

create table public.workspace_business_categories (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category_id smallint not null references public.business_categories(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (workspace_id, category_id)
);

alter table public.workspace_members
  add column status public.membership_status not null default 'active',
  add column job_title text,
  add column joined_at timestamptz not null default now(),
  add column updated_at timestamptz not null default now(),
  add constraint workspace_members_job_title_check
    check (job_title is null or char_length(trim(job_title)) between 2 and 80);

create table public.workspace_invitations (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role public.workspace_role not null default 'member'
    check (role <> 'owner'),
  status public.invitation_status not null default 'pending',
  token_hash text not null unique
    check (char_length(token_hash) between 32 and 128),
  invited_by uuid not null references auth.users(id) on delete restrict,
  accepted_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_invitations_email_check
    check (char_length(trim(email)) between 3 and 254),
  constraint workspace_invitations_expiry_check
    check (expires_at > created_at),
  constraint workspace_invitations_acceptance_check
    check (
      (status = 'accepted' and accepted_by is not null and accepted_at is not null)
      or
      (status <> 'accepted' and accepted_by is null and accepted_at is null)
    )
);

create unique index workspace_invitations_pending_email_idx
  on public.workspace_invitations (workspace_id, lower(email))
  where status = 'pending';
create index workspace_invitations_workspace_status_idx
  on public.workspace_invitations (workspace_id, status, created_at desc);
create index workspace_invitations_email_status_idx
  on public.workspace_invitations (lower(email), status);
create index workspace_categories_category_idx
  on public.workspace_business_categories (category_id, workspace_id);
create index workspaces_location_idx
  on public.workspaces (country_code, province, city);

create trigger profile_preferences_set_updated_at
before update on public.profile_preferences
for each row execute function private.set_updated_at();

create trigger workspace_members_set_updated_at
before update on public.workspace_members
for each row execute function private.set_updated_at();

create trigger workspace_invitations_set_updated_at
before update on public.workspace_invitations
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_name text;
begin
  resolved_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Pengguna Siapin'
  );

  if char_length(resolved_name) < 2 then
    resolved_name := 'Pengguna Siapin';
  end if;

  insert into public.profiles (user_id, full_name, display_name, email)
  values (new.id, resolved_name, resolved_name, coalesce(new.email, ''));

  insert into public.profile_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

create or replace function private.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
      and status = 'active'
  );
$$;

create or replace function private.has_workspace_role(
  target_workspace_id uuid,
  allowed_roles public.workspace_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
      and status = 'active'
      and role = any(allowed_roles)
  );
$$;

create or replace function private.storage_workspace_id(object_name text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return ((storage.foldername(object_name))[1])::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.storage_workspace_id(text) from public, anon, authenticated;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.has_workspace_role(uuid, public.workspace_role[]) to authenticated;
grant execute on function private.storage_workspace_id(text) to authenticated;

alter table public.profile_preferences enable row level security;
alter table public.business_categories enable row level security;
alter table public.workspace_business_categories enable row level security;
alter table public.workspace_invitations enable row level security;

create policy "preferences_select_own"
on public.profile_preferences for select to authenticated
using ((select auth.uid()) = user_id);

create policy "preferences_update_own"
on public.profile_preferences for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "categories_select_authenticated"
on public.business_categories for select to authenticated
using (true);

create policy "workspace_categories_select_member"
on public.workspace_business_categories for select to authenticated
using (private.is_workspace_member(workspace_id));

create policy "workspace_categories_insert_manager"
on public.workspace_business_categories for insert to authenticated
with check (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "workspace_categories_delete_manager"
on public.workspace_business_categories for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "invitations_select_manager"
on public.workspace_invitations for select to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "invitations_insert_manager"
on public.workspace_invitations for insert to authenticated
with check (
  invited_by = (select auth.uid())
  and private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "invitations_update_manager"
on public.workspace_invitations for update to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
)
with check (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "invitations_delete_owner"
on public.workspace_invitations for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'workspace-logos',
    'workspace-logos',
    true,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "avatars_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "avatars_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "avatars_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid())::text
);

create policy "workspace_logos_insert_manager"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'workspace-logos'
  and private.has_workspace_role(
    private.storage_workspace_id(name),
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "workspace_logos_update_manager"
on storage.objects for update to authenticated
using (
  bucket_id = 'workspace-logos'
  and private.has_workspace_role(
    private.storage_workspace_id(name),
    array['owner', 'manager']::public.workspace_role[]
  )
)
with check (
  bucket_id = 'workspace-logos'
  and private.has_workspace_role(
    private.storage_workspace_id(name),
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "workspace_logos_delete_manager"
on storage.objects for delete to authenticated
using (
  bucket_id = 'workspace-logos'
  and private.has_workspace_role(
    private.storage_workspace_id(name),
    array['owner', 'manager']::public.workspace_role[]
  )
);
