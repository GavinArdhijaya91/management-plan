alter table public.profiles
  add constraint profiles_full_name_check
    check (char_length(trim(full_name)) between 2 and 100),
  add constraint profiles_email_length_check
    check (char_length(email) <= 254);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_name text;
begin
  resolved_name := coalesce(
    nullif(trim(coalesce(new.raw_user_meta_data, '{}'::jsonb) ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Pengguna Siapin'
  );

  if char_length(resolved_name) < 2 then
    resolved_name := 'Pengguna Siapin';
  end if;

  resolved_name := left(resolved_name, 100);

  insert into public.profiles (
    user_id,
    full_name,
    display_name,
    email
  )
  values (
    new.id,
    resolved_name,
    left(resolved_name, 50),
    left(coalesce(new.email, ''), 254)
  );

  insert into public.profile_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

revoke all on function private.handle_new_user()
from public, anon, authenticated;

comment on function private.handle_new_user() is
  'Provisions bounded profile data and default preferences from a new Supabase Auth identity.';
