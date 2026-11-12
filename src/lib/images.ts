/**
 * Image source resolver.
 *
 * The reference site's photos are not licensed for reuse, so by default every
 * image path is mapped to a themed, freely licensed Unsplash photo (Unsplash
 * licence: free for commercial use, no attribution required). The theme is
 * picked from the file name (e.g. "quad…" → desert safari) and the photo
 * within the theme is chosen deterministically, so a path always gets the
 * same picture.
 *
 * When you have your own photos, set NEXT_PUBLIC_IMAGE_BASE (e.g. to your CDN)
 * and the original paths are used unchanged.
 */
const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE?.replace(/\/$/, '');

/** Unsplash photo ids grouped by theme (all checked to load). */
const P = {
  reef: ['1546026423-cc4642628d2b', '1582967788606-a171c1080cb0', '1583212292454-1fe6229603b7', '1544552866-d3ed42536cfd', '1559827260-dc66d52bef19'],
  diving: ['1544551763-46a013bb70d5', '1544552866-d3ed42536cfd', '1559827260-dc66d52bef19', '1582967788606-a171c1080cb0'],
  boat: ['1567899378494-47b22a2ae96a', '1569263979104-865ab7cd8d13', '1605281317010-fe5ffe798166', '1540946485063-a40da27545f8'],
  coast: ['1547036967-23d11aacaee0', '1505118380757-91f5f5632de0', '1507525428034-b723cf961d3e', '1530053969600-caed2596d242'],
  desert: ['1473580044384-7ba9967e16a0', '1509316785289-025f5b846b35', '1539768942893-daf53e448371', '1558981403-c5f9899a28bc'],
  night: ['1419242902214-272b3f66ee7a', '1504280390367-361c6d9f38f4'],
  pyramids: ['1503177119275-0aa32b3a9368', '1539650116574-8efeb43e2750', '1553913861-c0fddf2619ee', '1590133324192-1df305deea6b', '1600520611035-84157ad4084d', '1568322445389-f64ac2515020'],
  cairo: ['1572252009286-268acec5ca0a', '1568322445389-f64ac2515020', '1539650116574-8efeb43e2750'],
  plane: ['1530521954074-e64f6810b32d', '1600520611035-84157ad4084d'],
  temple: ['1566288623394-377af472d81b', '1553913861-c0fddf2619ee'],
  petra: ['1579606032821-4e6161c81bd3', '1580834341580-8c17a3a630ca'],
  mountain: ['1506905925346-21bda4d32df4', '1509316785289-025f5b846b35'],
  dolphin: ['1570481662006-a3a1374699e8', '1607153333879-c174d265f1d2'],
  dinner: ['1414235077428-338989a2e8c0', '1517248135467-4c7edcad34c4'],
  beach: ['1507525428034-b723cf961d3e', '1505118380757-91f5f5632de0', '1547036967-23d11aacaee0'],
} as const;

/** First matching rule wins; tested against the lower-cased file name. */
const RULES: [RegExp, readonly string[]][] = [
  [/dolphin/, P.dolphin],
  // before the /ras/ rule below, which would otherwise match "parasiling"
  [/parasil|parasail/, [...P.beach, ...P.boat]],
  [/petra/, P.petra],
  [/luxor|luxort/, P.temple],
  [/cairo-plane|plane/, [...P.plane, ...P.pyramids]],
  [/cairo|pyramid/, [...P.pyramids, ...P.cairo]],
  [/moses|mosses|mount/, P.mountain],
  [/stargaz|dinner/, [...P.night, ...P.dinner]],
  [/quad|buggy|safari|slama|canyon/, P.desert],
  [/padi|scuba|diving|blue-hole/, [...P.diving, ...P.reef]],
  [/submarin|glass|white-island|ras|tiran|snorkel/, [...P.reef, ...P.coast]],
  [/boat|yacht|cruise|speed/, P.boat],
  [/sample-review/, [...P.diving, ...P.boat]],
  [/hurghada|marsa|sharm|hero|about/, [...P.coast, ...P.beach, ...P.reef]],
];
const FALLBACK = [...P.coast, ...P.reef, ...P.boat];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick(path: string): string {
  const name = path.replace(/^\/images\//, '').toLowerCase();
  const list = RULES.find(([re]) => re.test(name))?.[1] ?? FALLBACK;
  return list[hash(name) % list.length];
}

export function imageSrc(path: string, width = 1200, height = 800): string {
  // Photos uploaded in the admin panel, and absolute URLs, are used as-is.
  if (path.startsWith('/media/') || /^https?:\/\//.test(path)) return path;
  if (IMAGE_BASE) return `${IMAGE_BASE}${path}`;
  return `https://images.unsplash.com/photo-${pick(path)}?w=${width}&h=${height}&fit=crop&auto=format&q=70`;
}

export const usingPlaceholders = !IMAGE_BASE;
