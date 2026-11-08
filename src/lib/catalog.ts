import type { Category, TourSummary } from '@/data/tours';

export type PriceBand = 'all' | 'under30' | '30to100' | 'over100';

export const PRICE_BANDS: { key: PriceBand; label: string }[] = [
  { key: 'all', label: 'Any price' },
  { key: 'under30', label: 'Under £30' },
  { key: '30to100', label: '£30 – £100' },
  { key: 'over100', label: '£100+' },
];

export function inPriceBand(price: number, band: PriceBand): boolean {
  switch (band) {
    case 'under30':
      return price < 30;
    case '30to100':
      return price >= 30 && price <= 100;
    case 'over100':
      return price > 100;
    default:
      return true;
  }
}

export function matchesQuery(t: Pick<TourSummary, 'name' | 'categoryLabel'>, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return t.name.toLowerCase().includes(q) || t.categoryLabel.toLowerCase().includes(q);
}

export interface CatalogFilter {
  query?: string;
  category?: Category | 'all';
  price?: PriceBand;
}

export function filterTours<T extends TourSummary>(list: T[], f: CatalogFilter): T[] {
  return list.filter(
    (t) =>
      (!f.category || f.category === 'all' || t.category === f.category) &&
      inPriceBand(t.priceFrom, f.price ?? 'all') &&
      matchesQuery(t, f.query ?? ''),
  );
}
