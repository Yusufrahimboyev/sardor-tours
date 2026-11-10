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
