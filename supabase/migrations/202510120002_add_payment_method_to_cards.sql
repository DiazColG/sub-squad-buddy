-- Add payment method fields to cards
alter table if exists public.cards
  add column if not exists payment_method text, -- 'cash-deposit' | 'auto-debit'
  add column if not exists auto_debit_account_id text; -- references cards.id (savings account)