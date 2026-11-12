/** Kept separate from tours.ts so client components don't pull the whole tour JSON into the bundle. */
export type Category = 'sea' | 'safari' | 'historical' | 'family';

export const CATEGORIES: { key: Category; label: string; tag: string }[] = [
  { key: 'sea', label: 'Sea & Diving', tag: 'Discover the Red Sea' },
  { key: 'safari', label: 'Safari', tag: 'Breathe in the desert' },
  { key: 'historical', label: 'Historical', tag: 'Where history began' },
  { key: 'family', label: 'Entertainment', tag: 'Dive into the adventure' },
];

export function tourHref(slug: string): string {
  return `/en/tours/${slug}/`;
}
