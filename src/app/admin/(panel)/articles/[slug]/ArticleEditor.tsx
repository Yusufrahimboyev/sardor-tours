'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { imageSrc } from '@/lib/images';
import type { Article } from '@/lib/server/articles';
import { saveArticleAction, type ArticleEditorData, type FormState } from '../../../contentActions';
import { useAdminDict } from '../../../i18n/client';
import s from '../../tours/[slug]/editor.module.css';

type Lang = 'en' | 'ru' | 'uz';
const TABS: Lang[] = ['en', 'ru', 'uz'];

function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);
}

export function ArticleEditor({ article, tours, justSaved }: { article: Article; tours: { slug: string; name: string }[]; justSaved: boolean }) {
  const t = useAdminDict();
  const A = t.articles;
  const empty = { title: '', excerpt: '', body: '' };
  const [d, setD] = useState<ArticleEditorData>({
    active: article.active,
    slug: article.slug,
    cover: article.cover,
    relatedTours: article.relatedTours,
    i18n: { en: article.i18n.en ?? empty, ru: article.i18n.ru ?? empty, uz: article.i18n.uz ?? empty },
  });
  const [lang, setLang] = useState<Lang>('en');
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const slugTouched = useRef(!article.slug.startsWith('new-article'));
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(saveArticleAction.bind(null, article.slug), { saved: justSaved });

  useEffect(() => {
    if (state.saved) setDirty(false);
  }, [state]);

  const tx = d.i18n[lang];
  const setTx = (patch: Partial<typeof tx>) => {
    setD((p) => {
      const next = { ...p, i18n: { ...p.i18n, [lang]: { ...p.i18n[lang], ...patch } } };
      if (lang === 'en' && patch.title !== undefined && !slugTouched.current) next.slug = slugify(patch.title) || p.slug;
      return next;
    });
    setDirty(true);
  };
  const set = <K extends keyof ArticleEditorData>(k: K, v: ArticleEditorData[K]) => {
    setD((p) => ({ ...p, [k]: v }));
    setDirty(true);
  };

  const uploadCover = async (file: File) => {
    setUploading(true);
    setUploadErr('');
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await fetch('/api/admin/upload/', { method: 'POST', body: fd });
      const data = (await res.json()) as { paths?: string[]; errors?: string[] };
      if (data.paths?.[0]) set('cover', data.paths[0]);
      else setUploadErr(data.errors?.[0] ?? t.common.uploadFailed);
    } catch {
      setUploadErr(t.common.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={action} className={s.layout} style={{ gridTemplateColumns: 'minmax(0,1fr) 300px' }}>
      <input type="hidden" name="data" value={JSON.stringify(d)} />
      <div className={s.main}>
        {state.error && (
          <p className={s.alertErr} role="alert">
            ⚠️ {state.error}
          </p>
        )}
        {state.saved && !state.error && !dirty && (
          <p className={s.alertOk} role="status">
            {t.common.savedShort}
          </p>
        )}

        <div className={s.langBar}>
          <span>{A.lang}</span>
          <div className={s.langTabs} role="tablist">
            {TABS.map((l) => (
              <button key={l} type="button" role="tab" aria-selected={lang === l} className={lang === l ? s.langOn : s.lang} onClick={() => setLang(l)}>
                {t.common.langTab[l]}
                {!d.i18n[l].title && <i className={s.langWarn} title={A.notWritten}>!</i>}
              </button>
            ))}
          </div>
          <small>{A.fallbackNote}</small>
        </div>

        <section className={s.section}>
          <h2>
            {A.text} ({lang.toUpperCase()})
          </h2>
          <div className={s.sectionBody}>
            <div className={s.field}>
              <div className={s.label}>{A.fTitle}</div>
              <input value={tx.title} onChange={(e) => setTx({ title: e.target.value })} placeholder={lang === 'en' ? 'What to pack for Sharm El Sheikh' : d.i18n.en.title} />
            </div>
            <div className={s.field}>
              <div className={s.label}>{A.fExcerpt}</div>
              <textarea value={tx.excerpt} onChange={(e) => setTx({ excerpt: e.target.value })} rows={2} placeholder={lang === 'en' ? '1–2 sentences shown in the list and on Google' : d.i18n.en.excerpt} />
            </div>
            <div className={s.field}>
              <div className={s.label}>{A.fBody}</div>
              <textarea value={tx.body} onChange={(e) => setTx({ body: e.target.value })} rows={20} placeholder={lang === 'en' ? 'Write the article here…' : d.i18n.en.body.slice(0, 400)} />
              <small>
                {A.formatHelpA} <code>## </code> {A.formatHelpB} <code>- </code> {A.formatHelpC}
              </small>
            </div>
          </div>
        </section>

        <section className={s.section}>
          <h2>{A.related}</h2>
          <p className={s.hint}>{A.relatedHint}</p>
          <div className={s.chips} style={{ marginTop: 12 }}>
            {tours.map((t) => {
              const on = d.relatedTours.includes(t.slug);
              return (
                <button
                  key={t.slug}
                  type="button"
                  className={on ? s.chipOn : s.chip}
                  aria-pressed={on}
                  onClick={() => set('relatedTours', on ? d.relatedTours.filter((x) => x !== t.slug) : [...d.relatedTours, t.slug])}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className={s.section}>
          <h2>{A.url}</h2>
          <div className={s.sectionBody}>
            <div className={s.field}>
              <input
                value={d.slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  set('slug', slugify(e.target.value));
                }}
              />
              <small>/en/guide/{d.slug}/ · /ru/guide/{d.slug}/ · /uz/guide/{d.slug}/</small>
            </div>
          </div>
        </section>
      </div>

      <aside className={s.aside}>
        <div className={s.asideInner}>
          <div className={s.previewLabel}>{A.cover}</div>
          <div
            className={s.previewImg}
            style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current?.click()}
          >
            {d.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageSrc(d.cover, 600, 400)} alt="" />
            ) : (
              <span>{uploading ? t.common.uploading : A.pickImage}</span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadCover(f);
              e.target.value = '';
            }}
          />
          {uploadErr && <p className={s.unsaved}>{uploadErr}</p>}
          {d.cover && (
            <button type="button" className={s.addLink} onClick={() => fileRef.current?.click()}>
              {A.otherImage}
            </button>
          )}
          <label className={`${s.switch} ${s.visible}`}>
            <input type="checkbox" checked={d.active} onChange={(e) => set('active', e.target.checked)} />
            <span>{d.active ? A.isPublished : A.isDraft}</span>
          </label>
          <button type="submit" className={s.save} disabled={pending}>
            {pending ? t.common.saving : dirty ? t.common.save : t.common.savedBtn}
          </button>
        </div>
      </aside>
    </form>
  );
}
