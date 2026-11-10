import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTour } from '../../src/data/tours';
import { optionPriceLabel } from '../../src/lib/pricing';
import { createT, type Dict } from '../../src/i18n/translate';
import en from '../../src/i18n/messages/en.json';

const t = createT(en.client as unknown as Dict, 'en');

test('Included label does not depend on the translatable unit', () => {
  const o = getTour('private-yacht-sharm', 'en')!.options.find((x) => x.included)!;
  assert.ok(o);
  assert.equal(optionPriceLabel(o, t, 'en'), en.client.booking.included);
  assert.equal(optionPriceLabel({ ...o, unit: 'включено' }, t, 'ru'), en.client.booking.included);
});
test('priced option renders price / unit', () => {
  const o = getTour('quad-safari-sharm', 'en')!.options.find((x) => x.price > 0 && x.unit)!;
  assert.equal(optionPriceLabel(o, t, 'en'), `£${o.price} / ${o.unit}`);
});
