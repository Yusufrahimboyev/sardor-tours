import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';

const WINDOW_MS = 60_000;
// Shared by every copy of this module (Next.js may load it in several bundles).
const g = globalThis as typeof globalThis & { __stRateHits?: Map<string, number[]> };
const hits = (g.__stRateHits ??= new Map<string, number[]>());

/** Small in-memory sliding-window limiter (per server instance). */
export function rateLimited(req: Request, bucket: string, limit = 10): boolean {
  if (process.env.RATE_LIMIT === 'off') return false;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local';
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}

export function jsonError(status: number, error: string, fieldErrors?: Record<string, string>) {
  return NextResponse.json({ ok: false, error, fieldErrors }, { status });
}

export function zodFieldErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || 'form';
    out[key] ??= issue.message;
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
  const got = Buffer.from(req.headers.get('authorization') ?? '');
  const want = Buffer.from(`Bearer ${token}`);
  return got.length === want.length && timingSafeEqual(got, want);
}
