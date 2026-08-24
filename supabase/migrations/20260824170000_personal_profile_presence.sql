alter table public.profiles
  add column headline text,
  add column status_text text,
  add column profile_banner_path text,
  add constraint profiles_headline_check
    check (headline is null or char_length(trim(headline)) between 2 and 80),
  add constraint profiles_status_text_check
    check (status_text is null or char_length(trim(status_text)) between 1 and 120),
  add constraint profiles_banner_path_check
    check (
      profile_banner_path is null
      or (
        char_length(profile_banner_path) <= 500
        and char_length(profile_banner_path) > 37
        and split_part(profile_banner_path, '/', 1) = user_id::text
        and profile_banner_path not like '%..%'
      )
    );

alter table public.profile_preferences
  add column show_activity_status boolean not null default true;

update storage.buckets
set file_size_limit = 5242880
where id = 'avatars';

drop function if exists public.get_workspace_member_directory(uuid);

create function public.get_workspace_member_directory(
  target_workspace_id uuid
)
returns table (
  user_id uuid,
  display_name text,
  avatar_path text,
  headline text,
  status_text text,
  show_activity_status boolean,
  membership_status public.membership_status,
  job_title text,
  joined_at timestamptz,
  workspace_role_id uuid,
  role_code text,
  role_name text,
  hierarchy_rank smallint,
  base_role public.workspace_role,
  is_owner_role boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.has_workspace_permission(target_workspace_id, 'member.read') then
    raise exception 'Not authorized to view the workspace member directory'
      using errcode = '42501';
  end if;

  return query
  select
    member.user_id,
    profile.display_name,
    profile.avatar_path,
    profile.headline,
    profile.status_text,
    preference.show_activity_status,
    member.status,
    member.job_title,
    member.joined_at,
    member.workspace_role_id,
    role_record.code,
    role_record.name,
    role_record.hierarchy_rank,
    role_record.base_role,
    role_record.is_owner_role
  from public.workspace_members member
  join public.profiles profile on profile.user_id = member.user_id
  join public.profile_preferences preference on preference.user_id = member.user_id
  join public.workspace_roles role_record
    on role_record.workspace_id = member.workspace_id
    and role_record.id = member.workspace_role_id
  where member.workspace_id = target_workspace_id
  order by role_record.hierarchy_rank desc, profile.display_name, member.user_id;
end;
$$;

revoke all on function public.get_workspace_member_directory(uuid) from public, anon;
grant execute on function public.get_workspace_member_directory(uuid) to authenticated;

comment on function public.get_workspace_member_directory(uuid) is
  'Returns safe workspace identity and activity-display fields after checking member.read. Presence itself remains ephemeral Realtime state.';

comment on column public.profile_preferences.show_activity_status is
  'Controls whether the client publishes Realtime Presence. It is not a persisted online flag.';

create function public.update_my_personal_profile(
  requested_display_name text,
  requested_headline text,
  requested_status_text text,
  requested_bio text,
  requested_avatar_path text,
  requested_profile_banner_path text,
  requested_show_activity_status boolean
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update public.profiles
  set
    display_name = requested_display_name,
    headline = requested_headline,
    status_text = requested_status_text,
    bio = requested_bio,
    avatar_path = requested_avatar_path,
    profile_banner_path = requested_profile_banner_path
  where user_id = actor_id;

  if not found then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;

  update public.profile_preferences
  set show_activity_status = requested_show_activity_status
  where user_id = actor_id;

  if not found then
    raise exception 'Profile preferences not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.update_my_personal_profile(text, text, text, text, text, text, boolean)
from public, anon;
grant execute on function public.update_my_personal_profile(text, text, text, text, text, text, boolean)
to authenticated;
