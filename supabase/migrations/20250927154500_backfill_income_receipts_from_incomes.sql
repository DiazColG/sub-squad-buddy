-- Backfill income_receipts from existing incomes.tags entries like 'income-received:YYYY-MM'
-- and currency from 'currency:XXX'. Amount taken from current incomes.amount at time of backfill.

WITH receipt_tags AS (
  SELECT 
    i.user_id,
    i.id AS income_id,
    unnest(i.tags) AS tag,
    i.amount,
    (
      SELECT replace(t, 'currency:', '')
      FROM unnest(i.tags) t
      WHERE t LIKE 'currency:%'
      LIMIT 1
    ) AS currency_guess
  FROM public.incomes i
  WHERE i.tags IS NOT NULL
), parsed AS (
  SELECT 
    user_id,
    income_id,
    amount,
    COALESCE(currency_guess, 'USD') AS currency,
    to_date(replace(tag, 'income-received:', ''), 'YYYY-MM') AS month_date
  FROM receipt_tags
  WHERE tag LIKE 'income-received:%'
)
INSERT INTO public.income_receipts (user_id, income_id, received_at, amount, currency, notes, tags)
SELECT 
  p.user_id,
  p.income_id,
  p.month_date,
  p.amount,
  p.currency,
  'backfill from tags',
  ARRAY['source:tags']
FROM parsed p
ON CONFLICT (income_id, period_month)
DO UPDATE SET 
  amount = EXCLUDED.amount,
  currency = EXCLUDED.currency,
  updated_at = now();
