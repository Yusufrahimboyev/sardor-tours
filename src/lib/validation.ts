import { z } from 'zod';
import type { TourBase } from '@/data/tours';
import { LOCALES } from '@/i18n/config';
import type { Messages } from '@/i18n/messages';
import { parseISODate, tomorrowISO, weekdayOf } from './dates';
import { quote } from './pricing';

/** Keys under `client.errors` in the message dictionaries. */
export type ErrorKey = keyof Messages['client']['errors'];

const phoneRe = /^\+?[0-9 ()-]{7,20}$/;

/** Unknown or missing languages fall back to English. */
export const langSchema = z.enum(LOCALES).catch('en');

export const contactDetailsSchema = z.object({
  name: z.string().trim().min(2, 'nameMin' satisfies ErrorKey).max(80),
  phone: z.string().trim().regex(phoneRe, 'phoneInvalid' satisfies ErrorKey),
  email: z.union([z.literal(''), z.string().trim().email('emailInvalid' satisfies ErrorKey)]),
});

export const bookingBaseSchema = z
  .object({
    tourSlug: z.string().min(1).max(80),
    date: z.string().min(1, 'dateRequired' satisfies ErrorKey),
    time: z.string().max(20).default(''),
    hotel: z.string().trim().min(2, 'hotelRequired' satisfies ErrorKey).max(120),
    qty: z.record(z.string(), z.number().int().min(0).max(30)),
    notes: z.string().trim().max(1000).default(''),
    lang: langSchema.optional().transform((l) => l ?? 'en'),
    /** Honeypot: must stay empty. */
    company: z.string().max(0).optional(),
  })
  .merge(contactDetailsSchema);

export type BookingInput = z.infer<typeof bookingBaseSchema>;

/** Tour-specific rules shared by the client form and the API. */
export function bookingIssues(tour: TourBase, v: Pick<BookingInput, 'date' | 'time' | 'qty'>, today = new Date()) {
  const issues: { path: string; key: ErrorKey; params?: { days: number[] } }[] = [];
  const d = parseISODate(v.date);
  if (!d) {
    issues.push({ path: 'date', key: 'dateRequired' });
  } else if (v.date < tomorrowISO(today)) {
    issues.push({ path: 'date', key: 'dateTooEarly' });
  } else if (tour.scheduleDays && !tour.scheduleDays.includes(weekdayOf(v.date)!)) {
    issues.push({ path: 'date', key: 'tourRunsOn', params: { days: tour.scheduleDays } });
  }
  if (tour.timeSlots.length > 0 && !tour.timeSlots.includes(v.time)) {
    issues.push({ path: 'time', key: 'timeRequired' });
  }
  const unknown = Object.keys(v.qty).filter((k) => !tour.options.some((o) => o.key === k));
  if (unknown.length) issues.push({ path: 'qty', key: 'unknownOption' });
  if (quote(tour, v.qty).guestUnits === 0) {
    issues.push({ path: 'qty', key: 'guestsRequired' });
  }
  return issues;
}

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'contactNameMin' satisfies ErrorKey).max(80),
  email: z.string().trim().email('emailInvalid' satisfies ErrorKey),
  phone: z.union([z.literal(''), z.string().trim().regex(phoneRe, 'phoneInvalid' satisfies ErrorKey)]),
  topic: z.enum(['booking', 'private', 'group', 'other']),
  message: z.string().trim().min(10, 'messageMin' satisfies ErrorKey).max(2000),
  lang: langSchema.optional().transform((l) => l ?? 'en'),
  company: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
