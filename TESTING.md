# TESTING

Run: `npm run test:e2e` (builds the app, starts it on :3200 with `DATA_DIR=.data-test`,
`RATE_LIMIT=off`, `ADMIN_TOKEN=test-admin-token`, runs Playwright in two projects).

## Latest result — 2026-11-08

```
58 passed (17.1m)   — desktop (1440×900) + mobile (Pixel 7)
```

Also green: `npm run typecheck`, `npm run lint` (0 errors, 0 warnings), `npm run build` (39 routes).

The server log prints `Error: Internal: NoFallbackError` twice; it comes from the deliberate 404 test
(`/en/sharm/does-not-exist/` with `dynamicParams = false`) and is Next.js's internal 404 signal, not a failure.

## Coverage

| Spec | What it checks |
|---|---|
| `pages.spec.ts` | Every static page returns 200, has an H1, title and meta description, no horizontal scroll, **no console errors**; all 23 tour pages render with TouristTrip JSON-LD; 404 page; robots.txt + sitemap contain all tours; **every internal link** found on 5 key pages returns < 400 |
| `catalog.spec.ts` | All tours listed; category filter; price filter + result count + clear; combined filters; filters restored from URL; hero search suggestions → navigation; no-result message; Enter filters list; card → detail page |
| `booking.spec.ts` | Full 3-step booking: required-field errors, time slots, guest requirement, live total (£55 → £40), name/phone validation, submission → confirmation page with reference, WhatsApp link contains reference, booking persisted with **server-computed** total; weekday rule (Mount Moses); CTA opens dialog and Esc closes it. API: server ignores client total, 400 for invalid/past/unknown option/honeypot, 404 for unknown tour, admin listing requires token |
| `ui.spec.ts` | Contact form validation + submission + persistence; home destinations, "coming soon" cards, FAQ accordion, mobile menu / desktop navigation; gallery arrows, counter, fullscreen viewer; included/not-included tabs; quick-nav search panel and contact dialog |

## Bugs found and fixed during testing

| Bug | Fix |
|---|---|
| Hero search suggestions rendered **under** the glass stats strip (couldn't be clicked) | `z-index` on the search form (`sharm.module.css`) |
| API calls hit a 308 redirect because of `trailingSlash: true` | Client calls `/api/bookings/` and `/api/contact/` |
| Placeholder images timed out in the Next image optimiser | Placeholders bypass the optimiser (`images.unoptimized` when `NEXT_PUBLIC_IMAGE_BASE` is unset) |
| `.onDark` class name used for two different things on the destination page | Renamed the price-pill state to `.onInk` |
| Mobile menu inside a `backdrop-filter` header was positioned relative to the header | Menu moved outside the header element |
| Duplicate review quotes (several tours share them) | `collectReviews()` de-duplicates |
| Rate limiter blocked the E2E run | `RATE_LIMIT=off` for tests |
| Test-side selector issues (hidden step panes, ambiguous labels/links) | Selectors fixed |

## Manual / visual checks
Desktop and 390px screenshots of home, destination and a tour page compared with the reference.
Not yet done: a Lighthouse run with real photos (placeholders are served from a
third-party CDN, so image scores would not be representative).
