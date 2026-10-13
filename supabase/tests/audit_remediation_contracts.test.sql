\set ON_ERROR_STOP on

-- Kontrak untuk perbaikan audit B1 (paginated export) dan S1 (member.manage).
begin;

select plan(4);

select set_config('test.export_workspace_id', id::text, true)
from public.workspaces
where slug = 'kedai-siapin-demo';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"a1000000-0000-0000-0000-000000000002","role":"authenticated","email":"manager@siapin.local"}',
  true
);

-- 1. RPC ber-paginasi ada dan mengembalikan total_count + rows.
select has_function(
  'public', 'prepare_transaction_export_page',
  array['uuid', 'text', 'date', 'date', 'integer', 'integer']
);

-- 2. Halaman pertama mengembalikan total yang cocok dengan isi rows.
do $$
declare
  payload jsonb;
begin
  select public.prepare_transaction_export_page(
    current_setting('test.export_workspace_id')::uuid,
    'xlsx',
    null,
    null,
    0,
    500
  ) into payload;

  if (payload ->> 'total_count')::integer <> jsonb_array_length(payload -> 'rows') then
    raise exception 'Paginated export total_count % does not match rows %',
      payload ->> 'total_count', jsonb_array_length(payload -> 'rows');
  end if;
end;
$$;

select ok(true, 'paginated export count matches rows');

-- 3. Helper permission member.manage ada dan Manager lolos.
select has_function('private', 'require_member_manager', array['uuid']);

do $$
begin
  perform private.require_member_manager(current_setting('test.export_workspace_id')::uuid);
end;
$$;

select ok(true, 'manager passes member.manage gate');

rollback;
