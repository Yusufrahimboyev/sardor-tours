import { NextResponse } from 'next/server';
import { getT } from '@/i18n/messages';
import { contactSchema, langSchema, type ErrorKey } from '@/lib/validation';
import { messages, newReference } from '@/lib/server/store';
import { isAdmin, jsonError, rateLimited, readJson, zodFieldErrors } from '@/lib/server/http';

export async function POST(req: Request) {
  if (rateLimited(req, 'contact', 5)) return jsonError(429, getT('en')('client.errors.tooManyRequests'));

  const body = await readJson(req);
  // Read the language first so a request that fails validation is still answered in it.
  const lang = langSchema.parse((body as { lang?: unknown } | undefined)?.lang);
  const t = getT(lang);
  const err = (key: ErrorKey) => t(`client.errors.${key}`);

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, err('checkFields'), zodFieldErrors(parsed.error, lang));
  const { name, email, phone, topic, message } = parsed.data;

  try {
    await messages.insert({ id: newReference('MSG'), createdAt: new Date().toISOString(), name, email, phone, topic, message, lang });
  } catch (e) {
    console.error('Failed to save contact message', e);
    return jsonError(500, err('sendFailed'));
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return jsonError(401, 'Unauthorized');
  return NextResponse.json({ ok: true, items: (await messages.list()).reverse() });
}
