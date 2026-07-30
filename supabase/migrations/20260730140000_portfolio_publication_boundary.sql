create type public.business_portfolio_visibility as enum (
  'private',
  'public'
);

alter table public.business_portfolios
  add column visibility public.business_portfolio_visibility
    not null default 'private',
  add column public_slug text,
  add column published_at timestamptz,
  add constraint business_portfolios_public_slug_format_check check (
    public_slug is null
    or public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  add constraint business_portfolios_publication_state_check check (
    (
      visibility = 'private'
      and public_slug is null
      and published_at is null
    )
    or
    (
      visibility = 'public'
      and status = 'active'
      and public_slug is not null
      and published_at is not null
    )
  );

create unique index business_portfolios_public_slug_unique_idx
  on public.business_portfolios (public_slug)
  where public_slug is not null;

create or replace function public.publish_business_portfolio(
  target_business_portfolio_id uuid,
  requested_public_slug text,
  should_publish boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  portfolio_record public.business_portfolios%rowtype;
  normalized_slug text := lower(trim(requested_public_slug));
begin
  select *
  into portfolio_record
  from public.business_portfolios
  where id = target_business_portfolio_id
  for update;

  if portfolio_record.id is null then
    raise exception 'Business portfolio not found' using errcode = 'P0002';
  end if;

  if actor_id is null
    or not private.has_workspace_permission(
      portfolio_record.workspace_id,
      'portfolio.manage'
    )
  then
    raise exception 'Not authorized to publish this business portfolio'
      using errcode = '42501';
  end if;

  if should_publish then
    if portfolio_record.status <> 'active' then
      raise exception 'Only an active business portfolio can be published'
        using errcode = '23514';
    end if;

    if normalized_slug is null
      or normalized_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      or char_length(normalized_slug) not between 3 and 80
    then
      raise exception 'Public portfolio slug is invalid'
        using errcode = '22023';
    end if;

    if not exists (
      select 1
      from public.business_portfolio_reviews portfolio_review
      where portfolio_review.business_portfolio_id = portfolio_record.id
    ) then
      raise exception 'Public portfolio requires finalized review evidence'
        using errcode = '23514';
    end if;

    update public.business_portfolios
    set
      visibility = 'public',
      public_slug = normalized_slug,
      published_at = coalesce(published_at, now())
    where id = portfolio_record.id;
  else
    update public.business_portfolios
    set
      visibility = 'private',
      public_slug = null,
      published_at = null
    where id = portfolio_record.id;
  end if;
end;
$$;

revoke all on function public.publish_business_portfolio(uuid, text, boolean)
from public, anon;
grant execute on function public.publish_business_portfolio(uuid, text, boolean)
to authenticated;

create or replace function public.get_public_business_portfolio(
  requested_public_slug text
)
returns table (
  portfolio_title text,
  portfolio_summary text,
  workspace_name text,
  workspace_logo_path text,
  published_at timestamptz,
  review_evidence jsonb,
  achievement_badges jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    portfolio.title,
    portfolio.summary,
    workspace.name,
    workspace.logo_path,
    portfolio.published_at,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'period_start', evidence.period_start,
          'period_end', evidence.period_end,
          'summary', evidence.review_summary
        )
        order by evidence.display_order, evidence.period_end desc
      )
      from public.business_portfolio_evidence evidence
      where evidence.business_portfolio_id = portfolio.id
    ), '[]'::jsonb),
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'code', achievement.achievement_code,
          'name', achievement.name,
          'description', achievement.description,
          'icon_key', achievement.icon_key,
          'awarded_at', achievement.awarded_at
        )
        order by achievement.display_order, achievement.awarded_at
      )
      from public.workspace_achievement_details achievement
      where achievement.workspace_id = portfolio.workspace_id
        and exists (
          select 1
          from public.business_portfolio_reviews portfolio_review
          where portfolio_review.business_portfolio_id = portfolio.id
            and portfolio_review.business_review_id =
              achievement.evidence_business_review_id
        )
    ), '[]'::jsonb)
  from public.business_portfolios portfolio
  join public.workspaces workspace
    on workspace.id = portfolio.workspace_id
  where portfolio.visibility = 'public'
    and portfolio.status = 'active'
    and portfolio.public_slug = lower(trim(requested_public_slug));
$$;

revoke all on function public.get_public_business_portfolio(text)
from public;
grant execute on function public.get_public_business_portfolio(text)
to anon, authenticated;

revoke update on public.business_portfolios from authenticated;
grant update (
  title,
  summary,
  cover_image_url,
  status
) on public.business_portfolios to authenticated;

comment on function public.get_public_business_portfolio(text) is
  'Returns only explicitly published portfolio summaries, finalized review evidence, and evidence-backed badges; private workspace records remain behind RLS.';
