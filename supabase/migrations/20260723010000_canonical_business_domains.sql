create type public.business_plan_status as enum (
  'draft',
  'active',
  'completed',
  'archived'
);
create type public.business_goal_status as enum (
  'draft',
  'active',
  'achieved',
  'cancelled'
);
create type public.metric_unit_type as enum (
  'number',
  'currency',
  'percentage'
);
create type public.metric_aggregation as enum (
  'sum',
  'average',
  'latest',
  'minimum',
  'maximum',
  'count'
);
create type public.goal_direction as enum (
  'increase',
  'decrease',
  'maintain'
);
create type public.business_initiative_status as enum (
  'planned',
  'active',
  'paused',
  'completed',
  'cancelled'
);
create type public.action_item_status as enum (
  'todo',
  'in_progress',
  'blocked',
  'completed',
  'cancelled'
);
create type public.business_review_period as enum (
  'weekly',
  'monthly',
  'quarterly',
  'annual',
  'custom'
);
create type public.business_partner_status as enum (
  'active',
  'inactive',
  'archived'
);
create type public.business_partner_role as enum (
  'supplier',
  'customer',
  'distributor',
  'reseller',
  'manufacturer',
  'logistics_provider',
  'customs_broker',
  'agent'
);

create table public.currencies (
  code text primary key check (code ~ '^[A-Z]{3}$'),
  name text not null unique check (char_length(trim(name)) between 2 and 80),
  symbol text not null check (char_length(symbol) between 1 and 8),
  decimal_digits smallint not null default 2
    check (decimal_digits between 0 and 4),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.currencies (code, name, symbol, decimal_digits)
values
  ('IDR', 'Indonesian Rupiah', 'Rp', 0),
  ('USD', 'United States Dollar', '$', 2),
  ('SGD', 'Singapore Dollar', 'S$', 2),
  ('MYR', 'Malaysian Ringgit', 'RM', 2),
  ('PHP', 'Philliphine Peso', '₱', 2),
  ('THB', 'Thai Baht', '฿', 2),
  ('VND', 'Vietnamese Dong', '₫', 0),
  ('JPY', 'Japanese Yen', '¥', 0),
  ('CNY', 'Chinese Yuan', 'CN¥', 2),
  ('AUD', 'Australian Dollar', 'A$', 2),
  ('EUR', 'Euro', '€', 2),
  ('GBP', 'Pound Sterling', '£', 2);

create table public.countries (
  code text primary key check (code ~ '^[A-Z]{2}$'),
  name text not null unique check (char_length(trim(name)) between 2 and 100),
  default_currency_code text not null references public.currencies(code)
    on update cascade on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.countries (code, name, default_currency_code)
values
  ('ID', 'Indonesia', 'IDR'),
  ('US', 'United States', 'USD'),
  ('SG', 'Singapore', 'SGD'),
  ('MY', 'Malaysia', 'MYR'),
  ('PH', 'Philippines', 'PHP'),
  ('TH', 'Thailand', 'THB'),
  ('VN', 'Vietnam', 'VND'),
  ('JP', 'Japan', 'JPY'),
  ('CN', 'China', 'CNY'),
  ('AU', 'Australia', 'AUD'),
  ('DE', 'Germany', 'EUR'),
  ('FR', 'France', 'EUR'),
  ('GB', 'United Kingdom', 'GBP');

alter table public.workspaces
  add constraint workspaces_country_fk
    foreign key (country_code) references public.countries(code)
    on update cascade on delete restrict,
  add constraint workspaces_currency_fk
    foreign key (currency_code) references public.currencies(code)
    on update cascade on delete restrict;

create table public.business_plans (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 160),
  description text check (description is null or char_length(description) <= 2000),
  status public.business_plan_status not null default 'draft',
  starts_on date not null,
  ends_on date not null,
  owner_id uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_plans_period_check check (ends_on >= starts_on),
  unique (workspace_id, id)
);

create table public.business_goals (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  business_plan_id uuid not null,
  title text not null check (char_length(trim(title)) between 2 and 160),
  description text check (description is null or char_length(description) <= 1500),
  status public.business_goal_status not null default 'draft',
  target_date date,
  owner_id uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (workspace_id, business_plan_id)
    references public.business_plans(workspace_id, id) on delete cascade,
  unique (workspace_id, id)
);

create table public.metric_definitions (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null check (code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  name text not null check (char_length(trim(name)) between 2 and 100),
  description text check (description is null or char_length(description) <= 500),
  unit_type public.metric_unit_type not null,
  unit_label text check (unit_label is null or char_length(trim(unit_label)) <= 30),
  aggregation public.metric_aggregation not null default 'latest',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, code),
  unique (workspace_id, name),
  unique (workspace_id, id)
);

create table public.goal_targets (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  business_goal_id uuid not null,
  metric_definition_id uuid not null,
  starting_value numeric(18, 4),
  target_value numeric(18, 4) not null,
  direction public.goal_direction not null default 'increase',
  target_date date,
  weight_percent numeric(5, 2) not null default 100
    check (weight_percent > 0 and weight_percent <= 100),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_goal_id, metric_definition_id),
  foreign key (workspace_id, business_goal_id)
    references public.business_goals(workspace_id, id) on delete cascade,
  foreign key (workspace_id, metric_definition_id)
    references public.metric_definitions(workspace_id, id) on delete restrict,
  unique (workspace_id, id)
);

create table public.metric_measurements (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  goal_target_id uuid not null,
  measured_value numeric(18, 4) not null,
  measured_at timestamptz not null default now(),
  source text not null default 'manual'
    check (char_length(trim(source)) between 2 and 50),
  note text check (note is null or char_length(note) <= 500),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  foreign key (workspace_id, goal_target_id)
    references public.goal_targets(workspace_id, id) on delete cascade
);

create table public.business_initiatives (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  business_plan_id uuid not null,
  business_goal_id uuid,
  title text not null check (char_length(trim(title)) between 2 and 160),
  description text check (description is null or char_length(description) <= 1500),
  status public.business_initiative_status not null default 'planned',
  starts_on date,
  ends_on date,
  budget_amount numeric(18, 2)
    check (budget_amount is null or budget_amount >= 0),
  owner_id uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_initiatives_period_check
    check (starts_on is null or ends_on is null or ends_on >= starts_on),
  foreign key (workspace_id, business_plan_id)
    references public.business_plans(workspace_id, id) on delete cascade,
  foreign key (workspace_id, business_goal_id)
    references public.business_goals(workspace_id, id)
    on delete set null (business_goal_id),
  unique (workspace_id, id)
);

create table public.action_items (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  business_initiative_id uuid not null,
  title text not null check (char_length(trim(title)) between 2 and 160),
  description text check (description is null or char_length(description) <= 1000),
  status public.action_item_status not null default 'todo',
  priority smallint not null default 2 check (priority between 1 and 4),
  assignee_id uuid references auth.users(id) on delete set null,
  starts_on date,
  due_on date,
  completed_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint action_items_period_check
    check (starts_on is null or due_on is null or due_on >= starts_on),
  constraint action_items_completion_check
    check (
      (status = 'completed' and completed_at is not null)
      or
      (status <> 'completed' and completed_at is null)
    ),
  foreign key (workspace_id, business_initiative_id)
    references public.business_initiatives(workspace_id, id) on delete cascade
);

create table public.business_reviews (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  business_plan_id uuid not null,
  period_type public.business_review_period not null,
  period_start date not null,
  period_end date not null,
  summary text not null check (char_length(trim(summary)) between 10 and 3000),
  wins text check (wins is null or char_length(wins) <= 3000),
  challenges text check (challenges is null or char_length(challenges) <= 3000),
  next_steps text check (next_steps is null or char_length(next_steps) <= 3000),
  reviewed_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_reviews_period_check check (period_end >= period_start),
  unique (business_plan_id, period_start, period_end),
  foreign key (workspace_id, business_plan_id)
    references public.business_plans(workspace_id, id) on delete cascade
);

create table public.business_partners (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legal_name text not null check (char_length(trim(legal_name)) between 2 and 160),
  display_name text check (display_name is null or char_length(trim(display_name)) between 2 and 120),
  status public.business_partner_status not null default 'active',
  country_code text references public.countries(code)
    on update cascade on delete restrict,
  default_currency_code text references public.currencies(code)
    on update cascade on delete restrict,
  email text check (email is null or char_length(trim(email)) between 3 and 254),
  phone text check (phone is null or char_length(trim(phone)) between 7 and 30),
  address_line text check (address_line is null or char_length(address_line) <= 300),
  city text check (city is null or char_length(trim(city)) between 2 and 100),
  province text check (province is null or char_length(trim(province)) between 2 and 100),
  postal_code text check (postal_code is null or char_length(trim(postal_code)) between 3 and 20),
  tax_identifier text check (tax_identifier is null or char_length(trim(tax_identifier)) <= 80),
  notes text check (notes is null or char_length(notes) <= 1500),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, legal_name)
);

create table public.business_partner_roles (
  business_partner_id uuid not null references public.business_partners(id) on delete cascade,
  role public.business_partner_role not null,
  created_at timestamptz not null default now(),
  primary key (business_partner_id, role)
);

create index countries_currency_idx
  on public.countries (default_currency_code, active);
create index business_plans_workspace_status_idx
  on public.business_plans (workspace_id, status, starts_on desc);
create index business_goals_workspace_plan_idx
  on public.business_goals (workspace_id, business_plan_id, status);
create index business_goals_owner_idx
  on public.business_goals (workspace_id, owner_id, status);
create index metric_definitions_workspace_type_idx
  on public.metric_definitions (workspace_id, unit_type);
create index goal_targets_workspace_goal_idx
  on public.goal_targets (workspace_id, business_goal_id);
create index metric_measurements_target_date_idx
  on public.metric_measurements (goal_target_id, measured_at desc);
create index metric_measurements_workspace_date_idx
  on public.metric_measurements (workspace_id, measured_at desc);
create index business_initiatives_workspace_plan_idx
  on public.business_initiatives (workspace_id, business_plan_id, status);
create index business_initiatives_goal_idx
  on public.business_initiatives (business_goal_id);
create index action_items_workspace_status_due_idx
  on public.action_items (workspace_id, status, due_on);
create index action_items_assignee_idx
  on public.action_items (workspace_id, assignee_id, status);
create index business_reviews_workspace_period_idx
  on public.business_reviews (workspace_id, period_end desc);
create index business_partners_workspace_status_idx
  on public.business_partners (workspace_id, status, legal_name);
create index business_partners_country_idx
  on public.business_partners (workspace_id, country_code);
create index business_partner_roles_role_idx
  on public.business_partner_roles (role, business_partner_id);

create trigger business_plans_set_updated_at
before update on public.business_plans
for each row execute function private.set_updated_at();
create trigger business_goals_set_updated_at
before update on public.business_goals
for each row execute function private.set_updated_at();
create trigger metric_definitions_set_updated_at
before update on public.metric_definitions
for each row execute function private.set_updated_at();
create trigger goal_targets_set_updated_at
before update on public.goal_targets
for each row execute function private.set_updated_at();
create trigger business_initiatives_set_updated_at
before update on public.business_initiatives
for each row execute function private.set_updated_at();
create trigger action_items_set_updated_at
before update on public.action_items
for each row execute function private.set_updated_at();
create trigger business_reviews_set_updated_at
before update on public.business_reviews
for each row execute function private.set_updated_at();
create trigger business_partners_set_updated_at
before update on public.business_partners
for each row execute function private.set_updated_at();

alter table public.currencies enable row level security;
alter table public.countries enable row level security;
alter table public.business_plans enable row level security;
alter table public.business_goals enable row level security;
alter table public.metric_definitions enable row level security;
alter table public.goal_targets enable row level security;
alter table public.metric_measurements enable row level security;
alter table public.business_initiatives enable row level security;
alter table public.action_items enable row level security;
alter table public.business_reviews enable row level security;
alter table public.business_partners enable row level security;
alter table public.business_partner_roles enable row level security;

create policy "currencies_select_authenticated"
on public.currencies for select to authenticated using (true);
create policy "countries_select_authenticated"
on public.countries for select to authenticated using (true);

create policy "business_plans_select_member"
on public.business_plans for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "business_plans_insert_editor"
on public.business_plans for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "business_plans_update_editor"
on public.business_plans for update to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
)
with check (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "business_plans_delete_manager"
on public.business_plans for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "business_goals_select_member"
on public.business_goals for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "business_goals_insert_editor"
on public.business_goals for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "business_goals_update_editor"
on public.business_goals for update to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
)
with check (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "business_goals_delete_manager"
on public.business_goals for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "metric_definitions_select_member"
on public.metric_definitions for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "metric_definitions_insert_editor"
on public.metric_definitions for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "metric_definitions_update_editor"
on public.metric_definitions for update to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
)
with check (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "metric_definitions_delete_manager"
on public.metric_definitions for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "goal_targets_select_member"
on public.goal_targets for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "goal_targets_insert_editor"
on public.goal_targets for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "goal_targets_update_editor"
on public.goal_targets for update to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
)
with check (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "goal_targets_delete_manager"
on public.goal_targets for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "metric_measurements_select_member"
on public.metric_measurements for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "metric_measurements_insert_editor"
on public.metric_measurements for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "metric_measurements_update_editor"
on public.metric_measurements for update to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
)
with check (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "metric_measurements_delete_manager"
on public.metric_measurements for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "business_initiatives_select_member"
on public.business_initiatives for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "business_initiatives_insert_editor"
on public.business_initiatives for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "business_initiatives_update_editor"
on public.business_initiatives for update to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
)
with check (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "business_initiatives_delete_manager"
on public.business_initiatives for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "action_items_select_member"
on public.action_items for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "action_items_insert_editor"
on public.action_items for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "action_items_update_editor"
on public.action_items for update to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
)
with check (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "action_items_delete_manager"
on public.action_items for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "business_reviews_select_member"
on public.business_reviews for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "business_reviews_insert_editor"
on public.business_reviews for insert to authenticated
with check (
  reviewed_by = (select auth.uid())
  and private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "business_reviews_update_author"
on public.business_reviews for update to authenticated
using (
  reviewed_by = (select auth.uid())
  or private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
)
with check (
  reviewed_by = (select auth.uid())
  or private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);
create policy "business_reviews_delete_manager"
on public.business_reviews for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "business_partners_select_member"
on public.business_partners for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "business_partners_insert_editor"
on public.business_partners for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "business_partners_update_editor"
on public.business_partners for update to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
)
with check (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager', 'member']::public.workspace_role[]
  )
);
create policy "business_partners_delete_manager"
on public.business_partners for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner', 'manager']::public.workspace_role[]
  )
);

create policy "business_partner_roles_select_member"
on public.business_partner_roles for select to authenticated
using (
  exists (
    select 1
    from public.business_partners
    where business_partners.id = business_partner_id
      and private.is_workspace_member(business_partners.workspace_id)
  )
);
create policy "business_partner_roles_insert_editor"
on public.business_partner_roles for insert to authenticated
with check (
  exists (
    select 1
    from public.business_partners
    where business_partners.id = business_partner_id
      and private.has_workspace_role(
        business_partners.workspace_id,
        array['owner', 'manager', 'member']::public.workspace_role[]
      )
  )
);
create policy "business_partner_roles_delete_editor"
on public.business_partner_roles for delete to authenticated
using (
  exists (
    select 1
    from public.business_partners
    where business_partners.id = business_partner_id
      and private.has_workspace_role(
        business_partners.workspace_id,
        array['owner', 'manager', 'member']::public.workspace_role[]
      )
  )
);
