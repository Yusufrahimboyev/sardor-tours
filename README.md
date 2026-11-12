# Sardor Tours

Excursion website for Sharm El Sheikh in **English, Russian and Uzbek**, with online booking
requests and an admin panel (Uzbek UI). Next.js 15 (App Router) + TypeScript.

## Quick start

```bash
npm install
cp .env.example .env.local     # set ADMIN_PASSWORD to enable /admin
npm run dev                    # http://localhost:3000
```

Production: `npm run build && npm start`.

## Site structure

| URL | Page |
|---|---|
| `/` | redirects to `/en/`, `/ru/` or `/uz/` (remembered choice → browser language → English) |
| `/{lang}/` | Home: intro, advantages + video, excursions, how it works, reviews, feedback form |
| `/{lang}/tours/` · `/{lang}/tours/{slug}/` | Catalogue (category + search) · tour page with booking form |
| `/{lang}/about/` · `/{lang}/contacts/` · `/{lang}/terms/` | Company, contacts (per language), terms |
| `/{lang}/guide/` · `/{lang}/guide/{slug}/` | Travel guide articles |
| `/{lang}/booking/{ref}/` | Booking confirmation |
| `/admin/` | Admin panel |

Old URLs from the first version (`/en/sharm/…`, `/en/about-us/`, …) redirect permanently (308).

## Where things live

| What | Where |
|---|---|
| UI texts (menus, buttons, home/about/terms copy) | `src/i18n/dictionaries/{en,ru,uz}.ts` |
| Tours, articles, reviews, contacts, video | edited in **/admin**; stored in `DATA_DIR` (default `.data/`) |
| Initial tour data and translations | `src/data/tours.json`, `src/data/tours.i18n.json` |
| Initial guide articles | `src/data/articles.json` |
| Uploaded photos / videos | `DATA_DIR/uploads`, served from `/media/…` |

## Admin panel (`/admin`, password = `ADMIN_PASSWORD`)

Bookings (confirm / cancel, notes, WhatsApp the guest) · Tours (add, edit in EN/RU/UZ, photos,
prices, schedule, show/hide, delete) · Articles · Reviews · Messages · Settings (contacts per
language, home video).

## Environment

See `.env.example`. Required in production: `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`.

## Data storage — read before deploying

Data is kept in JSON files under `DATA_DIR` with a process-wide write lock. This is reliable on
**one Node.js server with a persistent disk** (VPS). It is **not** suitable for serverless hosting
(e.g. Vercel), where the disk is temporary — move bookings/tours/settings to a database and
uploads to object storage first. Back up `DATA_DIR` regularly.

## Tests

`npm run lint` · `npm run typecheck` · `npm run test:e2e` (builds, starts on :3200, runs Playwright
on desktop + mobile using the installed Google Chrome).

## Content to check

`CONTENT-ISSUES.md` lists inconsistencies in the original tour texts (prices, durations, payment
wording) found during translation.
