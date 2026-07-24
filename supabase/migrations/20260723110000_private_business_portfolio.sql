create type public.business_portfolio_status as enum (
  'draft',
  'active',
  'archived'
);

insert into public.permission_definitions (code, resource, action, description)
values
  (
    'portfolio.read',
    'portfolio',
    'read',
    'View private business portfolios and evidence-based achievements.'
  ),
  (
    'portfolio.manage',
    'portfolio',
    'manage',
    'Create and maintain private business portfolios.'
  );

create table public.business_portfolios (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 160),
  summary text check (summary is null or char_length(summary) <= 2000),
  cover_image_url text check (
    cover_image_url is null
    or (
      char_length(cover_image_url) <= 2048
      and cover_image_url ~ '^https://'
    )
  ),
  status public.business_portfolio_status not null default 'draft',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, title),
  unique (workspace_id, id)
);

create table public.business_portfolio_reviews (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  business_portfolio_id uuid not null,
  business_review_id uuid not null,
  display_order integer not null default 0 check (display_order >= 0),
  note text check (note is null or char_length(note) <= 500),
  added_by uuid not null references auth.users(id) on delete restrict,
  added_at timestamptz not null default now(),
  unique (business_portfolio_id, business_review_id),
  foreign key (workspace_id, business_portfolio_id)
    references public.business_portfolios(workspace_id, id) on delete cascade,
  foreign key (workspace_id, business_review_id)
    references public.business_reviews(workspace_id, id) on delete restrict
);

create table public.achievement_definitions (
  code text primary key check (code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  name text not null unique check (char_length(trim(name)) between 2 and 100),
  description text not null check (char_length(trim(description)) between 10 and 500),
  icon_key text not null check (icon_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  display_order integer not null default 0 check (display_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.achievement_definitions (
  code,
  name,
  description,
  icon_key,
  display_order
)
values
  (
    'first_finalized_review',
    'Langkah Evaluasi Pertama',
    'Menyelesaikan evaluasi bisnis pertama dengan bukti snapshot.',
    'clipboard-check',
    10
  ),
  (
    'three_finalized_reviews',
    'Ritme Evaluasi',
    'Menyelesaikan sedikitnya tiga evaluasi bisnis.',
    'calendar-check',
    20
  ),
  (
    'all_targets_measured',
    'Target Terukur',
    'Memfinalisasi evaluasi dengan realisasi tersedia untuk seluruh target.',
    'target',
    30
  ),
  (
    'execution_on_track',
    'Eksekusi Terjaga',
    'Memfinalisasi evaluasi dengan tindakan selesai dan tanpa tindakan terlambat.',
    'circle-check-big',
    40
  );

create table public.workspace_achievements (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  achievement_code text not null references public.achievement_definitions(code)
    on update cascade on delete restrict,
  evidence_business_review_id uuid not null,
  awarded_at timestamptz not null default now(),
  unique (workspace_id, achievement_code),
  foreign key (workspace_id, evidence_business_review_id)
    references public.business_reviews(workspace_id, id) on delete restrict
);

create index business_portfolios_workspace_status_idx
  on public.business_portfolios (workspace_id, status, updated_at desc);
create index business_portfolio_reviews_order_idx
  on public.business_portfolio_reviews (
    business_portfolio_id,
    display_order,
    added_at
  );
create index workspace_achievements_workspace_awarded_idx
  on public.workspace_achievements (workspace_id, awarded_at desc);

create or replace function private.validate_business_portfolio_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.business_reviews review
    where review.workspace_id = new.workspace_id
      and review.id = new.business_review_id
      and review.status = 'finalized'
  ) then
    raise exception 'A portfolio can only feature a finalized business review';
  end if;

  return new;
end;
$$;

create trigger business_portfolio_reviews_require_finalized_review
before insert or update of workspace_id, business_review_id
on public.business_portfolio_reviews
for each row execute function private.validate_business_portfolio_review();

create or replace function private.evaluate_business_review_achievements(
  target_business_review_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  review_record public.business_reviews%rowtype;
begin
  select *
  into review_record
  from public.business_reviews
  where id = target_business_review_id
    and status = 'finalized';

  if review_record.id is null then
    raise exception 'Achievements require a finalized business review';
  end if;

  insert into public.workspace_achievements (
    workspace_id,
    achievement_code,
    evidence_business_review_id
  )
  values (
    review_record.workspace_id,
    'first_finalized_review',
    review_record.id
  )
  on conflict (workspace_id, achievement_code) do nothing;

  if (
    select count(*)
    from public.business_reviews
    where workspace_id = review_record.workspace_id
      and status = 'finalized'
  ) >= 3 then
    insert into public.workspace_achievements (
      workspace_id,
      achievement_code,
      evidence_business_review_id
    )
    values (
      review_record.workspace_id,
      'three_finalized_reviews',
      review_record.id
    )
    on conflict (workspace_id, achievement_code) do nothing;
  end if;

  if exists (
    select 1
    from public.business_review_summaries summary
    where summary.business_review_id = review_record.id
      and summary.target_count > 0
      and summary.measured_target_count = summary.target_count
  ) then
    insert into public.workspace_achievements (
      workspace_id,
      achievement_code,
      evidence_business_review_id
    )
    values (
      review_record.workspace_id,
      'all_targets_measured',
      review_record.id
    )
    on conflict (workspace_id, achievement_code) do nothing;
  end if;

  if exists (
    select 1
    from public.business_review_action_item_snapshots snapshot
    where snapshot.business_review_id = review_record.id
      and snapshot.completed_count > 0
      and snapshot.overdue_count = 0
  ) then
    insert into public.workspace_achievements (
      workspace_id,
      achievement_code,
      evidence_business_review_id
    )
    values (
      review_record.workspace_id,
      'execution_on_track',
      review_record.id
    )
    on conflict (workspace_id, achievement_code) do nothing;
  end if;
end;
$$;

revoke all on function private.evaluate_business_review_achievements(uuid)
from public, anon, authenticated;

do $$
declare
  finalized_review record;
begin
  for finalized_review in
    select id
    from public.business_reviews
    where status = 'finalized'
    order by finalized_at, id
  loop
    perform private.evaluate_business_review_achievements(finalized_review.id);
  end loop;
end;
$$;

create or replace function public.finalize_business_review(
  target_business_review_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
begin
  perform private.refresh_business_review_snapshots(
    target_business_review_id,
    actor_id
  );

  update public.business_reviews
  set
    status = 'finalized',
    finalized_at = now()
  where id = target_business_review_id
    and status = 'draft';

  if not found then
    raise exception 'Business review could not be finalized';
  end if;

  perform private.evaluate_business_review_achievements(
    target_business_review_id
  );
end;
$$;

alter table public.business_portfolios enable row level security;
alter table public.business_portfolio_reviews enable row level security;
alter table public.achievement_definitions enable row level security;
alter table public.workspace_achievements enable row level security;

create policy "business_portfolios_select_permitted"
on public.business_portfolios for select to authenticated
using (private.has_workspace_permission(workspace_id, 'portfolio.read'));
create policy "business_portfolios_insert_permitted"
on public.business_portfolios for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'portfolio.manage')
);
create policy "business_portfolios_update_permitted"
on public.business_portfolios for update to authenticated
using (private.has_workspace_permission(workspace_id, 'portfolio.manage'))
with check (private.has_workspace_permission(workspace_id, 'portfolio.manage'));
create policy "business_portfolios_delete_permitted"
on public.business_portfolios for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'portfolio.manage'));

create policy "business_portfolio_reviews_select_permitted"
on public.business_portfolio_reviews for select to authenticated
using (private.has_workspace_permission(workspace_id, 'portfolio.read'));
create policy "business_portfolio_reviews_insert_permitted"
on public.business_portfolio_reviews for insert to authenticated
with check (
  added_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'portfolio.manage')
);
create policy "business_portfolio_reviews_update_permitted"
on public.business_portfolio_reviews for update to authenticated
using (private.has_workspace_permission(workspace_id, 'portfolio.manage'))
with check (private.has_workspace_permission(workspace_id, 'portfolio.manage'));
create policy "business_portfolio_reviews_delete_permitted"
on public.business_portfolio_reviews for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'portfolio.manage'));

create policy "achievement_definitions_read_authenticated"
on public.achievement_definitions for select to authenticated
using (true);
create policy "workspace_achievements_select_permitted"
on public.workspace_achievements for select to authenticated
using (private.has_workspace_permission(workspace_id, 'portfolio.read'));

create trigger business_portfolios_set_updated_at
before update on public.business_portfolios
for each row execute function private.set_updated_at();
create trigger business_portfolios_protect_identity
before update on public.business_portfolios
for each row execute function private.prevent_column_changes(
  'id',
  'workspace_id',
  'created_by'
);
create trigger business_portfolio_reviews_protect_identity
before update on public.business_portfolio_reviews
for each row execute function private.prevent_column_changes(
  'id',
  'workspace_id',
  'business_portfolio_id',
  'business_review_id',
  'added_by'
);

create trigger business_portfolios_audit
after insert or update or delete on public.business_portfolios
for each row execute function private.write_workspace_audit_log(
  'business_portfolio'
);
create trigger business_portfolio_reviews_audit
after insert or update or delete on public.business_portfolio_reviews
for each row execute function private.write_workspace_audit_log(
  'business_portfolio_review'
);
create trigger workspace_achievements_audit
after insert or update or delete on public.workspace_achievements
for each row execute function private.write_workspace_audit_log(
  'workspace_achievement'
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
cross join lateral unnest(
  case role_record.code
    when 'manager' then array['portfolio.read', 'portfolio.manage']
    when 'member' then array['portfolio.read']
    when 'viewer' then array['portfolio.read']
    else array[]::text[]
  end
) as permission_code
where role_record.is_system
on conflict do nothing;

create or replace function private.install_default_portfolio_permissions(
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
      when 'manager' then array['portfolio.read', 'portfolio.manage']
      when 'member' then array['portfolio.read']
      when 'viewer' then array['portfolio.read']
      else array[]::text[]
    end
  ) as permission_code
  where role_record.workspace_id = target_workspace_id
    and role_record.is_system
  on conflict do nothing;
end;
$$;

revoke all on function private.install_default_portfolio_permissions(uuid, uuid)
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
  perform private.install_default_portfolio_permissions(new.id, new.created_by);
  return new;
end;
$$;

create view public.business_portfolio_evidence
with (security_invoker = true)
as
select
  portfolio.workspace_id,
  portfolio.id as business_portfolio_id,
  portfolio.title,
  portfolio.status,
  portfolio_review.business_review_id,
  portfolio_review.display_order,
  review.business_plan_id,
  review.period_start,
  review.period_end,
  review.summary as review_summary,
  review.finalized_at
from public.business_portfolios portfolio
join public.business_portfolio_reviews portfolio_review
  on portfolio_review.workspace_id = portfolio.workspace_id
  and portfolio_review.business_portfolio_id = portfolio.id
join public.business_reviews review
  on review.workspace_id = portfolio_review.workspace_id
  and review.id = portfolio_review.business_review_id;

create view public.workspace_achievement_details
with (security_invoker = true)
as
select
  achievement.workspace_id,
  achievement.id as workspace_achievement_id,
  achievement.achievement_code,
  definition.name,
  definition.description,
  definition.icon_key,
  definition.display_order,
  achievement.evidence_business_review_id,
  achievement.awarded_at
from public.workspace_achievements achievement
join public.achievement_definitions definition
  on definition.code = achievement.achievement_code
where definition.active;

revoke all on public.business_portfolio_evidence from anon;
revoke all on public.workspace_achievement_details from anon;
grant select on public.business_portfolio_evidence to authenticated;
grant select on public.workspace_achievement_details to authenticated;
