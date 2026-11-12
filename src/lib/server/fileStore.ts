import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

/**
 * Process-wide write lock per file. Next.js can load the same server module more than once
 * (route handlers, server actions and pages live in separate bundles), so a module-level
 * queue is not enough — the lock map lives on globalThis and is shared by every copy.
 */
const g = globalThis as typeof globalThis & { __stFileLocks?: Map<string, Promise<unknown>> };
const locks = (g.__stFileLocks ??= new Map());

export function withFileLock<R>(file: string, fn: () => Promise<R>): Promise<R> {
  const prev = locks.get(file) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  locks.set(
    file,
    run.catch(() => undefined),
  );
  return run;
}

/** Write via a uniquely named temp file + rename, so readers never see a half-written file. */
export async function atomicWrite(file: string, data: string): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, file);
}

export async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8')) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return fallback;
    throw e;
  }
}
