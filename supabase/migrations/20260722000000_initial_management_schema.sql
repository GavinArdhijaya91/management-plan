create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.workspace_role as enum ('owner', 'manager', 'member', 'viewer');
create type public.transaction_type as enum ('sale', 'expense');
create type public.calendar_event_type as enum ('supplier', 'payroll', 'stock', 'other');
create type public.notification_type as enum ('stock', 'target', 'schedule', 'system');
create type public.contact_status as enum ('new', 'in_progress', 'resolved', 'closed');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 100),
  email text not null,
  phone text,
  avatar_url text,
  email_notifications boolean not null default true,
  weekly_summary boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.transactions (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  type public.transaction_type not null,
  amount numeric(14, 2) not null check (amount > 0),
  capital numeric(14, 2) not null default 0 check (capital >= 0),
  transaction_date date not null,
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sale_capital_check check (type <> 'sale' or capital <= amount),
  constraint expense_capital_check check (type <> 'expense' or capital = 0)
);

create table public.calendar_events (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 2 and 160),
  type public.calendar_event_type not null default 'other',
  starts_at timestamptz not null,
  ends_at timestamptz,
  completed_at timestamptz,
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_time_order_check check (ends_at is null or ends_at >= starts_at)
);

create table public.market_products (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 2 and 120),
  description text check (description is null or char_length(description) <= 500),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table public.market_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid not null references public.market_products(id) on delete cascade,
  observed_on date not null,
  change_percent numeric(8, 2) not null check (change_percent between -100 and 1000),
  market_condition text not null check (char_length(trim(market_condition)) between 2 and 120),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (product_id, observed_on)
);

create table public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.notification_type not null default 'system',
  title text not null check (char_length(trim(title)) between 2 and 160),
  detail text not null check (char_length(trim(detail)) between 2 and 1000),
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(trim(name)) between 2 and 100),
  email text not null,
  phone text,
  subject text not null check (char_length(trim(subject)) between 2 and 120),
  message text not null check (char_length(trim(message)) between 10 and 1000),
  status public.contact_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  workspace_id uuid references public.workspaces(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (lower(email));
create index workspace_members_user_idx on public.workspace_members (user_id, workspace_id);
create index workspaces_created_by_idx on public.workspaces (created_by);
create index transactions_workspace_date_idx on public.transactions (workspace_id, transaction_date desc);
create index transactions_workspace_type_idx on public.transactions (workspace_id, type);
create index calendar_events_workspace_start_idx on public.calendar_events (workspace_id, starts_at);
create index market_products_workspace_active_idx on public.market_products (workspace_id, active);
create index market_snapshots_product_date_idx on public.market_snapshots (product_id, observed_on desc);
create index market_snapshots_workspace_date_idx on public.market_snapshots (workspace_id, observed_on desc);
create index notifications_user_read_date_idx on public.notifications (user_id, read_at, created_at desc);
create index contact_messages_status_date_idx on public.contact_messages (status, created_at desc);
create index audit_logs_workspace_date_idx on public.audit_logs (workspace_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
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
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function private.has_workspace_role(target_workspace_id uuid, allowed_roles public.workspace_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
      and role = any(allowed_roles)
  );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, full_name, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create or replace function public.create_workspace(workspace_name text, workspace_slug text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_workspace_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  insert into public.workspaces (name, slug, created_by)
  values (trim(workspace_name), lower(trim(workspace_slug)), (select auth.uid()))
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, (select auth.uid()), 'owner');

  return new_workspace_id;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.handle_new_user() from public, anon, authenticated;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.has_workspace_role(uuid, public.workspace_role[]) to authenticated;
revoke all on function public.create_workspace(text, text) from public, anon;
grant execute on function public.create_workspace(text, text) to authenticated;

create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

create trigger profiles_set_updated_at before update on public.profiles for each row execute function private.set_updated_at();
create trigger workspaces_set_updated_at before update on public.workspaces for each row execute function private.set_updated_at();
create trigger transactions_set_updated_at before update on public.transactions for each row execute function private.set_updated_at();
create trigger calendar_events_set_updated_at before update on public.calendar_events for each row execute function private.set_updated_at();
create trigger market_products_set_updated_at before update on public.market_products for each row execute function private.set_updated_at();
create trigger contact_messages_set_updated_at before update on public.contact_messages for each row execute function private.set_updated_at();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.transactions enable row level security;
alter table public.calendar_events enable row level security;
alter table public.market_products enable row level security;
alter table public.market_snapshots enable row level security;
alter table public.notifications enable row level security;
alter table public.contact_messages enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "workspaces_select_member" on public.workspaces for select to authenticated using (private.is_workspace_member(id));
create policy "workspaces_insert_owner" on public.workspaces for insert to authenticated with check ((select auth.uid()) = created_by);
create policy "workspaces_update_manager" on public.workspaces for update to authenticated using (private.has_workspace_role(id, array['owner', 'manager']::public.workspace_role[])) with check (private.has_workspace_role(id, array['owner', 'manager']::public.workspace_role[]));
create policy "workspaces_delete_owner" on public.workspaces for delete to authenticated using (private.has_workspace_role(id, array['owner']::public.workspace_role[]));

create policy "members_select_member" on public.workspace_members for select to authenticated using (private.is_workspace_member(workspace_id));
create policy "members_insert_owner" on public.workspace_members for insert to authenticated with check (
  ((select auth.uid()) = user_id and role = 'owner') or private.has_workspace_role(workspace_id, array['owner']::public.workspace_role[])
);
create policy "members_update_owner" on public.workspace_members for update to authenticated using (private.has_workspace_role(workspace_id, array['owner']::public.workspace_role[])) with check (private.has_workspace_role(workspace_id, array['owner']::public.workspace_role[]));
create policy "members_delete_owner" on public.workspace_members for delete to authenticated using (private.has_workspace_role(workspace_id, array['owner']::public.workspace_role[]));

create policy "transactions_select_member" on public.transactions for select to authenticated using (private.is_workspace_member(workspace_id));
create policy "transactions_insert_editor" on public.transactions for insert to authenticated with check (created_by = (select auth.uid()) and private.has_workspace_role(workspace_id, array['owner', 'manager', 'member']::public.workspace_role[]));
create policy "transactions_update_editor" on public.transactions for update to authenticated using (private.has_workspace_role(workspace_id, array['owner', 'manager', 'member']::public.workspace_role[])) with check (private.has_workspace_role(workspace_id, array['owner', 'manager', 'member']::public.workspace_role[]));
create policy "transactions_delete_manager" on public.transactions for delete to authenticated using (private.has_workspace_role(workspace_id, array['owner', 'manager']::public.workspace_role[]));

create policy "events_select_member" on public.calendar_events for select to authenticated using (private.is_workspace_member(workspace_id));
create policy "events_insert_editor" on public.calendar_events for insert to authenticated with check (created_by = (select auth.uid()) and private.has_workspace_role(workspace_id, array['owner', 'manager', 'member']::public.workspace_role[]));
create policy "events_update_editor" on public.calendar_events for update to authenticated using (private.has_workspace_role(workspace_id, array['owner', 'manager', 'member']::public.workspace_role[])) with check (private.has_workspace_role(workspace_id, array['owner', 'manager', 'member']::public.workspace_role[]));
create policy "events_delete_editor" on public.calendar_events for delete to authenticated using (private.has_workspace_role(workspace_id, array['owner', 'manager', 'member']::public.workspace_role[]));

create policy "products_select_member" on public.market_products for select to authenticated using (private.is_workspace_member(workspace_id));
create policy "products_insert_editor" on public.market_products for insert to authenticated with check (created_by = (select auth.uid()) and private.has_workspace_role(workspace_id, array['owner', 'manager', 'member']::public.workspace_role[]));
create policy "products_update_editor" on public.market_products for update to authenticated using (private.has_workspace_role(workspace_id, array['owner', 'manager', 'member']::public.workspace_role[])) with check (private.has_workspace_role(workspace_id, array['owner', 'manager', 'member']::public.workspace_role[]));
create policy "products_delete_manager" on public.market_products for delete to authenticated using (private.has_workspace_role(workspace_id, array['owner', 'manager']::public.workspace_role[]));

create policy "snapshots_select_member" on public.market_snapshots for select to authenticated using (private.is_workspace_member(workspace_id));
create policy "snapshots_insert_editor" on public.market_snapshots for insert to authenticated with check (created_by = (select auth.uid()) and private.has_workspace_role(workspace_id, array['owner', 'manager', 'member']::public.workspace_role[]));
create policy "snapshots_update_editor" on public.market_snapshots for update to authenticated using (private.has_workspace_role(workspace_id, array['owner', 'manager', 'member']::public.workspace_role[])) with check (private.has_workspace_role(workspace_id, array['owner', 'manager', 'member']::public.workspace_role[]));
create policy "snapshots_delete_manager" on public.market_snapshots for delete to authenticated using (private.has_workspace_role(workspace_id, array['owner', 'manager']::public.workspace_role[]));

create policy "notifications_select_own" on public.notifications for select to authenticated using ((select auth.uid()) = user_id);
create policy "notifications_update_own" on public.notifications for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "notifications_delete_own" on public.notifications for delete to authenticated using ((select auth.uid()) = user_id);

create policy "contact_select_manager" on public.contact_messages for select to authenticated using (workspace_id is not null and private.has_workspace_role(workspace_id, array['owner', 'manager']::public.workspace_role[]));
create policy "audit_select_manager" on public.audit_logs for select to authenticated using (workspace_id is not null and private.has_workspace_role(workspace_id, array['owner', 'manager']::public.workspace_role[]));
