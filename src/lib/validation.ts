import { z } from 'zod';
import type { Tour } from '@/data/tours';
import { parseISODate, tomorrowISO, weekdayNames, weekdayOf } from './dates';
import { quote } from './pricing';

const phoneRe = /^\+?[0-9 ()-]{7,20}$/;

export const contactDetailsSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(80),
  phone: z.string().trim().regex(phoneRe, 'Please enter a valid phone / WhatsApp number'),
  email: z.union([z.literal(''), z.string().trim().email('Please enter a valid email address')]),
});

export const bookingBaseSchema = z
  .object({
    tourSlug: z.string().min(1).max(80),
    date: z.string().min(1, 'Select a date to continue'),
    time: z.string().max(20).default(''),
    hotel: z.string().trim().min(2, 'Please enter your hotel name').max(120),
    qty: z.record(z.string(), z.number().int().min(0).max(30)),
    notes: z.string().trim().max(1000).default(''),
    /** Honeypot: must stay empty. */
    company: z.string().max(0).optional(),
  })
  .merge(contactDetailsSchema);

export type BookingInput = z.infer<typeof bookingBaseSchema>;

/** Tour-specific rules shared by the client form and the API. */
export function bookingIssues(tour: Tour, v: Pick<BookingInput, 'date' | 'time' | 'qty'>, today = new Date()) {
  const issues: { path: string; message: string }[] = [];
  const d = parseISODate(v.date);
  if (!d) {
    issues.push({ path: 'date', message: 'Select a date to continue' });
  } else if (v.date < tomorrowISO(today)) {
    issues.push({ path: 'date', message: 'Please choose a date from tomorrow onwards' });
  } else if (tour.scheduleDays && !tour.scheduleDays.includes(weekdayOf(v.date)!)) {
    issues.push({ path: 'date', message: `This tour runs on ${weekdayNames(tour.scheduleDays)} only` });
  }
  if (tour.timeSlots.length > 0 && !tour.timeSlots.includes(v.time)) {
    issues.push({ path: 'time', message: 'Please choose a departure time' });
  }
  const unknown = Object.keys(v.qty).filter((k) => !tour.options.some((o) => o.key === k));
  if (unknown.length) issues.push({ path: 'qty', message: 'Unknown booking option' });
  if (quote(tour, v.qty).guestUnits === 0) {
    issues.push({ path: 'qty', message: 'Please add at least one guest' });
  }
  return issues;
}

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z.union([z.literal(''), z.string().trim().regex(phoneRe, 'Please enter a valid phone number')]),
  topic: z.enum(['booking', 'private', 'group', 'other']),
  message: z.string().trim().min(10, 'Please write at least 10 characters').max(2000),
  company: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
