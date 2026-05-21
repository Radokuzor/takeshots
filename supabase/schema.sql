-- TakeShots Supabase Schema
-- Run this in your Supabase SQL editor

-- Products
create table if not exists products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text,
  price            numeric(10, 2) not null,
  photo_url        text,
  photo_urls       text[] default '{}',
  occasion_tag     text check (occasion_tag in ('bachelorette','wedding','birthday','anniversary','game_night','holiday')),
  occasion_tags    text[] default '{}',
  amazon_asin      text,
  pros             text[],
  cons             text[],
  key_points       text[],
  featured         boolean default false,
  created_at       timestamptz default now()
);

-- Articles
create table if not exists articles (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text unique not null,
  category         text check (category in ('near_me','blog')),
  city             text,
  body             text,
  author           text default 'TakeShots Team',
  last_updated     timestamptz default now(),
  tags             text[],
  related_slugs    text[]
);

-- Email subscribers
create table if not exists email_subscribers (
  id               uuid primary key default gen_random_uuid(),
  email            text unique not null,
  discount_claimed boolean default false,
  source           text check (source in ('hero','popup','footer','play_page')),
  created_at       timestamptz default now()
);

-- Orders
create table if not exists orders (
  id                  uuid primary key default gen_random_uuid(),
  customer_email      text not null,
  stripe_payment_id   text unique,
  items               jsonb not null default '[]',
  total               numeric(10, 2) not null,
  status              text check (status in ('pending','fulfilled','cancelled')) default 'pending',
  created_at          timestamptz default now()
);

-- Game sessions (placeholder — Firebase will own this later)
create table if not exists game_sessions (
  id               uuid primary key default gen_random_uuid(),
  room_code        text unique not null,
  created_at       timestamptz default now()
);

-- RLS: enable on all tables
alter table products          enable row level security;
alter table articles          enable row level security;
alter table email_subscribers enable row level security;
alter table orders            enable row level security;
alter table game_sessions     enable row level security;

-- Public read for products and articles
create policy "Public read products"  on products  for select using (true);
create policy "Public read articles"  on articles  for select using (true);

-- Email subscribers: insert only from client (anon)
create policy "Insert subscribers" on email_subscribers for insert with check (true);

-- Orders: service role only (no public read/write)
-- (No public policy needed — use service role key in API routes)
