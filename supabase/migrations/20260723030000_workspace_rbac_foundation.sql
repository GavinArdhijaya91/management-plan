create table public.permission_definitions (
  code text primary key check (code ~ '^[a-z_]+\.[a-z_]+$'),
  resource text not null check (resource ~ '^[a-z_]+$'),
  action text not null check (action ~ '^[a-z_]+$'),
  description text not null check (char_length(trim(description)) between 5 and 300),
  created_at timestamptz not null default now(),
  unique (resource, action)
);

insert into public.permission_definitions (code, resource, action, description)
values
  ('workspace.read', 'workspace', 'read', 'View workspace identity and business settings.'),
  ('workspace.update', 'workspace', 'update', 'Update workspace identity and business settings.'),
  ('workspace.delete', 'workspace', 'delete', 'Permanently delete the workspace.'),
  ('role.read', 'role', 'read', 'View workspace roles and their permissions.'),
  ('role.manage', 'role', 'manage', 'Create, update, and remove workspace roles and permissions.'),
  ('member.read', 'member', 'read', 'View workspace members and invitations.'),
  ('member.manage', 'member', 'manage', 'Invite, update, suspend, and remove workspace members.'),
  ('plan.read', 'plan', 'read', 'View plans, goals, metrics, initiatives, actions, and reviews.'),
  ('plan.write', 'plan', 'write', 'Create and update planning records.'),
  ('plan.delete', 'plan', 'delete', 'Delete planning records.'),
  ('transaction.read', 'transaction', 'read', 'View workspace transactions.'),
  ('transaction.write', 'transaction', 'write', 'Create and update workspace transactions.'),
  ('transaction.delete', 'transaction', 'delete', 'Delete workspace transactions.'),
  ('transaction.export', 'transaction', 'export', 'Export workspace transaction data.'),
  ('calendar.read', 'calendar', 'read', 'View workspace calendar events.'),
  ('calendar.write', 'calendar', 'write', 'Create and update workspace calendar events.'),
  ('calendar.delete', 'calendar', 'delete', 'Delete workspace calendar events.'),
  ('market.read', 'market', 'read', 'View market products and snapshots.'),
  ('market.write', 'market', 'write', 'Create and update market products and snapshots.'),
  ('market.delete', 'market', 'delete', 'Delete market products and snapshots.'),
  ('partner.read', 'partner', 'read', 'View external business partners.'),
  ('partner.write', 'partner', 'write', 'Create and update external business partners.'),
  ('partner.delete', 'partner', 'delete', 'Delete external business partners.'),
  ('audit.read', 'audit', 'read', 'View workspace audit history.'),
  ('contact.read', 'contact', 'read', 'View contact messages associated with the workspace.');

create table public.workspace_roles (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null check (code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  name text not null check (char_length(trim(name)) between 2 and 80),
  description text check (description is null or char_length(description) <= 300),
  hierarchy_rank smallint not null check (hierarchy_rank between 1 and 100),
  base_role public.workspace_role not null default 'member',
  is_system boolean not null default false,
  is_owner_role boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, code),
  unique (workspace_id, name),
  unique (workspace_id, id),
  constraint workspace_roles_owner_check check (
    (is_owner_role and is_system and base_role = 'owner' and hierarchy_rank = 100)
    or not is_owner_role
  )
);

create unique index workspace_roles_single_owner_idx
  on public.workspace_roles (workspace_id)
  where is_owner_role;

create table public.workspace_role_permissions (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workspace_role_id uuid not null,
  permission_code text not null references public.permission_definitions(code)
    on update cascade on delete restrict,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (workspace_role_id, permission_code),
  foreign key (workspace_id, workspace_role_id)
    references public.workspace_roles(workspace_id, id) on delete cascade
);

create index workspace_roles_workspace_rank_idx
  on public.workspace_roles (workspace_id, hierarchy_rank desc);
create index workspace_role_permissions_workspace_idx
  on public.workspace_role_permissions (workspace_id, permission_code);

create or replace function private.install_default_workspace_roles(
  target_workspace_id uuid,
  actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_role_id uuid;
  manager_role_id uuid;
  member_role_id uuid;
  viewer_role_id uuid;
begin
  insert into public.workspace_roles (
    workspace_id,
    code,
    name,
    description,
    hierarchy_rank,
    base_role,
    is_system,
    is_owner_role,
    created_by
  )
  values
    (
      target_workspace_id,
      'owner',
      'Owner',
      'Workspace owner with immutable full access.',
      100,
      'owner',
      true,
      true,
      actor_id
    ),
    (
      target_workspace_id,
      'manager',
      'Manager',
      'Manages daily business operations without ownership authority.',
      60,
      'manager',
      true,
      false,
      actor_id
    ),
    (
      target_workspace_id,
      'member',
      'Staff',
      'Contributes to assigned business work.',
      20,
      'member',
      true,
      false,
      actor_id
    ),
    (
      target_workspace_id,
      'viewer',
      'Viewer',
      'Read-only workspace access.',
      10,
      'viewer',
      true,
      false,
      actor_id
    )
  on conflict (workspace_id, code) do nothing;

  select id into owner_role_id
  from public.workspace_roles
  where workspace_id = target_workspace_id and code = 'owner';
  select id into manager_role_id
  from public.workspace_roles
  where workspace_id = target_workspace_id and code = 'manager';
  select id into member_role_id
  from public.workspace_roles
  where workspace_id = target_workspace_id and code = 'member';
  select id into viewer_role_id
  from public.workspace_roles
  where workspace_id = target_workspace_id and code = 'viewer';

  insert into public.workspace_role_permissions (
    workspace_id,
    workspace_role_id,
    permission_code,
    granted_by
  )
  select target_workspace_id, owner_role_id, code, actor_id
  from public.permission_definitions
  on conflict do nothing;

  insert into public.workspace_role_permissions (
    workspace_id,
    workspace_role_id,
    permission_code,
    granted_by
  )
  select target_workspace_id, manager_role_id, code, actor_id
  from public.permission_definitions
  where code = any(array[
    'workspace.read',
    'workspace.update',
    'role.read',
    'member.read',
    'member.manage',
    'plan.read',
    'plan.write',
    'plan.delete',
    'transaction.read',
    'transaction.write',
    'transaction.delete',
    'transaction.export',
    'calendar.read',
    'calendar.write',
    'calendar.delete',
    'market.read',
    'market.write',
    'market.delete',
    'partner.read',
    'partner.write',
    'partner.delete',
    'audit.read',
    'contact.read'
  ])
  on conflict do nothing;

  insert into public.workspace_role_permissions (
    workspace_id,
    workspace_role_id,
    permission_code,
    granted_by
  )
  select target_workspace_id, member_role_id, code, actor_id
  from public.permission_definitions
  where code = any(array[
    'workspace.read',
    'role.read',
    'member.read',
    'plan.read',
    'plan.write',
    'transaction.read',
    'transaction.write',
    'calendar.read',
    'calendar.write',
    'market.read',
    'market.write',
    'partner.read',
    'partner.write'
  ])
  on conflict do nothing;

  insert into public.workspace_role_permissions (
    workspace_id,
    workspace_role_id,
    permission_code,
    granted_by
  )
  select target_workspace_id, viewer_role_id, code, actor_id
  from public.permission_definitions
  where code = any(array[
    'workspace.read',
    'role.read',
    'member.read',
    'plan.read',
    'transaction.read',
    'calendar.read',
    'market.read',
    'partner.read'
  ])
  on conflict do nothing;
end;
$$;

revoke all on function private.install_default_workspace_roles(uuid, uuid)
from public, anon, authenticated;

do $$
declare
  workspace_record record;
begin
  for workspace_record in
    select id, created_by from public.workspaces
  loop
    perform private.install_default_workspace_roles(
      workspace_record.id,
      workspace_record.created_by
    );
  end loop;
end;
$$;

create or replace function private.handle_workspace_role_setup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.install_default_workspace_roles(new.id, new.created_by);
  return new;
end;
$$;

revoke all on function private.handle_workspace_role_setup()
from public, anon, authenticated;

create trigger on_workspace_created_install_roles
after insert on public.workspaces
for each row execute function private.handle_workspace_role_setup();

alter table public.workspace_members
  add column workspace_role_id uuid;

update public.workspace_members member
set workspace_role_id = role_record.id
from public.workspace_roles role_record
where role_record.workspace_id = member.workspace_id
  and role_record.base_role = member.role
  and role_record.is_system;

alter table public.workspace_members
  alter column workspace_role_id set not null,
  add constraint workspace_members_workspace_role_fkey
    foreign key (workspace_id, workspace_role_id)
    references public.workspace_roles(workspace_id, id) on delete restrict;

create index workspace_members_workspace_role_idx
  on public.workspace_members (workspace_id, workspace_role_id, status);

alter table public.workspace_invitations
  add column workspace_role_id uuid;

update public.workspace_invitations invitation
set workspace_role_id = role_record.id
from public.workspace_roles role_record
where role_record.workspace_id = invitation.workspace_id
  and role_record.base_role = invitation.role
  and role_record.is_system;

alter table public.workspace_invitations
  alter column workspace_role_id set not null,
  add constraint workspace_invitations_workspace_role_fkey
    foreign key (workspace_id, workspace_role_id)
    references public.workspace_roles(workspace_id, id) on delete restrict;

create or replace function private.sync_membership_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_role public.workspace_roles%rowtype;
begin
  if new.workspace_role_id is null then
    select *
    into selected_role
    from public.workspace_roles
    where workspace_id = new.workspace_id
      and base_role = new.role
      and is_system
    order by hierarchy_rank desc
    limit 1;

    new.workspace_role_id := selected_role.id;
  else
    select *
    into selected_role
    from public.workspace_roles
    where workspace_id = new.workspace_id
      and id = new.workspace_role_id;

    if selected_role.id is null then
      raise exception 'Workspace role does not belong to this workspace'
        using errcode = '23503';
    end if;

    new.role := selected_role.base_role;
  end if;

  return new;
end;
$$;

revoke all on function private.sync_membership_role()
from public, anon, authenticated;

create trigger workspace_members_sync_role
before insert or update of workspace_role_id, role on public.workspace_members
for each row execute function private.sync_membership_role();

create trigger workspace_invitations_sync_role
before insert or update of workspace_role_id, role on public.workspace_invitations
for each row execute function private.sync_membership_role();

create or replace function private.has_workspace_permission(
  target_workspace_id uuid,
  target_permission_code text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members member
    join public.workspace_roles role_record
      on role_record.id = member.workspace_role_id
      and role_record.workspace_id = member.workspace_id
    where member.workspace_id = target_workspace_id
      and member.user_id = (select auth.uid())
      and member.status = 'active'
      and (
        role_record.is_owner_role
        or exists (
          select 1
          from public.workspace_role_permissions role_permission
          where role_permission.workspace_id = target_workspace_id
            and role_permission.workspace_role_id = role_record.id
            and role_permission.permission_code = target_permission_code
        )
      )
  );
$$;

grant execute on function private.has_workspace_permission(uuid, text)
to authenticated;

create trigger workspace_roles_set_updated_at
before update on public.workspace_roles
for each row execute function private.set_updated_at();

create trigger workspace_roles_protect_identity
before update on public.workspace_roles
for each row execute function private.prevent_column_changes(
  'id',
  'workspace_id',
  'is_system',
  'is_owner_role',
  'created_by'
);

alter table public.permission_definitions enable row level security;
alter table public.workspace_roles enable row level security;
alter table public.workspace_role_permissions enable row level security;

create policy "permissions_select_authenticated"
on public.permission_definitions for select to authenticated
using (true);

create policy "workspace_roles_select_member"
on public.workspace_roles for select to authenticated
using (private.is_workspace_member(workspace_id));

create policy "workspace_roles_insert_owner"
on public.workspace_roles for insert to authenticated
with check (
  created_by = (select auth.uid())
  and not is_system
  and not is_owner_role
  and base_role in ('member', 'viewer')
  and private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
);

create policy "workspace_roles_update_owner"
on public.workspace_roles for update to authenticated
using (
  not is_owner_role
  and private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
)
with check (
  not is_owner_role
  and base_role <> 'owner'
  and private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
);

create policy "workspace_roles_delete_owner"
on public.workspace_roles for delete to authenticated
using (
  not is_system
  and not is_owner_role
  and private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
);

create policy "role_permissions_select_member"
on public.workspace_role_permissions for select to authenticated
using (private.is_workspace_member(workspace_id));

create policy "role_permissions_insert_owner"
on public.workspace_role_permissions for insert to authenticated
with check (
  private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
  and not exists (
    select 1
    from public.workspace_roles role_record
    where role_record.id = workspace_role_id
      and role_record.is_owner_role
  )
);

create policy "role_permissions_delete_owner"
on public.workspace_role_permissions for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
  and not exists (
    select 1
    from public.workspace_roles role_record
    where role_record.id = workspace_role_id
      and role_record.is_owner_role
  )
);

create trigger workspace_roles_audit
after insert or update or delete on public.workspace_roles
for each row execute function private.write_workspace_audit_log('workspace_role');
