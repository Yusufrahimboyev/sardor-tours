/**
 * Brand & contact configuration. Every brand-specific value lives here so the
 * clone can be re-branded (or pointed at a different business) in one place.
 * Contact values can be overridden with NEXT_PUBLIC_* env vars.
 */
export const site = {
  name: 'Sardor Tours',
  tagline: 'Egypt Excursions',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  description:
    'Day trips and excursions from Sharm El Sheikh — boat trips, desert safaris, Cairo, Luxor and Petra. No prepayment, hotel transfer included.',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '998932129905',
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY || '+998 93 212 99 05',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'rahimboyevyusuf13@gmail.com',
  /** Social links — set the env var to an empty string to hide one. */
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/androidcoder',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/rv_yusuff/',
  /**
   * Trust figures shown in the /en/sharm/ hero. Replace with YOUR business's real numbers —
   * publishing figures you can't back up is misleading advertising.
   */
  /** Office addresses listed in the footer's "Get in touch" column. Empty → a contact-form link is shown. */
  offices: [] as string[],
  /** Year the business started, shown as "Since 2015" under the brand name. Leave empty to show the tagline. */
  since: process.env.NEXT_PUBLIC_SINCE_YEAR || '',
  /** Platforms listed in the ratings card — only list ones where you really have reviews. */
  reviewPlatforms: ['Google', 'Tripadvisor', 'GetYourGuide'],
  stats: {
    rating: '4.9',
    travellers: '150,000+',
    /** Short form for the big faded number next to "What they say". */
    travellersShort: '150k',
    reviews: '2,131',
    years: '17+',
  },
} as const;

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Destination cards; their text lives in the messages under `home.destinations.<num>`. */
export const destinations = [
  { num: '01', live: true, path: '/sharm/', image: '/images/Sharm.webp' },
  { num: '02', live: false, image: '/images/Hurghada.webp' },
  { num: '03', live: false, image: '/images/cairo-home.webp' },
  { num: '04', live: false, image: '/images/Marsa.webp' },
] as const;
