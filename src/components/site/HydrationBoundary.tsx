import { Suspense } from 'react';

/**
 * Wrap a page's markup (after its data is loaded) in a Suspense boundary.
 *
 * Next.js starts hydrating while the HTML is still arriving. On large pages under load React
 * could hydrate before the parser reached the end of the document and fail (React #418).
 * A boundary lets React wait for its content. It sits *inside* the page, after the page's
 * awaits and notFound() checks, so 404 responses keep their 404 status.
 */
export function HydrationBoundary({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
