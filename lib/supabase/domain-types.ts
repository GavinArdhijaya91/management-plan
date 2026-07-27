import type { Enums, Tables, TablesInsert, TablesUpdate } from './database.types'

// Identity and workspace access
export type ProfileRow = Tables<'profiles'>
export type ProfilePreferenceRow = Tables<'profile_preferences'>
export type WorkspaceRow = Tables<'workspaces'>
export type WorkspaceMemberAccessRow = Tables<'workspace_member_access'>
export type WorkspaceInvitationAccessRow = Tables<'workspace_invitation_access'>
export type WorkspaceRoleRow = Tables<'workspace_roles'>

// Planning and review
export type BusinessPlanRow = Tables<'business_plans'>
export type BusinessGoalRow = Tables<'business_goals'>
export type GoalTargetRow = Tables<'goal_targets'>
export type MetricMeasurementRow = Tables<'metric_measurements'>
export type BusinessInitiativeRow = Tables<'business_initiatives'>
export type ActionItemRow = Tables<'action_items'>
export type BusinessReviewRow = Tables<'business_reviews'>
export type BusinessReviewSummaryRow = Tables<'business_review_summaries'>

// Financial operations
export type TransactionRow = Tables<'transactions'>
export type TransactionInsert = TablesInsert<'transactions'>
export type TransactionUpdate = TablesUpdate<'transactions'>
export type TransactionFinancialResultRow = Tables<'transaction_financial_results'>
export type FinancialAccountRow = Tables<'financial_accounts'>
export type FinancialAccountBalanceRow = Tables<'financial_account_balances'>
export type TransactionCategoryRow = Tables<'transaction_categories'>
export type TransactionCategoryActualRow = Tables<'transaction_category_actuals'>

// Portfolio, achievements, and notifications
export type BusinessPortfolioRow = Tables<'business_portfolios'>
export type BusinessPortfolioEvidenceRow = Tables<'business_portfolio_evidence'>
export type WorkspaceAchievementDetailRow = Tables<'workspace_achievement_details'>
export type NotificationRow = Tables<'notifications'>

// Canonical database enums. Translate only at the presentation boundary.
export type TransactionType = Enums<'transaction_type'>
export type MembershipStatus = Enums<'membership_status'>
export type BusinessReviewStatus = Enums<'business_review_status'>
export type BusinessPortfolioStatus = Enums<'business_portfolio_status'>
export type BusinessPlanStatus = Enums<'business_plan_status'>
export type BusinessGoalStatus = Enums<'business_goal_status'>
export type BusinessInitiativeStatus = Enums<'business_initiative_status'>
export type ActionItemStatus = Enums<'action_item_status'>
export type PlanningRecordType = Enums<'planning_record_type'>
