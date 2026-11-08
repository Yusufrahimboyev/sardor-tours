# TODO

## Needs a decision / input from the owner
- [ ] **Photos & videos** — obtain licensed originals and set `NEXT_PUBLIC_IMAGE_BASE` (or copy them
      into `public/images/` and set it to the site URL). Until then placeholder photos are shown.
- [ ] **Brand & contact details** — confirm the WhatsApp number, email, logo and company name in
      `src/data/site.ts` / env vars belong to the business that will run this site.
- [ ] **Reviews** — connect a real review source (Google Places API, Trustindex, etc.) instead of the
      static quotes copied from the tour pages.

## Product
- [ ] RU / IT / TR translations (`next-intl` or route groups per locale + `hreflang`)
- [ ] Hurghada, Cairo, Marsa Alam destination pages (data model already supports more destinations)
- [ ] Real excursion videos on `/en/sharm/video/`
- [ ] Online payment / deposits (Stripe Checkout) for tours flagged `requiresDeposit`
- [ ] Email / WhatsApp Business API notification to staff when a booking arrives
- [ ] Simple admin UI for bookings (currently JSON API behind `ADMIN_TOKEN`)
- [ ] Analytics + cookie consent (the reference uses GTM with Consent Mode v2)

## Technical
- [ ] Replace the JSON-file store with Supabase/PostgreSQL before deploying to serverless hosting
- [ ] Shared (Redis/Upstash) rate limiter for multi-instance deployments
- [ ] Unit tests for `lib/pricing.ts`, `lib/catalog.ts`, `lib/validation.ts` (currently covered via E2E)
- [ ] Lighthouse CI budget in CI once real images are in place
- [ ] Re-run `scripts/research/*.py` when the reference content changes (paths inside the scripts point
      to the research scratch directory — adjust before reuse)
