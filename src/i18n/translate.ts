import { INTL_LOCALE, type Locale } from './config';

export type Dict = { [k: string]: string | string[] | Dict | Dict[] };
export type Params = Record<string, string | number>;
export type T = (key: string, params?: Params) => string;

function lookup(dict: Dict, key: string): unknown {
  let cur: unknown = dict;
  for (const part of key.split('.')) {
    if (cur === null || typeof cur !== 'object' || Array.isArray(cur)) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function interpolate(s: string, params?: Params): string {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m));
}

export function createT(dict: Dict, lang: Locale): T {
  const rules = new Intl.PluralRules(INTL_LOCALE[lang]);
  const warned = new Set<string>();
  return (key, params) => {
    const v = lookup(dict, key);
    if (typeof v === 'string') return interpolate(v, params);
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof params?.n === 'number') {
      const forms = v as Record<string, unknown>;
      const picked = forms[rules.select(params.n)] ?? forms.other;
      if (typeof picked === 'string') return interpolate(picked, params);
    }
    if (process.env.NODE_ENV === 'development' && !warned.has(key)) {
      warned.add(key);
      console.warn(`[i18n] missing key "${key}" (${lang})`);
    }
    return key;
  };
}

export function tList<V>(dict: Dict, key: string): V {
  return lookup(dict, key) as V;
}
