import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
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
}

function createJsonCollection<T extends { id: string }>(name: string): Collection<T> {
  const file = path.join(DATA_DIR, `${name}.json`);
  let queue: Promise<unknown> = Promise.resolve();

  async function read(): Promise<T[]> {
    try {
      return JSON.parse(await fs.readFile(file, 'utf8')) as T[];
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw e;
    }
  }

  async function write(items: T[]) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(items, null, 2));
    await fs.rename(tmp, file);
  }

  /** Serialize read-modify-write cycles so concurrent requests can't clobber each other. */
  function serial<R>(fn: () => Promise<R>): Promise<R> {
    const run = queue.then(fn);
    queue = run.catch(() => undefined);
    return run;
  }

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

export const bookings = createJsonCollection<Booking>('bookings');
export const messages = createJsonCollection<ContactMessage>('messages');

/** Human-friendly reference, e.g. ST-7K4Q9P. No ambiguous characters. */
export function newReference(prefix = 'ST'): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  let s = '';
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `${prefix}-${s}`;
}
