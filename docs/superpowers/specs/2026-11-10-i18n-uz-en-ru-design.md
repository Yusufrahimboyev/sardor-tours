# Multi-language site: Uzbek, English, Russian — Design

- **Date:** 2026-11-10
- **Status:** Approved in conversation, awaiting written-spec review
- **Approach:** A — locale path segment, no i18n library

## 1. Goal and understanding

**What the owner said**
- Add Uzbek, English and Russian to the Sardor Tours site.
- All three languages are equal — no primary/secondary language.
- Claude translates everything (UI, pages and all 23 tours).
- Uzbek uses the **Latin** script.
- WhatsApp messages are written in the **customer's language**.

**Assumptions (confirmed through section approvals)**
- Existing `/en/...` URLs keep working unchanged (indexed, already shared).
- Bookings/contact behave the same in every language; prices stay in GBP (£).
- Admin endpoints and API responses (other than user-facing error text) stay English.

**Success criteria**
1. Every page, the booking form, validation errors, toasts and WhatsApp prefilled text appear in the selected language.
2. A language switcher on every page keeps the current path and query string.
3. Search engines see all three versions (`hreflang`, per-language sitemap entries).
4. `typecheck`, `lint`, `i18n:check` and the full E2E suite (existing + new i18n spec) pass.

## 2. Routing and URLs

### Structure

```
src/app/
  [lang]/                 uz | en | ru  (generateStaticParams, dynamicParams = false)
    layout.tsx            ROOT layout: <html lang={lang}>, fonts, ToastProvider, I18nProvider
    page.tsx              home (moved from (home)/page.tsx; HomeHeader + home.module.css move too)
    not-found.tsx         localized 404
    sharm/  sharm/[slug]/  sharm/video/  about-us/  contact/  terms-and-conditions/
    booking/[ref]/        moved from app/booking/[ref]
  api/                    unchanged, not localized
  sitemap.ts  robots.ts  manifest.ts
src/middleware.ts         redirect-only
```

- `src/app/layout.tsx`, `src/app/(home)/` and `src/app/not-found.tsx` are removed; their content moves under `[lang]/`.
- `[lang]/layout.tsx` validates `lang`; any other value (e.g. `/de/`) calls `notFound()`.

### Middleware (`src/middleware.ts`)

- Matcher excludes `/api`, `/_next`, and files with an extension (`icon.svg`, `sitemap.xml`, `robots.txt`, `manifest.webmanifest`).
- Runs only when the first path segment is **not** `uz`, `en` or `ru`:
  - `/` → `/{lang}/`
  - `/booking/ST-XXXXXX/` → `/{lang}/booking/ST-XXXXXX/` (references already sent to customers keep working)
  - any other unprefixed path → `/{lang}{path}`
- Language resolution order: `lang` cookie → `Accept-Language` (`uz*` → `uz`, `ru*` → `ru`) → `en`.
- Redirect status **307** (target depends on the visitor). Query string is preserved.

### Links

- One helper `localeHref(lang, path)` in `src/i18n/routing.ts` replaces every hard-coded `'/en/...'` string (16 files).
- `tourHref(slug)` becomes `tourHref(lang, slug)`.
- `BottomNav`'s active-item check compares against the localized path.

### Language switcher

- `LanguageSwitcher` client component: `UZ · EN · RU`, current language marked with `aria-current`.
- Placed in `SiteHeader`, `HomeHeader` (desktop nav + mobile menu) and the `BottomNav` pages.
- Replaces only the first path segment and keeps `location.search`
  (`/ru/sharm/quad-bike/?cat=safari` → `/uz/sharm/quad-bike/?cat=safari`).
- Sets cookie `lang=<code>; Path=/; Max-Age=31536000; SameSite=Lax`.

## 3. Content storage and loading

### UI / page copy — `src/i18n/messages/`

- `en.json` (source of truth), `uz.json`, `ru.json`.
- Namespaces: `common`, `nav`, `home`, `sharm`, `tour`, `booking`, `contact`, `about`, `terms`, `video`, `errors`, `client`.
- Typed: `type Messages = typeof en`; `uz`/`ru` are imported through a module that asserts `satisfies Messages`, so a missing key fails `tsc`.
- Interpolation: `{name}` placeholders.
- Plurals: object form `{ "one": "...", "few": "...", "many": "...", "other": "..." }`, chosen with `Intl.PluralRules(locale)`. RU uses one/few/many; UZ and EN use one/other.

### Tour content

- `src/data/tours.json` is reduced to language-independent fields: `id`, `slug`, `category`, `scheduleDays`, `timeSlots`, `priceFrom`, `heroPrices[].price/oldPrice`, `options[]` (key, price, free, kind, group, max), `gallery`, `cardImage`, `featured`, `related[].slug`, `requiresDeposit`, numeric bento fields.
- `src/data/tours.{en,uz,ru}.json`: map `slug → translatable fields` (name, title, excerpt, metaTitle, metaDescription, duration, detailDuration, schedule, timeText, priceUnit, badge, categoryLabel, heroPrices[].label/unit/discount, highlights, itinerary, included, notIncluded, bring, faq, infoHeading, destinationCards, goodToKnow, bento text fields, cta, related[].tag/name, options[].label/unit).
- `getTour(slug, lang)` returns the merged `Tour`; `getTourBase(slug)` returns the language-independent part.
- **Pricing and the booking API use only the base data**, so prices cannot diverge between languages.
- `CATEGORIES` labels/tags move into the dictionaries.
- `scripts/i18n-check.mjs` (`npm run i18n:check`): every language file has all 23 slugs, and every array has the same length as English.
- Slugs stay English in all languages.

### Server vs client

- Server components: `getMessages(lang)` + `createT(messages, lang)`. Page copy is never shipped to the browser.
- Client components: `I18nProvider` in `[lang]/layout.tsx` receives **only the `client` namespace for the current language**. `useT()` and `useLang()` hooks.

### Formatting — `src/i18n/format.ts`

- Locale tags: `uz` → `uz-Latn-UZ`, `en` → `en-GB`, `ru` → `ru-RU`.
- Dates and weekday names through `Intl.DateTimeFormat` (replaces the `WEEKDAYS` array in `lib/dates.ts`). Verify Node/Chrome ICU support for Uzbek during implementation. If output is missing or wrong, use a small built-in Uzbek month/weekday table.
- Prices: `£` + `Intl.NumberFormat(locale)` grouping.
- `tomorrowISO()` keeps its Cairo time-zone behaviour (unchanged).

## 4. Booking, validation and WhatsApp

### Validation

- `lib/validation.ts` schemas and `bookingIssues()` return **message keys** (with params) instead of English text, e.g. `errors.hotelRequired`, `errors.tourRunsOn` `{days}`.
- Client: `BookingForm` and `ContactForm` translate keys with `useT()`.
- API: request bodies gain `lang: z.enum(['uz','en','ru']).default('en')`. The routes translate keys server-side, so the response shape stays `{ ok, error, fieldErrors: { path: message } }`.

### Records

- `Booking` and `ContactMessage` gain `lang`. Records without it are treated as `en`.
- `Booking.tourName` stays the English (canonical) name for staff.

### Confirmation page

- After submitting, redirect to `/{lang}/booking/{ref}/`.
- The page renders in the URL's language (tour name, labels, dates from base + language data), whatever the booking's stored language is.

### WhatsApp text

- `BOOK_TOUR_MSG`, `PLAN_TRIP_MSG` and the booking summary move into the dictionaries and are written in the customer's language. The reference `ST-XXXXXX` and the English tour name (in brackets) are always included so staff can find the booking.

### Unchanged

- Prices, rate limiting, admin `GET` endpoints (English JSON).
- `/api/tours` gains optional `?lang=`, defaulting to `en`.

## 5. SEO

- Every page uses `generateMetadata({ params })`:
  - Localized `title`/`description`.
  - `alternates.canonical: /{lang}/…`.
  - `alternates.languages: { uz, en, ru, 'x-default': '/en/…' }`.
  - `openGraph.locale`: `uz_UZ` / `en_GB` / `ru_RU`.
- JSON-LD content is localized and has `inLanguage`.
- `sitemap.ts`: each page in all 3 languages, with `alternates.languages` (~87 URLs).
- `robots.ts`: disallow `/api/` and `/*/booking/`.

## 6. Testing

- `npm run typecheck` fails on missing UZ/RU keys.
- `npm run i18n:check` validates tour translation files.
- Existing E2E suite (58 tests) keeps running against `/en/` (paths updated only).
- New `tests/e2e/i18n.spec.ts`:
  - Every page in `uz`/`en`/`ru` renders with correct `<html lang>`, localized `<title>`, no console errors.
  - Middleware: `/` → cookie, then `Accept-Language`, then `en`. Legacy `/booking/ST-…` redirect. `/de/` → 404.
  - Switcher keeps path + query and sets the cookie.
  - Full booking in Russian: Russian validation error shown, booking succeeds, confirmation page in Russian, WhatsApp link text in Russian.
  - `hreflang` alternates present on a tour page.
- Unit-level check for RU plurals (1/2/5/21 → one/few/many/one) inside the i18n spec or the check script.
- Visual check: mobile 390px and desktop screenshots of header, bottom nav, booking form and tour cards in RU and UZ; fix overflow.
- Test runs start the production server manually first (the Playwright `webServer` build step currently hangs; tracked separately).

## 7. Translation process and quality

- Order: UI dictionary → page copy → tours in batches.
- Proper names, prices, times and slugs are never altered.
- Add a `TODO.md` item: native-speaker review of UZ and RU before launch, starting with home and booking form.

## 8. Out of scope

- Translated URL slugs.
- Currency switching.
- Languages beyond UZ/EN/RU (adding one later = one messages file + one tours file + one entry in the locale list).
- CMS / admin translation UI.
- Fixing the Playwright `webServer` hang.
