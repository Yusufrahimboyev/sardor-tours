import { notFound } from 'next/navigation';

/** Unknown paths inside a language section render that language's 404 (src/app/[lang]/not-found.tsx). */
export const dynamicParams = true;

export default function CatchAll() {
  notFound();
}
