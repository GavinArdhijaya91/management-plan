drop policy if exists "avatars_update_own"
on storage.objects;

create policy "avatars_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

comment on policy "avatars_update_own" on storage.objects is
  'Avatar updates preserve both the authenticated owner metadata and identity-scoped object path.';
