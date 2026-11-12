/**
 * Customer reviews shown in the "What they say" carousel on /en/sharm/.
 *
 * Only publish reviews your own customers actually left (e.g. copied from your
 * Google Business profile). Entries marked `sample: true` are layout fillers:
 * they render in `next dev` only and are dropped from production builds, so
 * the carousel stays hidden until real reviews are added here.
 */
export interface Review {
  name: string;
  /** ISO date, e.g. 2026-09-05 */
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  source: 'google' | 'tripadvisor' | 'site';
  /** Optional photo the reviewer attached (path under /public or absolute URL). */
  photo?: string;
  sample?: boolean;
}

const all: Review[] = [
  {
    name: 'Sample Reviewer',
    date: '2026-09-05',
    rating: 5,
    text: 'Sample review text — replace with a real review from your Google profile. The card shows up to four lines and the rest opens with “Read more”, so longer reviews are fine here.',
    source: 'google',
    photo: '/images/sample-review-1.webp',
    sample: true,
  },
  {
    name: 'Another Sample',
    date: '2026-09-03',
    rating: 5,
    text: 'Second placeholder review. Delete the sample entries once real reviews are in this file.',
    source: 'google',
    sample: true,
  },
  {
    name: 'Third Sample',
    date: '2026-08-28',
    rating: 5,
    text: 'Third placeholder review, without a photo, to show how a text-only card looks in the carousel.',
    source: 'google',
    sample: true,
  },
  {
    name: 'Fourth Sample',
    date: '2026-08-20',
    rating: 4,
    text: 'Fourth placeholder review with a four-star rating.',
    source: 'tripadvisor',
    photo: '/images/sample-review-2.webp',
    sample: true,
  },
];

export const reviews: Review[] =
  process.env.NODE_ENV === 'production' ? all.filter((r) => !r.sample) : all;
