'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { CATEGORIES, seedTours, type Tour, type TourOption } from '@/data/tours';
import { requireAdmin } from '@/lib/server/auth';
import { deleteTour, getTour, listTours, nextTourId, saveTour } from '@/lib/server/tours';

export interface TourFormState {
  error?: string;
  saved?: boolean;
}

/** What the tour editor sends (one JSON field). Validated here — the client is never trusted. */
const editorSchema = z.object({
  active: z.boolean(),
  name: z.string().trim().min(3, 'Tur nomini yozing (kamida 3 harf).').max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Sahifa manzili faqat lotin harflari, raqamlar va "-" dan iborat bo‘lsin.'),
  title: z.string().trim().max(160),
  category: z.enum(['sea', 'safari', 'historical', 'family'], { message: 'Kategoriyani tanlang.' }),
  badge: z.string().trim().max(30),
  excerpt: z.string().trim().max(400),
  photos: z.array(z.string().trim().min(1)).max(60),
  prices: z
    .array(
      z.object({
        key: z.string().regex(/^[a-z0-9_]+$/i),
        label: z.string().trim().min(1, 'Har bir narx uchun nom yozing (masalan, "Kattalar").').max(80),
        price: z.number().min(0).max(100000),
        unit: z.string().trim().max(30),
        kind: z.enum(['counter', 'toggle']),
        group: z.enum(['guests', 'extras']),
        max: z.number().int().min(1).max(99).optional(),
      }),
    )
    .min(1, 'Kamida bitta narx qo‘shing.'),
  oldPrice: z.number().min(0).nullable(),
  priceUnit: z.string().trim().max(30),
  requiresDeposit: z.boolean(),
  duration: z.string().trim().max(40),
  days: z.array(z.number().int().min(0).max(6)),
  timeText: z.string().trim().max(60),
  timeSlots: z.array(z.string().trim().min(1).max(20)).max(12),
  highlights: z.array(z.string().trim().min(1).max(120)).max(12),
  included: z.array(z.string().trim().min(1).max(200)).max(40),
  notIncluded: z.array(z.string().trim().min(1).max(200)).max(40),
  bring: z.array(z.string().trim().min(1).max(200)).max(40),
  itinerary: z.array(z.object({ title: z.string().trim().min(1).max(120), text: z.string().trim().max(1500) })).max(30),
  faq: z.array(z.object({ q: z.string().trim().min(1).max(200), a: z.string().trim().max(1500) })).max(30),
  metaTitle: z.string().trim().max(160),
  metaDescription: z.string().trim().max(320),
});
export type TourEditorData = z.infer<typeof editorSchema>;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function scheduleText(days: number[]): string {
  if (!days.length || days.length === 7) return 'Daily';
  return days.map((d) => DAY_NAMES[d]).join(' · ');
}

function revalidateSite() {
  revalidatePath('/', 'layout');
}

/** Map editor data onto a full Tour, keeping fields the simple editor doesn't touch. */
function buildTour(d: TourEditorData, base: Tour, id: number): Tour {
  const keys = new Set<string>();
  const options: TourOption[] = d.prices.map((o) => {
    let key = o.key;
    for (let n = 2; keys.has(key); n++) key = `${o.key}_${n}`;
    keys.add(key);
    const free = o.price === 0;
    return {
      key,
      label: o.label,
      price: o.price,
      unit: free ? '' : o.unit,
      ...(free && base.options.find((option) => option.key === key)?.included ? { included: true } : {}),
      free,
      kind: o.kind,
      group: o.group,
      ...(o.max ? { max: o.max } : {}),
    };
  });
  const paidGuests = options.filter((o) => o.group === 'guests' && o.price > 0);
  const first = paidGuests[0]?.price ?? 0;
  const oldPrice = d.oldPrice && d.oldPrice > first ? d.oldPrice : null;
  const discount = oldPrice ? `−${Math.round(((oldPrice - first) / oldPrice) * 100)}%` : null;
  const days = [...new Set(d.days)].sort();
  const cover = d.photos[0] ?? base.cardImage;
  const cat = CATEGORIES.find((c) => c.key === d.category)!;

  return {
    ...base,
    id,
    active: d.active,
    slug: d.slug,
    name: d.name,
    title: d.title || d.name,
    category: d.category,
    categoryLabel: cat.label,
    badge: d.badge || null,
    excerpt: d.excerpt,
    duration: d.duration,
    detailDuration: d.duration,
    schedule: scheduleText(days),
    scheduleDays: days.length && days.length < 7 ? days : null,
    timeText: d.timeText || null,
    timeSlots: d.timeSlots,
    options,
    priceFrom: paidGuests.length ? Math.min(...paidGuests.map((o) => o.price)) : 0,
    priceUnit: d.priceUnit || null,
    heroPrices: paidGuests.map((o, i) => ({
      price: o.price,
      label: o.label,
      unit: o.unit === 'person' ? 'per person' : o.unit ? `per ${o.unit}` : null,
      oldPrice: i === 0 ? oldPrice : null,
      discount: i === 0 ? discount : null,
    })),
    bento: { ...base.bento, oldPrice, badge: discount },
    requiresDeposit: d.requiresDeposit,
    cardImage: cover,
    gallery: (d.photos.length ? d.photos : [cover]).map((src) => base.gallery.find((g) => g.src === src) ?? { src, w: 1200, h: 800 }),
    highlights: d.highlights,
    included: d.included,
    notIncluded: d.notIncluded,
    bring: d.bring,
    itinerary: d.itinerary,
    faq: d.faq,
    metaTitle: d.metaTitle || d.title || d.name,
    metaDescription: d.metaDescription || d.excerpt,
  };
}

export async function saveTourAction(previousSlug: string, _prev: TourFormState, f: FormData): Promise<TourFormState> {
  await requireAdmin();
  let data: TourEditorData;
  try {
    data = editorSchema.parse(JSON.parse(String(f.get('data') ?? '{}')));
  } catch (e) {
    return { error: e instanceof z.ZodError ? e.issues[0].message : 'Ma’lumotlarni o‘qib bo‘lmadi, sahifani yangilang.' };
  }
  const all = await listTours({ all: true });
  const base = all.find((t) => t.slug === previousSlug);
  if (!base) return { error: 'Bu tur o‘chirilgan.' };
  if (data.slug !== previousSlug && all.some((t) => t.slug === data.slug)) {
    return { error: `"${data.slug}" manzili boshqa turda band. Boshqa manzil yozing.` };
  }
  if (data.active && !data.prices.some((p) => p.group === 'guests' && p.price > 0)) {
    return { error: 'Turni saytda ko‘rsatish uchun kamida bitta pullik narx kerak (masalan, Kattalar — £25).' };
  }
  if (data.active && !data.photos.length) {
    return { error: 'Turni saytda ko‘rsatish uchun kamida bitta rasm yuklang.' };
  }

  await saveTour(buildTour(data, base, base.id), previousSlug);
  revalidateSite();
  if (data.slug !== previousSlug) redirect(`/admin/tours/${data.slug}/?saved=1`);
  return { saved: true };
}

/** A fresh, hidden tour with neutral content, ready to fill in. */
export async function createTourAction(): Promise<void> {
  await requireAdmin();
  const all = await listTours({ all: true });
  let slug = 'new-tour';
  for (let n = 2; all.some((t) => t.slug === slug); n++) slug = `new-tour-${n}`;
  const template = seedTours[0];
  const blank: Tour = {
    ...structuredClone(template),
    id: nextTourId(all),
    slug,
    name: 'Yangi tur',
    title: '',
    badge: null,
    featured: false,
    excerpt: '',
    duration: '',
    detailDuration: '',
    schedule: 'Daily',
    scheduleDays: null,
    timeText: null,
    timeSlots: [],
    priceFrom: 0,
    priceUnit: null,
    heroPrices: [],
    options: [{ key: 'adult', label: 'Adults', price: 0, unit: 'person', free: false, kind: 'counter', group: 'guests' }],
    highlights: ['English-speaking guide', 'Hotel transfer both ways', 'No prepayment', 'Book in 3 minutes'],
    itinerary: [],
    included: ['Hotel pick-up and drop-off', 'English-speaking guide'],
    notIncluded: [],
    bring: [],
    faq: [],
    infoHeading: 'About the Destination',
    destinationCards: [],
    goodToKnow: [],
    bento: {
      ...template.bento,
      priceKicker: 'Tour price',
      oldPrice: null,
      badge: null,
      priceText: 'Hotel transfer included. No prepayment — pay on the day.',
      programKicker: null,
      programNum: null,
      programText: null,
      ring: null,
      ringLabel: null,
    },
    cta: { heading: null, line1: 'Hotel transfer included', line2: 'No prepayment — pay on the day', chips: [] },
    related: template.related,
    gallery: [],
    cardImage: '',
    metaTitle: '',
    metaDescription: '',
    requiresDeposit: false,
    active: false,
  };
  await saveTour(blank, slug);
  redirect(`/admin/tours/${slug}/`);
}

export async function toggleTourActive(slug: string): Promise<void> {
  await requireAdmin();
  const t = await getTour(slug, { all: true });
  if (!t) return;
  await saveTour({ ...t, active: t.active === false });
  revalidateSite();
}

export async function deleteTourAction(slug: string): Promise<void> {
  await requireAdmin();
  await deleteTour(slug);
  revalidateSite();
  redirect('/admin/tours/');
}

export async function duplicateTourAction(slug: string): Promise<void> {
  await requireAdmin();
  const all = await listTours({ all: true });
  const src = all.find((t) => t.slug === slug);
  if (!src) return;
  let next = `${src.slug}-copy`;
  for (let n = 2; all.some((t) => t.slug === next); n++) next = `${src.slug}-copy-${n}`;
  await saveTour({ ...structuredClone(src), id: nextTourId(all), slug: next, name: `${src.name} (nusxa)`, active: false });
  redirect(`/admin/tours/${next}/`);
}
