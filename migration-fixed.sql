-- ===================================
-- MIGRACIÓN FINANZAS PERSONALES - CORREGIDA
-- ===================================
-- Ejecutar este script completo en Supabase Dashboard > SQL Editor

-- 1. Crear tabla de categorías financieras
CREATE TABLE IF NOT EXISTS financial_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('income', 'expense')),
    icon text DEFAULT '💰',
    color text DEFAULT '#3b82f6',
    parent_category_id uuid REFERENCES financial_categories(id) ON DELETE SET NULL,
    is_system boolean DEFAULT false,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, name, type)
);

-- 2. Crear tabla de ingresos
CREATE TABLE IF NOT EXISTS incomes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES financial_categories(id) ON DELETE SET NULL,
    name text NOT NULL,
    description text,
    amount decimal(12,2) NOT NULL CHECK (amount > 0),
    frequency text NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('once', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    start_date date NOT NULL,
    end_date date,
    payment_day integer CHECK (payment_day >= 1 AND payment_day <= 31),
    is_active boolean DEFAULT true,
    tags text[],
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Crear tabla de gastos
CREATE TABLE IF NOT EXISTS expenses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES financial_categories(id) ON DELETE SET NULL,
    name text NOT NULL,
    description text,
    amount decimal(12,2) NOT NULL CHECK (amount > 0),
    expense_date date NOT NULL DEFAULT CURRENT_DATE,
    frequency text DEFAULT 'once' CHECK (frequency IN ('once', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    start_date date,
    end_date date,
    payment_day integer CHECK (payment_day >= 1 AND payment_day <= 31),
    is_recurring boolean DEFAULT false,
    is_active boolean DEFAULT true,
    payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer', 'crypto', 'other')),
    tags text[],
    notes text,
    receipt_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Crear tabla de metas financieras
CREATE TABLE IF NOT EXISTS financial_goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    target_amount decimal(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount decimal(12,2) DEFAULT 0 CHECK (current_amount >= 0),
    target_date date,
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    goal_type text DEFAULT 'savings' CHECK (goal_type IN ('savings', 'debt_payment', 'investment', 'emergency_fund', 'other')),
    is_active boolean DEFAULT true,
    auto_contribution_amount decimal(12,2) DEFAULT 0,
    auto_contribution_frequency text DEFAULT 'monthly' CHECK (auto_contribution_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. Crear tabla de presupuestos
CREATE TABLE IF NOT EXISTS budgets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    period_type text NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    start_date date NOT NULL,
    end_date date,
    total_budget decimal(12,2) NOT NULL CHECK (total_budget > 0),
    total_spent decimal(12,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    categories jsonb DEFAULT '[]',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 6. Crear tabla de insights financieros
CREATE TABLE IF NOT EXISTS financial_insights (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    insight_type text NOT NULL CHECK (insight_type IN ('spending_pattern', 'budget_alert', 'goal_progress', 'savings_opportunity', 'recurring_expense')),
    title text NOT NULL,
    message text NOT NULL,
    data jsonb DEFAULT '{}',
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_read boolean DEFAULT false,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- ===================================
-- TABLA DE CATEGORÍAS DEL SISTEMA (SIN USER_ID)
-- ===================================
-- Crear tabla separada para categorías del sistema que no pertenecen a ningún usuario
CREATE TABLE IF NOT EXISTS system_financial_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('income', 'expense')),
    icon text DEFAULT '💰',
    color text DEFAULT '#3b82f6',
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(name, type)
);

-- ===================================
-- RLS POLICIES (Row Level Security)
-- ===================================

-- Enable RLS for all tables
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_insights ENABLE ROW LEVEL SECURITY;

-- No RLS for system categories (accessible to all)
-- ALTER TABLE system_financial_categories ENABLE ROW LEVEL SECURITY;

-- Policies for financial_categories
CREATE POLICY "Users can view their own financial categories" ON financial_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own financial categories" ON financial_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own financial categories" ON financial_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own financial categories" ON financial_categories FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- Policies for incomes
CREATE POLICY "Users can view their own incomes" ON incomes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own incomes" ON incomes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own incomes" ON incomes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own incomes" ON incomes FOR DELETE USING (auth.uid() = user_id);

-- Policies for expenses
CREATE POLICY "Users can view their own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- Policies for financial_goals
CREATE POLICY "Users can view their own financial goals" ON financial_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own financial goals" ON financial_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own financial goals" ON financial_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own financial goals" ON financial_goals FOR DELETE USING (auth.uid() = user_id);

-- Policies for budgets
CREATE POLICY "Users can view their own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);

-- Policies for financial_insights
CREATE POLICY "Users can view their own financial insights" ON financial_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own financial insights" ON financial_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own financial insights" ON financial_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own financial insights" ON financial_insights FOR DELETE USING (auth.uid() = user_id);

-- ===================================
-- INDEXES FOR PERFORMANCE
-- ===================================
CREATE INDEX IF NOT EXISTS idx_financial_categories_user_id ON financial_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_categories_type ON financial_categories(type);
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_category_id ON incomes(category_id);
CREATE INDEX IF NOT EXISTS idx_incomes_start_date ON incomes(start_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_financial_insights_user_id ON financial_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_insights_type ON financial_insights(insight_type);

-- ===================================
-- SAMPLE DATA (CATEGORÍAS DEL SISTEMA)
-- ===================================

-- Insertar categorías de ingresos del sistema en tabla separada
INSERT INTO system_financial_categories (name, type, icon, color) VALUES
('Salario', 'income', '💼', '#10b981'),
('Freelance', 'income', '💻', '#3b82f6'),
('Inversiones', 'income', '📈', '#8b5cf6'),
('Alquiler', 'income', '🏠', '#f59e0b'),
('Otros Ingresos', 'income', '💰', '#6b7280');

-- Insertar categorías de gastos del sistema en tabla separada
INSERT INTO system_financial_categories (name, type, icon, color) VALUES
('Alimentación', 'expense', '🍔', '#ef4444'),
('Transporte', 'expense', '🚗', '#3b82f6'),
('Entretenimiento', 'expense', '🎬', '#8b5cf6'),
('Salud', 'expense', '⚕️', '#10b981'),
('Educación', 'expense', '📚', '#f59e0b'),
('Servicios', 'expense', '🔌', '#6b7280'),
('Compras', 'expense', '🛒', '#ec4899'),
('Otros Gastos', 'expense', '💸', '#6b7280');

-- ===================================
-- FUNCIÓN PARA COPIAR CATEGORÍAS DEL SISTEMA AL USUARIO
-- ===================================
CREATE OR REPLACE FUNCTION create_default_categories_for_user(target_user_id uuid)
RETURNS void AS $$
BEGIN
    -- Copiar categorías del sistema a las categorías del usuario
    INSERT INTO financial_categories (name, type, icon, color, is_system, user_id)
    SELECT name, type, icon, color, true, target_user_id
    FROM system_financial_categories
    ON CONFLICT (user_id, name, type) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- VERIFICACIÓN
-- ===================================
-- Verificar que las tablas fueron creadas
SELECT 'financial_categories' as table_name, count(*) as row_count FROM financial_categories
UNION ALL
SELECT 'system_financial_categories', count(*) FROM system_financial_categories
UNION ALL
SELECT 'incomes', count(*) FROM incomes
UNION ALL  
SELECT 'expenses', count(*) FROM expenses
UNION ALL
SELECT 'financial_goals', count(*) FROM financial_goals
UNION ALL
SELECT 'budgets', count(*) FROM budgets
UNION ALL
SELECT 'financial_insights', count(*) FROM financial_insights;