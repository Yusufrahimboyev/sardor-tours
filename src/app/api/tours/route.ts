import { NextResponse } from 'next/server';
import { CATEGORY_KEYS, allTours, toSummary, type Category } from '@/data/tours';
import { filterTours, PRICE_BANDS, type PriceBand } from '@/lib/catalog';

/** GET /api/tours?q=&category=&price= — public, read-only catalogue search. */
export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const cat = sp.get('category');
  const price = sp.get('price');
  const category = CATEGORY_KEYS.includes(cat as Category) ? (cat as Category) : 'all';
  const band = PRICE_BANDS.some((b) => b.key === price) ? (price as PriceBand) : 'all';
  const items = filterTours(allTours('en').map(toSummary), { query: (sp.get('q') ?? '').slice(0, 100), category, price: band });
  return NextResponse.json({ ok: true, count: items.length, items });
}
