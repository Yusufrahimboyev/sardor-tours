import 'server-only';
import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';
import type { Locale } from '@/i18n/config';
import { getMessages, getT } from '@/i18n/messages';

const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

/** Small in-memory sliding-window limiter (per server instance). */
export function rateLimited(req: Request, bucket: string, limit = 10): boolean {
  if (process.env.RATE_LIMIT === 'off') return false;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local';
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  // Evict idle clients so the map can't grow without bound on a long-lived server.
  if (hits.size > 5_000) {
    for (const [k, ts] of hits) if (now - ts[ts.length - 1] >= WINDOW_MS) hits.delete(k);
  }
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}

export function jsonError(status: number, error: string, fieldErrors?: Record<string, string>) {
  return NextResponse.json({ ok: false, error, fieldErrors }, { status });
}

/**
 * Field → message. Schema messages are `ErrorKey`s, translated into `lang`;
 * anything else (zod's built-in messages) becomes the generic error.
 */
export function zodFieldErrors(err: ZodError, lang: Locale): Record<string, string> {
  const t = getT(lang);
  const known = getMessages(lang).client.errors as Record<string, string>;
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || 'form';
    out[key] ??= t(`client.errors.${issue.message in known ? issue.message : 'generic'}`);
  }
  return out;
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

/** Bearer-token check for admin-only endpoints. Disabled when ADMIN_TOKEN is unset. */
export function isAdmin(req: Request): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  return req.headers.get('authorization') === `Bearer ${token}`;
}
