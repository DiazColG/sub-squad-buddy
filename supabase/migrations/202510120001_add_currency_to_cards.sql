-- Add currency column to cards to support account currencies (ARS, USD, EUR, etc.)
alter table if exists public.cards
  add column if not exists currency text;

-- Optional: you could backfill with a default later if needed