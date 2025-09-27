-- Create expense_payments table to store immutable payment history for expenses (instances and one-off)
-- Mirrors income_receipts but keyed per expense instance.

-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.expense_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  expense_id uuid NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  paid_at date NOT NULL DEFAULT CURRENT_DATE,
  -- Period key derived from paid_at
  period_month text GENERATED ALWAYS AS (
    ((extract(year from paid_at)::int)::text || '-' || lpad((extract(month from paid_at)::int)::text, 2, '0'))
  ) STORED,
  amount numeric NOT NULL,
  currency text NOT NULL,
  notes text,
  tags text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One payment per expense instance
CREATE UNIQUE INDEX IF NOT EXISTS uq_expense_payments_expense
  ON public.expense_payments (expense_id);

-- Helpful indexes for common queries
CREATE INDEX IF NOT EXISTS idx_expense_payments_user_period
  ON public.expense_payments (user_id, period_month);
CREATE INDEX IF NOT EXISTS idx_expense_payments_expense
  ON public.expense_payments (expense_id);

-- Enable RLS and policy
ALTER TABLE public.expense_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Individuals can access own expense payments" ON public.expense_payments;

CREATE POLICY "Individuals can access own expense payments"
  ON public.expense_payments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
