create or replace function public.get_my_workspace_access()
returns table (
  workspace_id uuid,
  workspace_name text,
  workspace_slug text,
  workspace_logo_path text,
  membership_status public.membership_status,
  workspace_role_id uuid,
  role_code text,
  role_name text,
  hierarchy_rank smallint,
  base_role public.workspace_role,
  is_owner_role boolean,
  permission_codes text[]
)
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  return query
  select
    workspace.id,
    workspace.name,
    workspace.slug,
    workspace.logo_path,
    member.status,
    role.id,
    role.code,
    role.name,
    role.hierarchy_rank,
    role.base_role,
    role.is_owner_role,
    coalesce(
      array_agg(role_permission.permission_code order by role_permission.permission_code)
        filter (where role_permission.permission_code is not null),
      '{}'::text[]
    )
  from public.workspace_members member
  join public.workspaces workspace
    on workspace.id = member.workspace_id
  join public.workspace_roles role
    on role.id = member.workspace_role_id
   and role.workspace_id = member.workspace_id
  left join public.workspace_role_permissions role_permission
    on role_permission.workspace_role_id = role.id
   and role_permission.workspace_id = workspace.id
  where member.user_id = auth.uid()
  group by
    workspace.id,
    workspace.name,
    workspace.slug,
    workspace.logo_path,
    member.status,
    role.id,
    role.code,
    role.name,
    role.hierarchy_rank,
    role.base_role,
    role.is_owner_role
  order by member.joined_at, workspace.name;
end;
$$;

revoke all on function public.get_my_workspace_access() from public, anon;
grant execute on function public.get_my_workspace_access() to authenticated;

comment on function public.get_my_workspace_access() is
  'Returns only the authenticated user workspace memberships, canonical roles, and effective permissions. Used to resolve an active workspace without weakening member-directory RLS.';
