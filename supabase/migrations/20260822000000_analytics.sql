-- ============================================================================
-- Sonic Vault — analytics schema
--
-- Tables:
--   website_visits : one row per landing-page visit (UA + referrer)
--   app_downloads  : one row per download click (platform + anonymized IP)
--
-- Security model:
--   * RLS is ENABLED on both tables with NO policies.
--     -> The public `anon` key can neither read nor write anything.
--     -> Only server-side code using the SERVICE_ROLE key (which bypasses
--        RLS) performs inserts/reads. All traffic flows through our API
--        routes, never straight from the browser to Postgres.
--
-- Privacy model:
--   * ip_address is nullable and MUST be anonymized at the application
--     layer (last octet zeroed for IPv4 / last 80 bits for IPv6) before
--     insert. We never store full IPs.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- website_visits: lightweight landing-page telemetry
-- ----------------------------------------------------------------------------
create table if not exists public.website_visits (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_agent text,          -- raw User-Agent header (may be empty/bot)
  referrer   text           -- Referer header, null on direct traffic
);

comment on table public.website_visits is
  'One row per landing page visit. Written only by the service-role API route.';

-- Fast "visits last N days" aggregates.
create index if not exists idx_website_visits_created_at
  on public.website_visits (created_at desc);

-- ----------------------------------------------------------------------------
-- app_downloads: click-to-download conversion tracking
-- ----------------------------------------------------------------------------
create table if not exists public.app_downloads (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  platform   text not null check (platform in ('android', 'ios')),
  ip_address text            -- anonymized (see header). Null when unavailable.
);

comment on table public.app_downloads is
  'One row per download button click. IP is anonymized before insert.';

-- Time-window aggregates and per-platform splits.
create index if not exists idx_app_downloads_created_at
  on public.app_downloads (created_at desc);
create index if not exists idx_app_downloads_platform
  on public.app_downloads (platform);

-- ----------------------------------------------------------------------------
-- Lock down: RLS on, zero policies => anon/authenticated see nothing.
-- The service_role key used by our API routes bypasses RLS by design.
-- ----------------------------------------------------------------------------
alter table public.website_visits enable row level security;
alter table public.app_downloads  enable row level security;

-- Newer Postgres images no longer hand out blanket default privileges,
-- so grant the server-side role exactly what it needs: DML only.
-- (anon/authenticated intentionally receive NOTHING.)
grant select, insert, update, delete on public.website_visits to service_role;
grant select, insert, update, delete on public.app_downloads  to service_role;

-- Identity columns draw ids from sequences — service_role needs USAGE.
grant usage, select on sequence public.website_visits_id_seq to service_role;
grant usage, select on sequence public.app_downloads_id_seq  to service_role;
