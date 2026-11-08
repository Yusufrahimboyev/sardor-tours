import type { Tour, TourOption } from '@/data/tours';

export type Quantities = Record<string, number>;

export interface PriceLine {
  key: string;
  label: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

export interface Quote {
  lines: PriceLine[];
  total: number;
  guestUnits: number;
}

export const MAX_QTY = 30;

export function optionMax(o: TourOption): number {
  return o.kind === 'toggle' ? 1 : (o.max ?? MAX_QTY);
}

/**
 * Pure price calculation used by both the booking UI and the API.
 * The server always recomputes the quote from its own tour data, so a
 * tampered client total can never be persisted.
 */
export function quote(tour: Tour, qty: Quantities): Quote {
  const lines: PriceLine[] = [];
  let guestUnits = 0;
  for (const o of tour.options) {
    const n = Math.min(Math.max(0, Math.floor(qty[o.key] ?? 0)), optionMax(o));
    if (n === 0) continue;
    if (o.group === 'guests') guestUnits += n;
    lines.push({ key: o.key, label: o.label, qty: n, unitPrice: o.price, subtotal: n * o.price });
  }
  return { lines, total: lines.reduce((s, l) => s + l.subtotal, 0), guestUnits };
}

export function formatGBP(n: number): string {
  return `£${n.toLocaleString('en-GB')}`;
}

export function optionPriceLabel(o: TourOption): string {
  if (o.free || o.price === 0) return o.unit === 'included' ? 'Included' : 'Free';
  return `£${o.price}${o.unit ? ` / ${o.unit}` : ''}`;
}
