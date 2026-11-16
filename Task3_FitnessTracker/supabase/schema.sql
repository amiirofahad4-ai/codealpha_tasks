-- FitTrack database schema for Supabase.
-- Run this once in your Supabase project: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Row Level Security (RLS) makes sure each user can only see and change their own data.

-- 1. Activities: one row per logged workout
create table if not exists public.activities (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null,
  duration integer not null default 0 check (duration >= 0 and duration <= 1440),
  calories integer not null default 0 check (calories >= 0),
  steps integer not null default 0 check (steps >= 0),
  date date not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists activities_user_date_idx on public.activities (user_id, date desc);

alter table public.activities enable row level security;

drop policy if exists "Users read own activities" on public.activities;
create policy "Users read own activities" on public.activities
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users add own activities" on public.activities;
create policy "Users add own activities" on public.activities
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own activities" on public.activities;
create policy "Users update own activities" on public.activities
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete own activities" on public.activities;
create policy "Users delete own activities" on public.activities
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 2. Goals: one row per user
create table if not exists public.goals (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  steps integer not null default 10000 check (steps > 0),
  calories integer not null default 500 check (calories > 0),
  minutes integer not null default 30 check (minutes > 0),
  weight integer not null default 70 check (weight > 0),
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;

drop policy if exists "Users read own goals" on public.goals;
create policy "Users read own goals" on public.goals
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users add own goals" on public.goals;
create policy "Users add own goals" on public.goals
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own goals" on public.goals;
create policy "Users update own goals" on public.goals
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
