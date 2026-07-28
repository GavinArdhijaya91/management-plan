alter table public.audit_logs
  drop constraint audit_logs_action_check,
  add constraint audit_logs_action_check
    check (
      action in (
        'insert',
        'update',
        'delete',
        'request_deletion',
        'cancel_deletion',
        'permanent_delete'
      )
    );

drop policy if exists "avatars_select_own"
on storage.objects;

-- Authenticated users need visibility of their own avatar metadata before
-- PostgreSQL can evaluate update and delete policies for that object.
create policy "avatars_select_own"
on storage.objects for select to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
