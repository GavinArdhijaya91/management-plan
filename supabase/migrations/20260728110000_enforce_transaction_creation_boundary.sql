drop policy if exists "transactions_insert_permitted"
on public.transactions;

revoke insert on public.transactions from public, anon, authenticated;

comment on function public.create_transaction(
  uuid,
  public.transaction_type,
  numeric,
  date,
  uuid,
  numeric,
  text,
  uuid
) is
  'The only browser-accessible transaction creation boundary. It enforces workspace permission, active account selection, actor attribution, and idempotency.';
