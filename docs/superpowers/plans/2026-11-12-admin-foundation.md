# Admin Panel — Sub-project 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Execution in this project:** each task is implemented by **Codex CLI** (`codex exec -s workspace-write`) from a task brief. Claude (controller) runs every step marked **[controller]** — anything needing network, `npm install`, the Supabase test project, a running server, the build or Playwright — then reviews each task with a reviewer subagent before the next starts.

**Goal:** Move tours, bookings and contact messages into Supabase, keep the public site identical but database-backed with tag-based revalidation, and add a single-owner admin login with a trilingual admin shell and dashboard.

**Architecture:** A pure tour model (`tour-model.ts`) holds the types and the base+text merge used by every source. A server-only Supabase repository reads `tours` / `tour_translations` through `unstable_cache` with `tours` / `tour:<slug>` tags; `src/data/tours.ts` keeps its public names but becomes async. Bookings and messages keep the `Collection` interface with a Supabase implementation. Admin auth uses Supabase Auth (`@supabase/ssr` cookies) gated by a single `ADMIN_EMAIL`; admin pages live under `/{lang}/admin/`.

**Tech Stack:** Next.js 15.5 App Router, React 19, TypeScript, Supabase (Postgres, Auth) via `@supabase/supabase-js` + `@supabase/ssr` (exact versions pinned), zod, node:test via tsx, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-12-admin-foundation-design.md`

## Global Constraints

- Starts from the merged localisation branch; all routes stay under `/{lang}/` with `lang ∈ {uz, en, ru}`.
- Tables exactly as spec §2: `tours`, `tour_translations`, `bookings`, `contact_messages`; RLS **enabled with no policies** on all four.
- The service-role key is read only in `server-only` modules; no `NEXT_PUBLIC_` variable ever holds it.
- Env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_EMAIL`; test-only `ADMIN_TEST_PASSWORD`; test values in git-ignored `.env.test.local`.
- Cache tags: `tours`, `tour:<slug>`, `bookings`, `messages`.
- Unpublished tours (`is_published = false`) never appear in any public read: pages, listings, related, bestsellers, sitemap, `/api/tours`.
- `/{lang}/sharm/<unknown>/` returns HTTP 404 with server-rendered `<html lang="{lang}">` (existing E2E must stay green).
- Admin: login at `/{lang}/admin/login`, dashboard at `/{lang}/admin/`; only `ADMIN_EMAIL` (compared trimmed, case-insensitive); login rate limit 5/min/IP; generic login error; admin pages `noindex, nofollow`; robots `Disallow: /*/admin/`.
- Admin UI text lives in a new `admin` namespace of `src/i18n/messages/{en,uz,ru}.json` (key parity + strict `i18n:check` apply); public client bundles never receive `admin`, admin client bundles receive only `admin`.
- Booking references stay `ST-XXXXXX` / `MSG-XXXXXX`; a primary-key collision retries once with a new reference.
- Dependencies pinned to exact versions; lockfile committed. No other new runtime dependencies.

## Review Focus

1. **Owner email written differently** (`Owner@Mail.com ` vs `owner@mail.com`) — treated as the owner; any other email refused. Pinned in Task 7 (`isOwner` unit test).
2. **Expired or missing session when an admin server action runs** — returns 401 / redirects to login, never throws a 500. Pinned in Task 7 (`requireAdmin` decision test) and Task 9 (E2E with cleared cookies).
3. **Login `next` parameter pointing elsewhere** (`?next=https://evil.example` or `?next=/uz/sharm/`) — ignored; after login always lands inside `/{lang}/admin/`. Pinned in Task 7 (`safeNext` unit test).
4. **Unpublished tour still referenced** by another tour's `related`, by `BESTSELLERS` or by the sitemap — silently excluded everywhere, no broken link. Pinned in Task 3 (repository unit test) and Task 9 (E2E).
5. **Re-running the seed after the owner edited tours in the database** — existing rows are not overwritten unless `--force`; missing tours are added. Pinned in Task 4 (`planSeed` unit test).

---

## File structure

```
supabase/migrations/<timestamp>_init.sql      schema + RLS (Task 1)
src/lib/server/db/client.ts                   getServiceClient() — server-only (Task 1)
src/data/tour-model.ts                        types + mergeTour() + toSummary() — pure (Task 2)
src/data/tour-json-source.ts                  JSON fixture source for seed/tests — pure (Task 2)
src/lib/server/db/tours.ts                    Supabase tour repository + cache tags (Task 3)
src/lib/server/db/tour-rows.ts                row ↔ model mapping — pure (Task 3)
scripts/db-seed.ts, src/lib/seed-plan.ts      seed (Task 4)
src/data/tours.ts                             async public API over the repository (Task 5)
src/lib/server/store.ts                       Supabase-backed bookings/messages (Task 6)
src/lib/server/auth/*.ts, src/app/[lang]/admin/login/*   auth (Task 7)
src/app/[lang]/admin/(shell)/*                admin shell + dashboard (Task 8)
tests/unit/*.test.ts, tests/e2e/admin.spec.ts (Tasks 1–9)
```

---

### Task 1: Supabase schema, server client, dependencies

**Files:**
- Create: `supabase/migrations/20261112000000_init.sql`, `src/lib/server/db/client.ts`, `tests/unit/db-client.test.ts`
- Modify: `package.json` (+ lockfile), `.env.example`, `.gitignore` (`.env.test.local`)

**Interfaces:**
- Produces: `getServiceClient(): SupabaseClient` (memoised; throws `Error('Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')` when either is missing); `type DbTourRow`, `DbTranslationRow`, `DbBookingRow`, `DbMessageRow` matching spec §2 columns.

- [ ] **Step 1 [controller]: Install pinned dependencies**
  `npm i -E @supabase/supabase-js@<latest> @supabase/ssr@<latest>` (exact versions, check they are ≥ 2 weeks old); commit lockfile with the task.
- [ ] **Step 2: Write the failing test**
```ts
// tests/unit/db-client.test.ts
test('getServiceClient fails clearly without env', () => {
  delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.throws(() => getServiceClient(), /Supabase is not configured/);
});
test('migration enables RLS on all four tables and creates no policy', () => {
  const sql = readFileSync('supabase/migrations/20261112000000_init.sql', 'utf8');
  for (const t of ['tours', 'tour_translations', 'bookings', 'contact_messages'])
    assert.match(sql, new RegExp(`alter table (public\\.)?${t} enable row level security`, 'i'));
  assert.doesNotMatch(sql, /create policy/i);
});
```
  (`client.ts` imports `server-only`; the test loads it with `--conditions=react-server` or the module guards the import — implementer picks one and documents it in the test file.)
- [ ] **Step 3: Run → FAIL** (`node --import tsx --test tests/unit/db-client.test.ts`)
- [ ] **Step 4: Write the migration (spec §2 columns, `check (lang in ('uz','en','ru'))`, FK with cascade, `updated_at` default now(), index on `bookings(created_at desc)` and `bookings(status)`), `client.ts`, `.env.example` entries, `.gitignore` line**
- [ ] **Step 5: Run → PASS**; also `npm run typecheck && npm run lint`
- [ ] **Step 6 [controller]: Apply migration to the test project** (MCP `apply_migration` or `supabase db push` against the test project), then MCP `get_advisors` (security) → no RLS/exposure warnings beyond "RLS enabled, no policy" info.
- [ ] **Step 7: Commit** — `feat(db): supabase schema, rls and server client`

---

### Task 2: Pure tour model and JSON source

**Files:**
- Create: `src/data/tour-model.ts`, `src/data/tour-json-source.ts`
- Modify: `src/data/tours.ts` (re-export types from the model; behaviour unchanged in this task), `tests/unit/tours.test.ts`, `tests/unit/pricing.test.ts`, `tests/unit/validation.test.ts` (import from the JSON source instead of the soon-async API)

**Interfaces:**
- Produces (`tour-model.ts`, no imports from `@/lib/server` or Next): all current types (`TourBase`, `TourText`, `Tour`, `TourOption*`, `HeroPrice`, `TourSummary`), `mergeTour(base: TourBase, text: TourText): Tour`, `toSummary(t: Tour): TourSummary`.
- Produces (`tour-json-source.ts`): `jsonTourBases(): TourBase[]`, `jsonTourTexts(lang: Locale): Record<string, TourText>`, `jsonGetTour(slug, lang): Tour | undefined` — reads `tours.json` / `tours.{lang}.json`.

- [ ] **Step 1:** Repoint the three unit test files to `jsonGetTour` / `jsonTourBases`; run → FAIL (module missing).
- [ ] **Step 2:** Move types + merge + `toSummary` into `tour-model.ts`; implement `tour-json-source.ts`; make `tours.ts` use them (still sync, still JSON) so the app is unchanged.
- [ ] **Step 3:** `node --import tsx --test tests/unit/*.test.ts` → all pass (incl. the en round-trip test); `npm run typecheck && npm run lint`.
- [ ] **Step 4: Commit** — `refactor(data): pure tour model and JSON source`

---

### Task 3: Supabase tour repository

**Files:**
- Create: `src/lib/server/db/tour-rows.ts`, `src/lib/server/db/tours.ts`, `tests/unit/tour-rows.test.ts`

**Interfaces:**
- Consumes: `getServiceClient` (T1), `mergeTour`, types (T2).
- Produces (`tour-rows.ts`, pure): `rowToBase(row: DbTourRow): TourBase`, `toursFromRows(rows: DbTourRow[], texts: DbTranslationRow[], lang: Locale): Tour[]` — keeps only `is_published`, orders by `sort_order` then slug, drops `related` entries pointing at unpublished/missing slugs.
- Produces (`db/tours.ts`, server-only, each wrapped in `unstable_cache` with `{ tags: ['tours', …] }`): `dbPublishedSlugs(): Promise<string[]>`, `dbTourBase(slug): Promise<TourBase | undefined>`, `dbTour(slug, lang): Promise<Tour | undefined>`, `dbAllTours(lang): Promise<Tour[]>`; export `TOUR_TAG = 'tours'`, `tourTag(slug) => \`tour:${slug}\``.

- [ ] **Step 1: Failing tests**
```ts
test('unpublished tours are excluded and related links to them are dropped', () => {
  const rows = [row('a', { published: true, related: ['b', 'c'] }), row('b', { published: false }), row('c', { published: true })];
  const out = toursFromRows(rows, textsFor(['a', 'b', 'c'], 'ru'), 'ru');
  assert.deepEqual(out.map((t) => t.slug), ['a', 'c']);
  assert.deepEqual(out[0].related.map((r) => r.slug), ['c']);
});
test('merged ru tour from rows equals jsonGetTour(slug, "ru") for every fixture slug', () => { /* build rows from JSON fixtures; deepEqual */ });
test('missing translation row → tour omitted, not crash', () => { … });
```
- [ ] **Step 2: Run → FAIL**  **Step 3: Implement**  **Step 4: Run → PASS** (+ typecheck, lint)
- [ ] **Step 5: Commit** — `feat(db): tour repository with cache tags`

---

### Task 4: Seed script

**Files:**
- Create: `src/lib/seed-plan.ts`, `scripts/db-seed.ts`, `tests/unit/seed-plan.test.ts`
- Modify: `package.json` scripts: `"db:seed": "tsx scripts/db-seed.ts"`, `"db:reset:test": "tsx scripts/db-seed.ts --reset --env=.env.test.local"`

**Interfaces:**
- Produces: `planSeed(json: { bases: TourBase[]; texts: Record<Locale, Record<string, TourText>> }, existingSlugs: Set<string>, opts: { force: boolean }): { tourRows: DbTourRow[]; translationRows: DbTranslationRow[]; skipped: string[] }`. `sort_order` = index in `tours.json`. Bookings/messages from `.data/*.json` mapped to rows (`lang` default `'en'`), upserted by id (always safe — append-only data).
- `--reset` (test only): refuses to run unless the env file name contains `test`; truncates the four tables, then seeds with `force`.

- [ ] **Step 1: Failing tests** — `planSeed` with `existingSlugs = {'quad-safari-sharm'}` and `force:false` → that slug in `skipped`, its rows absent; with `force:true` → present; 23 tours × 3 langs = 69 translation rows from the real JSON.
- [ ] **Step 2–4:** FAIL → implement → PASS (+ typecheck, lint).
- [ ] **Step 5 [controller]:** `npm run db:reset:test` against the test project → 23 `tours`, 69 `tour_translations` (verify via MCP `execute_sql` counts); run `npm run db:seed` again → 0 inserted, 23 skipped.
- [ ] **Step 6: Commit** — `feat(db): idempotent seed from JSON data`

---

### Task 5: Public site reads from Supabase

**Files:**
- Modify: `src/data/tours.ts` (async API over `db/tours.ts`), callers: `src/app/sitemap.ts`, `src/app/api/tours/route.ts`, `src/app/api/bookings/route.ts`, `src/app/[lang]/page.tsx`, `src/app/[lang]/booking/[ref]/page.tsx`, `src/app/[lang]/about-us/page.tsx`, `src/app/[lang]/sharm/page.tsx`, `src/app/[lang]/sharm/video/page.tsx`, `src/app/[lang]/sharm/[slug]/page.tsx`; `src/middleware.ts` only if needed (see Step 4)

**Interfaces:**
- Produces: `getTour(slug, lang): Promise<Tour | undefined>`, `getTourBase(slug): Promise<TourBase | undefined>`, `allTours(lang): Promise<Tour[]>`, `tourSlugs(): Promise<string[]>`, `minPrice(): Promise<number>` (replaces `MIN_PRICE`), `bestsellers(lang): Promise<…>` (filters `BESTSELLERS` to published slugs).

- [ ] **Step 1:** Make the API async; add `await` at every caller; `[slug]/page.tsx` → `dynamicParams = true`, `generateStaticParams` from `tourSlugs()`.
- [ ] **Step 2:** `npm run typecheck && npm run lint && node --import tsx --test tests/unit/*.test.ts`.
- [ ] **Step 3 [controller]:** with `.env.test.local` loaded, `npm run build`, start server (E2E procedure), full Playwright suite both projects → all 80 green.
- [ ] **Step 4 [controller]:** `curl` raw HTML of `/ru/sharm/no-such-tour/` → 404 + `<html lang="ru"`. If it fails, Codex adds the middleware rewrite of unknown `/{lang}/sharm/<slug>/` to the global 404 using `dbPublishedSlugs()` (cached) and the step repeats.
- [ ] **Step 5: Commit** — `feat(db): public site reads tours from supabase`

---

### Task 6: Bookings and messages in Supabase

**Files:**
- Modify: `src/lib/server/store.ts`
- Create: `tests/unit/store.test.ts`

**Interfaces:**
- Keeps: `bookings` / `messages` with `insert(item)`, `list()`, `get(id)`; `Booking`, `ContactMessage`, `newReference`.
- Produces: `insertWithRetry<T>(insert: (item: T) => Promise<{ conflict: boolean }>, item: T, renew: (item: T) => T): Promise<T>` — one retry on conflict, second conflict throws.
- `insert` calls `revalidateTag('bookings')` / `('messages')`.

- [ ] **Step 1: Failing tests** — first insert conflicts, second succeeds → returned item has the renewed id; two conflicts → rejects.
- [ ] **Step 2–4:** FAIL → implement (Postgres unique violation code `23505` = conflict) → PASS.
- [ ] **Step 5 [controller]:** booking + contact E2E specs against the test project; MCP `execute_sql` shows the new rows with `lang`.
- [ ] **Step 6: Commit** — `feat(db): bookings and messages stored in supabase`

---

### Task 7: Admin authentication

**Files:**
- Create: `src/lib/server/auth/admin.ts`, `src/lib/server/auth/supabase-ssr.ts`, `src/lib/admin-redirect.ts`, `src/app/[lang]/admin/login/page.tsx`, `src/app/[lang]/admin/login/LoginForm.tsx`, `src/app/[lang]/admin/actions.ts`, `scripts/admin-create.ts`, `tests/unit/admin-auth.test.ts`
- Modify: `src/middleware.ts` (refresh Supabase session cookies for `/{lang}/admin/*` only), `package.json` (`"admin:create": "tsx scripts/admin-create.ts"`), `src/i18n/messages/{en,uz,ru}.json` (`admin.login.*`)

**Interfaces:**
- Produces (pure): `isOwner(email: string | null | undefined, adminEmail: string | undefined): boolean` (trim + lowercase both; false if either empty); `safeNext(next: string | null, lang: Locale): string` (returns `next` only if it starts with `/${lang}/admin/` and contains no `//` or scheme; else `/${lang}/admin/`).
- Produces (server): `requireAdmin(): Promise<{ email: string } | null>`; `loginAction(state, formData)` (rate limit 5/min/IP via existing `rateLimited`, generic error key `admin.login.error`); `logoutAction()`.

- [ ] **Step 1: Failing tests**
```ts
test('isOwner is case- and whitespace-insensitive', () => {
  assert.equal(isOwner('Owner@Mail.com ', 'owner@mail.com'), true);
  assert.equal(isOwner('other@mail.com', 'owner@mail.com'), false);
  assert.equal(isOwner('owner@mail.com', undefined), false);
  assert.equal(isOwner(null, 'owner@mail.com'), false);
});
test('safeNext only allows same-locale admin paths', () => {
  assert.equal(safeNext('/uz/admin/bookings/', 'uz'), '/uz/admin/bookings/');
  for (const bad of ['https://evil.example', '//evil.example', '/uz/sharm/', '/ru/admin/', null])
    assert.equal(safeNext(bad as string | null, 'uz'), '/uz/admin/');
});
```
- [ ] **Step 2–4:** FAIL → implement → PASS (+ typecheck, lint, i18n:check strict for the new keys in all three languages).
- [ ] **Step 5 [controller]:** in the test project disable public sign-ups; `npm run admin:create -- <ADMIN_EMAIL>` with `.env.test.local`; also create one non-owner user for tests.
- [ ] **Step 6: Commit** — `feat(admin): owner-only supabase login`

---

### Task 8: Admin shell and dashboard

**Files:**
- Create: `src/app/[lang]/admin/(shell)/layout.tsx`, `src/app/[lang]/admin/(shell)/page.tsx`, `src/app/[lang]/admin/(shell)/AdminNav.tsx`, `src/i18n/AdminI18nProvider.tsx`, `src/lib/server/db/dashboard.ts`, `tests/unit/dashboard.test.ts`
- Modify: `src/app/robots.ts` (`Disallow: /*/admin/`), `src/i18n/messages/{en,uz,ru}.json` (`admin.nav.*`, `admin.dashboard.*`)

**Interfaces:**
- Consumes: `requireAdmin`, `logoutAction` (T7); `getServiceClient` (T1); `LanguageSwitcher`.
- Produces: `dashboardStats(now: Date): Promise<{ publishedTours: number; pendingBookings: number; messagesLast7Days: number; latestBookings: Pick<Booking,'id'|'createdAt'|'tourName'|'date'|'name'|'status'>[] }>`; pure helper `sevenDaysAgo(now: Date): string` (ISO). Layout: `requireAdmin()` null → `redirect(localeHref(lang, '/admin/login/') + '?next=…')`; metadata `robots: { index: false, follow: false }`.

- [ ] **Step 1: Failing test** — `sevenDaysAgo(new Date('2026-11-12T10:00:00Z'))` → `'2026-11-05T10:00:00.000Z'`.
- [ ] **Step 2–4:** FAIL → implement shell (sidebar: Dashboard, Logout, UZ·EN·RU switcher) + dashboard → PASS (+ typecheck, lint, strict i18n:check).
- [ ] **Step 5: Commit** — `feat(admin): admin shell and dashboard`

---

### Task 9: Admin and data E2E, final verification

**Files:**
- Create: `tests/e2e/admin.spec.ts`
- Modify: `README.md` / `ARCHITECTURE.md` (Supabase setup, env vars, `db:seed`, `admin:create`, test project), `TODO.md`

- [ ] **Step 1: Write E2E** (credentials from env `ADMIN_EMAIL` / `ADMIN_TEST_PASSWORD` / `NONOWNER_EMAIL` / `NONOWNER_PASSWORD`):
  - logged-out `/uz/admin/` → URL `/uz/admin/login/?next=%2Fuz%2Fadmin%2F`;
  - wrong password → `admin.login.error` text (uz), still on login;
  - owner login → dashboard; counts equal seed (`publishedTours` 23);
  - switch to RU in the admin → `/ru/admin/`, `<html lang="ru">`, still logged in;
  - non-owner login → refused with the same generic error;
  - cookies cleared mid-session → next admin navigation lands on login;
  - logout → `/uz/admin/` redirects to login;
  - booking via UI appears in dashboard "latest bookings";
  - `update tours set is_published=false where slug='speed-boat-sharm'` (via service client in the test) + revalidate → `/en/sharm/speed-boat-sharm/` 404, absent from `/en/sharm/` and sitemap; restore afterwards;
  - `robots.txt` contains `Disallow: /*/admin/`; admin pages carry `noindex`.
- [ ] **Step 2 [controller]:** build, start, run `tests/e2e/admin.spec.ts` + full suite on both projects → all green.
- [ ] **Step 3:** Docs + TODO.
- [ ] **Step 4: Commit** — `test(admin): admin and database e2e; docs`
