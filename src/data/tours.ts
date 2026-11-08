import raw from './tours.json';

export type Category = 'sea' | 'safari' | 'historical' | 'family';

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
}

export const CATEGORIES: { key: Category; label: string; tag: string }[] = [
  { key: 'sea', label: 'Sea & Diving', tag: 'Discover the Red Sea' },
  { key: 'safari', label: 'Safari', tag: 'Breathe in the desert' },
  { key: 'historical', label: 'Historical', tag: 'Where history began' },
  { key: 'family', label: 'Entertainment', tag: 'Dive into the adventure' },
];

export const tours: Tour[] = raw as Tour[];

const bySlug = new Map(tours.map((t) => [t.slug, t]));

export function getTour(slug: string): Tour | undefined {
  return bySlug.get(slug);
}

export function tourHref(slug: string): string {
  return `/en/sharm/${slug}/`;
}

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

export const MIN_PRICE = Math.min(...tours.map((t) => t.priceFrom));

