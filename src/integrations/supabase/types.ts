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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      budgets: {
        Row: {
          categories: Json | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          period_type: string
          start_date: string
          total_budget: number
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categories?: Json | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          period_type?: string
          start_date: string
          total_budget: number
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categories?: Json | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          period_type?: string
          start_date?: string
          total_budget?: number
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          alert_days_before: number | null
          bank_name: string
          card_brand: string | null
          card_last_digits: string
          card_type: string
          cardholder_name: string | null
          created_at: string
          enable_expiry_alert: boolean | null
          expiry_date: string
          id: string
          is_active: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_days_before?: number | null
          bank_name: string
          card_brand?: string | null
          card_last_digits: string
          card_type: string
          cardholder_name?: string | null
          created_at?: string
          enable_expiry_alert?: boolean | null
          expiry_date: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_days_before?: number | null
          bank_name?: string
          card_brand?: string | null
          card_last_digits?: string
          card_type?: string
          cardholder_name?: string | null
          created_at?: string
          enable_expiry_alert?: boolean | null
          expiry_date?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      economic_indicators: {
        Row: {
          accumulated_inflation: number | null
          created_at: string | null
          data_source: string | null
          id: string
          inflation_rate: number | null
          period_month: string
          purchasing_power_index: number | null
          updated_at: string | null
          usd_blue_rate: number | null
          usd_official_rate: number | null
        }
        Insert: {
          accumulated_inflation?: number | null
          created_at?: string | null
          data_source?: string | null
          id?: string
          inflation_rate?: number | null
          period_month: string
          purchasing_power_index?: number | null
          updated_at?: string | null
          usd_blue_rate?: number | null
          usd_official_rate?: number | null
        }
        Update: {
          accumulated_inflation?: number | null
          created_at?: string | null
          data_source?: string | null
          id?: string
          inflation_rate?: number | null
          period_month?: string
          purchasing_power_index?: number | null
          updated_at?: string | null
          usd_blue_rate?: number | null
          usd_official_rate?: number | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          card_id: string | null
          category_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          due_date: string | null
          expense_type: string | null
          flexibility_level: string | null
          frequency: string | null
          id: string
          is_business_expense: boolean | null
          is_recurring: boolean | null
          is_tax_deductible: boolean | null
          location: string | null
          monthly_amount: number | null
          name: string
          necessity_score: number | null
          notes: string | null
          optimization_potential: number | null
          optimization_tags: string[] | null
          payment_method: string | null
          receipt_url: string | null
          recurring_day: number | null
          tags: string[] | null
          transaction_date: string
          updated_at: string | null
          user_id: string
          vendor_name: string | null
        }
        Insert: {
          amount: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          expense_type?: string | null
          flexibility_level?: string | null
          frequency?: string | null
          id?: string
          is_business_expense?: boolean | null
          is_recurring?: boolean | null
          is_tax_deductible?: boolean | null
          location?: string | null
          monthly_amount?: number | null
          name: string
          necessity_score?: number | null
          notes?: string | null
          optimization_potential?: number | null
          optimization_tags?: string[] | null
          payment_method?: string | null
          receipt_url?: string | null
          recurring_day?: number | null
          tags?: string[] | null
          transaction_date?: string
          updated_at?: string | null
          user_id: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          expense_type?: string | null
          flexibility_level?: string | null
          frequency?: string | null
          id?: string
          is_business_expense?: boolean | null
          is_recurring?: boolean | null
          is_tax_deductible?: boolean | null
          location?: string | null
          monthly_amount?: number | null
          name?: string
          necessity_score?: number | null
          notes?: string | null
          optimization_potential?: number | null
          optimization_tags?: string[] | null
          payment_method?: string | null
          receipt_url?: string | null
          recurring_day?: number | null
          tags?: string[] | null
          transaction_date?: string
          updated_at?: string | null
          user_id?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses_backup: {
        Row: {
          amount: number | null
          category_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          expense_type: string | null
          flexibility_level: string | null
          frequency: string | null
          id: string | null
          location: string | null
          monthly_amount: number | null
          name: string | null
          necessity_score: number | null
          notes: string | null
          optimization_potential: number | null
          optimization_tags: string[] | null
          payment_method: string | null
          receipt_url: string | null
          tags: string[] | null
          transaction_date: string | null
          updated_at: string | null
          user_id: string | null
          vendor_name: string | null
        }
        Insert: {
          amount?: number | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expense_type?: string | null
          flexibility_level?: string | null
          frequency?: string | null
          id?: string | null
          location?: string | null
          monthly_amount?: number | null
          name?: string | null
          necessity_score?: number | null
          notes?: string | null
          optimization_potential?: number | null
          optimization_tags?: string[] | null
          payment_method?: string | null
          receipt_url?: string | null
          tags?: string[] | null
          transaction_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_name?: string | null
        }
        Update: {
          amount?: number | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expense_type?: string | null
          flexibility_level?: string | null
          frequency?: string | null
          id?: string | null
          location?: string | null
          monthly_amount?: number | null
          name?: string | null
          necessity_score?: number | null
          notes?: string | null
          optimization_potential?: number | null
          optimization_tags?: string[] | null
          payment_method?: string | null
          receipt_url?: string | null
          tags?: string[] | null
          transaction_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_name?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          description: string
          id: string
          priority: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          priority?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          priority?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_categories: {
        Row: {
          avg_necessity_score: number | null
          benchmark_percentage: number | null
          color: string | null
          created_at: string | null
          default_flexibility: string | null
          icon: string | null
          id: string
          insight_templates: Json | null
          is_system: boolean | null
          name: string
          optimization_keywords: string[] | null
          parent_category_id: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avg_necessity_score?: number | null
          benchmark_percentage?: number | null
          color?: string | null
          created_at?: string | null
          default_flexibility?: string | null
          icon?: string | null
          id?: string
          insight_templates?: Json | null
          is_system?: boolean | null
          name: string
          optimization_keywords?: string[] | null
          parent_category_id?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avg_necessity_score?: number | null
          benchmark_percentage?: number | null
          color?: string | null
          created_at?: string | null
          default_flexibility?: string | null
          icon?: string | null
          id?: string
          insight_templates?: Json | null
          is_system?: boolean | null
          name?: string
          optimization_keywords?: string[] | null
          parent_category_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_goals: {
        Row: {
          auto_contribution_amount: number | null
          auto_contribution_frequency: string | null
          created_at: string | null
          current_amount: number | null
          description: string | null
          goal_type: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          priority: string | null
          target_amount: number
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_contribution_amount?: number | null
          auto_contribution_frequency?: string | null
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          goal_type?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          priority?: string | null
          target_amount: number
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_contribution_amount?: number | null
          auto_contribution_frequency?: string | null
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          goal_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          priority?: string | null
          target_amount?: number
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_insights: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          insight_type: string
          is_read: boolean | null
          message: string
          priority: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          insight_type: string
          is_read?: boolean | null
          message: string
          priority?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_read?: boolean | null
          message?: string
          priority?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      housing_services: {
        Row: {
          alert_days_before: number | null
          bank_name: string | null
          billing_cycle: string | null
          card_id: string | null
          card_last_digits: string | null
          card_type: string | null
          category: string | null
          cost: number | null
          created_at: string
          currency: string | null
          enable_due_alert: boolean | null
          id: string
          next_due_date: string | null
          payment_method: string | null
          service_name: string
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_days_before?: number | null
          bank_name?: string | null
          billing_cycle?: string | null
          card_id?: string | null
          card_last_digits?: string | null
          card_type?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          enable_due_alert?: boolean | null
          id?: string
          next_due_date?: string | null
          payment_method?: string | null
          service_name: string
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_days_before?: number | null
          bank_name?: string | null
          billing_cycle?: string | null
          card_id?: string | null
          card_last_digits?: string | null
          card_type?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          enable_due_alert?: boolean | null
          id?: string
          next_due_date?: string | null
          payment_method?: string | null
          service_name?: string
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      incomes: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payment_day: number | null
          start_date: string
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payment_day?: number | null
          start_date: string
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payment_day?: number | null
          start_date?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incomes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ,
      fire_scenarios: {
        Row: {
          id: string
          user_id: string
          name: string
          monthly_expenses: number
          withdrawal_rate: number
          current_portfolio: number
          monthly_savings: number
          real_annual_return: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          monthly_expenses: number
          withdrawal_rate: number
          current_portfolio: number
          monthly_savings: number
          real_annual_return: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          monthly_expenses?: number
          withdrawal_rate?: number
          current_portfolio?: number
          monthly_savings?: number
          real_annual_return?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      installments: {
        Row: {
          card_id: string | null
          category: string | null
          created_at: string | null
          due_day: number
          id: string
          installment_amount: number
          next_due_date: string
          paid_installments: number
          purchase_date: string
          purchase_name: string
          status: string | null
          total_amount: number
          total_installments: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_id?: string | null
          category?: string | null
          created_at?: string | null
          due_day: number
          id?: string
          installment_amount: number
          next_due_date: string
          paid_installments?: number
          purchase_date: string
          purchase_name: string
          status?: string | null
          total_amount: number
          total_installments: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_id?: string | null
          category?: string | null
          created_at?: string | null
          due_day?: number
          id?: string
          installment_amount?: number
          next_due_date?: string
          paid_installments?: number
          purchase_date?: string
          purchase_name?: string
          status?: string | null
          total_amount?: number
          total_installments?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "installments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      installments_analysis: {
        Row: {
          analysis_date: string
          created_at: string | null
          id: string
          inflation_rate: number | null
          installment_id: string
          nominal_amount: number
          period_month: string
          purchasing_power_index: number | null
          real_amount: number | null
          updated_at: string | null
          usd_amount: number | null
          usd_exchange_rate: number | null
        }
        Insert: {
          analysis_date?: string
          created_at?: string | null
          id?: string
          inflation_rate?: number | null
          installment_id: string
          nominal_amount: number
          period_month: string
          purchasing_power_index?: number | null
          real_amount?: number | null
          updated_at?: string | null
          usd_amount?: number | null
          usd_exchange_rate?: number | null
        }
        Update: {
          analysis_date?: string
          created_at?: string | null
          id?: string
          inflation_rate?: number | null
          installment_id?: string
          nominal_amount?: number
          period_month?: string
          purchasing_power_index?: number | null
          real_amount?: number | null
          updated_at?: string | null
          usd_amount?: number | null
          usd_exchange_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "installments_analysis_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "installments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string | null
          created_at: string
          full_name: string | null
          id: string
          primary_display_currency: string | null
        }
        Insert: {
          account_type?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          primary_display_currency?: string | null
        }
        Update: {
          account_type?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          primary_display_currency?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          alert_days_before: number | null
          bank_name: string | null
          billing_cycle: string | null
          card_id: string | null
          card_last_digits: string | null
          card_type: string | null
          category: string | null
          cost: number | null
          created_at: string
          currency: string | null
          enable_renewal_alert: boolean | null
          id: string
          next_renewal_date: string | null
          payment_method: string | null
          service_name: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          alert_days_before?: number | null
          bank_name?: string | null
          billing_cycle?: string | null
          card_id?: string | null
          card_last_digits?: string | null
          card_type?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          enable_renewal_alert?: boolean | null
          id?: string
          next_renewal_date?: string | null
          payment_method?: string | null
          service_name?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          alert_days_before?: number | null
          bank_name?: string | null
          billing_cycle?: string | null
          card_id?: string | null
          card_last_digits?: string | null
          card_type?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          enable_renewal_alert?: boolean | null
          id?: string
          next_renewal_date?: string | null
          payment_method?: string | null
          service_name?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      system_financial_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          role: string | null
          team_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          role?: string | null
          team_id?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          role?: string | null
          team_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          id: string
          owner_id: string | null
          team_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id?: string | null
          team_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string | null
          team_name?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          beta_features_enabled: boolean | null
          created_at: string | null
          id: string
          notifications_enabled: boolean | null
          personal_finance_enabled: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          beta_features_enabled?: boolean | null
          created_at?: string | null
          id?: string
          notifications_enabled?: boolean | null
          personal_finance_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          beta_features_enabled?: boolean | null
          created_at?: string | null
          id?: string
          notifications_enabled?: boolean | null
          personal_finance_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_optimization_potential: {
        Args:
          | {
              amount: number
              category_flexibility: string
              frequency: string
              necessity_score: number
            }
          | {
              expense_amount: number
              expense_category_id: string
              expense_flexibility: string
              expense_frequency: string
            }
        Returns: number
      }
      create_default_categories_for_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      get_user_team_role: {
        Args: { team_uuid: string }
        Returns: string
      }
      is_team_member: {
        Args: { team_uuid: string }
        Returns: boolean
      }
      is_team_owner: {
        Args: { team_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
