import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { seedTours, localizeTour, type Tour } from '@/data/tours';

import type { Locale } from '@/i18n/config';

/**
 * Tour repository. Tours live in DATA_DIR/tours.json; until an admin saves the
 * first change, the bundled catalogue (src/data/tours.json) is used as-is.
 * Like the bookings store, this is a single-file store for one Node server —
 * swap the read/write functions for a database when hosting on serverless.
 */
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'tours.json');

let cache: { mtimeMs: number; tours: Tour[] } | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function readAll(): Promise<Tour[]> {
  let stat;
  try {
    stat = await fs.stat(FILE);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return seedTours;
    throw e;
  }
  if (cache && cache.mtimeMs === stat.mtimeMs) return cache.tours;
  const tours = JSON.parse(await fs.readFile(FILE, 'utf8')) as Tour[];
  cache = { mtimeMs: stat.mtimeMs, tours };
  return tours;
}

async function writeAll(tours: Tour[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(tours, null, 1));
  await fs.rename(tmp, FILE);
  cache = null;
}

function mutate<R>(fn: (tours: Tour[]) => { tours: Tour[]; result: R }): Promise<R> {
  const run = queue.then(async () => {
    const { tours, result } = fn(structuredClone(await readAll()));
    await writeAll(tours);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

const isActive = (t: Tour) => t.active !== false;

/** Public catalogue (visible tours only) unless `all` is set. */
export async function listTours(opts: { lang?: Locale; all?: boolean } = {}): Promise<Tour[]> {
  const tours = await readAll();
  return (opts.all ? tours : tours.filter(isActive)).map((tour) => opts.lang && opts.lang !== 'en' ? localizeTour(tour, opts.lang) : tour);
}

export async function getTour(slug: string, opts: { lang?: Locale; all?: boolean } = {}): Promise<Tour | undefined> {
  const t = (await readAll()).find((x) => x.slug === slug);
  return t && (opts.all || isActive(t)) ? (opts.lang && opts.lang !== 'en' ? localizeTour(t, opts.lang) : t) : undefined;
}

/** Insert or replace by slug. `previousSlug` lets an admin rename a tour's URL. */
export function saveTour(tour: Tour, previousSlug = tour.slug): Promise<Tour> {
  return mutate((tours) => {
    const i = tours.findIndex((t) => t.slug === previousSlug);
    if (i === -1) tours.push(tour);
    else tours[i] = tour;
    if (previousSlug !== tour.slug) {
      // Keep "You might also like" links pointing at the renamed tour.
      for (const t of tours) for (const r of t.related) if (r.slug === previousSlug) r.slug = tour.slug;
    }
    return { tours, result: tour };
  });
}

export function deleteTour(slug: string): Promise<boolean> {
  return mutate((tours) => {
    const next = tours
      .filter((t) => t.slug !== slug)
      .map((t) => ({ ...t, related: t.related.filter((r) => r.slug !== slug) }));
    return { tours: next, result: next.length !== tours.length };
  });
}

export function nextTourId(tours: Tour[]): number {
  return tours.reduce((m, t) => Math.max(m, t.id), 0) + 1;
}
