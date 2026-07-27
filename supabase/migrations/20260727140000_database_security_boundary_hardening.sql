-- Browser roles must receive capabilities explicitly. PostgreSQL grants
-- EXECUTE on new functions to PUBLIC by default, which can silently expose a
-- later SECURITY DEFINER RPC unless the default is closed here.
revoke all on schema private from public, anon, authenticated;
revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all sequences in schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from public, anon;

-- Invitation previews are the only anonymous database capability. The RPC
-- returns deliberately limited branding and invitation metadata.
grant execute on function public.get_workspace_invitation_preview(text)
to anon, authenticated;

-- Keep future objects default-deny. Application migrations must opt in with a
-- specific GRANT after defining the corresponding RLS or RPC contract.
alter default privileges in schema private
revoke all on tables from public, anon, authenticated;
alter default privileges in schema private
revoke all on sequences from public, anon, authenticated;
alter default privileges in schema private
revoke execute on functions from public, anon, authenticated;

alter default privileges in schema public
revoke all on tables from public, anon;
alter default privileges in schema public
revoke all on sequences from public, anon;
alter default privileges in schema public
revoke execute on functions from public, anon;

