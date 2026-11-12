import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import seed from '@/data/articles.json';
import type { Locale } from '@/i18n/config';
import { atomicWrite, withFileLock } from './fileStore';

/**
 * Travel-guide articles ("Справочник"). Stored in DATA_DIR/articles.json; the bundled
 * src/data/articles.json is used until an admin saves the first change.
 */
export interface ArticleText {
  title: string;
  excerpt: string;
  /** Paragraphs separated by blank lines; "## " = subheading; "- " lines = bullet list. */
  body: string;
}

export interface Article {
  id: string;
  slug: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  cover: string;
  relatedTours: string[];
  i18n: Partial<Record<Locale, ArticleText>>;
}

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'articles.json');

async function readAll(): Promise<Article[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8')) as Article[];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return seed as Article[];
    throw e;
  }
}

function mutate<R>(fn: (all: Article[]) => { all: Article[]; result: R }): Promise<R> {
  return withFileLock(FILE, async () => {
    const { all, result } = fn(structuredClone(await readAll()));
    await atomicWrite(FILE, JSON.stringify(all, null, 1));
    return result;
  });
}

/** Published articles (newest first) unless `all`. */
export async function listArticles(opts: { all?: boolean } = {}): Promise<Article[]> {
  const all = (await readAll()).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return opts.all ? all : all.filter((a) => a.active);
}

export async function getArticle(slug: string, opts: { all?: boolean } = {}): Promise<Article | undefined> {
  const a = (await readAll()).find((x) => x.slug === slug);
  return a && (opts.all || a.active) ? a : undefined;
}

export function saveArticle(a: Article, previousSlug = a.slug): Promise<Article> {
  return mutate((all) => {
    const i = all.findIndex((x) => x.slug === previousSlug);
    if (i === -1) all.push(a);
    else all[i] = a;
    return { all, result: a };
  });
}

export function deleteArticle(slug: string): Promise<boolean> {
  return mutate((all) => {
    const next = all.filter((x) => x.slug !== slug);
    return { all: next, result: next.length !== all.length };
  });
}

/** Text in the requested language, falling back to English, then any language. */
export function articleText(a: Article, locale: Locale): ArticleText & { fallback: boolean } {
  const own = a.i18n[locale];
  if (own?.title) return { ...own, fallback: false };
  const fb = a.i18n.en ?? Object.values(a.i18n).find(Boolean);
  return { title: fb?.title ?? a.slug, excerpt: fb?.excerpt ?? '', body: fb?.body ?? '', fallback: true };
}
