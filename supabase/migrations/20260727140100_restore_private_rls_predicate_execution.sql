-- RLS policies are stored with direct references to these private predicates.
-- The caller still needs EXECUTE on the referenced function for PostgreSQL to
-- evaluate the policy, even though the private schema itself is not exposed.
--
-- Keep USAGE on private revoked so browser roles cannot resolve or invoke these
-- helpers as an application API. Only the predicates required by RLS receive
-- EXECUTE; all other private functions remain default-deny.
grant execute on function private.is_workspace_member(uuid)
to authenticated;

grant execute on function private.has_workspace_role(
  uuid,
  public.workspace_role[]
)
to authenticated;

grant execute on function private.storage_workspace_id(text)
to authenticated;

grant execute on function private.has_workspace_permission(uuid, text)
to authenticated;

grant execute on function private.is_workspace_owner(uuid)
to authenticated;

grant execute on function private.can_read_business_plan(uuid)
to authenticated;

grant execute on function private.can_read_business_goal(uuid)
to authenticated;

grant execute on function private.can_read_goal_target(uuid)
to authenticated;

grant execute on function private.can_read_business_initiative(uuid)
to authenticated;

grant execute on function private.can_read_action_item(uuid)
to authenticated;

grant execute on function private.can_update_action_item(uuid)
to authenticated;

grant execute on function private.can_read_business_review(uuid)
to authenticated;

