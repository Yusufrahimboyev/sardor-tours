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

export const destinations = [
  {
    num: '01',
    name: 'Sharm El Sheikh',
    path: '/sharm/',
    live: true,
    image: '/images/Sharm.webp',
    text: "The Red Sea's crown — world-class diving, desert safaris, island cruises and Mount Moses.",
    meta: 'Sea · Safari · Family',
  },
  {
    num: '02',
    name: 'Hurghada',
    live: false,
    image: '/images/Hurghada.webp',
    text: "Endless beaches, vibrant reefs and water sports along Egypt's mainland Red Sea coast.",
    meta: 'Beaches · Reefs',
  },
  {
    num: '03',
    name: 'Cairo',
    live: false,
    image: '/images/cairo-home.webp',
    text: 'The Pyramids of Giza, the Sphinx and the Grand Egyptian Museum — 5,000 years of history.',
    meta: 'History · Culture',
  },
  {
    num: '04',
    name: 'Marsa Alam',
    live: false,
    image: '/images/Marsa.webp',
    text: 'Untouched reefs, dolphin houses and pure, uncrowded diving in the deep south.',
    meta: 'Diving · Nature',
  },
] as const;

export const generalFaq = [
  {
    q: 'Where do you operate?',
    a: 'We run excursions from Sharm El Sheikh — Red Sea boat trips, desert safaris and day trips to Dahab, Cairo, Luxor and Petra. Hurghada, Cairo and Marsa Alam are coming soon.',
  },
  {
    q: 'Do I have to pay in advance?',
    a: 'For most excursions, no. Reserve your place in just a few minutes and pay on the day of your tour. Selected experiences such as flights, private tours and large groups may require a deposit.',
  },
  {
    q: 'Is hotel transfer included?',
    a: "Yes, return transfer from your hotel's main entrance is included in the price of every excursion.",
  },
  {
    q: 'How do I book?',
    a: "Open any excursion, choose a date, your hotel and the number of guests, and send the booking request. You'll get a booking reference straight away and our team confirms everything with you on WhatsApp.",
  },
  {
    q: 'Can I cancel?',
    a: 'Yes — standard bookings can be cancelled free of charge more than 24 hours before the start. See our Terms & Conditions for the exceptions.',
  },
  {
    q: 'How can I contact you?',
    a: 'Message us on WhatsApp, use the contact form, or send us an email — we usually reply within minutes.',
  },
];
