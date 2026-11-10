import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingBaseSchema, bookingIssues, ERROR_KEYS, isErrorKey } from '../../src/lib/validation';
import en from '../../src/i18n/messages/en.json';
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

test('isErrorKey decides by membership in client.errors, never by shape', () => {
  assert.equal(isErrorKey('nameMin'), true);
  assert.equal(isErrorKey('Required'), false);
  assert.equal(isErrorKey('Пожалуйста, введите имя'), false);
  assert.equal(isErrorKey('Please enter your name'), false);
  assert.equal(isErrorKey(undefined), false);
});
test('ERROR_KEYS matches the en dictionary', () => {
  assert.deepEqual([...ERROR_KEYS].sort(), Object.keys(en.client.errors).sort());
});
