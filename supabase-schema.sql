-- Run this in the Supabase SQL Editor

create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  source      text not null default 'blog',
  created_at  timestamptz not null default now()
);

-- Index for fast email lookup
create index if not exists subscribers_email_idx on public.subscribers (email);

-- Row-level security: only service role can read/write
alter table public.subscribers enable row level security;

-- No public policies — all access goes through service role key
