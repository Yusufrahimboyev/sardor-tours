# Admin panel — Sub-project 1: Foundation — Design

- **Date:** 2026-11-12
- **Status:** Sections 1–2 approved in conversation; sections 3–5 written on the owner's instruction to proceed without per-section stops. Awaiting written-spec review.
- **Depends on:** the Uzbek/English/Russian localisation branch (`feat/i18n-uz-en-ru`) being complete and merged.
- **Executed by:** Codex CLI (`codex exec`), task by task, managed and reviewed by Claude.

## 0. Programme context (all sub-projects)

The owner asked for an admin panel to replace photos, add videos, and manage tours, bookings and messages, site settings and reviews. The work is split into sub-projects, each with its own spec → plan → implementation cycle:

| # | Sub-project | Depends on |
|---|---|---|
| **1** | **Foundation** (this spec): Supabase DB/Storage/Auth, admin login + shell, tours/bookings/messages moved from JSON into the database, site reads from the database with cache revalidation | i18n branch |
| 2 | Media: tour photo replacement (upload/order/delete), hero image, videos (upload or YouTube link) on the video page | 1 |
| 3 | Tour editor: add / edit / hide tours in UZ/EN/RU, prices and options | 1, 2 |
| 4 | Bookings & messages: list, status workflow, search/filter | 1 |
| 5 | Site settings (contacts, social links, hero) and reviews | 1 |

## 1. Understanding

**What the owner said**
- Hosting: **Vercel + Supabase**.
- Admin users: **only the owner** (one account).
- Admin interface language: **switchable UZ / RU / EN**, like the public site.
- Content storage: **approach A — Supabase Postgres as the source of truth**.
- Day-one admin scope across the programme: photos, videos, tours, bookings & messages, settings, reviews.

**Assumptions**
- The 23 existing tours and their three-language texts migrate to the database without loss.
- An edit saved in the admin panel is visible on the public site within seconds, with no redeploy.
- Public pages stay fast and static-first (SSG/ISR); SEO output does not change.
- Existing booking reference links (`/{lang}/booking/ST-XXXXXX/`) keep working after migration.

**Success criteria (sub-project 1)**
1. The owner can log in at `/{lang}/admin/login`, see the dashboard, switch the admin language and log out. Everyone else is refused.
2. All public pages render their tour, booking and message data from Supabase.
3. The full existing E2E suite (80 tests) passes against a seeded test database, plus the new admin and data tests.
4. `npm run db:seed` imports the current JSON data idempotently.

## 2. Data model (approved)

```
tours
  slug text primary key
  category text not null
  sort_order int not null default 0
  is_published boolean not null default true
  base jsonb not null          -- TourBase: options (key, price, kind, group, max, included),
                               -- scheduleDays, timeSlots, gallery, cardImage, related slugs, …
  updated_at timestamptz not null default now()

tour_translations
  slug text references tours(slug) on delete cascade
  lang text not null check (lang in ('uz','en','ru'))
  text jsonb not null          -- TourText: name, title, itinerary, faq, included, …
  updated_at timestamptz not null default now()
  primary key (slug, lang)

bookings
  id text primary key          -- 'ST-XXXXXX'
  created_at timestamptz not null default now()
  status text not null default 'pending'
  lang text not null, tour_slug text not null, tour_name text not null,
  date date not null, time text not null default '', hotel text not null,
  lines jsonb not null, total int not null, currency text not null default 'GBP',
  name text not null, phone text not null, email text not null default '',
  notes text not null default '', requires_deposit boolean not null default false

contact_messages
  id text primary key          -- 'MSG-XXXXXX'
  created_at timestamptz not null default now()
  lang text not null, name text not null, email text not null,
  phone text not null default '', topic text not null, message text not null
```

- The existing TypeScript types `TourBase` / `TourText` are the shapes of the `jsonb` columns. `getTour()` merges them exactly as it does today.
- **RLS is enabled on every table with no policies.** The anon key can read nothing. The site talks to Supabase only from the server, with the service-role key, which never reaches the browser.
- Migrations live in `supabase/migrations/*.sql`.
- `npm run db:seed` upserts `src/data/tours*.json` and any `.data/bookings.json` / `.data/messages.json` records. It is idempotent. The JSON files remain as the seed source and test fixtures.

## 3. Public site reads (approved)

- `src/data/tours.ts` keeps its public names but becomes **async**: `getTour(slug, lang)`, `getTourBase(slug)`, `allTours(lang)`, `tourSlugs()`. Data comes from `src/lib/server/db/tours.ts` (Supabase).
- Callers (pages, API routes, validation, sitemap) gain `await`; their logic does not change.
- Reads are wrapped in `unstable_cache` with tags `tours` and `tour:<slug>`. Admin writes call `revalidateTag` for the affected tags.
- Unpublished tours (`is_published = false`) are excluded from public reads and return 404.
- The tour route becomes `dynamicParams = true`, so tours created later don't need a redeploy.
  - **Hard requirement (existing E2E):** `/ru/sharm/no-such-tour/` returns HTTP 404 with server-rendered `<html lang="ru">`.
  - If `notFound()` from the dynamic page breaks that, the middleware rewrites unknown slugs to the global 404 instead, using the cached slug list.
- `store.ts` keeps its `insert` / `list` / `get` interface with a Supabase implementation. API routes are unchanged.
  - A duplicate `ST-` reference (primary-key violation) retries once with a new reference.
- **Failure behaviour:**
  - If Supabase is down, cached pages keep serving.
  - Booking or contact submission errors show the existing "message us on WhatsApp" error.
  - Builds require `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## 4. Admin access and interface

**Routes** — under the existing locale segment, so the admin language reuses locale routing and the switcher:
```
/{lang}/admin/login      login form (email + password)
/{lang}/admin/           dashboard (protected)
```
Sub-projects 2–5 add pages under `/{lang}/admin/…`.

**Authentication**
- Supabase Auth, email and password. Public sign-ups are **disabled** in the Supabase project.
- The owner account is created once by `npm run admin:create -- <email>`, which uses the service role and prompts for the password.
- Only the email in env `ADMIN_EMAIL` is accepted. Any other authenticated user is treated as logged out.
- Session cookies come from `@supabase/ssr`. The middleware refreshes the session on `/{lang}/admin/*` requests only.
- A single server helper `requireAdmin()`:
  - The admin layout calls it, and redirects to `/{lang}/admin/login` if it fails.
  - **Every** admin server action calls it, and returns 401 if it fails.
- Login errors are generic ("wrong email or password").
- Login attempts are rate-limited with the existing limiter: 5 per minute per IP.

**Admin shell (sub-project 1)**
- Sidebar: Dashboard and Logout, plus the UZ · EN · RU switcher. Later sub-projects add their own items.
- The dashboard shows:
  - number of published tours
  - number of bookings with status `pending`
  - number of contact messages in the last 7 days
  - the 5 latest bookings, read-only
- All admin pages are `noindex, nofollow`. `robots.ts` adds `Disallow: /*/admin/`.

**Admin text**
- A new `admin` namespace in `src/i18n/messages/{uz,en,ru}.json`, kept to the same key-parity rules and the strict `i18n:check`.
- Admin client components receive only `messages.admin` through their own provider. Public client bundles never include admin strings, and admin pages never include public page copy.

## 5. Testing and execution

**Test database**
- There is no Docker on the development machine, so tests run against a **dedicated Supabase test project**. Creating it needs the owner's explicit approval.
- Its credentials live in `.env.test.local`, which is git-ignored: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_EMAIL`, `ADMIN_TEST_PASSWORD`.
- `npm run db:reset:test` applies migrations, truncates the tables and seeds the data.

**Tests**
- **Unit:** row ↔ `TourBase`/`TourText` mapping, `requireAdmin` decisions (no session / wrong email / owner), duplicate-reference retry, seed idempotency (pure functions with fixtures).
- **E2E, existing:** the full 80-test suite runs against the seeded test project, unchanged apart from setup.
- **E2E, new admin:**
  - logged-out `/uz/admin/` redirects to login
  - wrong password shows the generic error
  - the owner logs in and sees dashboard counts that match the seed
  - the language switch keeps you in the admin area
  - logout works
  - a non-owner user (created in the test project) is refused
- **E2E, new data:** a booking made through the UI appears in the `bookings` table and on the dashboard. Unpublishing a tour in the DB makes it 404 after revalidation.

**Execution by Codex**
- Each plan task is sent to `codex exec -s workspace-write` with a task brief.
- Codex's sandbox blocks network and listening ports, so Claude runs everything that needs the test database or a server: the integration suite, the build and E2E.
- Claude reviews each task with a reviewer subagent before the next one starts, and does a whole-branch review at the end.

## 6. Out of scope (sub-project 1)

- Uploading or editing photos and videos (sub-project 2).
- Creating or editing tours in the UI (sub-project 3). In sub-project 1 tours change only via seed or SQL.
- Booking status changes, search and filters (sub-project 4).
- Settings and reviews (sub-project 5).
- Multiple admin users, roles, password reset by email (single owner; reset via `npm run admin:create`).
- Vercel deployment itself (done once all sub-projects are complete; needs the owner's Vercel account).
