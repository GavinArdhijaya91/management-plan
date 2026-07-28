alter table public.workspace_invitations
  add column last_resend_requested_at timestamptz;

create or replace function private.resend_workspace_invitation_record(
  target_invitation_id uuid,
  valid_for_days integer default 7
)
returns table (
  invitation_id uuid,
  invitation_token text,
  invitation_expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_record public.workspace_invitations%rowtype;
  raw_token text := encode(extensions.gen_random_bytes(32), 'hex');
begin
  select * into invitation_record
  from public.workspace_invitations
  where id = target_invitation_id
  for update;

  if invitation_record.id is null then
    raise exception 'Invitation not found' using errcode = 'P0002';
  end if;

  perform private.require_workspace_owner(invitation_record.workspace_id);

  if invitation_record.status not in ('pending', 'expired') then
    raise exception 'Only pending or expired invitations can be resent'
      using errcode = '23514';
  end if;

  if valid_for_days < 1 or valid_for_days > 30 then
    raise exception 'Invitation validity must be between 1 and 30 days'
      using errcode = '22023';
  end if;

  if invitation_record.last_resend_requested_at is not null
    and invitation_record.last_resend_requested_at > now() - interval '60 seconds' then
    raise exception 'Wait before resending this invitation again'
      using errcode = '55000',
      hint = 'Retry after the 60-second invitation resend cooldown.';
  end if;

  return query
  update public.workspace_invitations
  set
    status = 'pending',
    token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex'),
    expires_at = now() + make_interval(days => valid_for_days),
    delivery_status = 'queued',
    delivery_attempts = 0,
    delivery_error_code = null,
    last_sent_at = null,
    last_resend_requested_at = now(),
    declined_at = null,
    revoked_at = null
  where id = invitation_record.id
  returning id, raw_token, expires_at;
end;
$$;

revoke all on function private.resend_workspace_invitation_record(uuid, integer)
from public, anon, authenticated;

comment on column public.workspace_invitations.last_resend_requested_at is
  'Server-owned timestamp used to reject rapid resend replay for the same invitation.';
comment on function private.resend_workspace_invitation_record(uuid, integer) is
  'Rotates a pending or expired invitation token with an owner-only 60-second resend cooldown.';
