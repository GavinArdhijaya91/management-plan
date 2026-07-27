-- Reference categories are inserted by migrations because production needs them too.
-- These passwordless identities are deterministic RLS personas, not login accounts.
-- This seed is idempotent and must only be used for local development or staging.

insert into auth.users (
  id,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  email_confirmed_at,
  created_at,
  updated_at
)
values
  ('a1000000-0000-0000-0000-000000000001', 'owner@siapin.local', '{"provider":"email","providers":["email"]}', '{"full_name":"Ayu Owner"}', now(), '2026-01-01 00:00:01+00', now()),
  ('a1000000-0000-0000-0000-000000000002', 'manager@siapin.local', '{"provider":"email","providers":["email"]}', '{"full_name":"Bima Manager"}', now(), '2026-01-01 00:00:02+00', now()),
  ('a1000000-0000-0000-0000-000000000003', 'staff@siapin.local', '{"provider":"email","providers":["email"]}', '{"full_name":"Citra Staff"}', now(), '2026-01-01 00:00:03+00', now()),
  ('a1000000-0000-0000-0000-000000000004', 'viewer@siapin.local', '{"provider":"email","providers":["email"]}', '{"full_name":"Damar Viewer"}', now(), '2026-01-01 00:00:04+00', now()),
  ('a1000000-0000-0000-0000-000000000005', 'suspended@siapin.local', '{"provider":"email","providers":["email"]}', '{"full_name":"Eka Suspended"}', now(), '2026-01-01 00:00:05+00', now()),
  ('a1000000-0000-0000-0000-000000000006', 'outsider@siapin.local', '{"provider":"email","providers":["email"]}', '{"full_name":"Farah Outsider"}', now(), '2026-01-01 00:00:06+00', now()),
  ('a1000000-0000-0000-0000-000000000007', 'other-owner@siapin.local', '{"provider":"email","providers":["email"]}', '{"full_name":"Gilang Other Owner"}', now(), '2026-01-01 00:00:07+00', now())
on conflict (id) do update
set
  email = excluded.email,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  email_confirmed_at = excluded.email_confirmed_at,
  updated_at = now();

do $$
declare
  seed_user_id uuid;
  seed_workspace_id uuid;
  seed_plan_id uuid;
  seed_goal_id uuid;
  seed_metric_id uuid;
  seed_target_id uuid;
  seed_initiative_id uuid;
  seed_sale_transaction_id uuid;
  seed_expense_transaction_id uuid;
  seed_measurement_id uuid;
  seed_action_item_id uuid;
  seed_calendar_event_id uuid;
  seed_review_id uuid;
  seed_portfolio_id uuid;
  seed_partner_id uuid;
begin
  select id into seed_user_id
  from auth.users
  where id = 'a1000000-0000-0000-0000-000000000001';

  if seed_user_id is null then
    raise notice '[seed.skip] No Auth user found. Create a local development user, then rerun the seed.';
    return;
  end if;

  select id
  into seed_workspace_id
  from public.workspaces
  where slug = 'kedai-siapin-demo';

  if seed_workspace_id is null then
    insert into public.workspaces (
      name,
      slug,
      created_by,
      description,
      business_email,
      business_phone,
      address_line,
      city,
      province,
      postal_code,
      country_code,
      currency_code,
      timezone,
      latitude,
      longitude
    )
    values (
      'Kedai Siapin Demo',
      'kedai-siapin-demo',
      seed_user_id,
      'Workspace latihan untuk mencoba alur perencanaan dan operasional usaha.',
      'demo@siapin.local',
      '+62 812 0000 0000',
      'Jl. Contoh Usaha No. 10',
      'Bandung',
      'Jawa Barat',
      '40115',
      'ID',
      'IDR',
      'Asia/Jakarta',
      -6.9175,
      107.6191
    )
    returning id into seed_workspace_id;

    insert into public.workspace_members (workspace_id, user_id, role, job_title)
    values (seed_workspace_id, seed_user_id, 'owner', 'Pemilik Usaha');
  end if;

  insert into public.workspace_business_categories (workspace_id, category_id)
  select seed_workspace_id, id
  from public.business_categories
  where code = 'culinary'
  on conflict do nothing;

  insert into public.transactions (
    workspace_id,
    created_by,
    type,
    amount,
    cost_amount,
    transaction_date,
    note
  )
  select
    seed_workspace_id,
    seed_user_id,
    'sale',
    1250000,
    650000,
    current_date - 2,
    'Penjualan harian demo'
  where not exists (
    select 1
    from public.transactions
    where workspace_id = seed_workspace_id
      and note = 'Penjualan harian demo'
  );

  insert into public.transactions (
    workspace_id,
    created_by,
    type,
    amount,
    cost_amount,
    transaction_date,
    note
  )
  select
    seed_workspace_id,
    seed_user_id,
    'expense',
    275000,
    0,
    current_date - 1,
    'Belanja kemasan demo'
  where not exists (
    select 1
    from public.transactions
    where workspace_id = seed_workspace_id
      and note = 'Belanja kemasan demo'
  );

  select id into seed_plan_id
  from public.business_plans
  where workspace_id = seed_workspace_id
    and title = 'Rencana Pertumbuhan Kedai';

  if seed_plan_id is null then
    insert into public.business_plans (
      workspace_id,
      title,
      description,
      status,
      starts_on,
      ends_on,
      owner_id,
      created_by
    )
    values (
      seed_workspace_id,
      'Rencana Pertumbuhan Kedai',
      'Rencana demo untuk menghubungkan target, program, tindakan, dan evaluasi.',
      'draft',
      date_trunc('year', current_date)::date,
      (date_trunc('year', current_date) + interval '1 year - 1 day')::date,
      seed_user_id,
      seed_user_id
    )
    returning id into seed_plan_id;
  end if;

  select id into seed_goal_id
  from public.business_goals
  where workspace_id = seed_workspace_id
    and title = 'Meningkatkan omzet bulanan';

  if seed_goal_id is null then
    insert into public.business_goals (
      workspace_id,
      business_plan_id,
      title,
      description,
      status,
      target_date,
      owner_id,
      created_by
    )
    values (
      seed_workspace_id,
      seed_plan_id,
      'Meningkatkan omzet bulanan',
      'Target demo untuk membuktikan alur plan-to-actual.',
      'draft',
      (date_trunc('month', current_date) + interval '1 month - 1 day')::date,
      seed_user_id,
      seed_user_id
    )
    returning id into seed_goal_id;
  end if;

  select id into seed_metric_id
  from public.metric_definitions
  where workspace_id = seed_workspace_id
    and code = 'monthly_revenue';

  if seed_metric_id is null then
    insert into public.metric_definitions (
      workspace_id,
      code,
      name,
      description,
      unit_type,
      unit_label,
      aggregation,
      created_by
    )
    values (
      seed_workspace_id,
      'monthly_revenue',
      'Omzet Bulanan',
      'Total pendapatan penjualan dalam satu bulan.',
      'currency',
      'IDR',
      'sum',
      seed_user_id
    )
    returning id into seed_metric_id;
  end if;

  select id into seed_target_id
  from public.goal_targets
  where business_goal_id = seed_goal_id
    and metric_definition_id = seed_metric_id;

  if seed_target_id is null then
    insert into public.goal_targets (
      workspace_id,
      business_goal_id,
      metric_definition_id,
      starting_value,
      target_value,
      direction,
      target_date,
      created_by
    )
    values (
      seed_workspace_id,
      seed_goal_id,
      seed_metric_id,
      12000000,
      20000000,
      'increase',
      (date_trunc('month', current_date) + interval '1 month - 1 day')::date,
      seed_user_id
    )
    returning id into seed_target_id;
  end if;

  insert into public.metric_measurements (
    workspace_id,
    goal_target_id,
    measured_value,
    measured_at,
    source,
    note,
    created_by
  )
  select
    seed_workspace_id,
    seed_target_id,
    1250000,
    now(),
    'manual',
    'Realisasi awal demo',
    seed_user_id
  where not exists (
    select 1
    from public.metric_measurements
    where goal_target_id = seed_target_id
      and note = 'Realisasi awal demo'
  );

  select id into seed_initiative_id
  from public.business_initiatives
  where workspace_id = seed_workspace_id
    and title = 'Promosi menu unggulan';

  if seed_initiative_id is null then
    insert into public.business_initiatives (
      workspace_id,
      business_plan_id,
      business_goal_id,
      title,
      description,
      status,
      starts_on,
      ends_on,
      budget_amount,
      owner_id,
      created_by
    )
    values (
      seed_workspace_id,
      seed_plan_id,
      seed_goal_id,
      'Promosi menu unggulan',
      'Program demo untuk menaikkan omzet melalui promosi terarah.',
      'planned',
      current_date,
      current_date + 30,
      1500000,
      seed_user_id,
      seed_user_id
    )
    returning id into seed_initiative_id;
  end if;

  insert into public.action_items (
    workspace_id,
    business_initiative_id,
    title,
    description,
    status,
    priority,
    assignee_id,
    due_on,
    created_by
  )
  select
    seed_workspace_id,
    seed_initiative_id,
    'Siapkan materi promosi',
    'Buat foto dan teks promosi untuk menu unggulan.',
    'in_progress',
    2,
    seed_user_id,
    current_date + 7,
    seed_user_id
  where not exists (
    select 1
    from public.action_items
    where business_initiative_id = seed_initiative_id
      and title = 'Siapkan materi promosi'
  );

  select id into seed_sale_transaction_id
  from public.transactions
  where workspace_id = seed_workspace_id
    and note = 'Penjualan harian demo';

  select id into seed_expense_transaction_id
  from public.transactions
  where workspace_id = seed_workspace_id
    and note = 'Belanja kemasan demo';

  insert into public.transaction_category_allocations (
    workspace_id,
    transaction_id,
    transaction_category_id,
    allocated_amount,
    created_by
  )
  select
    seed_workspace_id,
    seed_sale_transaction_id,
    category.id,
    1250000,
    seed_user_id
  from public.transaction_categories category
  where category.workspace_id = seed_workspace_id
    and category.code = 'sales_revenue'
  on conflict do nothing;

  insert into public.transaction_category_allocations (
    workspace_id,
    transaction_id,
    transaction_category_id,
    allocated_amount,
    created_by
  )
  select
    seed_workspace_id,
    seed_expense_transaction_id,
    category.id,
    275000,
    seed_user_id
  from public.transaction_categories category
  where category.workspace_id = seed_workspace_id
    and category.code = 'packaging'
  on conflict do nothing;

  select id into seed_measurement_id
  from public.metric_measurements
  where goal_target_id = seed_target_id
    and note = 'Realisasi awal demo';

  select id into seed_action_item_id
  from public.action_items
  where business_initiative_id = seed_initiative_id
    and title = 'Siapkan materi promosi';

  select id into seed_calendar_event_id
  from public.calendar_events
  where workspace_id = seed_workspace_id
    and title = 'Publikasi promosi menu unggulan';

  if seed_calendar_event_id is null then
    insert into public.calendar_events (
      workspace_id,
      created_by,
      title,
      type,
      starts_at,
      ends_at,
      notes
    )
    values (
      seed_workspace_id,
      seed_user_id,
      'Publikasi promosi menu unggulan',
      'other',
      date_trunc('day', now()) + interval '7 days 09:00',
      date_trunc('day', now()) + interval '7 days 10:00',
      'Agenda aktual yang terhubung ke action item demo.'
    )
    returning id into seed_calendar_event_id;
  end if;

  insert into public.action_item_calendar_events (
    workspace_id,
    action_item_id,
    calendar_event_id,
    created_by
  )
  values (
    seed_workspace_id,
    seed_action_item_id,
    seed_calendar_event_id,
    seed_user_id
  )
  on conflict do nothing;

  insert into public.transaction_initiative_allocations (
    workspace_id,
    transaction_id,
    business_initiative_id,
    allocated_amount,
    note,
    created_by
  )
  values (
    seed_workspace_id,
    seed_sale_transaction_id,
    seed_initiative_id,
    500000,
    'Sebagian penjualan yang diatribusikan ke promosi demo.',
    seed_user_id
  )
  on conflict do nothing;

  insert into public.transaction_goal_target_contributions (
    workspace_id,
    transaction_id,
    goal_target_id,
    contribution_value,
    note,
    created_by
  )
  values (
    seed_workspace_id,
    seed_sale_transaction_id,
    seed_target_id,
    1250000,
    'Kontribusi transaksi terhadap target omzet demo.',
    seed_user_id
  )
  on conflict do nothing;

  insert into public.metric_measurement_transactions (
    workspace_id,
    metric_measurement_id,
    transaction_id,
    created_by
  )
  values (
    seed_workspace_id,
    seed_measurement_id,
    seed_sale_transaction_id,
    seed_user_id
  )
  on conflict do nothing;

  select id into seed_review_id
  from public.business_reviews
  where business_plan_id = seed_plan_id
    and period_start = date_trunc('month', current_date)::date
    and period_end = current_date;

  if seed_review_id is null then
    insert into public.business_reviews (
      workspace_id,
      business_plan_id,
      period_type,
      period_start,
      period_end,
      summary,
      wins,
      challenges,
      next_steps,
      reviewed_by
    )
    values (
      seed_workspace_id,
      seed_plan_id,
      'monthly',
      date_trunc('month', current_date)::date,
      current_date,
      'Evaluasi demo menghubungkan target, tindakan, dan hasil aktual usaha.',
      'Transaksi penjualan awal sudah tercatat dan terhubung ke target.',
      'Data historis masih terbatas karena workspace ini digunakan untuk demo.',
      'Lanjutkan pencatatan transaksi dan evaluasi hasil promosi berikutnya.',
      seed_user_id
    )
    returning id into seed_review_id;
  end if;

  if exists (
    select 1
    from public.business_reviews
    where id = seed_review_id
      and status = 'draft'
  ) then
    perform private.refresh_business_review_snapshots(
      seed_review_id,
      seed_user_id
    );

    update public.business_reviews
    set
      status = 'finalized',
      finalized_at = now()
    where id = seed_review_id;

    perform private.evaluate_business_review_achievements(seed_review_id);
  end if;

  select id into seed_portfolio_id
  from public.business_portfolios
  where workspace_id = seed_workspace_id
    and title = 'Perjalanan Kedai Siapin';

  if seed_portfolio_id is null then
    insert into public.business_portfolios (
      workspace_id,
      title,
      summary,
      status,
      created_by
    )
    values (
      seed_workspace_id,
      'Perjalanan Kedai Siapin',
      'Portfolio privat berbasis evaluasi bisnis yang sudah difinalisasi.',
      'active',
      seed_user_id
    )
    returning id into seed_portfolio_id;
  end if;

  insert into public.business_portfolio_reviews (
    workspace_id,
    business_portfolio_id,
    business_review_id,
    display_order,
    note,
    added_by
  )
  values (
    seed_workspace_id,
    seed_portfolio_id,
    seed_review_id,
    10,
    'Evaluasi pertama yang menjadi bukti perjalanan usaha demo.',
    seed_user_id
  )
  on conflict do nothing;

  select id into seed_partner_id
  from public.business_partners
  where workspace_id = seed_workspace_id
    and legal_name = 'Pemasok Bahan Demo';

  if seed_partner_id is null then
    insert into public.business_partners (
      workspace_id,
      legal_name,
      display_name,
      country_code,
      default_currency_code,
      email,
      city,
      province,
      notes,
      created_by
    )
    values (
      seed_workspace_id,
      'Pemasok Bahan Demo',
      'Pemasok Demo',
      'ID',
      'IDR',
      'supplier@siapin.local',
      'Bandung',
      'Jawa Barat',
      'Mitra fiktif untuk pengembangan lokal.',
      seed_user_id
    )
    returning id into seed_partner_id;
  end if;

  insert into public.business_partner_roles (business_partner_id, role)
  values (seed_partner_id, 'supplier')
  on conflict do nothing;

  raise notice '[seed.complete] Demo workspace prepared: %', seed_workspace_id;
end;
$$;

do $$
declare
  primary_workspace_id uuid;
  secondary_workspace_id uuid;
  secondary_plan_id uuid;
  manager_role_id uuid;
  member_role_id uuid;
  viewer_role_id uuid;
  secondary_owner_role_id uuid;
begin
  select id into primary_workspace_id
  from public.workspaces
  where slug = 'kedai-siapin-demo';

  if primary_workspace_id is null then
    raise exception 'Primary persona workspace was not created';
  end if;

  select id into manager_role_id
  from public.workspace_roles
  where workspace_id = primary_workspace_id and code = 'manager';
  select id into member_role_id
  from public.workspace_roles
  where workspace_id = primary_workspace_id and code = 'member';
  select id into viewer_role_id
  from public.workspace_roles
  where workspace_id = primary_workspace_id and code = 'viewer';

  insert into public.workspace_members (
    workspace_id,
    user_id,
    role,
    workspace_role_id,
    status,
    job_title
  )
  values
    (
      primary_workspace_id,
      'a1000000-0000-0000-0000-000000000002',
      'manager',
      manager_role_id,
      'active',
      'Manajer Operasional'
    ),
    (
      primary_workspace_id,
      'a1000000-0000-0000-0000-000000000003',
      'member',
      member_role_id,
      'active',
      'Staf Operasional'
    ),
    (
      primary_workspace_id,
      'a1000000-0000-0000-0000-000000000004',
      'viewer',
      viewer_role_id,
      'active',
      'Pengamat Bisnis'
    ),
    (
      primary_workspace_id,
      'a1000000-0000-0000-0000-000000000005',
      'member',
      member_role_id,
      'suspended',
      'Staf Ditangguhkan'
    )
  on conflict (workspace_id, user_id) do update
  set
    role = excluded.role,
    workspace_role_id = excluded.workspace_role_id,
    status = excluded.status,
    job_title = excluded.job_title;

  select id into secondary_workspace_id
  from public.workspaces
  where slug = 'studio-siapin-demo';

  if secondary_workspace_id is null then
    insert into public.workspaces (
      id,
      name,
      slug,
      created_by,
      description,
      business_email,
      city,
      province,
      country_code,
      currency_code,
      timezone
    )
    values (
      'a2000000-0000-0000-0000-000000000002',
      'Studio Siapin Demo',
      'studio-siapin-demo',
      'a1000000-0000-0000-0000-000000000007',
      'Workspace pembanding untuk membuktikan isolasi tenant.',
      'studio@siapin.local',
      'Jakarta',
      'DKI Jakarta',
      'ID',
      'IDR',
      'Asia/Jakarta'
    )
    returning id into secondary_workspace_id;
  end if;

  select id into secondary_owner_role_id
  from public.workspace_roles
  where workspace_id = secondary_workspace_id and code = 'owner';

  insert into public.workspace_members (
    workspace_id,
    user_id,
    role,
    workspace_role_id,
    status,
    job_title
  )
  values (
    secondary_workspace_id,
    'a1000000-0000-0000-0000-000000000007',
    'owner',
    secondary_owner_role_id,
    'active',
    'Pemilik Studio'
  )
  on conflict (workspace_id, user_id) do update
  set
    role = excluded.role,
    workspace_role_id = excluded.workspace_role_id,
    status = excluded.status,
    job_title = excluded.job_title;

  insert into public.workspace_business_categories (workspace_id, category_id)
  select secondary_workspace_id, id
  from public.business_categories
  where code = 'creative'
  on conflict do nothing;

  insert into public.transactions (
    workspace_id,
    created_by,
    type,
    amount,
    cost_amount,
    transaction_date,
    note
  )
  select
    secondary_workspace_id,
    'a1000000-0000-0000-0000-000000000007',
    'sale',
    3500000,
    750000,
    current_date - 3,
    'Proyek desain workspace pembanding'
  where not exists (
    select 1 from public.transactions
    where workspace_id = secondary_workspace_id
      and note = 'Proyek desain workspace pembanding'
  );

  select id into secondary_plan_id
  from public.business_plans
  where workspace_id = secondary_workspace_id
    and title = 'Rencana Pertumbuhan Studio';

  if secondary_plan_id is null then
    insert into public.business_plans (
      workspace_id,
      title,
      description,
      status,
      starts_on,
      ends_on,
      owner_id,
      created_by
    )
    values (
      secondary_workspace_id,
      'Rencana Pertumbuhan Studio',
      'Data pembanding yang tidak boleh terlihat oleh persona workspace utama.',
      'draft',
      date_trunc('year', current_date)::date,
      (date_trunc('year', current_date) + interval '1 year - 1 day')::date,
      'a1000000-0000-0000-0000-000000000007',
      'a1000000-0000-0000-0000-000000000007'
    )
    returning id into secondary_plan_id;
  end if;

  raise notice
    '[seed.personas.complete] primary=%, secondary=%, personas=7',
    primary_workspace_id,
    secondary_workspace_id;
end;
$$;
