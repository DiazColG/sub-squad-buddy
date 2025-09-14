-- ===================================
-- PERSONAL FINANCE MODULE - DATABASE SCHEMA
-- ===================================
-- This migration adds personal finance functionality
-- WITHOUT modifying existing tables (subscriptions, installments, etc.)

-- ===================================
-- 1. FINANCIAL CATEGORIES TABLE
-- ===================================
CREATE TABLE financial_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('income', 'expense')),
    icon text DEFAULT '💰',
    color text DEFAULT '#3b82f6',
    parent_category_id uuid REFERENCES financial_categories(id) ON DELETE SET NULL,
    is_system boolean DEFAULT false, -- System categories cannot be deleted
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Ensure unique names per user per type
    UNIQUE(user_id, name, type)
);

-- ===================================
-- 2. INCOMES TABLE
-- ===================================
CREATE TABLE incomes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES financial_categories(id) ON DELETE SET NULL,
    
    -- Basic info
    name text NOT NULL,
    description text,
    amount decimal(12,2) NOT NULL CHECK (amount > 0),
    
    -- Frequency and dates
    frequency text NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('once', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    start_date date NOT NULL,
    end_date date, -- NULL for indefinite
    
    -- Payment details
    payment_day integer CHECK (payment_day >= 1 AND payment_day <= 31), -- Day of month for monthly/quarterly/yearly
    is_active boolean DEFAULT true,
    
    -- Metadata
    tags text[], -- For flexible categorization
    notes text,
    
    -- Tracking
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ===================================
-- 3. EXPENSES TABLE
-- ===================================
CREATE TABLE expenses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES financial_categories(id) ON DELETE SET NULL,
    
    -- Basic info
    name text NOT NULL,
    description text,
    amount decimal(12,2) NOT NULL CHECK (amount > 0),
    
    -- Expense type and frequency
    expense_type text NOT NULL DEFAULT 'variable' CHECK (expense_type IN ('fixed', 'variable', 'occasional')),
    frequency text DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    
    -- Dates
    transaction_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date, -- For recurring expenses
    
    -- Payment details
    payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'crypto')),
    card_id uuid REFERENCES cards(id) ON DELETE SET NULL, -- Link to existing cards table
    
    -- Recurring expenses
    is_recurring boolean DEFAULT false,
    recurring_day integer CHECK (recurring_day >= 1 AND recurring_day <= 31),
    
    -- Metadata
    tags text[],
    notes text,
    receipt_url text, -- For storing receipt images
    
    -- Business/Tax related
    is_business_expense boolean DEFAULT false,
    is_tax_deductible boolean DEFAULT false,
    
    -- Tracking
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ===================================
-- 4. FINANCIAL GOALS TABLE
-- ===================================
CREATE TABLE financial_goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Goal info
    name text NOT NULL,
    description text,
    target_amount decimal(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount decimal(12,2) DEFAULT 0 CHECK (current_amount >= 0),
    
    -- Timeline
    target_date date,
    created_date date DEFAULT CURRENT_DATE,
    
    -- Goal type and priority
    goal_type text DEFAULT 'general' CHECK (goal_type IN ('emergency_fund', 'vacation', 'purchase', 'investment', 'debt_payment', 'general')),
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    
    -- Status
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    
    -- Visual
    icon text DEFAULT '🎯',
    color text DEFAULT '#10b981',
    
    -- Metadata
    notes text,
    
    -- Tracking
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ===================================
-- 5. BUDGETS TABLE
-- ===================================
CREATE TABLE budgets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES financial_categories(id) ON DELETE CASCADE,
    
    -- Budget info
    name text NOT NULL,
    budgeted_amount decimal(12,2) NOT NULL CHECK (budgeted_amount > 0),
    spent_amount decimal(12,2) DEFAULT 0 CHECK (spent_amount >= 0),
    
    -- Period
    period_type text NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    period_start date NOT NULL,
    period_end date NOT NULL,
    
    -- Status and alerts
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'exceeded')),
    alert_threshold decimal(5,2) DEFAULT 80.0 CHECK (alert_threshold > 0 AND alert_threshold <= 100), -- Percentage
    
    -- Metadata
    notes text,
    
    -- Tracking
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Ensure no duplicate budgets for same category in same period
    UNIQUE(user_id, category_id, period_start, period_end)
);

-- ===================================
-- 6. FINANCIAL INSIGHTS TABLE
-- ===================================
CREATE TABLE financial_insights (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Insight info
    insight_type text NOT NULL CHECK (insight_type IN ('saving_opportunity', 'spending_alert', 'goal_progress', 'budget_warning', 'income_growth', 'expense_trend')),
    title text NOT NULL,
    description text NOT NULL,
    
    -- Data and calculations
    amount_impact decimal(12,2), -- Potential savings or cost
    percentage_impact decimal(5,2), -- Percentage impact
    confidence_score decimal(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1), -- AI confidence 0-1
    
    -- Categorization
    category_id uuid REFERENCES financial_categories(id) ON DELETE SET NULL,
    severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    
    -- Status
    status text DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'acted', 'dismissed')),
    is_read boolean DEFAULT false,
    
    -- Metadata
    insight_data jsonb, -- Flexible data storage for complex insights
    valid_until date, -- When insight becomes irrelevant
    
    -- Tracking
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ===================================
-- INDEXES FOR PERFORMANCE
-- ===================================

-- Financial Categories
CREATE INDEX idx_financial_categories_user_id ON financial_categories(user_id);
CREATE INDEX idx_financial_categories_type ON financial_categories(type);
CREATE INDEX idx_financial_categories_parent ON financial_categories(parent_category_id);

-- Incomes
CREATE INDEX idx_incomes_user_id ON incomes(user_id);
CREATE INDEX idx_incomes_category_id ON incomes(category_id);
CREATE INDEX idx_incomes_frequency ON incomes(frequency);
CREATE INDEX idx_incomes_start_date ON incomes(start_date);
CREATE INDEX idx_incomes_is_active ON incomes(is_active);

-- Expenses
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_transaction_date ON expenses(transaction_date);
CREATE INDEX idx_expenses_expense_type ON expenses(expense_type);
CREATE INDEX idx_expenses_is_recurring ON expenses(is_recurring);
CREATE INDEX idx_expenses_card_id ON expenses(card_id);

-- Financial Goals
CREATE INDEX idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_financial_goals_status ON financial_goals(status);
CREATE INDEX idx_financial_goals_target_date ON financial_goals(target_date);
CREATE INDEX idx_financial_goals_goal_type ON financial_goals(goal_type);

-- Budgets
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_period ON budgets(period_start, period_end);
CREATE INDEX idx_budgets_status ON budgets(status);

-- Financial Insights
CREATE INDEX idx_financial_insights_user_id ON financial_insights(user_id);
CREATE INDEX idx_financial_insights_type ON financial_insights(insight_type);
CREATE INDEX idx_financial_insights_status ON financial_insights(status);
CREATE INDEX idx_financial_insights_category_id ON financial_insights(category_id);

-- ===================================
-- TRIGGERS FOR UPDATED_AT
-- ===================================

CREATE TRIGGER update_financial_categories_updated_at
    BEFORE UPDATE ON financial_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incomes_updated_at
    BEFORE UPDATE ON incomes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at
    BEFORE UPDATE ON financial_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_insights_updated_at
    BEFORE UPDATE ON financial_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================

-- Enable RLS on all tables
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_insights ENABLE ROW LEVEL SECURITY;

-- Financial Categories Policies
CREATE POLICY "Users can manage their own categories" ON financial_categories
    FOR ALL USING (user_id = auth.uid() OR user_id IS NULL); -- Allow system categories

-- Incomes Policies
CREATE POLICY "Users can view their own incomes" ON incomes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own incomes" ON incomes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own incomes" ON incomes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own incomes" ON incomes
    FOR DELETE USING (auth.uid() = user_id);

-- Expenses Policies
CREATE POLICY "Users can view their own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" ON expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Financial Goals Policies
CREATE POLICY "Users can view their own financial goals" ON financial_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial goals" ON financial_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial goals" ON financial_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial goals" ON financial_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Budgets Policies
CREATE POLICY "Users can view their own budgets" ON budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" ON budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" ON budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" ON budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Financial Insights Policies
CREATE POLICY "Users can view their own insights" ON financial_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights" ON financial_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights" ON financial_insights
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights" ON financial_insights
    FOR DELETE USING (auth.uid() = user_id);

-- ===================================
-- SEED DATA - DEFAULT CATEGORIES
-- ===================================

-- Insert system-wide default categories (user_id = NULL makes them available to all)
INSERT INTO financial_categories (name, type, icon, color, is_system, user_id) VALUES

-- Income Categories
('Salario', 'income', '💼', '#10b981', true, NULL),
('Freelance', 'income', '💻', '#3b82f6', true, NULL),
('Inversiones', 'income', '📈', '#8b5cf6', true, NULL),
('Ventas', 'income', '🛒', '#f59e0b', true, NULL),
('Alquiler', 'income', '🏠', '#06b6d4', true, NULL),
('Bonificaciones', 'income', '🎁', '#ec4899', true, NULL),
('Otros Ingresos', 'income', '💰', '#6b7280', true, NULL),

-- Expense Categories
('Vivienda', 'expense', '🏠', '#ef4444', true, NULL),
('Transporte', 'expense', '🚗', '#f97316', true, NULL),
('Alimentación', 'expense', '🍽️', '#84cc16', true, NULL),
('Servicios', 'expense', '⚡', '#06b6d4', true, NULL),
('Entretenimiento', 'expense', '🎬', '#8b5cf6', true, NULL),
('Salud', 'expense', '⚕️', '#ec4899', true, NULL),
('Educación', 'expense', '📚', '#3b82f6', true, NULL),
('Ropa', 'expense', '👕', '#f59e0b', true, NULL),
('Ahorro e Inversión', 'expense', '💰', '#10b981', true, NULL),
('Impuestos', 'expense', '📋', '#6b7280', true, NULL),
('Seguros', 'expense', '🛡️', '#64748b', true, NULL),
('Otros Gastos', 'expense', '💸', '#94a3b8', true, NULL);

-- ===================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ===================================

-- Function to calculate monthly savings potential
CREATE OR REPLACE FUNCTION calculate_monthly_savings_potential(target_user_id uuid)
RETURNS decimal(12,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_monthly_income decimal(12,2) := 0;
    total_monthly_expenses decimal(12,2) := 0;
    savings_potential decimal(12,2);
BEGIN
    -- Calculate total monthly income
    SELECT COALESCE(SUM(
        CASE 
            WHEN frequency = 'monthly' THEN amount
            WHEN frequency = 'yearly' THEN amount / 12
            WHEN frequency = 'quarterly' THEN amount / 3
            WHEN frequency = 'weekly' THEN amount * 4.33
            WHEN frequency = 'biweekly' THEN amount * 2.17
            ELSE amount
        END
    ), 0) INTO total_monthly_income
    FROM incomes 
    WHERE user_id = target_user_id AND is_active = true;
    
    -- Calculate total monthly expenses (including recurring)
    SELECT COALESCE(SUM(
        CASE 
            WHEN frequency = 'monthly' THEN amount
            WHEN frequency = 'yearly' THEN amount / 12
            WHEN frequency = 'quarterly' THEN amount / 3
            WHEN frequency = 'weekly' THEN amount * 4.33
            WHEN frequency = 'biweekly' THEN amount * 2.17
            WHEN frequency = 'daily' THEN amount * 30
            ELSE amount
        END
    ), 0) INTO total_monthly_expenses
    FROM expenses 
    WHERE user_id = target_user_id 
    AND (is_recurring = true OR transaction_date >= CURRENT_DATE - INTERVAL '30 days');
    
    savings_potential := total_monthly_income - total_monthly_expenses;
    
    RETURN savings_potential;
END;
$$;

-- Function to get expense distribution by category
CREATE OR REPLACE FUNCTION get_expense_distribution(target_user_id uuid, months_back integer DEFAULT 3)
RETURNS TABLE(category_name text, total_amount decimal(12,2), percentage decimal(5,2))
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_expenses decimal(12,2);
BEGIN
    -- Get total expenses for the period
    SELECT COALESCE(SUM(amount), 0) INTO total_expenses
    FROM expenses 
    WHERE user_id = target_user_id 
    AND transaction_date >= CURRENT_DATE - (months_back || ' months')::INTERVAL;
    
    -- Return distribution by category
    RETURN QUERY
    SELECT 
        COALESCE(fc.name, 'Sin Categoría') as category_name,
        COALESCE(SUM(e.amount), 0) as total_amount,
        CASE 
            WHEN total_expenses > 0 THEN (COALESCE(SUM(e.amount), 0) / total_expenses * 100)
            ELSE 0
        END as percentage
    FROM expenses e
    LEFT JOIN financial_categories fc ON e.category_id = fc.id
    WHERE e.user_id = target_user_id 
    AND e.transaction_date >= CURRENT_DATE - (months_back || ' months')::INTERVAL
    GROUP BY fc.name
    ORDER BY total_amount DESC;
END;
$$;