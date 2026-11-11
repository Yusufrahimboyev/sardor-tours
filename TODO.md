# TODO

## Decisions needed from the owner

- [ ] **Photos & videos** — obtain licensed originals and set `NEXT_PUBLIC_IMAGE_BASE` (or copy them
      into `public/images/` and set it to the site URL). Until then placeholder photos are shown.
- [ ] **Brand & contact details** — confirm the WhatsApp number, email, logo and company name in
      `src/data/site.ts` / env vars belong to the business that will run this site.
- [ ] **Reviews** — connect a real review source (Google Places API, Trustindex, etc.) instead of the
      static quotes copied from the tour pages.
- [ ] Russian/Uzbek pages say "English-speaking guides" and "WhatsApp replies in English" — keep,
      or also offer Russian/Uzbek?
- [ ] Phone placeholder uses a UK number (+44) in all languages — switch to +998 for uz/ru?
- [ ] English text says free cancellation "up to 24 hours" in several places but the Terms say
      "more than 24 hours before" (uz/ru already follow the Terms).

## Product

- [ ] UZ/RU translations done — get a native-speaker review before launch (home page and booking form first)
- [ ] Hurghada, Cairo, Marsa Alam destination pages (data model already supports more destinations)
- [ ] Real excursion videos on `/en/sharm/video/`
- [ ] Online payment / deposits (Stripe Checkout) for tours flagged `requiresDeposit`
- [ ] Email / WhatsApp Business API notification to staff when a booking arrives
- [ ] Simple admin UI for bookings (currently JSON API behind `ADMIN_TOKEN`)
- [ ] Analytics + cookie consent (the reference uses GTM with Consent Mode v2)

## English source inconsistencies to fix (found during translation)

- [ ] Speed boat: "for 6 people" vs "up to 7".
- [ ] Quad safari: excerpt promises dinner and a show that are not in the itinerary/inclusions;
      duration 3 h vs 2.5 h.
- [ ] Red Canyon: duration 5 h vs 10 h; meta description promises a Jeep ride absent from the itinerary.
- [ ] Super safari: "5 in 1" but lists 4 activities.
- [ ] Several safari summaries imply camel/quad rides are included while the detailed sections say optional.
- [ ] Luxor: excerpt describes Cairo sights; return itinerary duplicated; child ages differ between FAQ and pricing.
- [ ] Grand Egyptian Museum tour: duration 17 h vs detail duration 26 h; "largest museum in the world" claim.
- [ ] Cairo/Luxor flight tours: "No prepayment" badge but the FAQ requires full payment.
- [ ] Cairo by bus: excerpt says "National Museum", itinerary says "Egyptian Museum".

## Technical

- [ ] Playwright's webServer build step hangs locally — investigate (tests currently need a manually started server)
- [ ] Replace the JSON-file store with Supabase/PostgreSQL before deploying to serverless hosting
- [ ] Shared (Redis/Upstash) rate limiter for multi-instance deployments
- [ ] Unit tests for `lib/pricing.ts`, `lib/catalog.ts`, `lib/validation.ts` (currently covered via E2E)
- [ ] Lighthouse CI budget in CI once real images are in place
- [ ] Re-run `scripts/research/*.py` when the reference content changes (paths inside the scripts point
      to the research scratch directory — adjust before reuse)
