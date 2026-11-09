import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createT } from '../../src/i18n/translate';

const ru = { tours: { one: '{n} тур', few: '{n} тура', many: '{n} туров', other: '{n} тура' }, hi: 'Привет, {name}!', a: { b: 'x' } };
const en = { tours: { one: '{n} tour', other: '{n} tours' } };

test('ru plurals 1/2/5/21/11', () => {
  const t = createT(ru, 'ru');
  assert.deepEqual([1, 2, 5, 21, 11].map((n) => t('tours', { n })), ['1 тур', '2 тура', '5 туров', '21 тур', '11 туров']);
});
test('en plurals', () => { const t = createT(en, 'en'); assert.equal(t('tours', { n: 1 }), '1 tour'); assert.equal(t('tours', { n: 0 }), '0 tours'); });
test('interpolation + nested key', () => { const t = createT(ru, 'ru'); assert.equal(t('hi', { name: 'Ali' }), 'Привет, Ali!'); assert.equal(t('a.b'), 'x'); });
test('missing key returns key', () => { assert.equal(createT(ru, 'ru')('nope.x'), 'nope.x'); });
