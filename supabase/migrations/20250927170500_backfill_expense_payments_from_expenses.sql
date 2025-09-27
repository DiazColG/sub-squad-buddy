-- Backfill expense_payments from existing expenses that are already marked as paid via tags
-- Uses 'paid-at:YYYY-MM-DD' if present, else falls back to transaction_date

WITH paid_rows AS (
  SELECT 
    e.user_id,
    e.id AS expense_id,
    e.amount,
    COALESCE(NULLIF(e.currency, ''), 'USD') AS currency,
    (
      SELECT replace(t, 'paid-at:', '')
      FROM unnest(e.tags) t
      WHERE t LIKE 'paid-at:%'
      LIMIT 1
    ) AS paid_at_tag,
    e.transaction_date
  FROM public.expenses e
  WHERE e.tags IS NOT NULL AND 'paid' = ANY(e.tags)
)
INSERT INTO public.expense_payments (user_id, expense_id, paid_at, amount, currency, notes, tags)
SELECT 
  p.user_id,
  p.expense_id,
  COALESCE(p.paid_at_tag::date, p.transaction_date::date),
  p.amount,
  p.currency,
  'backfill from expense tags',
  ARRAY['source:tags']
FROM paid_rows p
ON CONFLICT (expense_id)
DO UPDATE SET 
  amount = EXCLUDED.amount,
  currency = EXCLUDED.currency,
  paid_at = EXCLUDED.paid_at,
  updated_at = now();
