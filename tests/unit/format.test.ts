import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, formatPrice, weekdayNames } from '../../src/i18n/format';

test('formatDate per locale', () => {
  assert.equal(formatDate('2026-11-10', 'en'), 'Tue, 10 November 2026');
  assert.match(formatDate('2026-11-10', 'ru'), /10 ноября 2026/);
  assert.match(formatDate('2026-11-10', 'uz'), /noyabr/);
  assert.equal(formatDate('bad', 'ru'), 'bad');
});
test('weekdayNames', () => {
  assert.equal(weekdayNames([1, 3], 'en'), 'Monday, Wednesday');
  assert.equal(weekdayNames([1], 'ru'), 'понедельник');
  assert.equal(weekdayNames([2], 'uz'), 'seshanba');
});
test('formatPrice grouping', () => {
  assert.equal(formatPrice(1250, 'en'), '£1,250');
  assert.equal(formatPrice(1250, 'ru').replace(/\s/g, ' '), '£1 250');
});
