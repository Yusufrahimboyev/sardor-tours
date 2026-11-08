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

  return {
    insert(item) {
      // Serialize writes so concurrent requests can't clobber each other.
      const run = queue.then(async () => {
        const items = await read();
        items.push(item);
        await write(items);
        return item;
      });
      queue = run.catch(() => undefined);
      return run;
    },
    list: read,
    async get(id) {
      return (await read()).find((i) => i.id === id);
    },
  };
}

export interface Booking {
  id: string;
  createdAt: string;
  status: 'pending';
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
