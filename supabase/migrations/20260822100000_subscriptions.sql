-- ============================================================================
-- Sonic Vault — subscription system
--
-- Plans (hardcoded in app, mirrored here for documentation):
--   free     $0/mo   Audio with ads, basic features
--   basic    $2/mo   Ad-free audio, no video, no hosting
--   pro      $5/mo   Ad-free audio + video, 5GB hosting
--   premium  $10/mo  Everything: ad-free, video, unlimited hosting, all features
--
-- Security model:
--   RLS enabled, zero public policies.
--   Only service_role can read/write (same as analytics tables).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- plans: reference table for plan metadata (read-only, seeded once)
-- ----------------------------------------------------------------------------
create table if not exists public.plans (
  id           text primary key,               -- 'free', 'basic', 'pro', 'premium'
  name         text not null,                  -- display name
  price_cents  integer not null default 0,     -- monthly price in cents
  currency     text not null default 'usd',
  features     jsonb not null default '[]',    -- feature flags array
  sort_order   integer not null default 0      -- for display ordering
);

comment on table public.plans is
  'Subscription plan definitions. Seed data inserted below.';

-- Seed the 4 plans
insert into public.plans (id, name, price_cents, currency, features, sort_order) values
  ('free',    'Free',    0,    'usd', '["audio","ads","basic-themes","offline-queue"]', 0),
  ('basic',   'Basic',   200,  'usd', '["audio","no-ads","lyrics","equalizer","offline-download"]', 1),
  ('pro',     'Pro',     500,  'usd', '["audio","video","no-ads","lyrics","equalizer","offline-download","cloud-sync","5gb-hosting"]', 2),
  ('premium', 'Premium', 1000, 'usd', '["audio","video","no-ads","lyrics","equalizer","offline-download","cloud-sync","unlimited-hosting","custom-themes","priority-support","api-access"]', 3)
on conflict (id) do update set
  name = excluded.name,
  price_cents = excluded.price_cents,
  features = excluded.features,
  sort_order = excluded.sort_order;

-- ----------------------------------------------------------------------------
-- subscriptions: one row per active/expired subscription
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  device_id       text not null,                -- anonymous device fingerprint (MD5 hash)
  plan_id         text not null references public.plans(id),
  status          text not null default 'active' check (status in ('active','cancelled','expired','past_due')),
  current_period_start timestamptz not null default now(),
  current_period_end   timestamptz not null default (now() + interval '30 days'),
  cancelled_at    timestamptz,
  payment_ref     text                          -- Stripe payment intent ID (nullable for free tier)
);

comment on table public.subscriptions is
  'User subscriptions. device_id is an anonymous fingerprint (not PII).';

-- Fast lookups by device
create index if not exists idx_subscriptions_device_id
  on public.subscriptions (device_id);
create index if not exists idx_subscriptions_status
  on public.subscriptions (status);
create index if not exists idx_subscriptions_plan_id
  on public.subscriptions (plan_id);

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.subscriptions;
create trigger set_updated_at
  before update on public.subscriptions
  for each row execute function public.update_updated_at();

-- ----------------------------------------------------------------------------
-- Lock down + grants (same pattern as analytics tables)
-- ----------------------------------------------------------------------------
alter table public.plans           enable row level security;
alter table public.subscriptions   enable row level security;

grant select on public.plans to service_role;
grant select, insert, update, delete on public.subscriptions to service_role;
grant usage, select on sequence public.subscriptions_id_seq to service_role;
