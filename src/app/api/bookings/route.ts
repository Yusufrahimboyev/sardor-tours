import { NextResponse } from 'next/server';
import { getTour } from '@/lib/server/tours';
import { quote } from '@/lib/pricing';
import { bookingBaseSchema, bookingIssues } from '@/lib/validation';
import { bookings, newReference, type Booking } from '@/lib/server/store';
import { isAdmin, jsonError, rateLimited, readJson, zodFieldErrors } from '@/lib/server/http';

export async function POST(req: Request) {
  if (rateLimited(req, 'bookings', 8)) return jsonError(429, 'Too many requests. Please try again in a minute.');

  const parsed = bookingBaseSchema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(400, 'Please check the highlighted fields.', zodFieldErrors(parsed.error));
  const input = parsed.data;

  const tour = await getTour(input.tourSlug);
  if (!tour) return jsonError(404, 'This tour no longer exists.');

  const issues = bookingIssues(tour, input);
  if (issues.length) {
    return jsonError(400, issues[0].message, Object.fromEntries(issues.map((i) => [i.path, i.message])));
  }

  const q = quote(tour, input.qty);
  const booking: Booking = {
    id: newReference(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    tourSlug: tour.slug,
    tourName: tour.name,
    date: input.date,
    time: input.time,
    hotel: input.hotel,
    lines: q.lines,
    total: q.total,
    currency: 'GBP',
    name: input.name,
    phone: input.phone,
    email: input.email,
    notes: input.notes,
    requiresDeposit: tour.requiresDeposit,
  };

  try {
    await bookings.insert(booking);
  } catch (e) {
    console.error('Failed to save booking', e);
    return jsonError(500, 'We could not save your booking. Please try again or message us on WhatsApp.');
  }

  return NextResponse.json({ ok: true, reference: booking.id, total: booking.total }, { status: 201 });
}

/** Admin listing — requires `Authorization: Bearer $ADMIN_TOKEN`. */
export async function GET(req: Request) {
  if (!isAdmin(req)) return jsonError(401, 'Unauthorized');
  const items = await bookings.list();
  return NextResponse.json({ ok: true, items: items.reverse() });
}
