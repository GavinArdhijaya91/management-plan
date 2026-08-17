drop policy if exists "community_posts_select_readable"
on public.community_posts;

-- Keep the parent-table predicate row-local. A SECURITY DEFINER helper that
-- queries community_posts again cannot see the just-inserted row during
-- INSERT ... RETURNING in the same command snapshot.
create policy "community_posts_select_readable"
on public.community_posts for select to authenticated
using (
  (
    publication_status = 'published'
    and audience = 'authenticated'
  )
  or
  (
    created_by = (select auth.uid())
    and private.is_workspace_member(workspace_id)
  )
  or
  (
    publication_status = 'archived'
    and private.has_workspace_permission(
      workspace_id,
      'community_post.moderate'
    )
  )
);

comment on policy "community_posts_select_readable"
on public.community_posts is
  'Uses row-local fields so authorized draft inserts remain visible to INSERT RETURNING while preserving published, active-author, and archived-moderator read boundaries.';
