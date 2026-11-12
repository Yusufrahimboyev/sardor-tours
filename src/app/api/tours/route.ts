import { NextResponse } from 'next/server';
import { CATEGORY_KEYS, toSummary, type Category } from '@/data/tours';
import { isLocale } from '@/i18n/config';
import { filterTours, PRICE_BANDS, type PriceBand } from '@/lib/catalog';
import { listTours } from '@/lib/server/tours';

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const cat = sp.get('category');
  const price = sp.get('price');
  const category = CATEGORY_KEYS.includes(cat as Category) ? (cat as Category) : 'all';
  const band = PRICE_BANDS.some((b) => b.key === price) ? (price as PriceBand) : 'all';
  const l = sp.get('lang');
  const lang = isLocale(l) ? l : 'en';
  const items = filterTours((await listTours({ lang })).map(toSummary), { query: (sp.get('q') ?? '').slice(0, 100), category, price: band });
  return NextResponse.json({ ok: true, count: items.length, items });
}
