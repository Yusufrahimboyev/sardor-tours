const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** YYYY-MM-DD for a local date. */
export function isoDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function tomorrowISO(now = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  return isoDate(d);
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

export function weekdayNames(days: number[]): string {
  return days.map((d) => WEEKDAYS[d]).join(', ');
}

export function formatLongDate(s: string): string {
  const d = parseISODate(s);
  if (!d) return s;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
