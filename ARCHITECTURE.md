# ARCHITECTURE

## Stack & why

| Choice | Reason |
|---|---|
| **Next.js 15 (App Router) + React 19 + TypeScript** | SSG for all marketing/tour pages (fast, SEO-friendly), route handlers for the API in the same project |
| **CSS Modules + a small global stylesheet** | The reference is hand-written CSS; porting it 1:1 into scoped modules gives the highest visual fidelity without class-name collisions between pages (e.g. three different `.hero`s). Tailwind would have meant re-expressing every value. |
| **No Framer Motion** | All reference animations are simple CSS transitions + one IntersectionObserver; a motion library would add ~40 kB for nothing. |
| **React Hook Form + Zod** | Same Zod schemas validate in the browser and on the server. |
| **JSON-file repository** | Zero-config persistence for bookings and contact messages; isolated behind a 3-method interface so it can be swapped for Supabase/PostgreSQL. |
| **Playwright** | E2E tests on desktop + mobile viewports against a production build. |

## Directory layout

```
src/
  app/
    (home)/                 Home page (dark theme) + its header
    en/sharm/               Destination page, catalogue, hero search, bestsellers, map
    en/sharm/[slug]/        Tour detail (SSG for 23 slugs), gallery, included tabs
    en/sharm/video/         Videos (coming-soon state)
    en/about-us/ en/contact/ en/terms-and-conditions/
    booking/[ref]/          Booking confirmation (dynamic, noindex)
    api/bookings|contact|tours/   Route handlers
    sitemap.ts robots.ts manifest.ts icon.svg not-found.tsx
  components/               Shared UI (Footer, Modal, BottomNav, TourCard, booking/…)
  data/
    tours.json              Normalised data for 23 tours (generated, see below)
    tours.ts                Types, lookups, summaries
    site.ts                 Brand/contact config, destinations, general FAQ
  lib/
    catalog.ts              Pure search / category / price filtering (client + API)
    pricing.ts              Pure quote calculation (client + API)
    validation.ts           Zod schemas + tour-specific booking rules (client + API)
    dates.ts images.ts
    server/store.ts         JSON-file collections (server-only)
    server/http.ts          Rate limit, JSON errors, admin auth (server-only)
tests/e2e/                  Playwright specs
scripts/research/           Scraper + converter used to build tours.json
```

## Data flow

```
reference HTML ──scrape.py──▶ tours.json (raw) ──convert.py──▶ src/data/tours.json
                                                                  │
                         ┌────────────── build time (SSG) ◀───────┘
                         ▼
             pages render from data/tours.ts
                         │
  browser ── BookingForm (RHF + shared rules) ── POST /api/bookings/ ──▶ Zod parse
                                                                        ▼
                                                bookingIssues(tour) + quote(tour) (server-side total)
                                                                        ▼
                                                     store.bookings.insert() → .data/bookings.json
                                                                        ▼
                                                  201 { reference } → /booking/ST-XXXXXX/
```

## Key decisions

1. **Server is the source of truth for price.** The client shows a live total, but the API recomputes
   it from `tours.json`; any `total` sent by the client is ignored. Unknown option keys are rejected.
2. **Shared validation.** `bookingIssues()` (date ≥ tomorrow, allowed weekdays, departure time,
   ≥1 guest) runs in the form *and* in the API, so the UI can't drift from the server rules.
3. **WhatsApp kept, but not the only path.** The reference books purely via WhatsApp. The clone
   stores a real booking first, then offers "Confirm faster on WhatsApp" with the reference number.
4. **Images are pluggable.** `imageSrc()` maps the reference's image paths to licensed placeholders
   by default; setting `NEXT_PUBLIC_IMAGE_BASE` switches to real photos (and turns on the Next image
   optimiser).
5. **No fake urgency.** Viewer counters / scarcity messages from the reference are omitted.
6. **Accessibility.** Native `<dialog>` for modals (focus trap + Esc), `<details>` FAQs, ARIA tabs,
   labelled counters, skip link, reduced-motion support, content visible without JS (`<noscript>`
   override for reveal animations).
7. **Security.** Zod validation on every input, honeypot field, per-IP rate limit, admin endpoints
   behind `Authorization: Bearer $ADMIN_TOKEN` (disabled when unset), JSON-LD escaped, security
   headers in `next.config.ts`, no secrets in client code.

## Configuration (env)

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical URLs, sitemap, JSON-LD |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | reference number | WhatsApp links |
| `NEXT_PUBLIC_PHONE_DISPLAY`, `NEXT_PUBLIC_CONTACT_EMAIL` | reference values | Displayed contacts |
| `NEXT_PUBLIC_IMAGE_BASE` | unset → placeholders | Base URL of licensed original photos |
| `DATA_DIR` | `.data` | Where bookings/messages JSON is stored |
| `ADMIN_TOKEN` | unset → admin API off | Enables `GET /api/bookings/` and `GET /api/contact/` |
| `RATE_LIMIT` | on | `off` disables the limiter (used by E2E tests) |

## Swapping the store for Supabase

Implement `insert / list / get` in `src/lib/server/store.ts` with the Supabase server client
(service-role key from a server-only env var) for tables `bookings` and `messages`; nothing else
changes.
