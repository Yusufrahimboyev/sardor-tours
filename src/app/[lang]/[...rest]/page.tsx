import { notFound } from 'next/navigation';

/**
 * Any unmatched path under a locale renders `[lang]/not-found.tsx` with a 404 status.
 * Overrides the layout's `dynamicParams = false`: otherwise un-generated paths would 404
 * before the `[lang]` tree renders, skipping the localised not-found page.
 */
export const dynamicParams = true;

export default function CatchAll() {
  notFound();
}
