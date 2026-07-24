create type public.financial_account_kind as enum (
  'cash',
  'bank',
  'e_wallet',
  'receivable',
  'payable',
  'other'
);

insert into public.permission_definitions (code, resource, action, description)
values
  (
    'financial_account.read',
    'financial_account',
    'read',
    'View financial accounts and calculated balances.'
  ),
  (
    'financial_account.manage',
    'financial_account',
    'manage',
    'Create and maintain workspace financial accounts.'
  ),
  (
    'transaction_category.read',
    'transaction_category',
    'read',
    'View transaction categories and classified actuals.'
  ),
  (
    'transaction_category.manage',
    'transaction_category',
    'manage',
    'Create and maintain workspace transaction categories.'
  );

create table public.financial_accounts (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null check (code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  name text not null check (char_length(trim(name)) between 2 and 100),
  account_kind public.financial_account_kind not null,
  currency_code text not null references public.currencies(code)
    on update cascade on delete restrict,
  opening_balance numeric(18, 2) not null default 0,
  is_default boolean not null default false,
  is_system boolean not null default false,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint financial_accounts_default_must_be_active
    check (not is_default or active),
  unique (workspace_id, code),
  unique (workspace_id, name),
  unique (workspace_id, id)
);

create unique index financial_accounts_single_default_idx
  on public.financial_accounts (workspace_id)
  where is_default;
create index financial_accounts_workspace_active_idx
  on public.financial_accounts (workspace_id, active, account_kind);

create table public.transaction_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  parent_category_id uuid,
  code text not null check (code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  name text not null check (char_length(trim(name)) between 2 and 100),
  transaction_type public.transaction_type not null,
  description text check (description is null or char_length(description) <= 300),
  is_system boolean not null default false,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transaction_categories_parent_must_differ
    check (parent_category_id is null or parent_category_id <> id),
  unique (workspace_id, code),
  unique (workspace_id, transaction_type, name),
  unique (workspace_id, id),
  foreign key (workspace_id, parent_category_id)
    references public.transaction_categories(workspace_id, id)
    on delete set null (parent_category_id)
);

create index transaction_categories_workspace_type_idx
  on public.transaction_categories (workspace_id, transaction_type, active);
create index transaction_categories_parent_idx
  on public.transaction_categories (parent_category_id);

create or replace function private.install_default_financial_structure(
  target_workspace_id uuid,
  actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  workspace_currency text;
begin
  select currency_code into workspace_currency
  from public.workspaces
  where id = target_workspace_id;

  insert into public.financial_accounts (
    workspace_id,
    code,
    name,
    account_kind,
    currency_code,
    is_default,
    is_system,
    created_by
  )
  values (
    target_workspace_id,
    'cash',
    'Kas',
    'cash',
    workspace_currency,
    true,
    true,
    actor_id
  )
  on conflict (workspace_id, code) do nothing;

  insert into public.transaction_categories (
    workspace_id,
    code,
    name,
    transaction_type,
    description,
    is_system,
    created_by
  )
  values
    (
      target_workspace_id,
      'sales_revenue',
      'Pendapatan Penjualan',
      'sale',
      'Pendapatan utama dari penjualan produk atau jasa.',
      true,
      actor_id
    ),
    (
      target_workspace_id,
      'other_revenue',
      'Pendapatan Lainnya',
      'sale',
      'Pendapatan usaha di luar penjualan utama.',
      true,
      actor_id
    ),
    (
      target_workspace_id,
      'raw_material',
      'Bahan Baku',
      'expense',
      'Pembelian bahan yang digunakan untuk menghasilkan produk.',
      true,
      actor_id
    ),
    (
      target_workspace_id,
      'packaging',
      'Pengemasan',
      'expense',
      'Biaya kemasan dan material pendukung.',
      true,
      actor_id
    ),
    (
      target_workspace_id,
      'payroll',
      'Gaji',
      'expense',
      'Gaji, upah, dan kompensasi tenaga kerja.',
      true,
      actor_id
    ),
    (
      target_workspace_id,
      'rent',
      'Sewa',
      'expense',
      'Sewa tempat, alat, atau fasilitas usaha.',
      true,
      actor_id
    ),
    (
      target_workspace_id,
      'marketing',
      'Pemasaran',
      'expense',
      'Promosi, iklan, dan aktivitas pemasaran.',
      true,
      actor_id
    ),
    (
      target_workspace_id,
      'transportation',
      'Transportasi',
      'expense',
      'Transportasi dan distribusi operasional.',
      true,
      actor_id
    ),
    (
      target_workspace_id,
      'tax',
      'Pajak',
      'expense',
      'Pajak dan pungutan resmi usaha.',
      true,
      actor_id
    ),
    (
      target_workspace_id,
      'bank_fee',
      'Biaya Bank',
      'expense',
      'Biaya administrasi dan layanan keuangan.',
      true,
      actor_id
    ),
    (
      target_workspace_id,
      'other_expense',
      'Pengeluaran Lainnya',
      'expense',
      'Pengeluaran yang belum memiliki kategori khusus.',
      true,
      actor_id
    )
  on conflict (workspace_id, code) do nothing;
end;
$$;

revoke all on function private.install_default_financial_structure(uuid, uuid)
from public, anon, authenticated;

do $$
declare
  workspace_record record;
begin
  for workspace_record in
    select id, created_by from public.workspaces
  loop
    perform private.install_default_financial_structure(
      workspace_record.id,
      workspace_record.created_by
    );
  end loop;
end;
$$;

create or replace function private.handle_workspace_financial_setup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.install_default_financial_structure(new.id, new.created_by);
  return new;
end;
$$;

revoke all on function private.handle_workspace_financial_setup()
from public, anon, authenticated;

create trigger on_workspace_created_install_financial_structure
after insert on public.workspaces
for each row execute function private.handle_workspace_financial_setup();

create or replace function private.ensure_workspace_default_financial_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_workspace_id uuid := coalesce(new.workspace_id, old.workspace_id);
  default_account_count integer;
begin
  if not exists (
    select 1
    from public.workspaces
    where id = affected_workspace_id
  ) then
    return coalesce(new, old);
  end if;

  select count(*)
  into default_account_count
  from public.financial_accounts
  where workspace_id = affected_workspace_id
    and is_default
    and active;

  if default_account_count <> 1 then
    raise exception
      'Workspace % must have exactly one active default financial account',
      affected_workspace_id;
  end if;

  return coalesce(new, old);
end;
$$;

create constraint trigger financial_accounts_require_workspace_default
after insert or update or delete on public.financial_accounts
deferrable initially deferred
for each row execute function private.ensure_workspace_default_financial_account();

create or replace function private.validate_transaction_category_parent()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_transaction_type public.transaction_type;
begin
  if new.parent_category_id is null then
    return new;
  end if;

  select transaction_type
  into parent_transaction_type
  from public.transaction_categories
  where workspace_id = new.workspace_id
    and id = new.parent_category_id;

  if parent_transaction_type is distinct from new.transaction_type then
    raise exception
      'Transaction category and its parent must use the same transaction type';
  end if;

  return new;
end;
$$;

create trigger transaction_categories_validate_parent
before insert or update of workspace_id, parent_category_id, transaction_type
on public.transaction_categories
for each row execute function private.validate_transaction_category_parent();

alter table public.transactions
  add column financial_account_id uuid;

update public.transactions transaction_record
set financial_account_id = account.id
from public.financial_accounts account
where account.workspace_id = transaction_record.workspace_id
  and account.is_default;

alter table public.transactions
  alter column financial_account_id set not null,
  add constraint transactions_workspace_financial_account_fkey
    foreign key (workspace_id, financial_account_id)
    references public.financial_accounts(workspace_id, id)
    on delete restrict;

create index transactions_workspace_account_date_idx
  on public.transactions (
    workspace_id,
    financial_account_id,
    transaction_date desc
  );

create or replace function private.assign_default_financial_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.financial_account_id is null then
    select id into new.financial_account_id
    from public.financial_accounts
    where workspace_id = new.workspace_id
      and is_default
      and active;
  end if;

  if new.financial_account_id is null then
    raise exception 'An active default financial account is required'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

revoke all on function private.assign_default_financial_account()
from public, anon, authenticated;

create trigger transactions_assign_default_financial_account
before insert or update of financial_account_id on public.transactions
for each row execute function private.assign_default_financial_account();

create table public.transaction_category_allocations (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  transaction_id uuid not null,
  transaction_category_id uuid not null,
  allocated_amount numeric(14, 2) not null check (allocated_amount > 0),
  note text check (note is null or char_length(note) <= 500),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (workspace_id, transaction_id)
    references public.transactions(workspace_id, id) on delete cascade,
  foreign key (workspace_id, transaction_category_id)
    references public.transaction_categories(workspace_id, id) on delete restrict,
  unique (transaction_id, transaction_category_id)
);

create index transaction_category_allocations_workspace_idx
  on public.transaction_category_allocations (
    workspace_id,
    transaction_category_id
  );
create index transaction_category_allocations_transaction_idx
  on public.transaction_category_allocations (transaction_id);

create trigger financial_accounts_set_updated_at
before update on public.financial_accounts
for each row execute function private.set_updated_at();
create trigger transaction_categories_set_updated_at
before update on public.transaction_categories
for each row execute function private.set_updated_at();
create trigger transaction_category_allocations_set_updated_at
before update on public.transaction_category_allocations
for each row execute function private.set_updated_at();

create trigger financial_accounts_protect_identity
before update on public.financial_accounts
for each row execute function private.prevent_column_changes(
  'id',
  'workspace_id',
  'code',
  'is_system',
  'created_by',
  'created_at'
);
create trigger transaction_categories_protect_identity
before update on public.transaction_categories
for each row execute function private.prevent_column_changes(
  'id',
  'workspace_id',
  'code',
  'transaction_type',
  'is_system',
  'created_by',
  'created_at'
);
create trigger transaction_category_allocations_protect_identity
before update on public.transaction_category_allocations
for each row execute function private.prevent_column_changes(
  'id',
  'workspace_id',
  'transaction_id',
  'transaction_category_id',
  'created_by',
  'created_at'
);

create or replace function private.ensure_transaction_category_allocation_total()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_transaction_id uuid;
  transaction_amount numeric(14, 2);
  allocation_total numeric(14, 2);
begin
  if tg_table_name = 'transactions' then
    target_transaction_id := new.id;
  elsif tg_op = 'DELETE' then
    target_transaction_id := old.transaction_id;
  else
    target_transaction_id := new.transaction_id;
  end if;

  select amount into transaction_amount
  from public.transactions
  where id = target_transaction_id;

  if transaction_amount is null then
    return null;
  end if;

  select coalesce(sum(allocated_amount), 0)
  into allocation_total
  from public.transaction_category_allocations
  where transaction_id = target_transaction_id;

  if allocation_total > transaction_amount then
    raise exception 'Category allocations (%) exceed transaction amount (%)',
      allocation_total,
      transaction_amount
      using errcode = '23514';
  end if;

  return null;
end;
$$;

revoke all on function private.ensure_transaction_category_allocation_total()
from public, anon, authenticated;

create constraint trigger transaction_category_allocations_within_amount
after insert or update or delete on public.transaction_category_allocations
deferrable initially deferred
for each row execute function private.ensure_transaction_category_allocation_total();

create constraint trigger transaction_amount_covers_category_allocations
after update of amount on public.transactions
deferrable initially deferred
for each row execute function private.ensure_transaction_category_allocation_total();

create or replace function private.enforce_transaction_category_type()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_type public.transaction_type;
  category_type public.transaction_type;
begin
  select type into source_type
  from public.transactions
  where workspace_id = new.workspace_id
    and id = new.transaction_id;

  select transaction_type into category_type
  from public.transaction_categories
  where workspace_id = new.workspace_id
    and id = new.transaction_category_id;

  if source_type is distinct from category_type then
    raise exception 'Transaction and category types must match'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_transaction_category_type()
from public, anon, authenticated;

create trigger transaction_category_allocations_enforce_type
before insert or update on public.transaction_category_allocations
for each row execute function private.enforce_transaction_category_type();

alter table public.financial_accounts enable row level security;
alter table public.transaction_categories enable row level security;
alter table public.transaction_category_allocations enable row level security;

create policy "financial_accounts_select_permitted"
on public.financial_accounts for select to authenticated
using (private.has_workspace_permission(workspace_id, 'financial_account.read'));
create policy "financial_accounts_insert_permitted"
on public.financial_accounts for insert to authenticated
with check (
  created_by = (select auth.uid())
  and not is_system
  and private.has_workspace_permission(workspace_id, 'financial_account.manage')
);
create policy "financial_accounts_update_permitted"
on public.financial_accounts for update to authenticated
using (private.has_workspace_permission(workspace_id, 'financial_account.manage'))
with check (private.has_workspace_permission(workspace_id, 'financial_account.manage'));
create policy "financial_accounts_delete_permitted"
on public.financial_accounts for delete to authenticated
using (
  not is_system
  and not is_default
  and private.has_workspace_permission(workspace_id, 'financial_account.manage')
);

create policy "transaction_categories_select_permitted"
on public.transaction_categories for select to authenticated
using (private.has_workspace_permission(workspace_id, 'transaction_category.read'));
create policy "transaction_categories_insert_permitted"
on public.transaction_categories for insert to authenticated
with check (
  created_by = (select auth.uid())
  and not is_system
  and private.has_workspace_permission(workspace_id, 'transaction_category.manage')
);
create policy "transaction_categories_update_permitted"
on public.transaction_categories for update to authenticated
using (private.has_workspace_permission(workspace_id, 'transaction_category.manage'))
with check (private.has_workspace_permission(workspace_id, 'transaction_category.manage'));
create policy "transaction_categories_delete_permitted"
on public.transaction_categories for delete to authenticated
using (
  not is_system
  and private.has_workspace_permission(workspace_id, 'transaction_category.manage')
);

create policy "category_allocations_select_permitted"
on public.transaction_category_allocations for select to authenticated
using (
  private.has_workspace_permission(workspace_id, 'transaction.read')
  and private.has_workspace_permission(workspace_id, 'transaction_category.read')
);
create policy "category_allocations_insert_permitted"
on public.transaction_category_allocations for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'transaction_category.read')
);
create policy "category_allocations_update_permitted"
on public.transaction_category_allocations for update to authenticated
using (
  private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'transaction_category.read')
)
with check (
  private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'transaction_category.read')
);
create policy "category_allocations_delete_permitted"
on public.transaction_category_allocations for delete to authenticated
using (
  private.has_workspace_permission(workspace_id, 'transaction.write')
  and private.has_workspace_permission(workspace_id, 'transaction_category.read')
);

insert into public.workspace_role_permissions (
  workspace_id,
  workspace_role_id,
  permission_code,
  granted_by
)
select
  role_record.workspace_id,
  role_record.id,
  permission_code,
  role_record.created_by
from public.workspace_roles role_record
cross join unnest(array[
  'financial_account.read',
  'financial_account.manage',
  'transaction_category.read',
  'transaction_category.manage'
]) as permission_code
where role_record.code = 'manager'
  and role_record.is_system
on conflict do nothing;

insert into public.workspace_role_permissions (
  workspace_id,
  workspace_role_id,
  permission_code,
  granted_by
)
select
  role_record.workspace_id,
  role_record.id,
  permission_code,
  role_record.created_by
from public.workspace_roles role_record
cross join unnest(array[
  'financial_account.read',
  'transaction_category.read'
]) as permission_code
where role_record.code in ('member', 'viewer')
  and role_record.is_system
on conflict do nothing;

create or replace function private.install_default_financial_permissions(
  target_workspace_id uuid,
  actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workspace_role_permissions (
    workspace_id,
    workspace_role_id,
    permission_code,
    granted_by
  )
  select
    role_record.workspace_id,
    role_record.id,
    permission_code,
    actor_id
  from public.workspace_roles role_record
  cross join lateral unnest(
    case role_record.code
      when 'manager' then array[
        'financial_account.read',
        'financial_account.manage',
        'transaction_category.read',
        'transaction_category.manage'
      ]
      when 'member' then array[
        'financial_account.read',
        'transaction_category.read'
      ]
      when 'viewer' then array[
        'financial_account.read',
        'transaction_category.read'
      ]
      else array[]::text[]
    end
  ) as permission_code
  where role_record.workspace_id = target_workspace_id
    and role_record.is_system
  on conflict do nothing;
end;
$$;

revoke all on function private.install_default_financial_permissions(uuid, uuid)
from public, anon, authenticated;

create or replace function private.handle_workspace_role_setup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.install_default_workspace_roles(new.id, new.created_by);
  perform private.install_default_financial_permissions(new.id, new.created_by);
  return new;
end;
$$;

create trigger financial_accounts_audit
after insert or update or delete on public.financial_accounts
for each row execute function private.write_workspace_audit_log('financial_account');
create trigger transaction_categories_audit
after insert or update or delete on public.transaction_categories
for each row execute function private.write_workspace_audit_log('transaction_category');
create trigger transaction_category_allocations_audit
after insert or update or delete on public.transaction_category_allocations
for each row execute function private.write_workspace_audit_log(
  'transaction_category_allocation'
);

create view public.financial_account_balances
with (security_invoker = true)
as
select
  account.workspace_id,
  account.id as financial_account_id,
  account.code,
  account.name,
  account.account_kind,
  account.currency_code,
  account.opening_balance,
  (
    account.opening_balance
    + coalesce(sum(
      case
        when transaction_record.type = 'sale' then transaction_record.amount
        when transaction_record.type = 'expense' then -transaction_record.amount
      end
    ), 0)
  )::numeric(18, 2) as current_balance,
  max(transaction_record.transaction_date) as latest_transaction_date
from public.financial_accounts account
left join public.transactions transaction_record
  on transaction_record.workspace_id = account.workspace_id
  and transaction_record.financial_account_id = account.id
group by account.workspace_id, account.id;

create view public.transaction_category_actuals
with (security_invoker = true)
as
select
  category.workspace_id,
  category.id as transaction_category_id,
  category.code,
  category.name,
  category.transaction_type,
  coalesce(sum(allocation.allocated_amount), 0)::numeric(18, 2)
    as allocated_total,
  count(distinct allocation.transaction_id)::bigint as transaction_count,
  max(transaction_record.transaction_date) as latest_transaction_date
from public.transaction_categories category
left join public.transaction_category_allocations allocation
  on allocation.workspace_id = category.workspace_id
  and allocation.transaction_category_id = category.id
left join public.transactions transaction_record
  on transaction_record.workspace_id = allocation.workspace_id
  and transaction_record.id = allocation.transaction_id
group by category.workspace_id, category.id;

revoke all on public.financial_account_balances from anon;
revoke all on public.transaction_category_actuals from anon;
grant select on public.financial_account_balances to authenticated;
grant select on public.transaction_category_actuals to authenticated;
