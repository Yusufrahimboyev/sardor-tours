'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { LOCALES } from '@/i18n/config';
import { requireAdmin } from '@/lib/server/auth';
import { deleteArticle, getArticle, listArticles, saveArticle, type Article } from '@/lib/server/articles';
import { getSettings, saveSettings } from '@/lib/server/settings';
import { newReference, reviews, type Review } from '@/lib/server/store';

export interface FormState {
  error?: string;
  saved?: boolean;
}

const revalidateSite = () => revalidatePath('/', 'layout');

/* ───────────── articles ───────────── */

const textSchema = z.object({
  title: z.string().trim().max(160),
  excerpt: z.string().trim().max(400),
  body: z.string().max(30000),
});

const articleSchema = z.object({
  active: z.boolean(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Manzil faqat lotin harflari, raqamlar va "-" dan iborat bo‘lsin.'),
  cover: z.string().trim().max(500),
  relatedTours: z.array(z.string()).max(12),
  i18n: z.object({ en: textSchema, ru: textSchema, uz: textSchema }),
});
export type ArticleEditorData = z.infer<typeof articleSchema>;

export async function saveArticleAction(previousSlug: string, _p: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  let d: ArticleEditorData;
  try {
    d = articleSchema.parse(JSON.parse(String(f.get('data') ?? '{}')));
  } catch (e) {
    return { error: e instanceof z.ZodError ? e.issues[0].message : 'Ma’lumotni o‘qib bo‘lmadi.' };
  }
  const base = await getArticle(previousSlug, { all: true });
  if (!base) return { error: 'Maqola o‘chirilgan.' };
  const all = await listArticles({ all: true });
  if (d.slug !== previousSlug && all.some((a) => a.slug === d.slug)) return { error: `"${d.slug}" manzili band.` };
  if (d.active && !LOCALES.some((l) => d.i18n[l].title && d.i18n[l].body.trim().length > 50)) {
    return { error: 'Chop etish uchun kamida bitta tilda sarlavha va matn yozing.' };
  }
  const i18n: Article['i18n'] = {};
  for (const l of LOCALES) if (d.i18n[l].title.trim()) i18n[l] = d.i18n[l];
  await saveArticle(
    { ...base, slug: d.slug, active: d.active, cover: d.cover, relatedTours: d.relatedTours, i18n, updatedAt: new Date().toISOString() },
    previousSlug,
  );
  revalidateSite();
  if (d.slug !== previousSlug) redirect(`/admin/articles/${d.slug}/?saved=1`);
  return { saved: true };
}

export async function createArticleAction(): Promise<void> {
  await requireAdmin();
  const all = await listArticles({ all: true });
  let slug = 'new-article';
  for (let n = 2; all.some((a) => a.slug === slug); n++) slug = `new-article-${n}`;
  await saveArticle({
    id: newReference('ART'),
    slug,
    active: false,
    createdAt: new Date().toISOString(),
    cover: '',
    relatedTours: [],
    i18n: { en: { title: '', excerpt: '', body: '' } },
  });
  redirect(`/admin/articles/${slug}/`);
}

export async function toggleArticleAction(slug: string): Promise<void> {
  await requireAdmin();
  const a = await getArticle(slug, { all: true });
  if (!a) return;
  await saveArticle({ ...a, active: !a.active });
  revalidateSite();
}

export async function deleteArticleAction(slug: string): Promise<void> {
  await requireAdmin();
  await deleteArticle(slug);
  revalidateSite();
  redirect('/admin/articles/');
}

/* ───────────── reviews ───────────── */

const reviewSchema = z.object({
  name: z.string().trim().min(2, 'Ismni yozing.').max(80),
  meta: z.string().trim().max(120),
  text: z.string().trim().min(10, 'Sharh matni juda qisqa.').max(2000),
  rating: z.coerce.number().int().min(1).max(5),
  lang: z.enum(['all', 'en', 'ru', 'uz']),
});

export async function addReviewAction(_p: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const r = reviewSchema.safeParse(Object.fromEntries(f));
  if (!r.success) return { error: r.error.issues[0].message };
  const review: Review = { id: newReference('REV'), createdAt: new Date().toISOString(), active: true, ...r.data, rating: r.data.rating as Review['rating'] };
  await reviews.insert(review);
  revalidateSite();
  return { saved: true };
}

export async function toggleReviewAction(id: string, active: boolean): Promise<void> {
  await requireAdmin();
  await reviews.update(id, { active });
  revalidateSite();
}

export async function deleteReviewAction(id: string): Promise<void> {
  await requireAdmin();
  await reviews.remove(id);
  revalidateSite();
}

/* ───────────── settings ───────────── */

const contactsSchema = z.object({
  phoneDisplay: z.string().trim().max(40),
  whatsapp: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => !v || (v.length >= 8 && v.length <= 15), 'WhatsApp raqami 8–15 ta raqamdan iborat bo‘lsin (mamlakat kodi bilan).'),
  email: z.union([z.literal(''), z.string().trim().email('Email noto‘g‘ri.')]),
  telegram: z.union([z.literal(''), z.string().trim().url('Telegram havolasi https://t.me/… ko‘rinishida bo‘lsin.')]),
  instagram: z.union([z.literal(''), z.string().trim().url('Instagram havolasi https://… ko‘rinishida bo‘lsin.')]),
  address: z.string().trim().max(200),
});

export async function saveSettingsAction(_p: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const current = await getSettings();
  const contacts = { ...current.contacts };
  for (const l of LOCALES) {
    const r = contactsSchema.safeParse({
      phoneDisplay: f.get(`${l}.phoneDisplay`) ?? '',
      whatsapp: f.get(`${l}.whatsapp`) ?? '',
      email: f.get(`${l}.email`) ?? '',
      telegram: f.get(`${l}.telegram`) ?? '',
      instagram: f.get(`${l}.instagram`) ?? '',
      address: f.get(`${l}.address`) ?? '',
    });
    if (!r.success) return { error: `${l.toUpperCase()}: ${r.error.issues[0].message}` };
    contacts[l] = r.data;
  }
  const video = String(f.get('video') ?? '').trim();
  if (video && !/^(\/(media|videos)\/[\w.-]+|https:\/\/\S+)$/.test(video)) return { error: 'Video manzili noto‘g‘ri.' };
  await saveSettings({ contacts, video });
  revalidateSite();
  return { saved: true };
}
