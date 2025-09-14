// ===================================
// PERSONAL FINANCE MODULE - TYPESCRIPT INTERFACES
// ===================================

export interface FinancialCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  parent_category_id?: string;
  is_system: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFinancialCategoryData {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  parent_category_id?: string;
}

export interface Income {
  id: string;
  user_id: string;
  category_id?: string;
  name: string;
  description?: string;
  amount: number;
  frequency: 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  payment_day?: number;
  is_active: boolean;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  category?: FinancialCategory;
  monthly_amount?: number; // Calculated based on frequency
}

export interface CreateIncomeData {
  name: string;
  description?: string;
  amount: number;
  frequency: 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  payment_day?: number;
  category_id?: string;
  tags?: string[];
  notes?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id?: string;
  name: string;
  description?: string;
  amount: number;
  expense_type: 'fixed' | 'variable' | 'occasional';
  frequency: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  transaction_date: string;
  due_date?: string;
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'crypto';
  card_id?: string;
  is_recurring: boolean;
  recurring_day?: number;
  tags?: string[];
  notes?: string;
  receipt_url?: string;
  is_business_expense: boolean;
  is_tax_deductible: boolean;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  category?: FinancialCategory;
  monthly_amount?: number; // For recurring expenses
}

export interface CreateExpenseData {
  name: string;
  description?: string;
  amount: number;
  expense_type: 'fixed' | 'variable' | 'occasional';
  frequency?: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  transaction_date: string;
  due_date?: string;
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'crypto';
  card_id?: string;
  category_id?: string;
  is_recurring?: boolean;
  recurring_day?: number;
  tags?: string[];
  notes?: string;
  is_business_expense?: boolean;
  is_tax_deductible?: boolean;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  created_date: string;
  goal_type: 'emergency_fund' | 'vacation' | 'purchase' | 'investment' | 'debt_payment' | 'general';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  icon: string;
  color: string;
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  progress_percentage?: number;
  remaining_amount?: number;
  days_remaining?: number;
  suggested_monthly_saving?: number;
}

export interface CreateFinancialGoalData {
  name: string;
  description?: string;
  target_amount: number;
  target_date?: string;
  goal_type: 'emergency_fund' | 'vacation' | 'purchase' | 'investment' | 'debt_payment' | 'general';
  priority?: 'low' | 'medium' | 'high';
  icon?: string;
  color?: string;
  notes?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  budgeted_amount: number;
  spent_amount: number;
  period_type: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  status: 'active' | 'completed' | 'exceeded';
  alert_threshold: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  category?: FinancialCategory;
  remaining_amount?: number;
  progress_percentage?: number;
  is_over_budget?: boolean;
  days_remaining?: number;
}

export interface CreateBudgetData {
  category_id: string;
  name: string;
  budgeted_amount: number;
  period_type: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  alert_threshold?: number;
  notes?: string;
}

export interface FinancialInsight {
  id: string;
  user_id: string;
  insight_type: 'saving_opportunity' | 'spending_alert' | 'goal_progress' | 'budget_warning' | 'income_growth' | 'expense_trend';
  title: string;
  description: string;
  amount_impact?: number;
  percentage_impact?: number;
  confidence_score?: number;
  category_id?: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'new' | 'viewed' | 'acted' | 'dismissed';
  is_read: boolean;
  insight_data?: Record<string, unknown>; // JSON data
  valid_until?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  category?: FinancialCategory;
  is_expired?: boolean;
}

// ===================================
// ANALYSIS & SUMMARY INTERFACES
// ===================================

export interface FinancialSummary {
  period: string; // YYYY-MM format
  total_income: number;
  total_expenses: number;
  net_income: number;
  savings_rate: number; // Percentage
  expense_categories: ExpenseCategoryBreakdown[];
  income_sources: IncomeSourceBreakdown[];
  top_expenses: Expense[];
  budget_performance: BudgetPerformance[];
  goals_progress: GoalProgress[];
}

export interface ExpenseCategoryBreakdown {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total_amount: number;
  percentage: number;
  transaction_count: number;
  average_transaction: number;
}

export interface IncomeSourceBreakdown {
  category_id: string;
  category_name: string;
  category_icon: string;
  total_amount: number;
  percentage: number;
  is_recurring: boolean;
}

export interface BudgetPerformance {
  budget_id: string;
  category_name: string;
  budgeted_amount: number;
  spent_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  status: 'under_budget' | 'on_track' | 'over_budget';
}

export interface GoalProgress {
  goal_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  remaining_amount: number;
  target_date?: string;
  projected_completion?: string; // Based on current savings rate
  on_track: boolean;
}

export interface SavingsProjection {
  monthly_savings: number;
  annual_savings: number;
  projected_savings_12_months: number;
  savings_opportunities: SavingsOpportunity[];
  investment_recommendations: InvestmentRecommendation[];
}

export interface SavingsOpportunity {
  category: string;
  current_amount: number;
  potential_savings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  suggestion: string;
  action_items: string[];
}

export interface InvestmentRecommendation {
  instrument_type: 'fixed_deposit' | 'government_bonds' | 'mutual_funds' | 'stocks' | 'crypto';
  risk_level: 'low' | 'medium' | 'high';
  expected_return: number; // Annual percentage
  minimum_investment: number;
  liquidity: 'high' | 'medium' | 'low';
  recommendation_reason: string;
  pros: string[];
  cons: string[];
}

// ===================================
// UTILITY TYPES
// ===================================

export interface FinancialMetrics {
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  savings_rate: number;
  debt_to_income_ratio: number;
  emergency_fund_months: number;
}

export interface ExpenseDistribution {
  category_name: string;
  total_amount: number;
  percentage: number;
}

export interface IncomeFrequencyMap {
  once: number;
  weekly: number;
  biweekly: number;
  monthly: number;
  quarterly: number;
  yearly: number;
}

export interface PeriodFilter {
  start_date: string;
  end_date: string;
  period_type: 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

// ===================================
// FORM VALIDATION SCHEMAS (for use with react-hook-form + zod)
// ===================================

export interface IncomeFormData {
  name: string;
  amount: string; // String for form validation
  frequency: 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  payment_day?: string;
  category_id?: string;
  description?: string;
  notes?: string;
  tags?: string;
}

export interface ExpenseFormData {
  name: string;
  amount: string; // String for form validation
  expense_type: 'fixed' | 'variable' | 'occasional';
  transaction_date: string;
  category_id?: string;
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'crypto';
  card_id?: string;
  is_recurring?: boolean;
  frequency?: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  recurring_day?: string;
  description?: string;
  notes?: string;
  tags?: string;
  is_business_expense?: boolean;
  is_tax_deductible?: boolean;
}

export interface GoalFormData {
  name: string;
  target_amount: string; // String for form validation
  target_date?: string;
  goal_type: 'emergency_fund' | 'vacation' | 'purchase' | 'investment' | 'debt_payment' | 'general';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  notes?: string;
}