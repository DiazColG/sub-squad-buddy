-- Add period_month generated column to expenses and supporting index
-- This enables fast monthly queries and aligns with the new periods logic

DO $$
BEGIN
  -- Add generated column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'expenses' 
      AND column_name = 'period_month'
  ) THEN
    ALTER TABLE public.expenses
      ADD COLUMN period_month text GENERATED ALWAYS AS (to_char(transaction_date, 'YYYY-MM')) STORED;
  END IF;
END $$;

-- Index for period queries
CREATE INDEX IF NOT EXISTS idx_expenses_period_month ON public.expenses(period_month);

-- Optional composite index frequently used in dashboards
CREATE INDEX IF NOT EXISTS idx_expenses_user_period ON public.expenses(user_id, period_month);
