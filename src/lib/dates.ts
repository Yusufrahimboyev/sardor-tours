/** YYYY-MM-DD for a local date. */
export function isoDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** All tours run in Egypt, so "today" is always measured on Cairo's calendar. */
export const TOUR_TIME_ZONE = 'Africa/Cairo';

/** YYYY-MM-DD of `now` on the calendar of `timeZone`. */
export function todayISO(now = new Date(), timeZone = TOUR_TIME_ZONE): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/**
 * Tomorrow in the tours' time zone. Must not depend on the runtime's local
 * zone: the browser (form `min`), the server render and the API all have to
 * agree, otherwise a valid client-side date is rejected by the API.
 */
export function tomorrowISO(now = new Date()): string {
  const d = new Date(`${todayISO(now)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Parse YYYY-MM-DD as a UTC-noon date so weekday checks are timezone-stable. */
export function parseISODate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T12:00:00Z`);
  return Number.isNaN(d.getTime()) || isoFromUTC(d) !== s ? null : d;
}

function isoFromUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(s: string): number | null {
  const d = parseISODate(s);
  return d ? d.getUTCDay() : null;
}

export function formatLongDate(value: string): string {
  const date = parseISODate(value);
  return date ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(date) : value;
}
