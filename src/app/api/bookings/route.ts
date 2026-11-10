import { NextResponse } from 'next/server';
import { getTour, getTourBase } from '@/data/tours';
import { quote } from '@/lib/pricing';
import { weekdayNames } from '@/i18n/format';
import { getT } from '@/i18n/messages';
import { bookingBaseSchema, bookingIssues, langSchema, type ErrorKey } from '@/lib/validation';
import { bookings, newReference, type Booking } from '@/lib/server/store';
import { isAdmin, jsonError, rateLimited, readJson, zodFieldErrors } from '@/lib/server/http';

export async function POST(req: Request) {
  const en = getT('en');
  if (rateLimited(req, 'bookings', 8)) return jsonError(429, en('client.errors.tooManyRequests' satisfies `client.errors.${ErrorKey}`));

  const body = await readJson(req);
  // Read the language first so a request that fails validation is still answered in it.
  const lang = langSchema.parse((body as { lang?: unknown } | undefined)?.lang);
  const t = getT(lang);
  const err = (key: ErrorKey, params?: Parameters<typeof t>[1]) => t(`client.errors.${key}`, params);

  const parsed = bookingBaseSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, err('checkFields'), zodFieldErrors(parsed.error, lang));
  const input = parsed.data;

  const tour = getTourBase(input.tourSlug);
  const tourEn = getTour(input.tourSlug, 'en');
  if (!tour || !tourEn) return jsonError(404, err('tourGone'));

  const issues = bookingIssues(tour, input);
  if (issues.length) {
    const msgs = issues.map((i) => ({
      path: i.path,
      message: err(i.key, i.params ? { days: weekdayNames(i.params.days, lang) } : undefined),
    }));
    return jsonError(400, msgs[0].message, Object.fromEntries(msgs.map((m) => [m.path, m.message])));
  }

  const q = quote(tour, input.qty);
  const labels = new Map(tourEn.options.map((o) => [o.key, o.label]));
  const booking: Booking = {
    id: newReference(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    tourSlug: tour.slug,
    tourName: tourEn.name,
    date: input.date,
    time: input.time,
    hotel: input.hotel,
    lines: q.lines.map((l) => ({ ...l, label: labels.get(l.key) ?? l.label })),
    total: q.total,
    currency: 'GBP',
    name: input.name,
    phone: input.phone,
    email: input.email,
    notes: input.notes,
    requiresDeposit: tour.requiresDeposit,
    lang,
  };

  try {
    await bookings.insert(booking);
  } catch (e) {
    console.error('Failed to save booking', e);
    return jsonError(500, err('saveFailed'));
  }

  return NextResponse.json({ ok: true, reference: booking.id, total: booking.total }, { status: 201 });
}

/** Admin listing — requires `Authorization: Bearer $ADMIN_TOKEN`. */
export async function GET(req: Request) {
  if (!isAdmin(req)) return jsonError(401, 'Unauthorized');
  const items = await bookings.list();
  return NextResponse.json({ ok: true, items: items.reverse() });
}
