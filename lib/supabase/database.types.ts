export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievement_definitions: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string
          display_order: number
          icon_key: string
          name: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description: string
          display_order?: number
          icon_key: string
          name: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string
          display_order?: number
          icon_key?: string
          name?: string
        }
        Relationships: []
      }
      action_item_calendar_events: {
        Row: {
          action_item_id: string
          calendar_event_id: string
          created_at: string
          created_by: string
          id: string
          workspace_id: string
        }
        Insert: {
          action_item_id: string
          calendar_event_id: string
          created_at?: string
          created_by: string
          id?: string
          workspace_id: string
        }
        Update: {
          action_item_id?: string
          calendar_event_id?: string
          created_at?: string
          created_by?: string
          id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_item_calendar_events_workspace_id_action_item_id_fkey"
            columns: ["workspace_id", "action_item_id"]
            isOneToOne: false
            referencedRelation: "action_items"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "action_item_calendar_events_workspace_id_calendar_event_id_fkey"
            columns: ["workspace_id", "calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "action_item_calendar_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      action_items: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          assignee_id: string
          blocked_at: string | null
          blocked_reason: string | null
          business_initiative_id: string
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_on: string
          id: string
          priority: number
          reopened_at: string | null
          reopened_by: string | null
          starts_on: string | null
          status: Database["public"]["Enums"]["action_item_status"]
          status_reason: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          assignee_id: string
          blocked_at?: string | null
          blocked_reason?: string | null
          business_initiative_id: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_on: string
          id?: string
          priority?: number
          reopened_at?: string | null
          reopened_by?: string | null
          starts_on?: string | null
          status?: Database["public"]["Enums"]["action_item_status"]
          status_reason?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          assignee_id?: string
          blocked_at?: string | null
          blocked_reason?: string | null
          business_initiative_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_on?: string
          id?: string
          priority?: number
          reopened_at?: string | null
          reopened_by?: string | null
          starts_on?: string | null
          status?: Database["public"]["Enums"]["action_item_status"]
          status_reason?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_assignee_workspace_member_fkey"
            columns: ["workspace_id", "assignee_id"]
            isOneToOne: false
            referencedRelation: "workspace_member_access"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "action_items_assignee_workspace_member_fkey"
            columns: ["workspace_id", "assignee_id"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "action_items_workspace_id_business_initiative_id_fkey"
            columns: ["workspace_id", "business_initiative_id"]
            isOneToOne: false
            referencedRelation: "business_initiatives"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "action_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          metadata: Json
          workspace_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: never
          metadata?: Json
          workspace_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: never
          metadata?: Json
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_categories: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: number
          name: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: never
          name: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: never
          name?: string
        }
        Relationships: []
      }
      business_goals: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          business_plan_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          owner_id: string | null
          status: Database["public"]["Enums"]["business_goal_status"]
          status_reason: string | null
          target_date: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          business_plan_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["business_goal_status"]
          status_reason?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          business_plan_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["business_goal_status"]
          status_reason?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_goals_owner_workspace_member_fkey"
            columns: ["workspace_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "workspace_member_access"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "business_goals_owner_workspace_member_fkey"
            columns: ["workspace_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "business_goals_workspace_id_business_plan_id_fkey"
            columns: ["workspace_id", "business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "business_goals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_initiatives: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          budget_amount: number | null
          business_goal_id: string | null
          business_plan_id: string
          created_at: string
          created_by: string
          description: string | null
          ends_on: string | null
          id: string
          owner_id: string | null
          starts_on: string | null
          status: Database["public"]["Enums"]["business_initiative_status"]
          status_reason: string | null
          title: string
          unlinked_goal_context: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          budget_amount?: number | null
          business_goal_id?: string | null
          business_plan_id: string
          created_at?: string
          created_by: string
          description?: string | null
          ends_on?: string | null
          id?: string
          owner_id?: string | null
          starts_on?: string | null
          status?: Database["public"]["Enums"]["business_initiative_status"]
          status_reason?: string | null
          title: string
          unlinked_goal_context?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          budget_amount?: number | null
          business_goal_id?: string | null
          business_plan_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          ends_on?: string | null
          id?: string
          owner_id?: string | null
          starts_on?: string | null
          status?: Database["public"]["Enums"]["business_initiative_status"]
          status_reason?: string | null
          title?: string
          unlinked_goal_context?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_initiatives_owner_workspace_member_fkey"
            columns: ["workspace_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "workspace_member_access"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "business_initiatives_owner_workspace_member_fkey"
            columns: ["workspace_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "business_initiatives_workspace_id_business_goal_id_fkey"
            columns: ["workspace_id", "business_goal_id"]
            isOneToOne: false
            referencedRelation: "business_goals"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "business_initiatives_workspace_id_business_plan_id_fkey"
            columns: ["workspace_id", "business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "business_initiatives_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_partner_roles: {
        Row: {
          business_partner_id: string
          created_at: string
          role: Database["public"]["Enums"]["business_partner_role"]
        }
        Insert: {
          business_partner_id: string
          created_at?: string
          role: Database["public"]["Enums"]["business_partner_role"]
        }
        Update: {
          business_partner_id?: string
          created_at?: string
          role?: Database["public"]["Enums"]["business_partner_role"]
        }
        Relationships: [
          {
            foreignKeyName: "business_partner_roles_business_partner_id_fkey"
            columns: ["business_partner_id"]
            isOneToOne: false
            referencedRelation: "business_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      business_partners: {
        Row: {
          address_line: string | null
          city: string | null
          country_code: string | null
          created_at: string
          created_by: string
          default_currency_code: string | null
          display_name: string | null
          email: string | null
          id: string
          legal_name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          province: string | null
          status: Database["public"]["Enums"]["business_partner_status"]
          tax_identifier: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          created_by: string
          default_currency_code?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          legal_name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          status?: Database["public"]["Enums"]["business_partner_status"]
          tax_identifier?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          address_line?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string
          default_currency_code?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          legal_name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          status?: Database["public"]["Enums"]["business_partner_status"]
          tax_identifier?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_partners_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "business_partners_default_currency_code_fkey"
            columns: ["default_currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "business_partners_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_plan_member_grants: {
        Row: {
          business_plan_id: string
          granted_at: string
          granted_by: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          business_plan_id: string
          granted_at?: string
          granted_by?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          business_plan_id?: string
          granted_at?: string
          granted_by?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_plan_member_grants_workspace_id_business_plan_id_fkey"
            columns: ["workspace_id", "business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "business_plan_member_grants_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_plan_member_grants_workspace_id_user_id_fkey"
            columns: ["workspace_id", "user_id"]
            isOneToOne: false
            referencedRelation: "workspace_member_access"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "business_plan_member_grants_workspace_id_user_id_fkey"
            columns: ["workspace_id", "user_id"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["workspace_id", "user_id"]
          },
        ]
      }
      business_plan_role_grants: {
        Row: {
          business_plan_id: string
          granted_at: string
          granted_by: string | null
          workspace_id: string
          workspace_role_id: string
        }
        Insert: {
          business_plan_id: string
          granted_at?: string
          granted_by?: string | null
          workspace_id: string
          workspace_role_id: string
        }
        Update: {
          business_plan_id?: string
          granted_at?: string
          granted_by?: string | null
          workspace_id?: string
          workspace_role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_plan_role_grants_workspace_id_business_plan_id_fkey"
            columns: ["workspace_id", "business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "business_plan_role_grants_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_plan_role_grants_workspace_id_workspace_role_id_fkey"
            columns: ["workspace_id", "workspace_role_id"]
            isOneToOne: false
            referencedRelation: "workspace_roles"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      business_plans: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string
          description: string | null
          ends_on: string
          id: string
          owner_id: string | null
          starts_on: string
          status: Database["public"]["Enums"]["business_plan_status"]
          status_reason: string | null
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["business_plan_visibility"]
          workspace_id: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          ends_on: string
          id?: string
          owner_id?: string | null
          starts_on: string
          status?: Database["public"]["Enums"]["business_plan_status"]
          status_reason?: string | null
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["business_plan_visibility"]
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          ends_on?: string
          id?: string
          owner_id?: string | null
          starts_on?: string
          status?: Database["public"]["Enums"]["business_plan_status"]
          status_reason?: string | null
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["business_plan_visibility"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_plans_owner_workspace_member_fkey"
            columns: ["workspace_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "workspace_member_access"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "business_plans_owner_workspace_member_fkey"
            columns: ["workspace_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "business_plans_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_portfolio_reviews: {
        Row: {
          added_at: string
          added_by: string
          business_portfolio_id: string
          business_review_id: string
          display_order: number
          id: string
          note: string | null
          workspace_id: string
        }
        Insert: {
          added_at?: string
          added_by: string
          business_portfolio_id: string
          business_review_id: string
          display_order?: number
          id?: string
          note?: string | null
          workspace_id: string
        }
        Update: {
          added_at?: string
          added_by?: string
          business_portfolio_id?: string
          business_review_id?: string
          display_order?: number
          id?: string
          note?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_portfolio_reviews_workspace_id_business_portfolio_fkey"
            columns: ["workspace_id", "business_portfolio_id"]
            isOneToOne: false
            referencedRelation: "business_portfolio_evidence"
            referencedColumns: ["workspace_id", "business_portfolio_id"]
          },
          {
            foreignKeyName: "business_portfolio_reviews_workspace_id_business_portfolio_fkey"
            columns: ["workspace_id", "business_portfolio_id"]
            isOneToOne: false
            referencedRelation: "business_portfolios"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "business_portfolio_reviews_workspace_id_business_review_id_fkey"
            columns: ["workspace_id", "business_review_id"]
            isOneToOne: false
            referencedRelation: "business_review_summaries"
            referencedColumns: ["workspace_id", "business_review_id"]
          },
          {
            foreignKeyName: "business_portfolio_reviews_workspace_id_business_review_id_fkey"
            columns: ["workspace_id", "business_review_id"]
            isOneToOne: false
            referencedRelation: "business_reviews"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "business_portfolio_reviews_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_portfolios: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string
          id: string
          status: Database["public"]["Enums"]["business_portfolio_status"]
          summary: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          id?: string
          status?: Database["public"]["Enums"]["business_portfolio_status"]
          summary?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          id?: string
          status?: Database["public"]["Enums"]["business_portfolio_status"]
          summary?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_portfolios_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_review_action_item_snapshots: {
        Row: {
          blocked_count: number
          business_review_id: string
          cancelled_count: number
          captured_at: string
          completed_count: number
          id: string
          in_progress_count: number
          overdue_count: number
          todo_count: number
          total_count: number
          workspace_id: string
        }
        Insert: {
          blocked_count?: number
          business_review_id: string
          cancelled_count?: number
          captured_at?: string
          completed_count?: number
          id?: string
          in_progress_count?: number
          overdue_count?: number
          todo_count?: number
          total_count?: number
          workspace_id: string
        }
        Update: {
          blocked_count?: number
          business_review_id?: string
          cancelled_count?: number
          captured_at?: string
          completed_count?: number
          id?: string
          in_progress_count?: number
          overdue_count?: number
          todo_count?: number
          total_count?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_review_action_item_s_workspace_id_business_review_fkey"
            columns: ["workspace_id", "business_review_id"]
            isOneToOne: false
            referencedRelation: "business_review_summaries"
            referencedColumns: ["workspace_id", "business_review_id"]
          },
          {
            foreignKeyName: "business_review_action_item_s_workspace_id_business_review_fkey"
            columns: ["workspace_id", "business_review_id"]
            isOneToOne: false
            referencedRelation: "business_reviews"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "business_review_action_item_snapshots_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_review_financial_snapshots: {
        Row: {
          business_review_id: string
          captured_at: string
          currency_code: string
          expense_amount: number
          id: string
          net_amount: number | null
          revenue_amount: number
          transaction_count: number
          workspace_id: string
        }
        Insert: {
          business_review_id: string
          captured_at?: string
          currency_code: string
          expense_amount?: number
          id?: string
          net_amount?: number | null
          revenue_amount?: number
          transaction_count?: number
          workspace_id: string
        }
        Update: {
          business_review_id?: string
          captured_at?: string
          currency_code?: string
          expense_amount?: number
          id?: string
          net_amount?: number | null
          revenue_amount?: number
          transaction_count?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_review_financial_sna_workspace_id_business_review_fkey"
            columns: ["workspace_id", "business_review_id"]
            isOneToOne: false
            referencedRelation: "business_review_summaries"
            referencedColumns: ["workspace_id", "business_review_id"]
          },
          {
            foreignKeyName: "business_review_financial_sna_workspace_id_business_review_fkey"
            columns: ["workspace_id", "business_review_id"]
            isOneToOne: false
            referencedRelation: "business_reviews"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "business_review_financial_snapshots_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "business_review_financial_snapshots_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_review_goal_target_snapshots: {
        Row: {
          actual_value: number | null
          aggregation: Database["public"]["Enums"]["metric_aggregation"]
          business_review_id: string
          captured_at: string
          direction: Database["public"]["Enums"]["goal_direction"]
          goal_target_id: string
          id: string
          metric_name: string
          starting_value: number | null
          target_value: number
          unit_type: Database["public"]["Enums"]["metric_unit_type"]
          workspace_id: string
        }
        Insert: {
          actual_value?: number | null
          aggregation: Database["public"]["Enums"]["metric_aggregation"]
          business_review_id: string
          captured_at?: string
          direction: Database["public"]["Enums"]["goal_direction"]
          goal_target_id: string
          id?: string
          metric_name: string
          starting_value?: number | null
          target_value: number
          unit_type: Database["public"]["Enums"]["metric_unit_type"]
          workspace_id: string
        }
        Update: {
          actual_value?: number | null
          aggregation?: Database["public"]["Enums"]["metric_aggregation"]
          business_review_id?: string
          captured_at?: string
          direction?: Database["public"]["Enums"]["goal_direction"]
          goal_target_id?: string
          id?: string
          metric_name?: string
          starting_value?: number | null
          target_value?: number
          unit_type?: Database["public"]["Enums"]["metric_unit_type"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_review_goal_target_s_workspace_id_business_review_fkey"
            columns: ["workspace_id", "business_review_id"]
            isOneToOne: false
            referencedRelation: "business_review_summaries"
            referencedColumns: ["workspace_id", "business_review_id"]
          },
          {
            foreignKeyName: "business_review_goal_target_s_workspace_id_business_review_fkey"
            columns: ["workspace_id", "business_review_id"]
            isOneToOne: false
            referencedRelation: "business_reviews"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "business_review_goal_target_sn_workspace_id_goal_target_id_fkey"
            columns: ["workspace_id", "goal_target_id"]
            isOneToOne: false
            referencedRelation: "goal_targets"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "business_review_goal_target_snapshots_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_reviews: {
        Row: {
          business_plan_id: string
          challenges: string | null
          created_at: string
          finalized_at: string | null
          id: string
          next_steps: string | null
          period_end: string
          period_start: string
          period_type: Database["public"]["Enums"]["business_review_period"]
          reviewed_by: string
          snapshot_refreshed_at: string | null
          status: Database["public"]["Enums"]["business_review_status"]
          summary: string
          updated_at: string
          wins: string | null
          workspace_id: string
        }
        Insert: {
          business_plan_id: string
          challenges?: string | null
          created_at?: string
          finalized_at?: string | null
          id?: string
          next_steps?: string | null
          period_end: string
          period_start: string
          period_type: Database["public"]["Enums"]["business_review_period"]
          reviewed_by: string
          snapshot_refreshed_at?: string | null
          status?: Database["public"]["Enums"]["business_review_status"]
          summary: string
          updated_at?: string
          wins?: string | null
          workspace_id: string
        }
        Update: {
          business_plan_id?: string
          challenges?: string | null
          created_at?: string
          finalized_at?: string | null
          id?: string
          next_steps?: string | null
          period_end?: string
          period_start?: string
          period_type?: Database["public"]["Enums"]["business_review_period"]
          reviewed_by?: string
          snapshot_refreshed_at?: string | null
          status?: Database["public"]["Enums"]["business_review_status"]
          summary?: string
          updated_at?: string
          wins?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_workspace_id_business_plan_id_fkey"
            columns: ["workspace_id", "business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "business_reviews_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          ends_at: string | null
          id: string
          notes: string | null
          starts_at: string
          title: string
          type: Database["public"]["Enums"]["calendar_event_type"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          starts_at: string
          title: string
          type?: Database["public"]["Enums"]["calendar_event_type"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          starts_at?: string
          title?: string
          type?: Database["public"]["Enums"]["calendar_event_type"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["contact_status"]
          subject: string
          updated_at: string
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          subject: string
          updated_at?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          subject?: string
          updated_at?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          active: boolean
          code: string
          created_at: string
          default_currency_code: string
          name: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          default_currency_code: string
          name: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          default_currency_code?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "countries_default_currency_code_fkey"
            columns: ["default_currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      currencies: {
        Row: {
          active: boolean
          code: string
          created_at: string
          decimal_digits: number
          name: string
          symbol: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          decimal_digits?: number
          name: string
          symbol: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          decimal_digits?: number
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      email_deliveries: {
        Row: {
          attempt_count: number
          cancelled_at: string | null
          created_at: string
          failed_at: string | null
          id: string
          last_error_code: string | null
          processing_started_at: string | null
          provider_message_id: string | null
          provider_name: string | null
          recipient_email: string
          scheduled_at: string
          sent_at: string | null
          status: Database["public"]["Enums"]["email_delivery_status"]
          template_code: Database["public"]["Enums"]["email_template_code"]
          updated_at: string
          workspace_id: string
          workspace_invitation_id: string
        }
        Insert: {
          attempt_count?: number
          cancelled_at?: string | null
          created_at?: string
          failed_at?: string | null
          id?: string
          last_error_code?: string | null
          processing_started_at?: string | null
          provider_message_id?: string | null
          provider_name?: string | null
          recipient_email: string
          scheduled_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_delivery_status"]
          template_code: Database["public"]["Enums"]["email_template_code"]
          updated_at?: string
          workspace_id: string
          workspace_invitation_id: string
        }
        Update: {
          attempt_count?: number
          cancelled_at?: string | null
          created_at?: string
          failed_at?: string | null
          id?: string
          last_error_code?: string | null
          processing_started_at?: string | null
          provider_message_id?: string | null
          provider_name?: string | null
          recipient_email?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_delivery_status"]
          template_code?: Database["public"]["Enums"]["email_template_code"]
          updated_at?: string
          workspace_id?: string
          workspace_invitation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_deliveries_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_deliveries_workspace_id_workspace_invitation_id_fkey"
            columns: ["workspace_id", "workspace_invitation_id"]
            isOneToOne: false
            referencedRelation: "workspace_invitation_access"
            referencedColumns: ["workspace_id", "workspace_invitation_id"]
          },
          {
            foreignKeyName: "email_deliveries_workspace_id_workspace_invitation_id_fkey"
            columns: ["workspace_id", "workspace_invitation_id"]
            isOneToOne: false
            referencedRelation: "workspace_invitations"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      financial_accounts: {
        Row: {
          account_kind: Database["public"]["Enums"]["financial_account_kind"]
          active: boolean
          code: string
          created_at: string
          created_by: string | null
          currency_code: string
          id: string
          is_default: boolean
          is_system: boolean
          name: string
          opening_balance: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          account_kind: Database["public"]["Enums"]["financial_account_kind"]
          active?: boolean
          code: string
          created_at?: string
          created_by?: string | null
          currency_code: string
          id?: string
          is_default?: boolean
          is_system?: boolean
          name: string
          opening_balance?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          account_kind?: Database["public"]["Enums"]["financial_account_kind"]
          active?: boolean
          code?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          id?: string
          is_default?: boolean
          is_system?: boolean
          name?: string
          opening_balance?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_accounts_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "financial_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_targets: {
        Row: {
          business_goal_id: string
          created_at: string
          created_by: string
          direction: Database["public"]["Enums"]["goal_direction"]
          id: string
          metric_definition_id: string
          starting_value: number | null
          target_date: string | null
          target_value: number
          updated_at: string
          weight_percent: number
          workspace_id: string
        }
        Insert: {
          business_goal_id: string
          created_at?: string
          created_by: string
          direction?: Database["public"]["Enums"]["goal_direction"]
          id?: string
          metric_definition_id: string
          starting_value?: number | null
          target_date?: string | null
          target_value: number
          updated_at?: string
          weight_percent?: number
          workspace_id: string
        }
        Update: {
          business_goal_id?: string
          created_at?: string
          created_by?: string
          direction?: Database["public"]["Enums"]["goal_direction"]
          id?: string
          metric_definition_id?: string
          starting_value?: number | null
          target_date?: string | null
          target_value?: number
          updated_at?: string
          weight_percent?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_targets_workspace_id_business_goal_id_fkey"
            columns: ["workspace_id", "business_goal_id"]
            isOneToOne: false
            referencedRelation: "business_goals"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "goal_targets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_targets_workspace_id_metric_definition_id_fkey"
            columns: ["workspace_id", "metric_definition_id"]
            isOneToOne: false
            referencedRelation: "metric_definitions"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      market_products: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_products_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      market_snapshots: {
        Row: {
          change_percent: number
          created_at: string
          created_by: string
          id: string
          market_condition: string
          observed_on: string
          product_id: string
          workspace_id: string
        }
        Insert: {
          change_percent: number
          created_at?: string
          created_by: string
          id?: string
          market_condition: string
          observed_on: string
          product_id: string
          workspace_id: string
        }
        Update: {
          change_percent?: number
          created_at?: string
          created_by?: string
          id?: string
          market_condition?: string
          observed_on?: string
          product_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_snapshots_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_snapshots_workspace_product_fkey"
            columns: ["workspace_id", "product_id"]
            isOneToOne: false
            referencedRelation: "market_products"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      metric_definitions: {
        Row: {
          aggregation: Database["public"]["Enums"]["metric_aggregation"]
          code: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          unit_label: string | null
          unit_type: Database["public"]["Enums"]["metric_unit_type"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          aggregation?: Database["public"]["Enums"]["metric_aggregation"]
          code: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          unit_label?: string | null
          unit_type: Database["public"]["Enums"]["metric_unit_type"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          aggregation?: Database["public"]["Enums"]["metric_aggregation"]
          code?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          unit_label?: string | null
          unit_type?: Database["public"]["Enums"]["metric_unit_type"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metric_definitions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_measurement_transactions: {
        Row: {
          created_at: string
          created_by: string
          id: string
          metric_measurement_id: string
          transaction_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          metric_measurement_id: string
          transaction_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          metric_measurement_id?: string
          transaction_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metric_measurement_transactio_workspace_id_metric_measurem_fkey"
            columns: ["workspace_id", "metric_measurement_id"]
            isOneToOne: false
            referencedRelation: "goal_target_latest_measurements"
            referencedColumns: ["workspace_id", "metric_measurement_id"]
          },
          {
            foreignKeyName: "metric_measurement_transactio_workspace_id_metric_measurem_fkey"
            columns: ["workspace_id", "metric_measurement_id"]
            isOneToOne: false
            referencedRelation: "metric_measurements"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "metric_measurement_transaction_workspace_id_transaction_id_fkey"
            columns: ["workspace_id", "transaction_id"]
            isOneToOne: false
            referencedRelation: "transaction_financial_results"
            referencedColumns: ["workspace_id", "transaction_id"]
          },
          {
            foreignKeyName: "metric_measurement_transaction_workspace_id_transaction_id_fkey"
            columns: ["workspace_id", "transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "metric_measurement_transactions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_measurements: {
        Row: {
          created_at: string
          created_by: string
          goal_target_id: string
          id: string
          measured_at: string
          measured_value: number
          note: string | null
          source: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          goal_target_id: string
          id?: string
          measured_at?: string
          measured_value: number
          note?: string | null
          source?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          goal_target_id?: string
          id?: string
          measured_at?: string
          measured_value?: number
          note?: string | null
          source?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metric_measurements_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_measurements_workspace_id_goal_target_id_fkey"
            columns: ["workspace_id", "goal_target_id"]
            isOneToOne: false
            referencedRelation: "goal_targets"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          detail: string
          event_code: string
          event_key: string
          expires_at: string | null
          href: string | null
          id: string
          occurred_at: string
          read_at: string | null
          source_entity_id: string | null
          source_entity_type: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          detail: string
          event_code?: string
          event_key: string
          expires_at?: string | null
          href?: string | null
          id?: string
          occurred_at?: string
          read_at?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          detail?: string
          event_code?: string
          event_key?: string
          expires_at?: string | null
          href?: string | null
          id?: string
          occurred_at?: string
          read_at?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_definitions: {
        Row: {
          action: string
          code: string
          created_at: string
          description: string
          resource: string
        }
        Insert: {
          action: string
          code: string
          created_at?: string
          description: string
          resource: string
        }
        Update: {
          action?: string
          code?: string
          created_at?: string
          description?: string
          resource?: string
        }
        Relationships: []
      }
      profile_preferences: {
        Row: {
          achievement_notifications: boolean
          action_due_notifications: boolean
          calendar_notifications: boolean
          collaboration_notifications: boolean
          created_at: string
          date_format: string
          locale: string
          marketing_notifications: boolean
          reminder_lead_hours: number
          review_notifications: boolean
          theme: Database["public"]["Enums"]["profile_theme"]
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_notifications?: boolean
          action_due_notifications?: boolean
          calendar_notifications?: boolean
          collaboration_notifications?: boolean
          created_at?: string
          date_format?: string
          locale?: string
          marketing_notifications?: boolean
          reminder_lead_hours?: number
          review_notifications?: boolean
          theme?: Database["public"]["Enums"]["profile_theme"]
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_notifications?: boolean
          action_due_notifications?: boolean
          calendar_notifications?: boolean
          collaboration_notifications?: boolean
          created_at?: string
          date_format?: string
          locale?: string
          marketing_notifications?: boolean
          reminder_lead_hours?: number
          review_notifications?: boolean
          theme?: Database["public"]["Enums"]["profile_theme"]
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          email: string
          email_notifications: boolean
          full_name: string
          phone: string | null
          updated_at: string
          user_id: string
          weekly_summary: boolean
        }
        Insert: {
          avatar_path?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          email: string
          email_notifications?: boolean
          full_name: string
          phone?: string | null
          updated_at?: string
          user_id: string
          weekly_summary?: boolean
        }
        Update: {
          avatar_path?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          email?: string
          email_notifications?: boolean
          full_name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          weekly_summary?: boolean
        }
        Relationships: []
      }
      transaction_categories: {
        Row: {
          active: boolean
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_system: boolean
          name: string
          parent_category_id: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          parent_category_id?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          parent_category_id?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_categories_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_categories_workspace_id_parent_category_id_fkey"
            columns: ["workspace_id", "parent_category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "transaction_categories_workspace_id_parent_category_id_fkey"
            columns: ["workspace_id", "parent_category_id"]
            isOneToOne: false
            referencedRelation: "transaction_category_actuals"
            referencedColumns: ["workspace_id", "transaction_category_id"]
          },
        ]
      }
      transaction_category_allocations: {
        Row: {
          allocated_amount: number
          created_at: string
          created_by: string
          id: string
          note: string | null
          transaction_category_id: string
          transaction_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          allocated_amount: number
          created_at?: string
          created_by: string
          id?: string
          note?: string | null
          transaction_category_id: string
          transaction_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          allocated_amount?: number
          created_at?: string
          created_by?: string
          id?: string
          note?: string | null
          transaction_category_id?: string
          transaction_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_category_allocati_workspace_id_transaction_cat_fkey"
            columns: ["workspace_id", "transaction_category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "transaction_category_allocati_workspace_id_transaction_cat_fkey"
            columns: ["workspace_id", "transaction_category_id"]
            isOneToOne: false
            referencedRelation: "transaction_category_actuals"
            referencedColumns: ["workspace_id", "transaction_category_id"]
          },
          {
            foreignKeyName: "transaction_category_allocatio_workspace_id_transaction_id_fkey"
            columns: ["workspace_id", "transaction_id"]
            isOneToOne: false
            referencedRelation: "transaction_financial_results"
            referencedColumns: ["workspace_id", "transaction_id"]
          },
          {
            foreignKeyName: "transaction_category_allocatio_workspace_id_transaction_id_fkey"
            columns: ["workspace_id", "transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "transaction_category_allocations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_goal_target_contributions: {
        Row: {
          contribution_value: number
          created_at: string
          created_by: string
          goal_target_id: string
          id: string
          note: string | null
          transaction_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          contribution_value: number
          created_at?: string
          created_by: string
          goal_target_id: string
          id?: string
          note?: string | null
          transaction_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          contribution_value?: number
          created_at?: string
          created_by?: string
          goal_target_id?: string
          id?: string
          note?: string | null
          transaction_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_goal_target_contri_workspace_id_goal_target_id_fkey"
            columns: ["workspace_id", "goal_target_id"]
            isOneToOne: false
            referencedRelation: "goal_targets"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "transaction_goal_target_contri_workspace_id_transaction_id_fkey"
            columns: ["workspace_id", "transaction_id"]
            isOneToOne: false
            referencedRelation: "transaction_financial_results"
            referencedColumns: ["workspace_id", "transaction_id"]
          },
          {
            foreignKeyName: "transaction_goal_target_contri_workspace_id_transaction_id_fkey"
            columns: ["workspace_id", "transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "transaction_goal_target_contributions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_initiative_allocations: {
        Row: {
          allocated_amount: number
          business_initiative_id: string
          created_at: string
          created_by: string
          id: string
          note: string | null
          transaction_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          allocated_amount: number
          business_initiative_id: string
          created_at?: string
          created_by: string
          id?: string
          note?: string | null
          transaction_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          allocated_amount?: number
          business_initiative_id?: string
          created_at?: string
          created_by?: string
          id?: string
          note?: string | null
          transaction_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_initiative_alloca_workspace_id_business_initia_fkey"
            columns: ["workspace_id", "business_initiative_id"]
            isOneToOne: false
            referencedRelation: "business_initiatives"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "transaction_initiative_allocat_workspace_id_transaction_id_fkey"
            columns: ["workspace_id", "transaction_id"]
            isOneToOne: false
            referencedRelation: "transaction_financial_results"
            referencedColumns: ["workspace_id", "transaction_id"]
          },
          {
            foreignKeyName: "transaction_initiative_allocat_workspace_id_transaction_id_fkey"
            columns: ["workspace_id", "transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "transaction_initiative_allocations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          cost_amount: number
          created_at: string
          created_by: string
          financial_account_id: string
          id: string
          note: string | null
          transaction_date: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          amount: number
          cost_amount?: number
          created_at?: string
          created_by: string
          financial_account_id: string
          id?: string
          note?: string | null
          transaction_date: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          amount?: number
          cost_amount?: number
          created_at?: string
          created_by?: string
          financial_account_id?: string
          id?: string
          note?: string | null
          transaction_date?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_workspace_financial_account_fkey"
            columns: ["workspace_id", "financial_account_id"]
            isOneToOne: false
            referencedRelation: "financial_account_balances"
            referencedColumns: ["workspace_id", "financial_account_id"]
          },
          {
            foreignKeyName: "transactions_workspace_financial_account_fkey"
            columns: ["workspace_id", "financial_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "transactions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_achievements: {
        Row: {
          achievement_code: string
          awarded_at: string
          evidence_business_review_id: string
          id: string
          workspace_id: string
        }
        Insert: {
          achievement_code: string
          awarded_at?: string
          evidence_business_review_id: string
          id?: string
          workspace_id: string
        }
        Update: {
          achievement_code?: string
          awarded_at?: string
          evidence_business_review_id?: string
          id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_achievements_achievement_code_fkey"
            columns: ["achievement_code"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "workspace_achievements_workspace_id_evidence_business_revi_fkey"
            columns: ["workspace_id", "evidence_business_review_id"]
            isOneToOne: false
            referencedRelation: "business_review_summaries"
            referencedColumns: ["workspace_id", "business_review_id"]
          },
          {
            foreignKeyName: "workspace_achievements_workspace_id_evidence_business_revi_fkey"
            columns: ["workspace_id", "evidence_business_review_id"]
            isOneToOne: false
            referencedRelation: "business_reviews"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "workspace_achievements_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_business_categories: {
        Row: {
          category_id: number
          created_at: string
          workspace_id: string
        }
        Insert: {
          category_id: number
          created_at?: string
          workspace_id: string
        }
        Update: {
          category_id?: number
          created_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_business_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_business_categories_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          declined_at: string | null
          delivery_attempts: number
          delivery_error_code: string | null
          delivery_status: Database["public"]["Enums"]["invitation_delivery_status"]
          email: string
          expires_at: string
          id: string
          invited_by: string
          last_resend_requested_at: string | null
          last_sent_at: string | null
          revoked_at: string | null
          role: Database["public"]["Enums"]["workspace_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          updated_at: string
          workspace_id: string
          workspace_role_id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          declined_at?: string | null
          delivery_attempts?: number
          delivery_error_code?: string | null
          delivery_status?: Database["public"]["Enums"]["invitation_delivery_status"]
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          last_resend_requested_at?: string | null
          last_sent_at?: string | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          updated_at?: string
          workspace_id: string
          workspace_role_id: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          declined_at?: string | null
          delivery_attempts?: number
          delivery_error_code?: string | null
          delivery_status?: Database["public"]["Enums"]["invitation_delivery_status"]
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          last_resend_requested_at?: string | null
          last_sent_at?: string | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash?: string
          updated_at?: string
          workspace_id?: string
          workspace_role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_invitations_workspace_role_fkey"
            columns: ["workspace_id", "workspace_role_id"]
            isOneToOne: false
            referencedRelation: "workspace_roles"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          job_title: string | null
          joined_at: string
          role: Database["public"]["Enums"]["workspace_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
          workspace_id: string
          workspace_role_id: string
        }
        Insert: {
          created_at?: string
          job_title?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
          workspace_id: string
          workspace_role_id: string
        }
        Update: {
          created_at?: string
          job_title?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
          workspace_id?: string
          workspace_role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_role_fkey"
            columns: ["workspace_id", "workspace_role_id"]
            isOneToOne: false
            referencedRelation: "workspace_roles"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      workspace_role_permissions: {
        Row: {
          granted_at: string
          granted_by: string | null
          permission_code: string
          workspace_id: string
          workspace_role_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          permission_code: string
          workspace_id: string
          workspace_role_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          permission_code?: string
          workspace_id?: string
          workspace_role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_role_permissions_permission_code_fkey"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "permission_definitions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "workspace_role_permissions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_role_permissions_workspace_id_workspace_role_id_fkey"
            columns: ["workspace_id", "workspace_role_id"]
            isOneToOne: false
            referencedRelation: "workspace_roles"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      workspace_roles: {
        Row: {
          base_role: Database["public"]["Enums"]["workspace_role"]
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          hierarchy_rank: number
          id: string
          is_owner_role: boolean
          is_system: boolean
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          base_role?: Database["public"]["Enums"]["workspace_role"]
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          hierarchy_rank: number
          id?: string
          is_owner_role?: boolean
          is_system?: boolean
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          base_role?: Database["public"]["Enums"]["workspace_role"]
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          hierarchy_rank?: number
          id?: string
          is_owner_role?: boolean
          is_system?: boolean
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_roles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          address_line: string | null
          banner_path: string | null
          brand_accent_color: string
          brand_primary_color: string
          business_email: string | null
          business_phone: string | null
          city: string | null
          country_code: string
          created_at: string
          created_by: string
          currency_code: string
          description: string | null
          id: string
          latitude: number | null
          logo_path: string | null
          longitude: number | null
          name: string
          postal_code: string | null
          province: string | null
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          address_line?: string | null
          banner_path?: string | null
          brand_accent_color?: string
          brand_primary_color?: string
          business_email?: string | null
          business_phone?: string | null
          city?: string | null
          country_code?: string
          created_at?: string
          created_by: string
          currency_code?: string
          description?: string | null
          id?: string
          latitude?: number | null
          logo_path?: string | null
          longitude?: number | null
          name: string
          postal_code?: string | null
          province?: string | null
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          address_line?: string | null
          banner_path?: string | null
          brand_accent_color?: string
          brand_primary_color?: string
          business_email?: string | null
          business_phone?: string | null
          city?: string | null
          country_code?: string
          created_at?: string
          created_by?: string
          currency_code?: string
          description?: string | null
          id?: string
          latitude?: number | null
          logo_path?: string | null
          longitude?: number | null
          name?: string
          postal_code?: string | null
          province?: string | null
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_country_fk"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "workspaces_currency_fk"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      business_portfolio_evidence: {
        Row: {
          business_plan_id: string | null
          business_portfolio_id: string | null
          business_review_id: string | null
          display_order: number | null
          finalized_at: string | null
          period_end: string | null
          period_start: string | null
          review_summary: string | null
          status:
            | Database["public"]["Enums"]["business_portfolio_status"]
            | null
          title: string | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_portfolios_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_review_summaries: {
        Row: {
          action_item_count: number | null
          business_plan_id: string | null
          business_review_id: string | null
          completed_action_item_count: number | null
          finalized_at: string | null
          measured_target_count: number | null
          overdue_action_item_count: number | null
          period_end: string | null
          period_start: string | null
          period_type:
            | Database["public"]["Enums"]["business_review_period"]
            | null
          snapshot_refreshed_at: string | null
          status: Database["public"]["Enums"]["business_review_status"] | null
          target_count: number | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_workspace_id_business_plan_id_fkey"
            columns: ["workspace_id", "business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "business_reviews_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_account_balances: {
        Row: {
          account_kind:
            | Database["public"]["Enums"]["financial_account_kind"]
            | null
          code: string | null
          currency_code: string | null
          current_balance: number | null
          financial_account_id: string | null
          latest_transaction_date: string | null
          name: string | null
          opening_balance: number | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_accounts_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "financial_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_target_latest_measurements: {
        Row: {
          goal_target_id: string | null
          measured_at: string | null
          measured_value: number | null
          metric_measurement_id: string | null
          source: string | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metric_measurements_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_measurements_workspace_id_goal_target_id_fkey"
            columns: ["workspace_id", "goal_target_id"]
            isOneToOne: false
            referencedRelation: "goal_targets"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      goal_target_transaction_actuals: {
        Row: {
          contributed_value: number | null
          goal_target_id: string | null
          latest_transaction_date: string | null
          transaction_count: number | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_goal_target_contri_workspace_id_goal_target_id_fkey"
            columns: ["workspace_id", "goal_target_id"]
            isOneToOne: false
            referencedRelation: "goal_targets"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "transaction_goal_target_contributions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_financial_actuals: {
        Row: {
          allocated_expense: number | null
          allocated_net: number | null
          allocated_revenue: number | null
          business_initiative_id: string | null
          transaction_count: number | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_initiative_alloca_workspace_id_business_initia_fkey"
            columns: ["workspace_id", "business_initiative_id"]
            isOneToOne: false
            referencedRelation: "business_initiatives"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "transaction_initiative_allocations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_category_actuals: {
        Row: {
          allocated_total: number | null
          code: string | null
          latest_transaction_date: string | null
          name: string | null
          transaction_category_id: string | null
          transaction_count: number | null
          transaction_type:
            | Database["public"]["Enums"]["transaction_type"]
            | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_categories_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_financial_results: {
        Row: {
          amount: number | null
          cost_amount: number | null
          currency_code: string | null
          financial_account_id: string | null
          net_result: number | null
          transaction_date: string | null
          transaction_id: string | null
          transaction_type:
            | Database["public"]["Enums"]["transaction_type"]
            | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_accounts_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "transactions_workspace_financial_account_fkey"
            columns: ["workspace_id", "financial_account_id"]
            isOneToOne: false
            referencedRelation: "financial_account_balances"
            referencedColumns: ["workspace_id", "financial_account_id"]
          },
          {
            foreignKeyName: "transactions_workspace_financial_account_fkey"
            columns: ["workspace_id", "financial_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "transactions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_achievement_details: {
        Row: {
          achievement_code: string | null
          awarded_at: string | null
          description: string | null
          display_order: number | null
          evidence_business_review_id: string | null
          icon_key: string | null
          name: string | null
          workspace_achievement_id: string | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_achievements_achievement_code_fkey"
            columns: ["achievement_code"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "workspace_achievements_workspace_id_evidence_business_revi_fkey"
            columns: ["workspace_id", "evidence_business_review_id"]
            isOneToOne: false
            referencedRelation: "business_review_summaries"
            referencedColumns: ["workspace_id", "business_review_id"]
          },
          {
            foreignKeyName: "workspace_achievements_workspace_id_evidence_business_revi_fkey"
            columns: ["workspace_id", "evidence_business_review_id"]
            isOneToOne: false
            referencedRelation: "business_reviews"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "workspace_achievements_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invitation_access: {
        Row: {
          base_role: Database["public"]["Enums"]["workspace_role"] | null
          delivery_status:
            | Database["public"]["Enums"]["invitation_delivery_status"]
            | null
          email: string | null
          expires_at: string | null
          hierarchy_rank: number | null
          invitation_status:
            | Database["public"]["Enums"]["invitation_status"]
            | null
          invited_by: string | null
          role_code: string | null
          role_description: string | null
          role_name: string | null
          workspace_id: string | null
          workspace_invitation_id: string | null
          workspace_role_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_invitations_workspace_role_fkey"
            columns: ["workspace_id", "workspace_role_id"]
            isOneToOne: false
            referencedRelation: "workspace_roles"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      workspace_member_access: {
        Row: {
          base_role: Database["public"]["Enums"]["workspace_role"] | null
          hierarchy_rank: number | null
          is_owner_role: boolean | null
          job_title: string | null
          joined_at: string | null
          membership_status:
            | Database["public"]["Enums"]["membership_status"]
            | null
          role_code: string | null
          role_description: string | null
          role_name: string | null
          user_id: string | null
          workspace_id: string | null
          workspace_role_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_role_fkey"
            columns: ["workspace_id", "workspace_role_id"]
            isOneToOne: false
            referencedRelation: "workspace_roles"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      workspace_deletion_requests: {
        Row: {
          cancelled_at: string | null
          cancelled_by: string | null
          id: string
          requested_at: string
          requested_by: string
          scheduled_for: string
          workspace_id: string
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          id?: string
          requested_at?: string
          requested_by: string
          scheduled_for: string
          workspace_id: string
        }
        Update: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          id?: string
          requested_at?: string
          requested_by?: string
          scheduled_for?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_deletion_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_workspace_invitation: {
        Args: { invitation_token: string }
        Returns: string
      }
      change_workspace_member_role: {
        Args: {
          target_user_id: string
          target_workspace_id: string
          target_workspace_role_id: string
        }
        Returns: undefined
      }
      cancel_workspace_deletion: {
        Args: { target_deletion_request_id: string }
        Returns: undefined
      }
      create_transaction: {
        Args: {
          request_idempotency_key: string
          target_financial_account_id?: string
          target_workspace_id: string
          transaction_amount: number
          transaction_cost_amount?: number
          transaction_date: string
          transaction_note?: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Returns: string
      }
      create_workspace: {
        Args: { workspace_name: string; workspace_slug: string }
        Returns: string
      }
      create_workspace_invitation: {
        Args: {
          invited_email: string
          target_workspace_id: string
          target_workspace_role_id: string
          valid_for_days?: number
        }
        Returns: {
          email_delivery_id: string
          invitation_expires_at: string
          invitation_id: string
          invitation_token: string
        }[]
      }
      create_workspace_role: {
        Args: {
          permission_codes?: string[]
          role_base_role: Database["public"]["Enums"]["workspace_role"]
          role_code: string
          role_description: string
          role_hierarchy_rank: number
          role_name: string
          target_workspace_id: string
        }
        Returns: string
      }
      decline_workspace_invitation: {
        Args: { invitation_token: string }
        Returns: string
      }
      delete_workspace_role: {
        Args: { target_workspace_role_id: string }
        Returns: undefined
      }
      finalize_business_review: {
        Args: { target_business_review_id: string }
        Returns: undefined
      }
      generate_my_workspace_reminders: {
        Args: { reference_time?: string; target_workspace_id: string }
        Returns: number
      }
      get_my_workspace_access: {
        Args: never
        Returns: {
          base_role: Database["public"]["Enums"]["workspace_role"]
          hierarchy_rank: number
          is_owner_role: boolean
          membership_status: Database["public"]["Enums"]["membership_status"]
          permission_codes: string[]
          role_code: string
          role_name: string
          workspace_id: string
          workspace_logo_path: string
          workspace_name: string
          workspace_role_id: string
          workspace_slug: string
        }[]
      }
      get_system_health_snapshot: {
        Args: { stale_processing_after?: string }
        Returns: {
          captured_at: string
          expired_idempotency_records: number
          expired_notifications: number
          expired_pending_invitations: number
          ready_email_deliveries: number
          stale_processing_deliveries: number
        }[]
      }
      get_workspace_invitation_preview: {
        Args: { invitation_token: string }
        Returns: {
          expires_at: string
          inviter_display_name: string
          permission_codes: string[]
          role_description: string
          role_name: string
          workspace_accent_color: string
          workspace_banner_path: string
          workspace_logo_path: string
          workspace_name: string
          workspace_primary_color: string
        }[]
      }
      get_workspace_member_directory: {
        Args: { target_workspace_id: string }
        Returns: {
          avatar_path: string
          base_role: Database["public"]["Enums"]["workspace_role"]
          display_name: string
          hierarchy_rank: number
          is_owner_role: boolean
          job_title: string
          joined_at: string
          membership_status: Database["public"]["Enums"]["membership_status"]
          role_code: string
          role_name: string
          user_id: string
          workspace_role_id: string
        }[]
      }
      mark_all_notifications_read: {
        Args: { target_workspace_id?: string }
        Returns: number
      }
      mark_email_delivery_failed: {
        Args: { target_delivery_id: string; target_error_code: string }
        Returns: undefined
      }
      mark_email_delivery_processing: {
        Args: { target_delivery_id: string }
        Returns: undefined
      }
      mark_email_delivery_sent: {
        Args: {
          target_delivery_id: string
          target_provider_message_id: string
          target_provider_name: string
        }
        Returns: undefined
      }
      mark_notification_read: {
        Args: { target_notification_id: string }
        Returns: undefined
      }
      execute_workspace_deletion: {
        Args: {
          confirmation_workspace_name: string
          target_deletion_request_id: string
        }
        Returns: undefined
      }
      refresh_business_review_snapshots: {
        Args: { target_business_review_id: string }
        Returns: undefined
      }
      remove_workspace_member: {
        Args: { target_user_id: string; target_workspace_id: string }
        Returns: undefined
      }
      request_workspace_deletion: {
        Args: {
          confirmation_workspace_name: string
          target_workspace_id: string
        }
        Returns: string
      }
      resend_workspace_invitation: {
        Args: { target_invitation_id: string; valid_for_days?: number }
        Returns: {
          email_delivery_id: string
          invitation_expires_at: string
          invitation_id: string
          invitation_token: string
        }[]
      }
      revoke_workspace_invitation: {
        Args: { invitation_id: string }
        Returns: undefined
      }
      run_system_maintenance: {
        Args: never
        Returns: {
          deleted_idempotency_records: number
          deleted_notifications: number
          expired_invitations: number
        }[]
      }
      set_planning_record_archived: {
        Args: {
          should_archive: boolean
          target_record_id: string
          target_record_type: Database["public"]["Enums"]["planning_record_type"]
        }
        Returns: undefined
      }
      set_workspace_member_status: {
        Args: {
          target_status: Database["public"]["Enums"]["membership_status"]
          target_user_id: string
          target_workspace_id: string
        }
        Returns: undefined
      }
      transfer_workspace_ownership: {
        Args: {
          next_owner_user_id: string
          previous_owner_workspace_role_id?: string
          request_idempotency_key?: string
          target_workspace_id: string
        }
        Returns: undefined
      }
      transition_action_item: {
        Args: {
          target_action_item_id: string
          target_status: Database["public"]["Enums"]["action_item_status"]
          transition_reason?: string
        }
        Returns: undefined
      }
      transition_business_goal: {
        Args: {
          replacement_target_date?: string
          target_business_goal_id: string
          target_status: Database["public"]["Enums"]["business_goal_status"]
          transition_reason?: string
        }
        Returns: undefined
      }
      transition_business_initiative: {
        Args: {
          target_business_initiative_id: string
          target_status: Database["public"]["Enums"]["business_initiative_status"]
          transition_reason?: string
        }
        Returns: undefined
      }
      transition_business_plan: {
        Args: {
          target_business_plan_id: string
          target_status: Database["public"]["Enums"]["business_plan_status"]
          transition_reason?: string
        }
        Returns: undefined
      }
      update_workspace_role: {
        Args: {
          permission_codes: string[]
          role_description: string
          role_hierarchy_rank: number
          role_name: string
          target_workspace_role_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      action_item_status:
        | "todo"
        | "in_progress"
        | "blocked"
        | "completed"
        | "cancelled"
      business_goal_status:
        | "draft"
        | "active"
        | "achieved"
        | "cancelled"
        | "missed"
      business_initiative_status:
        | "planned"
        | "active"
        | "paused"
        | "completed"
        | "cancelled"
      business_partner_role:
        | "supplier"
        | "customer"
        | "distributor"
        | "reseller"
        | "manufacturer"
        | "logistics_provider"
        | "customs_broker"
        | "agent"
      business_partner_status: "active" | "inactive" | "archived"
      business_plan_status:
        | "draft"
        | "active"
        | "completed"
        | "archived"
        | "cancelled"
      business_plan_visibility: "workspace" | "restricted"
      business_portfolio_status: "draft" | "active" | "archived"
      business_review_period:
        | "weekly"
        | "monthly"
        | "quarterly"
        | "annual"
        | "custom"
      business_review_status: "draft" | "finalized"
      calendar_event_type: "supplier" | "payroll" | "stock" | "other"
      contact_status: "new" | "in_progress" | "resolved" | "closed"
      email_delivery_status:
        | "queued"
        | "processing"
        | "sent"
        | "failed"
        | "cancelled"
      email_template_code: "workspace_invitation"
      financial_account_kind:
        | "cash"
        | "bank"
        | "e_wallet"
        | "receivable"
        | "payable"
        | "other"
      goal_direction: "increase" | "decrease" | "maintain"
      invitation_delivery_status: "not_sent" | "queued" | "sent" | "failed"
      invitation_status:
        | "pending"
        | "accepted"
        | "revoked"
        | "expired"
        | "declined"
      membership_status: "active" | "suspended"
      metric_aggregation:
        | "sum"
        | "average"
        | "latest"
        | "minimum"
        | "maximum"
        | "count"
      metric_unit_type: "number" | "currency" | "percentage"
      notification_type: "stock" | "target" | "schedule" | "system"
      planning_record_type:
        | "business_goal"
        | "business_initiative"
        | "action_item"
      profile_theme: "system" | "light" | "dark"
      transaction_type: "sale" | "expense"
      workspace_role: "owner" | "manager" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_item_status: [
        "todo",
        "in_progress",
        "blocked",
        "completed",
        "cancelled",
      ],
      business_goal_status: [
        "draft",
        "active",
        "achieved",
        "cancelled",
        "missed",
      ],
      business_initiative_status: [
        "planned",
        "active",
        "paused",
        "completed",
        "cancelled",
      ],
      business_partner_role: [
        "supplier",
        "customer",
        "distributor",
        "reseller",
        "manufacturer",
        "logistics_provider",
        "customs_broker",
        "agent",
      ],
      business_partner_status: ["active", "inactive", "archived"],
      business_plan_status: [
        "draft",
        "active",
        "completed",
        "archived",
        "cancelled",
      ],
      business_plan_visibility: ["workspace", "restricted"],
      business_portfolio_status: ["draft", "active", "archived"],
      business_review_period: [
        "weekly",
        "monthly",
        "quarterly",
        "annual",
        "custom",
      ],
      business_review_status: ["draft", "finalized"],
      calendar_event_type: ["supplier", "payroll", "stock", "other"],
      contact_status: ["new", "in_progress", "resolved", "closed"],
      email_delivery_status: [
        "queued",
        "processing",
        "sent",
        "failed",
        "cancelled",
      ],
      email_template_code: ["workspace_invitation"],
      financial_account_kind: [
        "cash",
        "bank",
        "e_wallet",
        "receivable",
        "payable",
        "other",
      ],
      goal_direction: ["increase", "decrease", "maintain"],
      invitation_delivery_status: ["not_sent", "queued", "sent", "failed"],
      invitation_status: [
        "pending",
        "accepted",
        "revoked",
        "expired",
        "declined",
      ],
      membership_status: ["active", "suspended"],
      metric_aggregation: [
        "sum",
        "average",
        "latest",
        "minimum",
        "maximum",
        "count",
      ],
      metric_unit_type: ["number", "currency", "percentage"],
      notification_type: ["stock", "target", "schedule", "system"],
      planning_record_type: [
        "business_goal",
        "business_initiative",
        "action_item",
      ],
      profile_theme: ["system", "light", "dark"],
      transaction_type: ["sale", "expense"],
      workspace_role: ["owner", "manager", "member", "viewer"],
    },
  },
} as const
