import { test } from 'node:test';
import assert from 'node:assert/strict';
import en from '../../src/i18n/messages/en.json';
import uz from '../../src/i18n/messages/uz.json';
import ru from '../../src/i18n/messages/ru.json';

const paths = (o: unknown, p = ''): string[] =>
  o && typeof o === 'object' && !Array.isArray(o)
    ? Object.entries(o).flatMap(([k, v]) => (['one', 'few', 'many', 'other'].includes(k) ? [p] : paths(v, p ? `${p}.${k}` : k)))
    : [p];
test('uz/ru have every en key path', () => {
  const want = new Set(paths(en));
  for (const [name, d] of [['uz', uz], ['ru', ru]] as const) assert.deepEqual([...want].filter((k) => !new Set(paths(d)).has(k)), [], name);
});
