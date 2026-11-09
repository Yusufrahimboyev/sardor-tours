// Consistency checks for localised content. Usage: node scripts/i18n-check.mjs [--strict]
import fs from 'node:fs';
import path from 'node:path';

const strict = process.argv.includes('--strict');
const root = path.resolve(import.meta.dirname, '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const allow = new Set(fs.existsSync(path.join(root, 'scripts/i18n-allowlist.json')) ? read('scripts/i18n-allowlist.json') : []);
const PLURAL = new Set(['one', 'few', 'many', 'other']);
const failures = [];
const fail = (file, p, reason) => failures.push(`${file}: ${p || '(root)'}: ${reason}`);

/** Flatten to { 'a.b[0].c': leaf } */
function flatten(v, p = '', out = {}) {
  if (Array.isArray(v)) v.forEach((x, i) => flatten(x, `${p}[${i}]`, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) flatten(x, p ? `${p}.${k}` : k, out);
  else out[p] = v;
  return out;
}

/** Paths of every array in a value, with its length. */
function arrayLengths(v, p = '', out = {}) {
  if (Array.isArray(v)) {
    out[p] = v.length;
    v.forEach((x, i) => arrayLengths(x, `${p}[${i}]`, out));
  } else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) arrayLengths(x, p ? `${p}.${k}` : k, out);
  return out;
}

const untranslated = [];

// Rules 1, 2 and (part of) 4: tour text files
const enFile = 'src/data/tours.en.json';
const en = read(enFile);
for (const lang of ['uz', 'ru']) {
  const file = `src/data/tours.${lang}.json`;
  const data = read(file);
  const enSlugs = Object.keys(en);
  const slugs = Object.keys(data);
  for (const s of enSlugs) if (!(s in data)) fail(file, s, 'missing slug');
  for (const s of slugs) if (!(s in en)) fail(file, s, 'unknown slug (not in tours.en.json)');
  for (const s of enSlugs) {
    if (!(s in data)) continue;
    const a = arrayLengths(en[s]);
    const b = arrayLengths(data[s]);
    for (const p of Object.keys(a)) {
      if (!(p in b)) fail(file, `${s}.${p}`, 'array missing');
      else if (a[p] !== b[p]) fail(file, `${s}.${p}`, `array length ${b[p]} != ${a[p]} in English`);
    }
    for (const p of Object.keys(b)) if (!(p in a)) fail(file, `${s}.${p}`, 'array not present in English');
    const fe = flatten(en[s]);
    const fl = flatten(data[s]);
    for (const [p, v] of Object.entries(fl)) {
      if (typeof v === 'string' && v === fe[p] && !allow.has(v)) untranslated.push(`${file}: ${s}.${p}: same as English`);
    }
  }
}

// Rule 3: message dictionaries (skipped until src/i18n/messages exists)
const msgDir = path.join(root, 'src/i18n/messages');
if (fs.existsSync(msgDir) && fs.existsSync(path.join(msgDir, 'en.json'))) {
  const enMsg = flatten(read('src/i18n/messages/en.json'));
  const norm = (flat) => {
    const keys = new Set();
    const pluralParents = new Map();
    for (const k of Object.keys(flat)) {
      const i = k.lastIndexOf('.');
      const leaf = i < 0 ? k : k.slice(i + 1);
      const parent = i < 0 ? '' : k.slice(0, i);
      if (PLURAL.has(leaf)) {
        if (!pluralParents.has(parent)) pluralParents.set(parent, new Set());
        pluralParents.get(parent).add(leaf);
      } else keys.add(k);
    }
    for (const p of pluralParents.keys()) keys.add(p + '.{plural}');
    return { keys, pluralParents };
  };
  const enN = norm(enMsg);
  for (const lang of ['uz', 'ru']) {
    const f = `src/i18n/messages/${lang}.json`;
    if (!fs.existsSync(path.join(root, f))) continue;
    const flat = flatten(read(f));
    const n = norm(flat);
    for (const k of enN.keys) if (!n.keys.has(k)) fail(f, k, 'missing key');
    for (const k of n.keys) if (!enN.keys.has(k)) fail(f, k, 'extra key (not in en.json)');
    for (const [p, set] of n.pluralParents) if (!set.has('other')) fail(f, p, "plural object lacks 'other'");
    for (const [k, v] of Object.entries(flat)) {
      if (typeof v === 'string' && v === enMsg[k] && !allow.has(v)) untranslated.push(`${f}: ${k}: same as English`);
    }
  }
}

if (untranslated.length) {
  console.log(`${untranslated.length} value(s) identical to English${strict ? '' : ' (report only; use --strict to fail)'}`);
  if (strict || process.argv.includes('--verbose')) for (const u of untranslated) console.log('  ' + u);
}
if (strict) failures.push(...untranslated);
if (failures.length) {
  for (const f of failures) console.error(f);
  console.error(`\ni18n:check failed with ${failures.length} problem(s)`);
  process.exit(1);
}
console.log('i18n:check OK');
