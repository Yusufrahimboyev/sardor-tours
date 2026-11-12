import type { Locale } from '../i18n/config';
import baseRaw from './tours.json';
import enText from './tours.en.json';
import uzText from './tours.uz.json';
import ruText from './tours.ru.json';

import type { Category } from './categories';

export { CATEGORIES, CATEGORY_KEYS, categoryList, categoryShort, tourHref, type Category } from './categories';

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
  /** Priced into the tour: shown as "Included" rather than "Free". Language-neutral. */
  included?: boolean;
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
  /** Hidden tours 404 publicly and can't be booked. Missing = visible. */
  active?: boolean;
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

export function minPrice(list: Pick<Tour, 'priceFrom'>[]): number {
  return list.length ? Math.min(...list.map((t) => t.priceFrom)) : 0;
}

/**
 * The bundled catalogue in English. It seeds the tour store the first time the site runs;
 * after that the store (editable in /admin/tours) is the source of truth: read tours on the
 * server with `listTours()` / `getTour()` from `@/lib/server/tours`.
 */
export const seedTours: Tour[] = allTours('en');

/** Keys whose values are identifiers or style tokens, never translated. */
const NOT_TEXT = new Set(['slug', 'key', 'kind', 'group', 'tone', 'src']);
/** Tour fields that hold visitor-facing text (everything in `TourText`). */
const TEXT_FIELDS = [
  'name', 'title', 'categoryLabel', 'duration', 'detailDuration', 'schedule', 'timeText', 'priceUnit', 'badge',
  'excerpt', 'metaTitle', 'metaDescription', 'heroPrices', 'highlights', 'itinerary', 'included', 'notIncluded',
  'bring', 'faq', 'infoHeading', 'destinationCards', 'goodToKnow', 'bento', 'cta', 'related', 'options',
] as const satisfies readonly (keyof Tour)[];

function collect(en: unknown, loc: unknown, into: Map<string, string>): void {
  if (typeof en === 'string') {
    if (typeof loc === 'string' && en && !into.has(en)) into.set(en, loc);
  } else if (Array.isArray(en)) {
    if (Array.isArray(loc)) en.forEach((v, i) => collect(v, loc[i], into));
  } else if (en && typeof en === 'object' && loc && typeof loc === 'object') {
    for (const [k, v] of Object.entries(en)) if (!NOT_TEXT.has(k)) collect(v, (loc as Record<string, unknown>)[k], into);
  }
}

const phraseCache = new Map<string, Map<string, string>>();

/** English phrase → translation, from one tour's text (or from every tour when `slug` is null). */
function phrases(lang: Locale, slug: string | null): Map<string, string> {
  const key = `${lang}/${slug ?? '*'}`;
  let m = phraseCache.get(key);
  if (!m) {
    m = new Map();
    for (const s of slug ? [slug] : tourSlugs) collect(textByLang.en[s], textByLang[lang]?.[s], m);
    phraseCache.set(key, m);
  }
  return m;
}

function translate(v: unknown, en: unknown, loc: unknown, own: Map<string, string>, all: Map<string, string>): unknown {
  if (typeof v === 'string') return v === en && typeof loc === 'string' ? loc : own.get(v) ?? all.get(v) ?? v;
  if (Array.isArray(v)) return v.map((x, i) => translate(x, Array.isArray(en) ? en[i] : undefined, Array.isArray(loc) ? loc[i] : undefined, own, all));
  if (v && typeof v === 'object') {
    const source = en && typeof en === 'object' ? en as Record<string, unknown> : {};
    const translated = loc && typeof loc === 'object' ? loc as Record<string, unknown> : {};
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, NOT_TEXT.has(k) ? x : translate(x, source[k], translated[k], own, all)]));
  }
  return v;
}

/**
 * Translates a tour from the store (kept in English, editable in the admin panel) into `lang`.
 * Every phrase that still matches the bundled English text is swapped for its bundled
 * translation; text an admin has rewritten or added stays as written until it is translated.
 */
export function localizeTour(tour: Tour, lang: Locale): Tour {
  if (lang === 'en') return tour;
  const own = phrases(lang, tourSlugs.includes(tour.slug) ? tour.slug : null);
  const all = phrases(lang, null);
  const out: Record<string, unknown> = { ...tour };
  const english = getTour(tour.slug, 'en');
  const translated = getTour(tour.slug, lang);
  for (const f of TEXT_FIELDS) out[f] = translate(tour[f], english?.[f], translated?.[f], own, all);
  return out as unknown as Tour;
}

