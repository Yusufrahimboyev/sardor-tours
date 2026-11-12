import raw from './tours.json';
import translations from './tours.i18n.json';

import type { Category } from './categories';
export { CATEGORIES, tourHref, type Category } from './categories';

export interface TourOption {
  key: string;
  label: string;
  /** Price in GBP per unit (0 = free / included). */
  price: number;
  unit: string;
  free: boolean;
  /** counter = quantity stepper; toggle = flat add-on (on/off). */
  kind: 'counter' | 'toggle';
  /** guests = main tickets (at least one required); extras = add-ons. */
  group: 'guests' | 'extras';
  max?: number;
}

export interface HeroPrice {
  price: number;
  label: string;
  unit: string | null;
  oldPrice: number | null;
  discount: string | null;
}

export interface Tour {
  id: number;
  slug: string;
  name: string;
  title: string;
  category: Category;
  categoryLabel: string;
  duration: string;
  /** Duration as stated on the tour page (can differ from the listing card). */
  detailDuration: string;
  schedule: string;
  /** Allowed weekdays (0 = Sunday). null = any day. */
  scheduleDays: number[] | null;
  timeText: string | null;
  timeSlots: string[];
  priceFrom: number;
  priceUnit: string | null;
  badge: string | null;
  featured: boolean;
  excerpt: string;
  cardImage: string;
  metaTitle: string;
  metaDescription: string;
  heroPrices: HeroPrice[];
  highlights: string[];
  itinerary: { title: string; text: string }[];
  included: string[];
  notIncluded: string[];
  bring: string[];
  faq: { q: string; a: string }[];
  infoHeading: string;
  destinationCards: { tag: string; title: string; text: string; tone: string | null }[];
  goodToKnow: { title: string; text: string; tone: string | null }[];
  bento: {
    priceKicker: string | null;
    oldPrice: number | null;
    badge: string | null;
    priceText: string | null;
    programKicker: string | null;
    programNum: string | null;
    programText: string | null;
    ring: string | null;
    ringLabel: string | null;
  };
  cta: { heading: string | null; line1: string; line2: string; chips: string[] };
  related: { slug: string; tag: string; name: string }[];
  gallery: { src: string; w: number; h: number }[];
  options: TourOption[];
  requiresDeposit: boolean;
  /** Hidden tours 404 publicly and can't be booked. Missing = visible. */
  active?: boolean;
  /** Russian / Uzbek texts. Missing fields fall back to the English ones above. */
  i18n?: Partial<Record<'ru' | 'uz', TourTranslation>>;
}

/** Translatable tour texts (same shapes as the English fields). */
export interface TourTranslation {
  name?: string;
  title?: string;
  excerpt?: string;
  duration?: string;
  detailDuration?: string;
  schedule?: string;
  timeText?: string;
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  bring?: string[];
  itinerary?: { title: string; text: string }[];
  faq?: { q: string; a: string }[];
  infoHeading?: string;
  destinationCards?: { tag: string; title: string; text: string }[];
  goodToKnow?: { title: string; text: string }[];
  /** option key → label */
  options?: Record<string, string>;
  metaTitle?: string;
  metaDescription?: string;
}

/** Tour with texts in the requested language (English where a translation is missing). */
export function localizeTour(t: Tour, locale: 'en' | 'ru' | 'uz'): Tour {
  if (locale === 'en') return t;
  const tr = t.i18n?.[locale];
  if (!tr) return t;
  const pick = <K extends keyof TourTranslation & keyof Tour>(k: K) => {
    const v = tr[k];
    return v === undefined || v === '' || (Array.isArray(v) && v.length === 0) ? t[k] : v;
  };
  const mergeArr = <T,>(base: T[], loc: Partial<T>[] | undefined) =>
    loc && loc.length === base.length ? base.map((b, i) => ({ ...b, ...loc[i] })) : base;
  return {
    ...t,
    name: pick('name') as string,
    title: pick('title') as string,
    excerpt: pick('excerpt') as string,
    duration: pick('duration') as string,
    detailDuration: pick('detailDuration') as string,
    schedule: pick('schedule') as string,
    timeText: pick('timeText') as string | null,
    highlights: pick('highlights') as string[],
    included: pick('included') as string[],
    notIncluded: pick('notIncluded') as string[],
    bring: pick('bring') as string[],
    itinerary: pick('itinerary') as Tour['itinerary'],
    faq: pick('faq') as Tour['faq'],
    infoHeading: pick('infoHeading') as string,
    destinationCards: mergeArr(t.destinationCards, tr.destinationCards),
    goodToKnow: mergeArr(t.goodToKnow, tr.goodToKnow),
    metaTitle: pick('metaTitle') as string,
    metaDescription: pick('metaDescription') as string,
    options: t.options.map((o) => ({ ...o, label: tr.options?.[o.key] || o.label })),
    heroPrices: t.heroPrices.map((h) => {
      const o = t.options.find((x) => x.label === h.label);
      return o && tr.options?.[o.key] ? { ...h, label: tr.options[o.key] } : h;
    }),
  };
}


/**
 * The original catalogue. Used to seed the tour store the first time the site runs;
 * after that the store (editable in /admin/tours) is the source of truth — read tours
 * on the server with `listTours()` / `getTour()` from `@/lib/server/tours`.
 */
export const seedTours: Tour[] = (raw as Tour[]).map((t) => {
  const tr = (translations as Record<string, Tour['i18n']>)[t.slug];
  return tr ? { ...t, i18n: tr } : t;
});


export const BESTSELLERS: { slug: string; tag: string; image: string }[] = [
  { slug: 'white-island-ras-mohamed', tag: 'Sea', image: '/images/white-island02.webp' },
  { slug: 'quad-safari-sharm', tag: 'Safari', image: '/images/quad01.webp' },
  { slug: 'vip-boat-white-island-ras-mohamed', tag: 'Sea', image: '/images/Vip-boat01.webp' },
  { slug: 'cairo-pyramids-by-bus', tag: 'History', image: '/images/cairo-bus08.webp' },
  { slug: 'red-canyon-jeep-dahab', tag: 'Safari', image: '/images/slama01.webp' },
];

/** Lightweight shape sent to client components (search, listing). */
export interface TourSummary {
  slug: string;
  name: string;
  category: Category;
  categoryLabel: string;
  duration: string;
  schedule: string;
  priceFrom: number;
  priceUnit: string | null;
  badge: string | null;
  excerpt: string;
  cardImage: string;
}

export function toSummary(t: Tour): TourSummary {
  return {
    slug: t.slug,
    name: t.name,
    category: t.category,
    categoryLabel: t.categoryLabel,
    duration: t.duration,
    schedule: t.schedule,
    priceFrom: t.priceFrom,
    priceUnit: t.priceUnit,
    badge: t.badge,
    excerpt: t.excerpt,
    cardImage: t.cardImage,
  };
}

export function minPrice(list: Pick<Tour, 'priceFrom'>[]): number {
  return list.length ? Math.min(...list.map((t) => t.priceFrom)) : 0;
}

