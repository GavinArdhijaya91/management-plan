create type public.email_delivery_status as enum (
  'queued',
  'processing',
  'sent',
  'failed',
  'cancelled'
);
create type public.email_template_code as enum (
  'workspace_invitation'
);

alter table public.workspace_invitations
  add constraint workspace_invitations_workspace_id_id_key
    unique (workspace_id, id);

create table public.email_deliveries (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workspace_invitation_id uuid not null,
  template_code public.email_template_code not null,
  recipient_email text not null
    check (char_length(trim(recipient_email)) between 3 and 254),
  status public.email_delivery_status not null default 'queued',
  provider_name text
    check (provider_name is null or char_length(trim(provider_name)) between 2 and 50),
  provider_message_id text
    check (
      provider_message_id is null
      or char_length(trim(provider_message_id)) between 2 and 255
    ),
  attempt_count smallint not null default 0
    check (attempt_count between 0 and 20),
  scheduled_at timestamptz not null default now(),
  processing_started_at timestamptz,
  sent_at timestamptz,
  failed_at timestamptz,
  cancelled_at timestamptz,
  last_error_code text
    check (last_error_code is null or char_length(last_error_code) <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (workspace_id, workspace_invitation_id)
    references public.workspace_invitations(workspace_id, id) on delete cascade,
  constraint email_deliveries_state_check check (
    (
      status = 'queued'
      and processing_started_at is null
      and sent_at is null
      and failed_at is null
      and cancelled_at is null
    )
    or
    (
      status = 'processing'
      and processing_started_at is not null
      and sent_at is null
      and failed_at is null
      and cancelled_at is null
    )
    or
    (
      status = 'sent'
      and sent_at is not null
      and failed_at is null
      and cancelled_at is null
    )
    or
    (
      status = 'failed'
      and sent_at is null
      and failed_at is not null
      and cancelled_at is null
    )
    or
    (
      status = 'cancelled'
      and sent_at is null
      and cancelled_at is not null
    )
  )
);

create index email_deliveries_workspace_status_idx
  on public.email_deliveries (workspace_id, status, scheduled_at);
create index email_deliveries_invitation_date_idx
  on public.email_deliveries (workspace_invitation_id, created_at desc);
create unique index email_deliveries_provider_message_idx
  on public.email_deliveries (provider_name, provider_message_id)
  where provider_name is not null and provider_message_id is not null;

create trigger email_deliveries_set_updated_at
before update on public.email_deliveries
for each row execute function private.set_updated_at();

create trigger email_deliveries_protect_identity
before update on public.email_deliveries
for each row execute function private.prevent_column_changes(
  'id',
  'workspace_id',
  'workspace_invitation_id',
  'template_code',
  'recipient_email',
  'created_at'
);

alter table public.email_deliveries enable row level security;

create policy "email_deliveries_select_owner"
on public.email_deliveries for select to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
);

alter function public.create_workspace_invitation(uuid, text, uuid, integer)
rename to create_workspace_invitation_record;
alter function public.create_workspace_invitation_record(uuid, text, uuid, integer)
set schema private;
revoke all on function private.create_workspace_invitation_record(
  uuid,
  text,
  uuid,
  integer
) from public, anon, authenticated;

create or replace function public.create_workspace_invitation(
  target_workspace_id uuid,
  invited_email text,
  target_workspace_role_id uuid,
  valid_for_days integer default 7
)
returns table (
  invitation_id uuid,
  invitation_token text,
  invitation_expires_at timestamptz,
  email_delivery_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_result record;
  new_delivery_id uuid;
begin
  select *
  into invitation_result
  from private.create_workspace_invitation_record(
    target_workspace_id,
    invited_email,
    target_workspace_role_id,
    valid_for_days
  );

  insert into public.email_deliveries (
    workspace_id,
    workspace_invitation_id,
    template_code,
    recipient_email
  )
  values (
    target_workspace_id,
    invitation_result.invitation_id,
    'workspace_invitation',
    lower(trim(invited_email))
  )
  returning id into new_delivery_id;

  return query select
    invitation_result.invitation_id,
    invitation_result.invitation_token,
    invitation_result.invitation_expires_at,
    new_delivery_id;
end;
$$;

revoke all on function public.create_workspace_invitation(uuid, text, uuid, integer)
from public, anon;
grant execute on function public.create_workspace_invitation(uuid, text, uuid, integer)
to authenticated;

alter function public.resend_workspace_invitation(uuid, integer)
rename to resend_workspace_invitation_record;
alter function public.resend_workspace_invitation_record(uuid, integer)
set schema private;
revoke all on function private.resend_workspace_invitation_record(uuid, integer)
from public, anon, authenticated;

create or replace function public.resend_workspace_invitation(
  target_invitation_id uuid,
  valid_for_days integer default 7
)
returns table (
  invitation_id uuid,
  invitation_token text,
  invitation_expires_at timestamptz,
  email_delivery_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_result record;
  target_workspace_id uuid;
  recipient_email text;
  new_delivery_id uuid;
begin
  select workspace_id, email
  into target_workspace_id, recipient_email
  from public.workspace_invitations
  where id = target_invitation_id;

  if target_workspace_id is null then
    raise exception 'Invitation not found' using errcode = 'P0002';
  end if;

  select *
  into invitation_result
  from private.resend_workspace_invitation_record(
    target_invitation_id,
    valid_for_days
  );

  update public.email_deliveries
  set
    status = 'cancelled',
    cancelled_at = now()
  where workspace_invitation_id = target_invitation_id
    and status in ('queued', 'processing');

  insert into public.email_deliveries (
    workspace_id,
    workspace_invitation_id,
    template_code,
    recipient_email
  )
  values (
    target_workspace_id,
    target_invitation_id,
    'workspace_invitation',
    recipient_email
  )
  returning id into new_delivery_id;

  return query select
    invitation_result.invitation_id,
    invitation_result.invitation_token,
    invitation_result.invitation_expires_at,
    new_delivery_id;
end;
$$;

revoke all on function public.resend_workspace_invitation(uuid, integer)
from public, anon;
grant execute on function public.resend_workspace_invitation(uuid, integer)
to authenticated;

create or replace function public.mark_email_delivery_processing(target_delivery_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.email_deliveries
  set
    status = 'processing',
    processing_started_at = now(),
    sent_at = null,
    failed_at = null,
    cancelled_at = null,
    last_error_code = null
  where id = target_delivery_id
    and status in ('queued', 'failed');

  if not found then
    raise exception 'Email delivery cannot enter processing state'
      using errcode = '23514';
  end if;
end;
$$;

create or replace function public.mark_email_delivery_sent(
  target_delivery_id uuid,
  target_provider_name text,
  target_provider_message_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_invitation_id uuid;
begin
  update public.email_deliveries
  set
    status = 'sent',
    provider_name = trim(target_provider_name),
    provider_message_id = trim(target_provider_message_id),
    attempt_count = attempt_count + 1,
    processing_started_at = coalesce(processing_started_at, now()),
    sent_at = now(),
    failed_at = null,
    cancelled_at = null,
    last_error_code = null
  where id = target_delivery_id
    and status in ('queued', 'processing', 'failed')
  returning workspace_invitation_id into target_invitation_id;

  if target_invitation_id is null then
    raise exception 'Email delivery cannot enter sent state'
      using errcode = '23514';
  end if;

  update public.workspace_invitations
  set
    delivery_status = 'sent',
    delivery_attempts = delivery_attempts + 1,
    last_sent_at = now(),
    delivery_error_code = null
  where id = target_invitation_id;
end;
$$;

create or replace function public.mark_email_delivery_failed(
  target_delivery_id uuid,
  target_error_code text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_invitation_id uuid;
  normalized_error_code text := left(trim(target_error_code), 100);
begin
  update public.email_deliveries
  set
    status = 'failed',
    attempt_count = attempt_count + 1,
    processing_started_at = coalesce(processing_started_at, now()),
    sent_at = null,
    failed_at = now(),
    cancelled_at = null,
    last_error_code = normalized_error_code
  where id = target_delivery_id
    and status in ('queued', 'processing', 'failed')
    and attempt_count < 20
  returning workspace_invitation_id into target_invitation_id;

  if target_invitation_id is null then
    raise exception 'Email delivery cannot enter failed state'
      using errcode = '23514';
  end if;

  update public.workspace_invitations
  set
    delivery_status = 'failed',
    delivery_attempts = delivery_attempts + 1,
    delivery_error_code = normalized_error_code
  where id = target_invitation_id;
end;
$$;

revoke all on function public.mark_email_delivery_processing(uuid)
from public, anon, authenticated;
grant execute on function public.mark_email_delivery_processing(uuid)
to service_role;
revoke all on function public.mark_email_delivery_sent(uuid, text, text)
from public, anon, authenticated;
grant execute on function public.mark_email_delivery_sent(uuid, text, text)
to service_role;
revoke all on function public.mark_email_delivery_failed(uuid, text)
from public, anon, authenticated;
grant execute on function public.mark_email_delivery_failed(uuid, text)
to service_role;

create or replace function private.cancel_pending_invitation_deliveries()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'pending' and new.status <> 'pending' then
    update public.email_deliveries
    set
      status = 'cancelled',
      cancelled_at = now()
    where workspace_invitation_id = new.id
      and status in ('queued', 'processing');
  end if;

  return new;
end;
$$;

revoke all on function private.cancel_pending_invitation_deliveries()
from public, anon, authenticated;

create trigger workspace_invitations_cancel_deliveries
after update of status on public.workspace_invitations
for each row
when (old.status is distinct from new.status)
execute function private.cancel_pending_invitation_deliveries();

create trigger email_deliveries_audit
after insert or update or delete on public.email_deliveries
for each row execute function private.write_workspace_audit_log('email_delivery');
