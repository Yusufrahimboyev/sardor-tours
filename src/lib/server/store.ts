import 'server-only';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { atomicWrite, readJsonFile, withFileLock } from './fileStore';
import type { PriceLine } from '@/lib/pricing';

/**
 * Minimal JSON-file persistence behind a small repository interface.
 * Good for local/demo use and a single Node server. For serverless or
 * multi-instance hosting swap `createJsonCollection` for a database-backed
 * implementation (e.g. Supabase/PostgreSQL) — callers only use `insert`,
 * `list` and `get`.
 */
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), '.data');

interface Collection<T extends { id: string }> {
  insert(item: T): Promise<T>;
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  /** Shallow-merges `patch` into the item; resolves to the updated item, or undefined if not found. */
  update(id: string, patch: Partial<Omit<T, 'id'>>): Promise<T | undefined>;
  remove(id: string): Promise<boolean>;
}

export function createJsonCollection<T extends { id: string }>(name: string): Collection<T> {
  const file = path.join(DATA_DIR, `${name}.json`);
  const read = () => readJsonFile<T[]>(file, []);
  const write = (items: T[]) => atomicWrite(file, JSON.stringify(items, null, 2));
  /** Serialize read-modify-write cycles (process-wide) so concurrent requests can't clobber each other. */
  const serial = <R,>(fn: () => Promise<R>) => withFileLock(file, fn);

  return {
    insert(item) {
      return serial(async () => {
        const items = await read();
        items.push(item);
        await write(items);
        return item;
      });
    },
    update(id, patch) {
      return serial(async () => {
        const items = await read();
        const i = items.findIndex((x) => x.id === id);
        if (i === -1) return undefined;
        items[i] = { ...items[i], ...patch, id };
        await write(items);
        return items[i];
      });
    },
    remove(id) {
      return serial(async () => {
        const items = await read();
        const next = items.filter((x) => x.id !== id);
        if (next.length === items.length) return false;
        await write(next);
        return true;
      });
    },
    list: read,
    async get(id) {
      return (await read()).find((i) => i.id === id);
    },
  };
}

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface Booking {
  id: string;
  createdAt: string;
  status: BookingStatus;
  /** Set when an admin changes the status or note. */
  updatedAt?: string;
  /** Internal note, only visible in the admin panel. */
  adminNote?: string;
  tourSlug: string;
  tourName: string;
  date: string;
  time: string;
  hotel: string;
  lines: PriceLine[];
  total: number;
  currency: 'GBP';
  name: string;
  phone: string;
  email: string;
  notes: string;
  requiresDeposit: boolean;
}

export interface ContactMessage {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  /** Marked read in the admin panel. */
  read?: boolean;
}

/** Guest review shown on the site; added and approved in the admin panel. */
export interface Review {
  id: string;
  createdAt: string;
  name: string;
  /** Free text, e.g. "London, UK" or the tour name. */
  meta: string;
  text: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Which language versions show it ('all' = every language). */
  lang: 'all' | 'en' | 'ru' | 'uz';
  active: boolean;
}

export const bookings = createJsonCollection<Booking>('bookings');
export const reviews = createJsonCollection<Review>('reviews');
export const messages = createJsonCollection<ContactMessage>('messages');

/** Human-friendly reference, e.g. ST-7K4Q9P. No ambiguous characters. */
export function newReference(prefix = 'ST'): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  let s = '';
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `${prefix}-${s}`;
}
