-- Hotfix migration to ensure budgets and savings_goals match frontend expectations
-- Idempotent: safe to run multiple times

-- Prerequisites
create extension if not exists pgcrypto;

-- =============================
-- Budgets table
-- =============================
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.financial_categories(id) on delete cascade,

  name text not null,
  budgeted_amount numeric(12,2) not null check (budgeted_amount > 0),
  spent_amount numeric(12,2) default 0 check (spent_amount >= 0),
  period_type text not null default 'monthly' check (period_type in ('weekly','monthly','quarterly','yearly')),
  period_start date not null,
  period_end date not null,
  status text default 'active' check (status in ('active','completed','exceeded')),
  alert_threshold numeric(5,2) default 80.0 check (alert_threshold > 0 and alert_threshold <= 100),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add missing columns if table already existed with older schema
alter table public.budgets add column if not exists user_id uuid;
alter table public.budgets add column if not exists category_id uuid;
alter table public.budgets add column if not exists spent_amount numeric(12,2) default 0;
alter table public.budgets add column if not exists period_type text default 'monthly';
alter table public.budgets add column if not exists period_start date;
alter table public.budgets add column if not exists period_end date;
alter table public.budgets add column if not exists status text default 'active';
alter table public.budgets add column if not exists alert_threshold numeric(5,2) default 80.0;
alter table public.budgets add column if not exists notes text;
alter table public.budgets add column if not exists created_at timestamptz default now();
alter table public.budgets add column if not exists updated_at timestamptz default now();

-- Ensure foreign key to categories
do $$ begin
  -- Only add FK if column exists; ignore if it already exists
  if exists (
    select 1 from information_schema.columns 
    where table_schema='public' and table_name='budgets' and column_name='category_id'
  ) then
    begin
      alter table public.budgets
        add constraint budgets_category_fk foreign key (category_id) references public.financial_categories(id) on delete cascade;
    exception when duplicate_object then
      null;
    end;
  end if;
end $$;

-- Unique constraint for user/category/period
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.budgets'::regclass and contype='u' and conname='budgets_user_category_period_unique'
  ) then
    alter table public.budgets add constraint budgets_user_category_period_unique unique (user_id, category_id, period_start, period_end);
  end if;
end $$;

-- Ensure only one general (category NULL) budget per period and user
create unique index if not exists budgets_general_user_period_unique
  on public.budgets (user_id, period_start, period_end)
  where category_id is null;

-- Helpful index for listing
create index if not exists budgets_user_created_idx on public.budgets (user_id, created_at desc);
create index if not exists budgets_user_period_idx on public.budgets (user_id, period_start desc);

-- RLS and policies
alter table public.budgets enable row level security;

drop policy if exists "budgets_select_own" on public.budgets;
create policy "budgets_select_own"
  on public.budgets for select
  using (auth.uid() = user_id);

drop policy if exists "budgets_insert_own" on public.budgets;
create policy "budgets_insert_own"
  on public.budgets for insert
  with check (auth.uid() = user_id);

drop policy if exists "budgets_update_own" on public.budgets;
create policy "budgets_update_own"
  on public.budgets for update
  using (auth.uid() = user_id);

drop policy if exists "budgets_delete_own" on public.budgets;
create policy "budgets_delete_own"
  on public.budgets for delete
  using (auth.uid() = user_id);

-- =============================
-- Savings Goals table
-- =============================
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) default 0 check (current_amount >= 0),
  target_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.savings_goals add column if not exists current_amount numeric(12,2) default 0;
alter table public.savings_goals add column if not exists target_date date;
alter table public.savings_goals add column if not exists created_at timestamptz default now();
alter table public.savings_goals add column if not exists updated_at timestamptz default now();

alter table public.savings_goals enable row level security;

drop policy if exists "savings_goals_select_own" on public.savings_goals;
create policy "savings_goals_select_own"
  on public.savings_goals for select
  using (auth.uid() = user_id);

drop policy if exists "savings_goals_insert_own" on public.savings_goals;
create policy "savings_goals_insert_own"
  on public.savings_goals for insert
  with check (auth.uid() = user_id);

drop policy if exists "savings_goals_update_own" on public.savings_goals;
create policy "savings_goals_update_own"
  on public.savings_goals for update
  using (auth.uid() = user_id);

drop policy if exists "savings_goals_delete_own" on public.savings_goals;
create policy "savings_goals_delete_own"
  on public.savings_goals for delete
  using (auth.uid() = user_id);

-- Done
