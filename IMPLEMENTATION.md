# IMPLEMENTATION

## Phase 1–2 · Research & audit
* Pulled `sitemap.xml` (112 URLs, 28 in English) and fetched every English page.
* Extracted design tokens and component CSS from the inline styles; captured desktop/mobile
  screenshots of home, destination, a tour page, about and terms for visual comparison.
* Wrote `scripts/research/scrape.py` (BeautifulSoup) to extract, per tour: title, meta, schedule,
  duration, departure times, price rows, highlights, reviews, itinerary, included / not included /
  bring lists, FAQ, destination & good-to-know cards, bento copy, CTA copy, related tours, gallery
  and booking options (with prices from the booking scripts).
* `scripts/research/convert.py` merges that with the catalogue array (`TOURS`) from the destination
  page and normalises it into `src/data/tours.json` (23 tours). Manual fixes: private yacht and
  speed boat priced per boat/hour; weekday rules derived from schedules; option groups
  (guests vs extras) derived from labels.
* Findings in [AUDIT.md](AUDIT.md).

## Phase 3 · Architecture
Next.js App Router, CSS Modules, RHF + Zod, JSON-file store, Playwright — see
[ARCHITECTURE.md](ARCHITECTURE.md).

## Phase 4 · UI
* Global tokens + shared components: Brand mark, Footer (dark/light, home/destination variants),
  CTA band, Modal (native `<dialog>`), Toast, BottomNav (floating or top bar), SupportWidget,
  ContactOptions, TourCard, ReviewsCarousel, TrustMarquee, FaqList, CountUp, RevealObserver, JsonLd.
* Pages ported section-by-section from the reference CSS: Home (dark), Destination (light,
  two-column with sticky panel), Tour detail (gallery, hero card, itinerary, tabs, info, bento, CTA,
  related, sidebar), About, Terms, Video, Contact, Booking confirmation, 404.
* Replacements for non-licensed assets: SVG logo mark, initials avatars, placeholder photos.

## Phase 5 · Functionality
* Catalogue: shared pure `filterTours()` used by the UI and `GET /api/tours/`; URL-synced filters.
* Booking: 3-step form, shared `bookingIssues()` + `quote()`; `POST /api/bookings/` validates,
  recomputes price, persists, returns `ST-XXXXXX`; confirmation page reads it back.
* Contact: form + `POST /api/contact/`.
* Hardening: honeypot, rate limit, admin token, security headers, escaped JSON-LD.

## Phase 6 · Responsive
Breakpoints follow the reference (1100 / 880 / 760 / 560 / 420px). Mobile-specific UX: sticky
booking bar + bottom-sheet, top quick-nav on tour pages, floating nav on destination page,
full-screen menus, single-column cards, centred hero. Verified with 390px screenshots and the
"no horizontal scroll" E2E assertion on every page in the mobile project.

## Phase 7 · Testing
Playwright suites in `tests/e2e/` (pages, catalogue, booking UI + API, contact, gallery, tabs,
quick-nav) on desktop and Pixel 7 viewports. Results and fixes in [TESTING.md](TESTING.md).

## Phase 8 · Polish
Side-by-side screenshot comparison with the reference (home, destination, tour page); fixed
review duplication, detail-page duration source, API trailing-slash redirects, a CSS class clash
(`.onDark`), modal/menu containing-block issue (menu moved out of the blurred header) and image
optimiser timeouts for placeholder photos (they now bypass the optimiser).

## Deviations from the reference (deliberate)
| Reference | Clone | Why |
|---|---|---|
| Booking = WhatsApp message only | Stored booking + reference + optional WhatsApp | Prompt requires a working booking flow |
| Random "viewing now" / scarcity | Removed | Don't present fake data as real |
| 2.5 s page loader | Removed | Performance / LCP |
| Video backgrounds | Image backgrounds | Videos not licensed |
| Trustindex widget | Review quotes from the tour pages | 3rd-party widget |
| No price filter / contact form | Added | Prompt requirements |
