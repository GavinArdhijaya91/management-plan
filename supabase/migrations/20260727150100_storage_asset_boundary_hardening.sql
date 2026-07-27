alter table public.profiles
  drop constraint profiles_avatar_path_check,
  add constraint profiles_avatar_path_check
    check (
      avatar_path is null
      or (
        char_length(avatar_path) <= 500
        and char_length(avatar_path) > 37
        and split_part(avatar_path, '/', 1) = user_id::text
        and avatar_path not like '%..%'
      )
    );

alter table public.workspaces
  drop constraint workspaces_logo_path_check,
  add constraint workspaces_logo_path_check
    check (
      logo_path is null
      or (
        char_length(logo_path) <= 500
        and char_length(logo_path) > 37
        and split_part(logo_path, '/', 1) = id::text
        and logo_path not like '%..%'
      )
    ),
  drop constraint workspaces_banner_path_check,
  add constraint workspaces_banner_path_check
    check (
      banner_path is null
      or (
        char_length(banner_path) <= 500
        and char_length(banner_path) > 37
        and split_part(banner_path, '/', 1) = id::text
        and banner_path not like '%..%'
      )
    );

drop policy "avatars_insert_own" on storage.objects;

create policy "avatars_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

update storage.buckets
set
  public = true,
  file_size_limit = case id
    when 'workspace-branding' then 5242880
    else 2097152
  end,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id in ('avatars', 'workspace-logos', 'workspace-branding');

comment on constraint profiles_avatar_path_check on public.profiles is
  'Avatar object paths must remain inside the authenticated profile identity folder.';

comment on constraint workspaces_logo_path_check on public.workspaces is
  'Workspace logo object paths must remain inside the owning workspace folder.';

comment on constraint workspaces_banner_path_check on public.workspaces is
  'Workspace banner object paths must remain inside the owning workspace folder.';
