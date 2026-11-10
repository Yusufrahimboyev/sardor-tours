import type { TourOption, TourOptionBase } from '@/data/tours';
import type { Locale } from '@/i18n/config';
import { formatPrice } from '@/i18n/format';
import type { T } from '@/i18n/translate';

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

export function optionMax(o: TourOptionBase): number {
  return o.kind === 'toggle' ? 1 : (o.max ?? MAX_QTY);
}

/**
 * Pure price calculation used by both the booking UI and the API.
 * The server always recomputes the quote from its own tour data, so a
 * tampered client total can never be persisted.
 */
export function quote(tour: { options: (TourOptionBase & { label?: string })[] }, qty: Quantities): Quote {
  const lines: PriceLine[] = [];
  let guestUnits = 0;
  for (const o of tour.options) {
    const n = Math.min(Math.max(0, Math.floor(qty[o.key] ?? 0)), optionMax(o));
    if (n === 0) continue;
    if (o.group === 'guests') guestUnits += n;
    lines.push({ key: o.key, label: o.label ?? o.key, qty: n, unitPrice: o.price, subtotal: n * o.price });
  }
  return { lines, total: lines.reduce((s, l) => s + l.subtotal, 0), guestUnits };
}

/** `t` is the client translator (keys relative to `client`). */
export function optionPriceLabel(o: TourOption, t: T, lang: Locale): string {
  if (o.free || o.price === 0) return o.unit === 'included' ? t('booking.included') : t('booking.free');
  return `${formatPrice(o.price, lang)}${o.unit ? ` / ${o.unit}` : ''}`;
}
