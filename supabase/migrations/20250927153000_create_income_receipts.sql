-- Create income_receipts table to store immutable monthly receipt history for incomes
-- Solid design: generated period_month, unique per (income_id, period_month), indexes, and RLS

-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.income_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  income_id uuid NOT NULL REFERENCES public.incomes(id) ON DELETE CASCADE,
  received_at date NOT NULL DEFAULT CURRENT_DATE,
  -- Period key derived from received_at to avoid client mistakes
  period_month text GENERATED ALWAYS AS (
    ((extract(year from received_at)::int)::text || '-' || lpad((extract(month from received_at)::int)::text, 2, '0'))
  ) STORED,
  amount numeric NOT NULL,
  currency text NOT NULL,
  notes text,
  tags text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One receipt per income per month
CREATE UNIQUE INDEX IF NOT EXISTS uq_income_receipts_income_period
  ON public.income_receipts (income_id, period_month);

-- Helpful indexes for common queries
CREATE INDEX IF NOT EXISTS idx_income_receipts_user_period
  ON public.income_receipts (user_id, period_month);
CREATE INDEX IF NOT EXISTS idx_income_receipts_income
  ON public.income_receipts (income_id);

-- Enable RLS and basic policies mirroring other tables
ALTER TABLE public.income_receipts ENABLE ROW LEVEL SECURITY;

-- Supabase SQL Editor-friendly (no DO blocks). Recreate policy idempotently.
DROP POLICY IF EXISTS "Individuals can access own income receipts" ON public.income_receipts;

CREATE POLICY "Individuals can access own income receipts"
  ON public.income_receipts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
