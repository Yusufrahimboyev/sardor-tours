# FEATURES

Legend: ✅ working · 🟡 working with a documented substitute · ➕ added beyond the reference · ⛔ not implemented

## Pages
| Page | Status |
|---|---|
| Home `/` | ✅ |
| Destination `/en/sharm/` | ✅ |
| 23 tour pages `/en/sharm/<slug>/` | ✅ (statically generated) |
| About `/en/about-us/` | ✅ (initials avatars instead of staff photos) |
| Terms `/en/terms-and-conditions/` | ✅ |
| Videos `/en/sharm/video/` | 🟡 videos unavailable → "coming soon" + tour grid |
| Contact `/en/contact/` | ➕ contact form + messengers + offices |
| Booking confirmation `/booking/<ref>/` | ➕ |
| 404 page | ✅ |
| RU / IT / TR versions | ⛔ (see TODO) |

## Navigation
* ✅ Home header: transparent → solid on scroll, desktop links, burger + full-screen menu (Esc closes)
* ✅ Destination page: hero nav; floating bottom nav appears after the hero
* ✅ Tour pages: top quick-nav (Back / Home / Search / Contact / About), breadcrumbs
* ✅ Secondary pages: shared header with mobile menu
* ✅ Skip-to-content link, footer links, anchors (#destinations, #why, #contact, #tours, #faq)

## Catalogue & search
* ✅ Hero search with live suggestions (combobox), "no results" state; Enter filters the catalogue
* ✅ Search panel (bottom nav) over all tours
* ✅ Category filter pills, grouped sections with counts
* ➕ Price filter (Any / Under £30 / £30–100 / £100+), combinable with category + query
* ➕ Filters synced to the URL (`?cat=&price=&q=`) — shareable, footer category links use it
* ➕ Result count + "Clear filters", empty state
* ➕ `GET /api/tours/?q=&category=&price=` public JSON endpoint
* ✅ Bestseller slider (autoplay, dots, pauses on hover/touch, reduced-motion aware)

## Tour detail
* ✅ Swipe gallery: arrows, dots, counter, keyboard arrows; ➕ fullscreen viewer
* ✅ Schedule / duration / departure times, price rows with old price and discount badge
* ✅ Highlights, reviews carousel, itinerary timeline
* ✅ Included / Not included / What to bring tabs (ARIA tabs)
* ✅ FAQ accordion, destination cards, good-to-know cards, "Why choose us" bento, CTA, related tours
* ✅ JSON-LD: TouristTrip, BreadcrumbList, FAQPage

## Booking (real, server-backed)
* ✅ Desktop sticky sidebar form; ✅ mobile sticky price bar → bottom-sheet; ✅ "Book this tour" CTA opens the dialog
* ✅ Step 1: date (min tomorrow, **weekday rules** e.g. Mount Moses Sun/Wed/Fri, Petra Mon/Wed/Sat), departure time chips (when the tour has fixed slots), hotel name
* ✅ Step 2: ticket counters, extras counters, add-on toggles, live total
* ➕ Step 3: name, phone/WhatsApp, optional email + notes, price breakdown, deposit notice for prepaid tours
* ➕ `POST /api/bookings/`: Zod validation, tour rules, **server-side price**, honeypot, rate limit, persisted with reference `ST-XXXXXX`
* ➕ Confirmation page with summary + prefilled WhatsApp message containing the reference
* ✅ Inline field errors, shake animation, loading state, success/error toasts, network-error handling

## Contact
* ✅ Contact lightbox (WhatsApp / Instagram / Telegram) + ➕ link to the contact form
* ➕ Contact form (RHF + Zod), `POST /api/contact/`, success state, toasts
* ✅ Floating WhatsApp button (home) and "Need help?" bubble (other pages)

## Admin (minimal)
* ➕ `GET /api/bookings/`, `GET /api/contact/` with `Authorization: Bearer $ADMIN_TOKEN`

## SEO & performance
* ✅ Per-page titles/descriptions, canonicals, Open Graph/Twitter
* ✅ `sitemap.xml`, `robots.txt` (disallows `/api/`, `/booking/`), web manifest, SVG icon
* ✅ JSON-LD: TravelAgency, ItemList, FAQPage, TouristTrip, BreadcrumbList
* ✅ SSG for 33 pages, `next/font` (self-hosted fonts, no layout shift), `next/image` lazy loading with sizes, priority hero images
* ✅ Security headers (nosniff, frame options, referrer policy, permissions policy)

## Intentionally not reproduced
* ⛔ Random "N people viewing now" / "Only a few spots left" (fake urgency)
* ⛔ Full-screen page loader (adds up to 2.5 s before content is visible)
* ⛔ Fake review submission (hard-coded booking ref `2909`)
* ⛔ Google Tag Manager / analytics (no account; add when needed)
