-- Add closing_day (day of month) to support statement cycles for credit cards
alter table if exists public.cards
  add column if not exists closing_day integer;