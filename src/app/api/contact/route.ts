import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation';
import { messages, newReference } from '@/lib/server/store';
import { isAdmin, jsonError, rateLimited, readJson, zodFieldErrors } from '@/lib/server/http';

export async function POST(req: Request) {
  if (rateLimited(req, 'contact', 5)) return jsonError(429, 'Too many requests. Please try again in a minute.');

  const parsed = contactSchema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(400, 'Please check the highlighted fields.', zodFieldErrors(parsed.error));
  const { name, email, phone, topic, message } = parsed.data;

  try {
    await messages.insert({ id: newReference('MSG'), createdAt: new Date().toISOString(), name, email, phone, topic, message });
  } catch (e) {
    console.error('Failed to save contact message', e);
    return jsonError(500, 'We could not send your message. Please try again or message us on WhatsApp.');
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return jsonError(401, 'Unauthorized');
  return NextResponse.json({ ok: true, items: (await messages.list()).reverse() });
}
