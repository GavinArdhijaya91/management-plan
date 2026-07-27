\set ON_ERROR_STOP on

begin;

select plan(1);

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
  ('95000000-0000-0000-0000-000000000001', 'inviter@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Invitation Owner"}', now(), now(), now()),
  ('95000000-0000-0000-0000-000000000002', 'accept@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Accept Recipient"}', now(), now(), now()),
  ('95000000-0000-0000-0000-000000000003', 'decline@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Decline Recipient"}', now(), now(), now()),
  ('95000000-0000-0000-0000-000000000004', 'mismatch@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Mismatch Recipient"}', now(), now(), now()),
  ('95000000-0000-0000-0000-000000000005', 'expired@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Expired Recipient"}', now(), now(), now()),
  ('95000000-0000-0000-0000-000000000006', 'unverified@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Unverified Recipient"}', null, now(), now()),
  ('95000000-0000-0000-0000-000000000007', 'revoke@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Revoked Recipient"}', now(), now(), now()),
  ('95000000-0000-0000-0000-000000000008', 'resend@siapin.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Resend Recipient"}', now(), now(), now());

insert into public.workspaces (id, name, slug, created_by)
values (
  '96000000-0000-0000-0000-000000000001',
  'Invitation Lifecycle Workspace',
  'invitation-lifecycle-workspace',
  '95000000-0000-0000-0000-000000000001'
);

insert into public.workspace_members (workspace_id, user_id, role, status)
values (
  '96000000-0000-0000-0000-000000000001',
  '95000000-0000-0000-0000-000000000001',
  'owner',
  'active'
);

create temporary table invitation_cases (
  case_name text primary key,
  invitation_id uuid not null,
  invitation_token text not null,
  invitation_expires_at timestamptz not null,
  email_delivery_id uuid not null
) on commit drop;

grant select, insert, update, delete on invitation_cases to authenticated;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"95000000-0000-0000-0000-000000000001","role":"authenticated","email":"inviter@siapin.test"}',
  true
);

insert into invitation_cases
select 'accept', result.*
from public.create_workspace_invitation(
  '96000000-0000-0000-0000-000000000001',
  '  ACCEPT@siapin.test ',
  (
    select id from public.workspace_roles
    where workspace_id = '96000000-0000-0000-0000-000000000001'
      and code = 'member'
  ),
  7
) result;

insert into invitation_cases
select 'decline', result.*
from public.create_workspace_invitation(
  '96000000-0000-0000-0000-000000000001',
  'decline@siapin.test',
  (
    select id from public.workspace_roles
    where workspace_id = '96000000-0000-0000-0000-000000000001'
      and code = 'viewer'
  ),
  7
) result;

insert into invitation_cases
select 'mismatch', result.*
from public.create_workspace_invitation(
  '96000000-0000-0000-0000-000000000001',
  'mismatch@siapin.test',
  (
    select id from public.workspace_roles
    where workspace_id = '96000000-0000-0000-0000-000000000001'
      and code = 'member'
  ),
  7
) result;

insert into invitation_cases
select 'expired', result.*
from public.create_workspace_invitation(
  '96000000-0000-0000-0000-000000000001',
  'expired@siapin.test',
  (
    select id from public.workspace_roles
    where workspace_id = '96000000-0000-0000-0000-000000000001'
      and code = 'member'
  ),
  7
) result;

insert into invitation_cases
select 'unverified', result.*
from public.create_workspace_invitation(
  '96000000-0000-0000-0000-000000000001',
  'unverified@siapin.test',
  (
    select id from public.workspace_roles
    where workspace_id = '96000000-0000-0000-0000-000000000001'
      and code = 'member'
  ),
  7
) result;

insert into invitation_cases
select 'revoke', result.*
from public.create_workspace_invitation(
  '96000000-0000-0000-0000-000000000001',
  'revoke@siapin.test',
  (
    select id from public.workspace_roles
    where workspace_id = '96000000-0000-0000-0000-000000000001'
      and code = 'member'
  ),
  7
) result;

insert into invitation_cases
select 'resend', result.*
from public.create_workspace_invitation(
  '96000000-0000-0000-0000-000000000001',
  'resend@siapin.test',
  (
    select id from public.workspace_roles
    where workspace_id = '96000000-0000-0000-0000-000000000001'
      and code = 'manager'
  ),
  7
) result;

do $$
declare
  duplicate_blocked boolean := false;
begin
  if exists (
    select 1
    from invitation_cases
    where char_length(invitation_token) <> 64
  ) then
    raise exception 'Invitation RPC returned a malformed raw token';
  end if;

  if exists (
    select 1
    from invitation_cases invitation_case
    join public.workspace_invitations invitation
      on invitation.id = invitation_case.invitation_id
    where invitation.token_hash = invitation_case.invitation_token
  ) then
    raise exception 'Raw invitation token was stored instead of its hash';
  end if;

  if (
    select count(*)
    from invitation_cases invitation_case
    join public.email_deliveries delivery
      on delivery.id = invitation_case.email_delivery_id
     and delivery.workspace_invitation_id = invitation_case.invitation_id
     and delivery.status = 'queued'
  ) <> 7 then
    raise exception 'Invitation creation did not queue exactly one email delivery per case';
  end if;

  if not exists (
    select 1 from public.workspace_invitations
    where id = (select invitation_id from invitation_cases where case_name = 'accept')
      and email = 'accept@siapin.test'
  ) then
    raise exception 'Invitation email was not normalized';
  end if;

  begin
    perform public.create_workspace_invitation(
      '96000000-0000-0000-0000-000000000001',
      'ACCEPT@siapin.test',
      (
        select id from public.workspace_roles
        where workspace_id = '96000000-0000-0000-0000-000000000001'
          and code = 'member'
      ),
      7
    );
  exception
    when unique_violation then duplicate_blocked := true;
  end;

  if not duplicate_blocked then
    raise exception 'Duplicate pending invitation was accepted';
  end if;
end;
$$;

-- A different authenticated email cannot consume another recipient token.
select set_config(
  'request.jwt.claims',
  '{"sub":"95000000-0000-0000-0000-000000000002","role":"authenticated","email":"accept@siapin.test"}',
  true
);

do $$
declare
  blocked boolean := false;
begin
  begin
    perform public.accept_workspace_invitation(
      (select invitation_token from invitation_cases where case_name = 'mismatch')
    );
  exception
    when invalid_parameter_value then blocked := true;
  end;
  if not blocked then
    raise exception 'Mismatched recipient consumed an invitation';
  end if;
end;
$$;

-- Valid acceptance creates one active membership with the invited canonical
-- role. An identical retry returns the same workspace without another member.
select public.accept_workspace_invitation(
  (select invitation_token from invitation_cases where case_name = 'accept')
);

do $$
declare
  retried_workspace_id uuid;
  active_member_reinvite_blocked boolean := false;
begin
  if not exists (
    select 1
    from public.workspace_members member
    join public.workspace_roles role_record
      on role_record.id = member.workspace_role_id
     and role_record.workspace_id = member.workspace_id
    where member.workspace_id = '96000000-0000-0000-0000-000000000001'
      and member.user_id = '95000000-0000-0000-0000-000000000002'
      and member.status = 'active'
      and role_record.code = 'member'
  ) then
    raise exception 'Acceptance did not create the invited canonical membership';
  end if;

  if not exists (
    select 1 from public.workspace_invitations
    where id = (select invitation_id from invitation_cases where case_name = 'accept')
      and status = 'accepted'
      and accepted_by = '95000000-0000-0000-0000-000000000002'
      and accepted_at is not null
  ) then
    raise exception 'Accepted invitation lifecycle fields are incomplete';
  end if;

  retried_workspace_id := public.accept_workspace_invitation(
    (select invitation_token from invitation_cases where case_name = 'accept')
  );
  if retried_workspace_id <> '96000000-0000-0000-0000-000000000001' then
    raise exception 'Accepted invitation retry returned a different workspace';
  end if;
  if (
    select count(*) from public.workspace_members
    where workspace_id = '96000000-0000-0000-0000-000000000001'
      and user_id = '95000000-0000-0000-0000-000000000002'
  ) <> 1 then
    raise exception 'Accepted invitation retry duplicated membership';
  end if;

  select set_config(
    'request.jwt.claims',
    '{"sub":"95000000-0000-0000-0000-000000000001","role":"authenticated","email":"inviter@siapin.test"}',
    true
  );
  begin
    perform public.create_workspace_invitation(
      '96000000-0000-0000-0000-000000000001',
      'accept@siapin.test',
      (
        select id from public.workspace_roles
        where workspace_id = '96000000-0000-0000-0000-000000000001'
          and code = 'member'
      ),
      7
    );
  exception
    when unique_violation then active_member_reinvite_blocked := true;
  end;
  if not active_member_reinvite_blocked then
    raise exception 'Active member received another invitation';
  end if;
end;
$$;

-- Decline is terminal and never creates membership.
select set_config(
  'request.jwt.claims',
  '{"sub":"95000000-0000-0000-0000-000000000003","role":"authenticated","email":"decline@siapin.test"}',
  true
);

select public.decline_workspace_invitation(
  (select invitation_token from invitation_cases where case_name = 'decline')
);

reset role;

do $$
begin
  if exists (
    select 1 from public.workspace_members
    where workspace_id = '96000000-0000-0000-0000-000000000001'
      and user_id = '95000000-0000-0000-0000-000000000003'
  ) then
    raise exception 'Declined invitation created a membership';
  end if;
  if not exists (
    select 1 from public.workspace_invitations
    where id = (select invitation_id from invitation_cases where case_name = 'decline')
      and status = 'declined'
      and declined_at is not null
  ) then
    raise exception 'Declined invitation lifecycle fields are incomplete';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"95000000-0000-0000-0000-000000000003","role":"authenticated","email":"decline@siapin.test"}',
  true
);

do $$
declare
  accept_blocked boolean := false;
begin
  begin
    perform public.accept_workspace_invitation(
      (select invitation_token from invitation_cases where case_name = 'decline')
    );
  exception
    when invalid_parameter_value then accept_blocked := true;
  end;
  if not accept_blocked then
    raise exception 'Declined invitation was later accepted';
  end if;
end;
$$;

-- Expiry is enforced even before the maintenance function marks the row.
reset role;
update public.workspace_invitations
set
  created_at = now() - interval '2 days',
  expires_at = now() - interval '1 day'
where id = (select invitation_id from invitation_cases where case_name = 'expired');
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"95000000-0000-0000-0000-000000000005","role":"authenticated","email":"expired@siapin.test"}',
  true
);

do $$
declare
  blocked boolean := false;
begin
  begin
    perform public.accept_workspace_invitation(
      (select invitation_token from invitation_cases where case_name = 'expired')
    );
  exception
    when invalid_parameter_value then blocked := true;
  end;
  if not blocked then
    raise exception 'Expired invitation was accepted';
  end if;
  if exists (
    select 1
    from public.get_workspace_invitation_preview(
      (select invitation_token from invitation_cases where case_name = 'expired')
    )
  ) then
    raise exception 'Expired invitation still has a public preview';
  end if;
end;
$$;

-- An unverified account cannot activate its invited role.
select set_config(
  'request.jwt.claims',
  '{"sub":"95000000-0000-0000-0000-000000000006","role":"authenticated","email":"unverified@siapin.test"}',
  true
);

do $$
declare
  blocked boolean := false;
begin
  begin
    perform public.accept_workspace_invitation(
      (select invitation_token from invitation_cases where case_name = 'unverified')
    );
  exception
    when insufficient_privilege then blocked := true;
  end;
  if not blocked then
    raise exception 'Unverified account accepted an invitation';
  end if;
end;
$$;

-- Owner revocation is terminal for the recipient token.
select set_config(
  'request.jwt.claims',
  '{"sub":"95000000-0000-0000-0000-000000000001","role":"authenticated","email":"inviter@siapin.test"}',
  true
);
select public.revoke_workspace_invitation(
  (select invitation_id from invitation_cases where case_name = 'revoke')
);

reset role;

do $$
begin
  if not exists (
    select 1 from public.workspace_invitations
    where id = (select invitation_id from invitation_cases where case_name = 'revoke')
      and status = 'revoked'
      and revoked_at is not null
  ) then
    raise exception 'Revoked invitation lifecycle fields are incomplete';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"95000000-0000-0000-0000-000000000007","role":"authenticated","email":"revoke@siapin.test"}',
  true
);

do $$
declare
  blocked boolean := false;
begin
  begin
    perform public.accept_workspace_invitation(
      (select invitation_token from invitation_cases where case_name = 'revoke')
    );
  exception
    when invalid_parameter_value then blocked := true;
  end;
  if not blocked then
    raise exception 'Revoked invitation was accepted';
  end if;
end;
$$;

-- Resend rotates the token and queues a replacement delivery. The old token
-- is invalid while the new token grants the original role.
select set_config(
  'request.jwt.claims',
  '{"sub":"95000000-0000-0000-0000-000000000001","role":"authenticated","email":"inviter@siapin.test"}',
  true
);

create temporary table resend_result (
  invitation_id uuid,
  invitation_token text,
  invitation_expires_at timestamptz,
  email_delivery_id uuid
) on commit drop;

insert into resend_result
select *
from public.resend_workspace_invitation(
  (select invitation_id from invitation_cases where case_name = 'resend'),
  14
);

do $$
begin
  if (
    select invitation_token from resend_result
  ) = (
    select invitation_token from invitation_cases where case_name = 'resend'
  ) then
    raise exception 'Resend did not rotate the invitation token';
  end if;
  if not exists (
    select 1
    from public.email_deliveries
    where id = (select email_delivery_id from resend_result)
      and status = 'queued'
  ) then
    raise exception 'Resend did not queue a replacement delivery';
  end if;
  if not exists (
    select 1
    from public.email_deliveries
    where id = (
      select email_delivery_id from invitation_cases where case_name = 'resend'
    )
      and status = 'cancelled'
      and cancelled_at is not null
  ) then
    raise exception 'Resend did not cancel the previous queued delivery';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"95000000-0000-0000-0000-000000000008","role":"authenticated","email":"resend@siapin.test"}',
  true
);

do $$
declare
  old_token_blocked boolean := false;
begin
  begin
    perform public.accept_workspace_invitation(
      (select invitation_token from invitation_cases where case_name = 'resend')
    );
  exception
    when invalid_parameter_value then old_token_blocked := true;
  end;
  if not old_token_blocked then
    raise exception 'Pre-resend invitation token remained valid';
  end if;
end;
$$;

select public.accept_workspace_invitation(
  (select invitation_token from resend_result)
);

do $$
begin
  if not exists (
    select 1
    from public.workspace_members member
    join public.workspace_roles role_record
      on role_record.id = member.workspace_role_id
     and role_record.workspace_id = member.workspace_id
    where member.workspace_id = '96000000-0000-0000-0000-000000000001'
      and member.user_id = '95000000-0000-0000-0000-000000000008'
      and member.status = 'active'
      and role_record.code = 'manager'
  ) then
    raise exception 'Resent invitation lost its canonical manager role';
  end if;
end;
$$;

select pass('workspace invitation lifecycle contracts passed');
select * from finish();

rollback;
