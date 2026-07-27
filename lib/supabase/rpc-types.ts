import type { Database } from './database.types'

type PublicFunctions = Database['public']['Functions']

export type RpcName = keyof PublicFunctions

export type RpcArgs<Name extends RpcName> = PublicFunctions[Name]['Args']

export type RpcResult<Name extends RpcName> = PublicFunctions[Name]['Returns']

export type FinalizeBusinessReviewArgs = RpcArgs<'finalize_business_review'>
export type CreateTransactionArgs = RpcArgs<'create_transaction'>
export type GenerateWorkspaceRemindersArgs = RpcArgs<'generate_my_workspace_reminders'>
export type GetMyWorkspaceAccessResult = RpcResult<'get_my_workspace_access'>
export type GetWorkspaceMemberDirectoryArgs = RpcArgs<'get_workspace_member_directory'>
export type GetWorkspaceMemberDirectoryResult = RpcResult<'get_workspace_member_directory'>
export type TransitionBusinessPlanArgs = RpcArgs<'transition_business_plan'>
export type TransitionBusinessGoalArgs = RpcArgs<'transition_business_goal'>
export type TransitionBusinessInitiativeArgs = RpcArgs<'transition_business_initiative'>
export type TransitionActionItemArgs = RpcArgs<'transition_action_item'>
export type SetPlanningRecordArchivedArgs = RpcArgs<'set_planning_record_archived'>
