import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localeHref, resolveLocale, switchLocalePath, stripLocale, alternatesFor } from '../../src/i18n/routing';

test('localeHref', () => { assert.equal(localeHref('ru', '/sharm/'), '/ru/sharm/'); assert.equal(localeHref('uz', '/'), '/uz/'); });
test('switchLocalePath keeps rest + query', () => {
  assert.equal(switchLocalePath('/ru/sharm/quad-safari-sharm/', '?cat=safari', 'uz'), '/uz/sharm/quad-safari-sharm/?cat=safari');
  assert.equal(switchLocalePath('/en/', '', 'ru'), '/ru/');
});
test('stripLocale', () => { assert.deepEqual(stripLocale('/ru/sharm/'), { lang: 'ru', rest: '/sharm/' }); assert.deepEqual(stripLocale('/booking/ST-ABC234/'), { lang: null, rest: '/booking/ST-ABC234/' }); });
test('resolveLocale: cookie wins when valid', () => assert.equal(resolveLocale('uz', 'ru-RU'), 'uz'));
test('resolveLocale: invalid/empty cookie ignored', () => { assert.equal(resolveLocale('de', 'ru-RU,ru;q=0.9'), 'ru'); assert.equal(resolveLocale('', null), 'en'); });
test('resolveLocale: Accept-Language q-values and regions', () => {
  assert.equal(resolveLocale(undefined, 'ru-RU,ru;q=0.9,en;q=0.8'), 'ru');
  assert.equal(resolveLocale(undefined, 'uz-Cyrl-UZ'), 'uz');
  assert.equal(resolveLocale(undefined, 'de-DE,ru;q=0.5'), 'ru');
  assert.equal(resolveLocale(undefined, 'en-US,ru;q=0.9'), 'en');
  assert.equal(resolveLocale(undefined, 'ru;q=0.3,uz;q=0.8'), 'uz');
  assert.equal(resolveLocale(undefined, '*'), 'en');
  assert.equal(resolveLocale(undefined, 'de-DE'), 'en');
});
test('alternatesFor', () => assert.deepEqual(alternatesFor('/sharm/').languages, { uz: '/uz/sharm/', en: '/en/sharm/', ru: '/ru/sharm/', 'x-default': '/en/sharm/' }));
