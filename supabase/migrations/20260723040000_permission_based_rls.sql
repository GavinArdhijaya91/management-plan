drop policy if exists "workspaces_update_manager" on public.workspaces;
drop policy if exists "workspaces_delete_owner" on public.workspaces;
create policy "workspaces_update_permitted"
on public.workspaces for update to authenticated
using (private.has_workspace_permission(id, 'workspace.update'))
with check (private.has_workspace_permission(id, 'workspace.update'));
create policy "workspaces_delete_permitted"
on public.workspaces for delete to authenticated
using (private.has_workspace_permission(id, 'workspace.delete'));

drop policy if exists "members_select_member" on public.workspace_members;
drop policy if exists "members_insert_manager" on public.workspace_members;
drop policy if exists "members_update_owner" on public.workspace_members;
drop policy if exists "members_delete_owner" on public.workspace_members;
create policy "members_select_permitted"
on public.workspace_members for select to authenticated
using (private.has_workspace_permission(workspace_id, 'member.read'));
create policy "members_insert_owner"
on public.workspace_members for insert to authenticated
with check (
  private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
);
create policy "members_update_owner"
on public.workspace_members for update to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
)
with check (
  private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
);
create policy "members_delete_owner"
on public.workspace_members for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
);

drop policy if exists "invitations_select_manager" on public.workspace_invitations;
drop policy if exists "invitations_delete_owner" on public.workspace_invitations;
create policy "invitations_select_permitted"
on public.workspace_invitations for select to authenticated
using (private.has_workspace_permission(workspace_id, 'member.read'));
create policy "invitations_delete_owner"
on public.workspace_invitations for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['owner']::public.workspace_role[]
  )
);

drop policy if exists "transactions_select_member" on public.transactions;
drop policy if exists "transactions_insert_editor" on public.transactions;
drop policy if exists "transactions_update_editor" on public.transactions;
drop policy if exists "transactions_delete_manager" on public.transactions;
create policy "transactions_select_permitted"
on public.transactions for select to authenticated
using (private.has_workspace_permission(workspace_id, 'transaction.read'));
create policy "transactions_insert_permitted"
on public.transactions for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'transaction.write')
);
create policy "transactions_update_permitted"
on public.transactions for update to authenticated
using (private.has_workspace_permission(workspace_id, 'transaction.write'))
with check (private.has_workspace_permission(workspace_id, 'transaction.write'));
create policy "transactions_delete_permitted"
on public.transactions for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'transaction.delete'));

drop policy if exists "events_select_member" on public.calendar_events;
drop policy if exists "events_insert_editor" on public.calendar_events;
drop policy if exists "events_update_editor" on public.calendar_events;
drop policy if exists "events_delete_editor" on public.calendar_events;
create policy "events_select_permitted"
on public.calendar_events for select to authenticated
using (private.has_workspace_permission(workspace_id, 'calendar.read'));
create policy "events_insert_permitted"
on public.calendar_events for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'calendar.write')
);
create policy "events_update_permitted"
on public.calendar_events for update to authenticated
using (private.has_workspace_permission(workspace_id, 'calendar.write'))
with check (private.has_workspace_permission(workspace_id, 'calendar.write'));
create policy "events_delete_permitted"
on public.calendar_events for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'calendar.delete'));

drop policy if exists "products_select_member" on public.market_products;
drop policy if exists "products_insert_editor" on public.market_products;
drop policy if exists "products_update_editor" on public.market_products;
drop policy if exists "products_delete_manager" on public.market_products;
create policy "products_select_permitted"
on public.market_products for select to authenticated
using (private.has_workspace_permission(workspace_id, 'market.read'));
create policy "products_insert_permitted"
on public.market_products for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'market.write')
);
create policy "products_update_permitted"
on public.market_products for update to authenticated
using (private.has_workspace_permission(workspace_id, 'market.write'))
with check (private.has_workspace_permission(workspace_id, 'market.write'));
create policy "products_delete_permitted"
on public.market_products for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'market.delete'));

drop policy if exists "snapshots_select_member" on public.market_snapshots;
drop policy if exists "snapshots_insert_editor" on public.market_snapshots;
drop policy if exists "snapshots_update_editor" on public.market_snapshots;
drop policy if exists "snapshots_delete_manager" on public.market_snapshots;
create policy "snapshots_select_permitted"
on public.market_snapshots for select to authenticated
using (private.has_workspace_permission(workspace_id, 'market.read'));
create policy "snapshots_insert_permitted"
on public.market_snapshots for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'market.write')
);
create policy "snapshots_update_permitted"
on public.market_snapshots for update to authenticated
using (private.has_workspace_permission(workspace_id, 'market.write'))
with check (private.has_workspace_permission(workspace_id, 'market.write'));
create policy "snapshots_delete_permitted"
on public.market_snapshots for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'market.delete'));

drop policy if exists "workspace_categories_insert_manager"
on public.workspace_business_categories;
drop policy if exists "workspace_categories_delete_manager"
on public.workspace_business_categories;
create policy "workspace_categories_insert_permitted"
on public.workspace_business_categories for insert to authenticated
with check (private.has_workspace_permission(workspace_id, 'workspace.update'));
create policy "workspace_categories_delete_permitted"
on public.workspace_business_categories for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'workspace.update'));

drop policy if exists "business_plans_select_member" on public.business_plans;
drop policy if exists "business_plans_insert_editor" on public.business_plans;
drop policy if exists "business_plans_update_editor" on public.business_plans;
drop policy if exists "business_plans_delete_manager" on public.business_plans;
create policy "business_plans_select_permitted"
on public.business_plans for select to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.read'));
create policy "business_plans_insert_permitted"
on public.business_plans for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'plan.write')
);
create policy "business_plans_update_permitted"
on public.business_plans for update to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.write'))
with check (private.has_workspace_permission(workspace_id, 'plan.write'));
create policy "business_plans_delete_permitted"
on public.business_plans for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.delete'));

drop policy if exists "business_goals_select_member" on public.business_goals;
drop policy if exists "business_goals_insert_editor" on public.business_goals;
drop policy if exists "business_goals_update_editor" on public.business_goals;
drop policy if exists "business_goals_delete_manager" on public.business_goals;
create policy "business_goals_select_permitted"
on public.business_goals for select to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.read'));
create policy "business_goals_insert_permitted"
on public.business_goals for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'plan.write')
);
create policy "business_goals_update_permitted"
on public.business_goals for update to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.write'))
with check (private.has_workspace_permission(workspace_id, 'plan.write'));
create policy "business_goals_delete_permitted"
on public.business_goals for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.delete'));

drop policy if exists "metric_definitions_select_member" on public.metric_definitions;
drop policy if exists "metric_definitions_insert_editor" on public.metric_definitions;
drop policy if exists "metric_definitions_update_editor" on public.metric_definitions;
drop policy if exists "metric_definitions_delete_manager" on public.metric_definitions;
create policy "metric_definitions_select_permitted"
on public.metric_definitions for select to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.read'));
create policy "metric_definitions_insert_permitted"
on public.metric_definitions for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'plan.write')
);
create policy "metric_definitions_update_permitted"
on public.metric_definitions for update to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.write'))
with check (private.has_workspace_permission(workspace_id, 'plan.write'));
create policy "metric_definitions_delete_permitted"
on public.metric_definitions for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.delete'));

drop policy if exists "goal_targets_select_member" on public.goal_targets;
drop policy if exists "goal_targets_insert_editor" on public.goal_targets;
drop policy if exists "goal_targets_update_editor" on public.goal_targets;
drop policy if exists "goal_targets_delete_manager" on public.goal_targets;
create policy "goal_targets_select_permitted"
on public.goal_targets for select to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.read'));
create policy "goal_targets_insert_permitted"
on public.goal_targets for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'plan.write')
);
create policy "goal_targets_update_permitted"
on public.goal_targets for update to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.write'))
with check (private.has_workspace_permission(workspace_id, 'plan.write'));
create policy "goal_targets_delete_permitted"
on public.goal_targets for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.delete'));

drop policy if exists "metric_measurements_select_member" on public.metric_measurements;
drop policy if exists "metric_measurements_insert_editor" on public.metric_measurements;
drop policy if exists "metric_measurements_update_editor" on public.metric_measurements;
drop policy if exists "metric_measurements_delete_manager" on public.metric_measurements;
create policy "metric_measurements_select_permitted"
on public.metric_measurements for select to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.read'));
create policy "metric_measurements_insert_permitted"
on public.metric_measurements for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'plan.write')
);
create policy "metric_measurements_update_permitted"
on public.metric_measurements for update to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.write'))
with check (private.has_workspace_permission(workspace_id, 'plan.write'));
create policy "metric_measurements_delete_permitted"
on public.metric_measurements for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.delete'));

drop policy if exists "business_initiatives_select_member" on public.business_initiatives;
drop policy if exists "business_initiatives_insert_editor" on public.business_initiatives;
drop policy if exists "business_initiatives_update_editor" on public.business_initiatives;
drop policy if exists "business_initiatives_delete_manager" on public.business_initiatives;
create policy "business_initiatives_select_permitted"
on public.business_initiatives for select to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.read'));
create policy "business_initiatives_insert_permitted"
on public.business_initiatives for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'plan.write')
);
create policy "business_initiatives_update_permitted"
on public.business_initiatives for update to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.write'))
with check (private.has_workspace_permission(workspace_id, 'plan.write'));
create policy "business_initiatives_delete_permitted"
on public.business_initiatives for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.delete'));

drop policy if exists "action_items_select_member" on public.action_items;
drop policy if exists "action_items_insert_editor" on public.action_items;
drop policy if exists "action_items_update_editor" on public.action_items;
drop policy if exists "action_items_delete_manager" on public.action_items;
create policy "action_items_select_permitted"
on public.action_items for select to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.read'));
create policy "action_items_insert_permitted"
on public.action_items for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'plan.write')
);
create policy "action_items_update_permitted"
on public.action_items for update to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.write'))
with check (private.has_workspace_permission(workspace_id, 'plan.write'));
create policy "action_items_delete_permitted"
on public.action_items for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.delete'));

drop policy if exists "business_reviews_select_member" on public.business_reviews;
drop policy if exists "business_reviews_insert_editor" on public.business_reviews;
drop policy if exists "business_reviews_update_author" on public.business_reviews;
drop policy if exists "business_reviews_delete_manager" on public.business_reviews;
create policy "business_reviews_select_permitted"
on public.business_reviews for select to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.read'));
create policy "business_reviews_insert_permitted"
on public.business_reviews for insert to authenticated
with check (
  reviewed_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'plan.write')
);
create policy "business_reviews_update_permitted"
on public.business_reviews for update to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.write'))
with check (private.has_workspace_permission(workspace_id, 'plan.write'));
create policy "business_reviews_delete_permitted"
on public.business_reviews for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'plan.delete'));

drop policy if exists "business_partners_select_member" on public.business_partners;
drop policy if exists "business_partners_insert_editor" on public.business_partners;
drop policy if exists "business_partners_update_editor" on public.business_partners;
drop policy if exists "business_partners_delete_manager" on public.business_partners;
create policy "business_partners_select_permitted"
on public.business_partners for select to authenticated
using (private.has_workspace_permission(workspace_id, 'partner.read'));
create policy "business_partners_insert_permitted"
on public.business_partners for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_workspace_permission(workspace_id, 'partner.write')
);
create policy "business_partners_update_permitted"
on public.business_partners for update to authenticated
using (private.has_workspace_permission(workspace_id, 'partner.write'))
with check (private.has_workspace_permission(workspace_id, 'partner.write'));
create policy "business_partners_delete_permitted"
on public.business_partners for delete to authenticated
using (private.has_workspace_permission(workspace_id, 'partner.delete'));

drop policy if exists "business_partner_roles_select_member"
on public.business_partner_roles;
drop policy if exists "business_partner_roles_insert_editor"
on public.business_partner_roles;
drop policy if exists "business_partner_roles_delete_editor"
on public.business_partner_roles;
create policy "business_partner_roles_select_permitted"
on public.business_partner_roles for select to authenticated
using (
  exists (
    select 1 from public.business_partners partner
    where partner.id = business_partner_id
      and private.has_workspace_permission(partner.workspace_id, 'partner.read')
  )
);
create policy "business_partner_roles_insert_permitted"
on public.business_partner_roles for insert to authenticated
with check (
  exists (
    select 1 from public.business_partners partner
    where partner.id = business_partner_id
      and private.has_workspace_permission(partner.workspace_id, 'partner.write')
  )
);
create policy "business_partner_roles_delete_permitted"
on public.business_partner_roles for delete to authenticated
using (
  exists (
    select 1 from public.business_partners partner
    where partner.id = business_partner_id
      and private.has_workspace_permission(partner.workspace_id, 'partner.write')
  )
);

drop policy if exists "contact_select_manager" on public.contact_messages;
create policy "contact_select_permitted"
on public.contact_messages for select to authenticated
using (
  workspace_id is not null
  and private.has_workspace_permission(workspace_id, 'contact.read')
);

drop policy if exists "audit_select_manager" on public.audit_logs;
create policy "audit_select_permitted"
on public.audit_logs for select to authenticated
using (
  workspace_id is not null
  and private.has_workspace_permission(workspace_id, 'audit.read')
);
