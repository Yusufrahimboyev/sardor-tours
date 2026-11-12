import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Minimal admin session: one shared password (ADMIN_PASSWORD) and a signed,
 * httpOnly cookie holding only an expiry timestamp. No user table needed.
 * The signing key is ADMIN_SESSION_SECRET (falls back to a hash of the
 * password, so changing the password logs everyone out).
 */
export const SESSION_COOKIE = 'st_admin';
const SESSION_DAYS = 7;

function secret(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return process.env.ADMIN_SESSION_SECRET || createHmac('sha256', 'st-admin').update(pw).digest('hex');
}

function sign(payload: string, key: string): string {
  return createHmac('sha256', key).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function adminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  // Compare HMACs so the comparison is constant-time regardless of length.
  const k = 'st-admin-pw';
  return safeEqual(createHmac('sha256', k).update(input).digest('hex'), createHmac('sha256', k).update(pw).digest('hex'));
}

export function createSessionValue(now = Date.now()): string | null {
  const key = secret();
  if (!key) return null;
  const exp = String(now + SESSION_DAYS * 86_400_000);
  return `${exp}.${sign(exp, key)}`;
}

export function verifySessionValue(value: string | undefined, now = Date.now()): boolean {
  const key = secret();
  if (!key || !value) return false;
  const [exp, sig] = value.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < now) return false;
  return safeEqual(sig, sign(exp, key));
}

export async function isAdminSession(): Promise<boolean> {
  return verifySessionValue((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Guard for admin pages and server actions. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) redirect('/admin/login/');
}

export async function startSession(): Promise<void> {
  const value = createSessionValue();
  if (!value) return;
  (await cookies()).set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
