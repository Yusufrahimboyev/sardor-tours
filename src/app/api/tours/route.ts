import { NextResponse } from 'next/server';
import { CATEGORIES, toSummary, type Category } from '@/data/tours';
import { listTours } from '@/lib/server/tours';
import { filterTours, PRICE_BANDS, type PriceBand } from '@/lib/catalog';

/** GET /api/tours?q=&category=&price= — public, read-only catalogue search. */
export async function GET(req: Request) {
  const tours = await listTours();
  const sp = new URL(req.url).searchParams;
  const cat = sp.get('category');
  const price = sp.get('price');
  const category = CATEGORIES.some((c) => c.key === cat) ? (cat as Category) : 'all';
  const band = PRICE_BANDS.some((b) => b.key === price) ? (price as PriceBand) : 'all';
  const items = filterTours(tours.map(toSummary), { query: (sp.get('q') ?? '').slice(0, 100), category, price: band });
  return NextResponse.json({ ok: true, count: items.length, items });
}
