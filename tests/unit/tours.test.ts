import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { getTour, getTourBase, tourSlugs, tourHref } from '../../src/data/tours';

const original = JSON.parse(execSync('git show 9545625:src/data/tours.json', { encoding: 'utf8' }));

test('en merge reproduces the original records exactly', () => {
  // `included` is a derived, language-neutral flag added to the base data after the original
  // commit (from `unit === 'included'`); compare with that one field omitted.
  const withoutIncluded = (t: ReturnType<typeof getTour>) => ({
    ...t!,
    options: t!.options.map((o) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'included'))),
  });
  for (const o of original) assert.deepEqual(withoutIncluded(getTour(o.slug, 'en')), o, o.slug);
});
test('every slug exists in every language', () => {
  assert.equal(tourSlugs.length, 23);
  for (const s of tourSlugs) for (const l of ['uz', 'en', 'ru'] as const) assert.ok(getTour(s, l), `${l}/${s}`);
});
test('prices identical across languages', () => {
  for (const s of tourSlugs) {
    const p = getTourBase(s)!.options.map((o) => o.price);
    for (const l of ['uz', 'ru'] as const) assert.deepEqual(getTour(s, l)!.options.map((o) => o.price), p);
  }
});
test('tourHref', () => assert.equal(tourHref('ru', 'quad-safari-sharm'), '/ru/sharm/quad-safari-sharm/'));
