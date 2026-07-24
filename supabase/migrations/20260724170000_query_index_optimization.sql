-- Query-path indexes for invitation lifecycle, delivery workers, and reminders.
-- Partial indexes keep write and storage costs limited to actionable rows.

create index workspace_invitations_pending_expiry_idx
  on public.workspace_invitations (expires_at)
  where status = 'pending';

create index email_deliveries_queued_schedule_idx
  on public.email_deliveries (scheduled_at, created_at)
  where status = 'queued';

create index action_items_active_assignee_due_idx
  on public.action_items (workspace_id, assignee_id, due_on)
  where status not in ('completed', 'cancelled')
    and assignee_id is not null
    and due_on is not null;

create index calendar_events_upcoming_idx
  on public.calendar_events (workspace_id, starts_at)
  where completed_at is null;

create index business_reviews_draft_reviewer_period_idx
  on public.business_reviews (workspace_id, reviewed_by, period_end)
  where status = 'draft';

create index notifications_unread_workspace_date_idx
  on public.notifications (user_id, workspace_id, created_at desc)
  where read_at is null;

-- Each removed index duplicates the leading columns of an existing unique
-- constraint index and therefore provides no additional lookup capability.
drop index public.market_snapshots_product_date_idx;
drop index public.transaction_category_allocations_transaction_idx;
drop index public.transaction_initiative_allocations_transaction_idx;
drop index public.transaction_goal_target_contributions_transaction_idx;
