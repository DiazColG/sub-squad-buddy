-- Create table for FIRE scenarios
create table if not exists public.fire_scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  monthly_expenses numeric not null check (monthly_expenses >= 0),
  withdrawal_rate numeric not null check (withdrawal_rate >= 0 and withdrawal_rate <= 1),
  current_portfolio numeric not null check (current_portfolio >= 0),
  monthly_savings numeric not null check (monthly_savings >= 0),
  real_annual_return numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.fire_scenarios enable row level security;

-- Policies: owner-only access
create policy "fire_scenarios_select_own" on public.fire_scenarios
  for select using (auth.uid() = user_id);

create policy "fire_scenarios_insert_own" on public.fire_scenarios
  for insert with check (auth.uid() = user_id);

create policy "fire_scenarios_update_own" on public.fire_scenarios
  for update using (auth.uid() = user_id);

create policy "fire_scenarios_delete_own" on public.fire_scenarios
  for delete using (auth.uid() = user_id);

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger fire_scenarios_set_updated_at
before update on public.fire_scenarios
for each row execute function public.set_updated_at();
