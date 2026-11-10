import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingBaseSchema, bookingIssues } from '../../src/lib/validation';
import { getTourBase } from '../../src/data/tours';

test('issues carry keys, not English text', () => {
  const tour = getTourBase('quad-safari-sharm')!;
  const issues = bookingIssues(tour, { date: '', time: '', qty: {} });
  assert.ok(issues.every((i) => /^[a-zA-Z]+$/.test(i.key)));
  assert.ok(issues.some((i) => i.key === 'dateRequired'));
});
test('unknown or missing lang falls back to en', () => {
  const base = { tourSlug: 'x', date: '2030-01-01', hotel: 'Rixos', qty: {}, name: 'Ali Valiyev', phone: '+998 93 212 99 05', email: '' };
  assert.equal(bookingBaseSchema.parse({ ...base, lang: 'de' }).lang, 'en');
  assert.equal(bookingBaseSchema.parse(base).lang, 'en');
  assert.equal(bookingBaseSchema.parse({ ...base, lang: 'ru' }).lang, 'ru');
});
