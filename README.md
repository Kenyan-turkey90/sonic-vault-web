# Sonic Vault — Web

Public landing page + admin analytics dashboard for [Sonic Vault](https://github.com/Kenyan-turkey90/sonic-vault), the open-source Android music player.

- **Landing page** (`/`) — dark hero with an emerald download CTA; every page load beacons `GET /api/track-visit`.
- **Download tracking** (`POST /api/download?platform=android|ios`) — logs the click to Postgres (with an anonymized IP), then `302`-redirects to the real APK / store link.
- **Admin dashboard** (`/admin`) — password-gated stats: visits, downloads, platform split, 14-day activity chart, recent events.

Stack: **Next.js 16 (App Router) · Tailwind CSS v4 · Supabase (PostgreSQL)**.
Design system: zinc surfaces, emerald/amber accents — no blue or purple anywhere.

---

## 1 · Local development

### Prereqs

- Node 20+, pnpm
- [Docker](https://docs.docker.com/get-docker/) running
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)

### Boot everything

```bash
pnpm install

# start the local Supabase stack (first run pulls images)
supabase start

# apply migrations + seed nothing (fresh DB)
supabase db reset

# copy local credentials into env
cp .env.example .env.local
supabase status -o env | grep -E "SUPABASE_URL|SERVICE_ROLE" >> .env.local
#   ^ then paste values from `supabase status` if your shell differs
```

Set a real password in `.env.local`:

```bash
ADMIN_PASSWORD=your-secret-here
```

Run the app:

```bash
pnpm dev        # http://localhost:3000  (admin at /admin)
```

## 2 · Database schema

Defined in [`supabase/migrations/20260822000000_analytics.sql`](supabase/migrations/20260822000000_analytics.sql):

| Table            | Columns                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| `website_visits` | `id`, `created_at`, `user_agent`, `referrer`                              |
| `app_downloads`  | `id`, `created_at`, `platform` (`android`\|`ios`), `ip_address` (nullable) |

Security posture:

- **RLS is enabled on both tables with zero policies** — the public `anon` key can't read or write anything.
- All inserts/reads go through Next.js route handlers using the **service-role key**, which stays on the server.
- IPs are anonymized in code before insert (IPv4 last octet zeroed, IPv6 truncated past `/64`). See `src/lib/analytics.ts`.

Handy SQL console without leaving the terminal:

```bash
supabase db --help          # reset, push, diff, dump…
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c 'select * from website_visits order by created_at desc limit 5;'
```

## 3 · API routes

| Route                    | Method | Behavior                                                                                     |
| ------------------------ | ------ | -------------------------------------------------------------------------------------------- |
| `/api/track-visit`       | GET    | Inserts `{user_agent, referrer}` into `website_visits`. Always `204`; never blocks the page. |
| `/api/download`          | POST   | Inserts `{platform, ip_address}` into `app_downloads`, then `302` → APK / store URL.         |

Quick smoke test against a running dev server:

```bash
curl -i http://localhost:3000/api/track-visit \
  -H "user-agent: curl-test"

curl -i -X POST "http://localhost:3000/api/download?platform=android"
# expect HTTP 302 → github.com/.../releases/latest/download/<apk>
```

## 4 · Production deployment

### Supabase (hosted)

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push          # applies supabase/migrations/* to the cloud project
```

Grab production creds from **Project Settings → API**.

### Vercel

1. Push this repo to GitHub and import it in Vercel (framework auto-detected).
2. Add environment variables (Project → Settings → Environment Variables):

   | Key                          | Value                                   | Sensitive |
   | ---------------------------- | --------------------------------------- | --------- |
   | `SUPABASE_URL`               | `https://<ref>.supabase.co`             |           |
   | `SUPABASE_SERVICE_ROLE_KEY`  | service_role secret key                 | ✅ yes     |
   | `ADMIN_PASSWORD`             | dashboard password                      | ✅ yes     |
   | `DOWNLOAD_URL_ANDROID`       | _(optional)_ override APK target        |           |
   | `DOWNLOAD_URL_IOS`           | _(optional)_ App Store link when live   |           |

3. Deploy. There are **no `NEXT_PUBLIC_*` secrets by design** — the browser bundle contains nothing sensitive.

> ⚠️ This auth stage is intentionally basic (single shared password + httpOnly cookie, see `src/lib/admin-auth.ts`). Before serious production use, swap it for Supabase Auth or OAuth — the gate is isolated in one file so the swap is cheap.

## 5 · Project layout

```
src/
├── app/
│   ├── page.tsx                  # landing hero (+ <VisitTracker/> beacon)
│   ├── admin/
│   │   ├── page.tsx              # cookie-gated dashboard
│   │   ├── login-form.tsx        # password screen (client)
│   │   └── actions.ts            # login/logout server actions
│   └── api/
│       ├── track-visit/route.ts  # GET  → website_visits
│       └── download/route.ts     # POST → app_downloads + 302 redirect
├── components/
│   ├── download-button.tsx       # native form POST (works without JS)
│   └── visit-tracker.tsx         # fires /api/track-visit once per load
└── lib/
    ├── analytics.ts              # IP anonymization + header helpers
    ├── admin-auth.ts             # placeholder password gate
    ├── stats.ts                  # dashboard read models
    └── supabase-admin.ts         # service-role client (server only)
supabase/
├── config.toml                   # supabase init
└── migrations/                   # schema, applied via CLI
```
