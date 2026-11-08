# AUDIT — Reference site analysis (sharmtours.org)

Researched on 2026-11-08 by fetching every English URL in the site's `sitemap.xml`
(28 URLs), parsing the HTML/CSS/JS, and taking full-page desktop (1440px) and mobile
(390px) screenshots with headless Chrome.

## 1. Technology of the reference

| Aspect | Finding |
|---|---|
| Rendering | Hand-written static HTML per page; all CSS inline in `<style>`; vanilla JS in inline `<script>` |
| Fonts | Plus Jakarta Sans (home, destination, about); Inter + Poppins (tour pages) |
| 3rd-party | Google Tag Manager + Consent Mode v2, Trustindex reviews widget, flatpickr date picker |
| Backend | None visible. Every "Book"/"Contact" action opens a prefilled `wa.me` WhatsApp link |
| i18n | EN / RU / IT / TR copies of each page (`/ru/`, `/it/`, `/tr/`), `hreflang` alternates |
| SEO | Canonicals, OG/Twitter tags, `TravelAgency`, `ItemList`, `FAQPage`, `TouristTrip` JSON-LD, sitemap.xml, robots.txt |

## 2. Site map (EN)

```
/                               Home — dark theme, 4 destinations (only Sharm is live)
/en/sharm/                      Destination page — light theme, catalogue of 23 tours
/en/sharm/<slug>/  × 23         Tour detail pages
/en/sharm/video/                Excursion videos (video grid, saved list, search)
/en/about-us/                   About the company, team, offices
/en/terms-and-conditions/       Booking, payment & cancellation terms
```

Hurghada / Cairo / Marsa Alam cards are "Coming soon" (not links).

## 3. Design system

| Token | Value |
|---|---|
| Primary orange | `#FF6B00`, gradient to `#FF9500` |
| Dark background (home) | `#050A1A`, cards `#0F1830`, footer `#040814` |
| Light ink | `#0A1628` (destination), `#081A4E` (tour pages) |
| Muted text | `#5A6A85`; lines `#E4EAF5`; soft bg `#F4F7FF` |
| Success / WhatsApp | `#1DB88A` / `#25D366` |
| Radii | 14px buttons, 16–24px cards, 32px tour cards, pills 50px |
| Max width | 1240px content (1440px on tour pages), padding `clamp(16–20px, 4–5vw, 64–72px)` |
| Motion | Scroll reveal (fade + 28px rise), hero slow-zoom, WhatsApp pulse, count-up stats, marquee, card hover lift |

## 4. Page-by-page

### Home (`/`)
Fixed transparent header → blurred solid after 40px scroll; burger + full-screen menu ≤880px.
Hero (video background, live-dot tag, gradient-text H1, 2 CTAs, 4 trust stats, scroll cue) ·
Destinations 2×2 grid (badge Live / Coming soon) · Reviews (Trustindex widget) · "Why us" 4 cards +
language chips · FAQ (7 `<details>`) · Orange CTA band · Footer (4 columns) · floating WhatsApp
avatar that rotates support-agent photos. A full-screen page loader shows for up to 2.5s.

### Destination (`/en/sharm/`)
Full-height video hero with search box (live suggestions dropdown), avatar stats strip ·
two-column layout with a **sticky "Book a Tour" panel** on desktop · 6 benefits · Reviews head +
marquee + widget · Bestseller slider with dots · **Tour catalogue** rendered from a JS `TOURS`
array, grouped by category with category filter pills · rating card (Google / Tripadvisor /
GetYourGuide) · FAQ · "No compromises" 7 numbered rows · "Three steps" · orange count-up stats band ·
animated flight-route map · CTA · footer · **floating bottom navigation** (Home / Search panel /
Contact lightbox / Videos / About) that appears after the hero · "Need help?" WhatsApp bubble.

### Tour detail (`/en/sharm/<slug>/`)
Top quick-nav bar (Back / Search / Home / Contact / About) · swipe gallery (13–42 photos, arrows,
dots, counter) · title card with schedule / duration / departure times · price rows (price, label,
old price, −% badge) · 4 highlight chips · auto-scrolling reviews · itinerary timeline ·
Included / Not included / What to bring tabs · reviews widget · FAQ · "About this experience"
cards + "Good to know" cards · "Why choose us" bento (price, programme ring, 17+ years) · orange
CTA · related tours slider · light footer.
**Booking UI** exists three times (desktop sidebar 2-step Date→Guests, mobile sticky footer → modal,
fixed panel): date (flatpickr, min = tomorrow), hotel name (required), optional departure-time
chips, counters per ticket type and extras, toggles (private ride/transfer), live total →
"Book on WhatsApp" builds a WhatsApp message. Shows "N people viewing now" (random number).

### About, Terms, Video
About: hero with glass info cards, stats bar, story + founder quote, 10-person team grid,
6 reasons, FAQ, 3 offices, reviews, CTA. Terms: numbered sections, payment methods, refund table.
Video: category chips, vertical video cards, saved-items panel.

## 5. Functional inventory

| Feature | Reference behaviour |
|---|---|
| Navigation | Anchor links, burger menu, floating/top quick-nav |
| Search | Client-side substring match over tour names + category labels (hero dropdown + search panel) |
| Category filter | Pills hide/show category sections |
| Price filter | **Not present** |
| Booking | Client-only; validates date + hotel, opens WhatsApp — **no server, no record** |
| Contact | WhatsApp / Telegram / Instagram links (lightbox) — **no form** |
| Reviews | Third-party widget; static review quotes on tour pages |
| Review submission | Fake — accepts only the hard-coded booking ref `2909`, stores in localStorage |

## 6. Assumptions & items we could not reproduce faithfully

* **Photos, videos, logo, team photos** belong to the operator and are not licensed for reuse →
  replaced by placeholder photos (see `src/lib/images.ts`), an SVG logo mark and initials avatars.
* **Trustindex widget** content is third-party → replaced by the review quotes published on the tour
  pages themselves.
* **"N people viewing now"** and **"Only a few spots left"** are randomly generated urgency signals
  in the reference → **not reproduced** (rule: don't present fake data as real).
* **RU / IT / TR** translations → out of scope for this iteration (see `TODO.md`).
* **Video page** videos are not available → honest "coming soon" state that still lists every tour.
* Card ratings for tours without an explicit rating use the same fallback list the reference uses.
