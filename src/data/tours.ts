import type { Locale } from '../i18n/config';
import baseRaw from './tours.json';
import enText from './tours.en.json';
import uzText from './tours.uz.json';
import ruText from './tours.ru.json';

import type { Category } from './categories';

export { CATEGORY_KEYS, categoryList, categoryShort, tourHref, type Category } from './categories';

export interface TourOptionBase {
  key: string;
  /** Price in GBP per unit (0 = free / included). */
  price: number;
  free: boolean;
  /** counter = quantity stepper; toggle = flat add-on (on/off). */
  kind: 'counter' | 'toggle';
  /** guests = main tickets (at least one required); extras = add-ons. */
  group: 'guests' | 'extras';
  max?: number;
}
export interface TourOptionText {
  label: string;
  unit: string;
}
export type TourOption = TourOptionBase & TourOptionText;

export interface HeroPrice {
  price: number;
  label: string;
  unit: string | null;
  oldPrice: number | null;
  discount: string | null;
}

/** Language-independent fields (prices, schedule, media). */
export interface TourBase {
  id: number;
  slug: string;
  category: Category;
  /** Allowed weekdays (0 = Sunday). null = any day. */
  scheduleDays: number[] | null;
  timeSlots: string[];
  priceFrom: number;
  featured: boolean;
  cardImage: string;
  heroPrices: { price: number; oldPrice: number | null }[];
  related: { slug: string }[];
  gallery: { src: string; w: number; h: number }[];
  options: TourOptionBase[];
  bento: { oldPrice: number | null };
  requiresDeposit: boolean;
}

/** Translatable fields, one record per language and slug. */
export interface TourText {
  name: string;
  title: string;
  categoryLabel: string;
  duration: string;
  /** Duration as stated on the tour page (can differ from the listing card). */
  detailDuration: string;
  schedule: string;
  timeText: string | null;
  priceUnit: string | null;
  badge: string | null;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  heroPrices: { label: string; unit: string | null; discount: string | null }[];
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
    badge: string | null;
    priceText: string | null;
    programKicker: string | null;
    programNum: string | null;
    programText: string | null;
    ring: string | null;
    ringLabel: string | null;
  };
  cta: { heading: string | null; line1: string; line2: string; chips: string[] };
  related: { tag: string; name: string }[];
  options: TourOptionText[];
}

export type Tour = Omit<TourBase, 'heroPrices' | 'related' | 'options' | 'bento'> &
  Omit<TourText, 'heroPrices' | 'related' | 'options' | 'bento'> & {
    heroPrices: HeroPrice[];
    related: { slug: string; tag: string; name: string }[];
    options: TourOption[];
    bento: TourBase['bento'] & TourText['bento'];
  };

const baseTours = baseRaw as unknown as TourBase[];
const textByLang = { en: enText, uz: uzText, ru: ruText } as unknown as Record<Locale, Record<string, TourText>>;

const baseBySlug = new Map(baseTours.map((t) => [t.slug, t]));

export const tourSlugs: string[] = baseTours.map((t) => t.slug);

export function getTourBase(slug: string): TourBase | undefined {
  return baseBySlug.get(slug);
}

function merge(b: TourBase, x: TourText): Tour {
  return {
    ...b,
    ...x,
    heroPrices: b.heroPrices.map((h, i) => ({ ...h, ...x.heroPrices[i] })),
    related: b.related.map((r, i) => ({ ...r, ...x.related[i] })),
    options: b.options.map((o, i) => ({ ...o, ...x.options[i] })),
    bento: { ...b.bento, ...x.bento },
  };
}

const cache = new Map<string, Tour>();

export function getTour(slug: string, lang: Locale): Tour | undefined {
  const key = `${lang}/${slug}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const b = baseBySlug.get(slug);
  const x = textByLang[lang]?.[slug];
  if (!b || !x) return undefined;
  const t = merge(b, x);
  cache.set(key, t);
  return t;
}

export function allTours(lang: Locale): Tour[] {
  return tourSlugs.map((s) => getTour(s, lang)!);
}

export const BESTSELLERS: { slug: string; category: Category; image: string }[] = [
  { slug: 'white-island-ras-mohamed', category: 'sea', image: '/images/white-island02.webp' },
  { slug: 'quad-safari-sharm', category: 'safari', image: '/images/quad01.webp' },
  { slug: 'vip-boat-white-island-ras-mohamed', category: 'sea', image: '/images/Vip-boat01.webp' },
  { slug: 'cairo-pyramids-by-bus', category: 'historical', image: '/images/cairo-bus08.webp' },
  { slug: 'red-canyon-jeep-dahab', category: 'safari', image: '/images/slama01.webp' },
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

export const MIN_PRICE = Math.min(...baseTours.map((t) => t.priceFrom));

