/**
 * Image source resolver.
 *
 * The reference site's photos are not licensed for reuse, so by default every
 * image path is mapped to a deterministic, freely licensed placeholder from
 * picsum.photos (Unsplash licence). If you own / are licensed to use the
 * original photos, set NEXT_PUBLIC_IMAGE_BASE (e.g. to your CDN or to the
 * original domain) and the original paths are used unchanged.
 */
const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE?.replace(/\/$/, '');

function seed(path: string): string {
  return path.replace(/^\/images\//, '').replace(/\.[a-z]+$/i, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
}

export function imageSrc(path: string, width = 1200, height = 800): string {
  if (IMAGE_BASE) return `${IMAGE_BASE}${path}`;
  return `https://picsum.photos/seed/${seed(path)}/${width}/${height}`;
}

export const usingPlaceholders = !IMAGE_BASE;
