/**
 * Brand & contact configuration. Every brand-specific value lives here so the
 * clone can be re-branded (or pointed at a different business) in one place.
 * Contact values can be overridden with NEXT_PUBLIC_* env vars.
 */
export const site = {
  name: 'Sardor Tours',
  tagline: 'Egypt · Since 2009',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  description:
    'Family-run Egyptian tour operator since 2009. Excursions across Sharm El Sheikh, Hurghada, Cairo and Marsa Alam. No prepayment, hotel transfer included.',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '201227100446',
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? '+20 122 710 0446',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'info@sharmtours.org',
  telegram: 'https://t.me/sharmtoursaibot',
  instagram: 'https://www.instagram.com/sharm.tours/',
  offices: [
    {
      name: 'Old Market Office',
      address:
        'Opposite the main entrance of Al Khima Beach, next to The Wave diving centre, Old Market district, Sharm El Sheikh.',
    },
    { name: 'Dahab Mall Office', address: 'Near the Aqua Blu hotel, Dahab Mall, No. 1018, ground floor, Sharm El Sheikh.' },
    { name: 'Cairo Office', address: '40 Kambiz St, Nadi Al-Said, Dokki, Giza Governorate, Cairo.' },
  ],
  stats: { rating: '4.9', reviews: '2,131', travellers: '150,000+', years: 17, founded: 2009 },
} as const;

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const PLAN_TRIP_MSG = "Hello! I'd like to plan an Egypt trip";
export const BOOK_TOUR_MSG = "Hello! I'd like to book a tour.";

export const destinations = [
  {
    num: '01',
    name: 'Sharm El Sheikh',
    href: '/en/sharm/',
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
    a: "We're based in Sharm El Sheikh and Cairo, with Hurghada coming soon, and offer more than 100 carefully selected tours and experiences across Egypt.",
  },
  {
    q: 'What makes Sardor Tours different?',
    a: "We're more than a booking website. Many of our experiences are operated directly by our own team, including our boats, diving services, watersports, desert safaris and Cairo tours. By managing the experience ourselves, we maintain high standards of safety, quality and customer service from start to finish.",
  },
  {
    q: 'Why choose Sardor Tours?',
    a: "Since 2009, we've helped more than 150,000 travellers discover Egypt. With 17+ years of experience, local expertise, transparent pricing and friendly service, we're dedicated to creating unforgettable experiences for every guest.",
  },
  {
    q: 'Do I have to pay in advance?',
    a: 'For most excursions, no. Reserve your place in just a few minutes and pay on the day of your tour. Selected experiences such as flights, private tours and large groups may require a deposit.',
  },
  {
    q: 'Are you licensed and insured?',
    a: 'Yes. We hold all licences required to operate in Egypt. Every excursion is issued a daily tourist police permit, available only to licensed operators, ensuring your trip meets official safety and tourism regulations.',
  },
  {
    q: 'How do I book?',
    a: "Open any excursion, choose a date, your hotel and the number of guests, and send the booking request. You'll get a booking reference straight away and our team confirms everything with you on WhatsApp.",
  },
  {
    q: 'How can I contact you?',
    a: `Our team is available on WhatsApp 24/7 at ${site.phoneDisplay}. You can also reach us on Telegram and Instagram, use the contact form, or visit our offices in Old Market and Dahab Mall (Sharm El Sheikh) or Dokki (Cairo).`,
  },
];
