-- ============================================
-- MobileCloud Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- SERVERS
-- ============================================
create table if not exists public.servers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  status text default 'stopped' check (status in ('running', 'stopped', 'error', 'building')),
  region text default 'global',
  ip_address text,
  port integer default 3000,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.servers enable row level security;

create policy "Users can manage own servers"
  on public.servers for all
  using (auth.uid() = user_id);

-- ============================================
-- DEPLOYMENTS
-- ============================================
create table if not exists public.deployments (
  id uuid primary key default gen_random_uuid(),
  server_id uuid references public.servers(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'building', 'success', 'failed')),
  github_repo text,
  branch text default 'main',
  commit_hash text,
  build_logs text,
  deployed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.deployments enable row level security;

create policy "Users can manage own deployments"
  on public.deployments for all
  using (auth.uid() = user_id);

-- ============================================
-- CREDENTIALS (encrypted)
-- ============================================
create table if not exists public.credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('s3', 'smtp', 'ai', 'maps', 'stripe', 'twilio', 'custom')),
  label text not null,
  encrypted_data text not null,
  created_at timestamptz default now()
);

alter table public.credentials enable row level security;

create policy "Users can manage own credentials"
  on public.credentials for all
  using (auth.uid() = user_id);

-- ============================================
-- DOMAINS
-- ============================================
create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  server_id uuid references public.servers(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  domain text not null unique,
  ssl_status text default 'pending' check (ssl_status in ('pending', 'active', 'failed')),
  cloudflare_zone_id text,
  created_at timestamptz default now()
);

alter table public.domains enable row level security;

create policy "Users can manage own domains"
  on public.domains for all
  using (auth.uid() = user_id);

-- ============================================
-- ENV VARIABLES (encrypted)
-- ============================================
create table if not exists public.env_variables (
  id uuid primary key default gen_random_uuid(),
  server_id uuid references public.servers(id) on delete cascade not null,
  key text not null,
  encrypted_value text not null,
  created_at timestamptz default now()
);

alter table public.env_variables enable row level security;

create policy "Users can manage env vars on own servers"
  on public.env_variables for all
  using (
    exists (
      select 1 from public.servers
      where servers.id = env_variables.server_id
      and servers.user_id = auth.uid()
    )
  );

-- ============================================
-- LOGS
-- ============================================
create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  server_id uuid references public.servers(id) on delete cascade not null,
  level text default 'info' check (level in ('info', 'warn', 'error', 'debug')),
  message text not null,
  created_at timestamptz default now()
);

alter table public.logs enable row level security;

create policy "Users can view logs on own servers"
  on public.logs for all
  using (
    exists (
      select 1 from public.servers
      where servers.id = logs.server_id
      and servers.user_id = auth.uid()
    )
  );

-- ============================================
-- TEAMS
-- ============================================
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

alter table public.teams enable row level security;

create policy "Team owners can manage teams"
  on public.teams for all
  using (auth.uid() = owner_id);

-- ============================================
-- TEAM MEMBERS
-- ============================================
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz default now()
);

alter table public.team_members enable row level security;

create policy "Team members can view team"
  on public.team_members for select
  using (auth.uid() = user_id);

-- ============================================
-- BILLING
-- ============================================
create table if not exists public.billing (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan text default 'free' check (plan in ('free', 'pro', 'enterprise')),
  stripe_customer_id text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

alter table public.billing enable row level security;

create policy "Users can view own billing"
  on public.billing for all
  using (auth.uid() = user_id);

-- ============================================
-- REALTIME (enable for live updates)
-- ============================================
alter publication supabase_realtime add table public.servers;
alter publication supabase_realtime add table public.deployments;
alter publication supabase_realtime add table public.logs;

-- ============================================
-- AUTO-CREATE BILLING RECORD ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.billing (user_id, plan)
  values (new.id, 'free');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
