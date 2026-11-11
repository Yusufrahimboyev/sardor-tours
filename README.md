# Sharm Tours — clone

A full re-implementation of [sharmtours.org](https://www.sharmtours.org/) (English version) in
Next.js 15 + TypeScript: home page, Sharm El Sheikh destination page with a searchable / filterable
catalogue, 23 tour pages, about, terms, contact and video pages — plus a **real booking backend**
(the reference only opens WhatsApp).

## Quick start

```bash
npm install
npm run dev            # http://localhost:3000
```

Production:

```bash
npm run build && npm start
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm run test:unit` | Unit tests |
| `npm run i18n:check` | Translation consistency checks (`--strict`, `--only=messages\|tours`) |
| `npm test` | Typecheck, lint, unit tests and strict translation checks |
| `npm run test:e2e` | Playwright (desktop + mobile); start the production server manually first |

Playwright uses the locally installed Google Chrome. Without Chrome run `npx playwright install chromium`
and `PW_CHANNEL= npm run test:e2e`.

## Languages

The site supports Uzbek (Latin), English and Russian. See
[Languages in ARCHITECTURE.md](ARCHITECTURE.md#languages) for URLs, routing, translation files,
adding text or a language, checks and the manual production-server setup for E2E tests.

## Configuration

Copy `.env.example` to `.env.local`. All variables are optional — see
[ARCHITECTURE.md](ARCHITECTURE.md#configuration-env). Important ones:

* `NEXT_PUBLIC_IMAGE_BASE` — the reference photos are **not** included (copyright). By default
  licensed placeholder photos are used. If you own/are licensed to use the original photos, point
  this at where they are hosted and every image switches over.
* `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_PHONE_DISPLAY`, `NEXT_PUBLIC_CONTACT_EMAIL` — contact details.
* `ADMIN_TOKEN` — enables `GET /api/bookings/` and `GET /api/contact/` (send `Authorization: Bearer <token>`).

Bookings and contact messages are stored as JSON in `.data/` (configurable with `DATA_DIR`).

## Documentation

* [AUDIT.md](AUDIT.md) — reference site analysis
* [ARCHITECTURE.md](ARCHITECTURE.md) — stack, structure, decisions
* [FEATURES.md](FEATURES.md) — feature list and status
* [IMPLEMENTATION.md](IMPLEMENTATION.md) — what was built, phase by phase
* [TESTING.md](TESTING.md) — test results
* [TODO.md](TODO.md) — remaining work
