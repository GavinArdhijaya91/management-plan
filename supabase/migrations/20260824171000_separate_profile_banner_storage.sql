insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-banners',
  'profile-banners',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

update storage.buckets
set file_size_limit = 2097152
where id = 'avatars';

create policy "profile_banners_select_own"
on storage.objects for select to authenticated
using (
  bucket_id = 'profile-banners'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "profile_banners_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-banners'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "profile_banners_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-banners'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'profile-banners'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "profile_banners_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-banners'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

comment on constraint profiles_banner_path_check on public.profiles is
  'Profile banner object paths must remain inside the authenticated profile identity folder.';
