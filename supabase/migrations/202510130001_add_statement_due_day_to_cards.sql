-- Add statement_due_day (billing due date) distinct from closing_day
alter table if exists public.cards
  add column if not exists statement_due_day integer;