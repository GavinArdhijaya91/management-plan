\set ON_ERROR_STOP on

begin;

select plan(1);

select set_config('test.portfolio_workspace_id', id::text, true)
from public.workspaces
where slug = 'kedai-siapin-demo';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated","email":"owner@siapin.local"}',
  true
);

do $$
declare
  portfolio_id uuid;
  review_id uuid;
begin
  select review.id
  into review_id
  from public.business_reviews review
  where review.workspace_id =
      current_setting('test.portfolio_workspace_id')::uuid
    and review.status = 'finalized'
  order by review.finalized_at
  limit 1;

  insert into public.business_portfolios (
    workspace_id,
    title,
    summary,
    status,
    created_by
  )
  values (
    current_setting('test.portfolio_workspace_id')::uuid,
    'Portfolio publication contract',
    'Ringkasan publik yang hanya bersumber dari evidence finalized.',
    'active',
    'a1000000-0000-0000-0000-000000000001'
  )
  returning id into portfolio_id;

  insert into public.business_portfolio_reviews (
    workspace_id,
    business_portfolio_id,
    business_review_id,
    added_by
  )
  values (
    current_setting('test.portfolio_workspace_id')::uuid,
    portfolio_id,
    review_id,
    'a1000000-0000-0000-0000-000000000001'
  );

  perform public.publish_business_portfolio(
    portfolio_id,
    'portfolio-contract',
    true
  );

  if not exists (
    select 1
    from public.get_public_business_portfolio('portfolio-contract')
    where jsonb_array_length(review_evidence) = 1
  ) then
    raise exception 'Published portfolio omitted its finalized evidence';
  end if;

  perform public.publish_business_portfolio(portfolio_id, '', false);

  if exists (
    select 1
    from public.get_public_business_portfolio('portfolio-contract')
  ) then
    raise exception 'Unpublished portfolio remained publicly readable';
  end if;
end;
$$;

reset role;
set local role anon;
select set_config(
  'request.jwt.claims',
  '{"role":"anon"}',
  true
);

do $$
declare
  private_table_rejected boolean := false;
begin
  begin
    perform 1
    from public.business_portfolios
    limit 1;
  exception
    when insufficient_privilege then private_table_rejected := true;
  end;

  if not private_table_rejected then
    raise exception 'Anonymous user received access to the private portfolio table';
  end if;
end;
$$;

reset role;

select pass(
  'Portfolio publication is explicit, evidence-backed, reversible, and does not expose private tables'
);

select * from finish();

rollback;
