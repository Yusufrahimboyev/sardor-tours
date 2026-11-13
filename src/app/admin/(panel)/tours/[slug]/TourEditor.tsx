'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '@/data/categories';
import type { Tour, TourTranslation } from '@/data/tours';
import { imageSrc } from '@/lib/images';
import { saveTourAction, type TourEditorData, type TourFormState } from '../../../tourActions';
import { useAdminDict } from '../../../i18n/client';
import type { AdminDict } from '../../../i18n/dict';
import s from './editor.module.css';

type Price = TourEditorData['prices'][number];

/** Rows added by the quick buttons. The row label is site content (English); the button text is UI. */
const PRESETS: { label: 'presetAdults' | 'presetChildren' | 'presetInfants' | 'presetExtra'; title: string; row: Omit<Price, 'key'> }[] = [
  { label: 'presetAdults', title: 'Adults', row: { label: 'Adults', price: 0, unit: 'person', kind: 'counter', group: 'guests' } },
  { label: 'presetChildren', title: 'Children', row: { label: 'Children 5–11 years', price: 0, unit: 'person', kind: 'counter', group: 'guests' } },
  { label: 'presetInfants', title: 'Infants', row: { label: 'Infants 0–4 years', price: 0, unit: '', kind: 'counter', group: 'guests' } },
  { label: 'presetExtra', title: 'Extra', row: { label: '', price: 0, unit: 'person', kind: 'counter', group: 'extras' } },
];

const SECTIONS = ['basics', 'photos', 'prices', 'schedule', 'details', 'advanced'] as const;

function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

type Lang = 'en' | 'ru' | 'uz';
type Tr = TourEditorData['i18n']['ru'];
const LANG_TABS: Lang[] = ['en', 'ru', 'uz'];

function pickTr(x: TourTranslation | undefined): Tr {
  return {
    name: x?.name ?? '',
    title: x?.title ?? '',
    excerpt: x?.excerpt ?? '',
    duration: x?.duration ?? '',
    timeText: x?.timeText ?? '',
    highlights: x?.highlights ?? [],
    included: x?.included ?? [],
    notIncluded: x?.notIncluded ?? [],
    bring: x?.bring ?? [],
    itinerary: x?.itinerary ?? [],
    faq: x?.faq ?? [],
    options: x?.options ?? {},
    metaTitle: x?.metaTitle ?? '',
    metaDescription: x?.metaDescription ?? '',
  };
}

function fromTour(t: Tour): TourEditorData {
  return {
    i18n: { ru: pickTr(t.i18n?.ru), uz: pickTr(t.i18n?.uz) },
    active: t.active !== false,
    name: t.name,
    slug: t.slug,
    title: t.title === t.name ? '' : t.title,
    category: t.category,
    badge: t.badge ?? '',
    excerpt: t.excerpt,
    photos: t.gallery.length ? [t.cardImage, ...t.gallery.map((g) => g.src).filter((p) => p !== t.cardImage)].filter(Boolean) : t.cardImage ? [t.cardImage] : [],
    prices: t.options.map((o) => ({ key: o.key, label: o.label, price: o.price, unit: o.unit, kind: o.kind, group: o.group, ...(o.max ? { max: o.max } : {}) })),
    oldPrice: t.heroPrices[0]?.oldPrice ?? null,
    priceUnit: t.priceUnit ?? '',
    requiresDeposit: t.requiresDeposit,
    duration: t.duration,
    days: t.scheduleDays ?? [],
    timeText: t.timeText ?? '',
    timeSlots: t.timeSlots,
    highlights: t.highlights,
    included: t.included,
    notIncluded: t.notIncluded,
    bring: t.bring,
    itinerary: t.itinerary,
    faq: t.faq,
    metaTitle: t.metaTitle === t.name ? '' : t.metaTitle,
    metaDescription: t.metaDescription === t.excerpt ? '' : t.metaDescription,
  };
}

export function TourEditor({ tour, justSaved }: { tour: Tour; justSaved: boolean }) {
  const t = useAdminDict();
  const E = t.editor;
  const DAYS = E.days;
  const [d, setD] = useState<TourEditorData>(() => fromTour(tour));
  const [dirty, setDirty] = useState(false);
  const slugTouched = useRef(!tour.slug.startsWith('new-tour'));
  const [state, action, pending] = useActionState<TourFormState, FormData>(saveTourAction.bind(null, tour.slug), { saved: justSaved });

  const set = <K extends keyof TourEditorData>(k: K, v: TourEditorData[K]) => {
    setD((prev) => ({ ...prev, [k]: v }));
    setDirty(true);
  };

  // Text fields are edited per language; photos, prices and schedule are shared.
  const [lang, setLang] = useState<Lang>('en');
  type TxtKey = 'name' | 'title' | 'excerpt' | 'duration' | 'timeText' | 'metaTitle' | 'metaDescription';
  type ListKey = 'highlights' | 'included' | 'notIncluded' | 'bring';
  const setTr = (patch: Partial<Tr>) => {
    if (lang === 'en') return;
    setD((prev) => ({ ...prev, i18n: { ...prev.i18n, [lang]: { ...prev.i18n[lang], ...patch } } }));
    setDirty(true);
  };
  const txt = (k: TxtKey) => (lang === 'en' ? d[k] : d.i18n[lang][k]);
  const setTxt = (k: TxtKey, v: string) => (lang === 'en' ? set(k, v) : setTr({ [k]: v }));
  /** In RU/UZ the English text is shown as the placeholder so the translator sees the original. */
  const ph = (k: TxtKey, fallback: string) => (lang === 'en' ? fallback : d[k] || fallback);
  const list = (k: ListKey) => (lang === 'en' ? d[k] : d.i18n[lang][k]);
  const setList = (k: ListKey, v: string[]) => (lang === 'en' ? set(k, v) : setTr({ [k]: v }));
  const itin = lang === 'en' ? d.itinerary : d.i18n[lang].itinerary;
  const faq = lang === 'en' ? d.faq : d.i18n[lang].faq;
  const trCount = (l: 'ru' | 'uz') => {
    const x = d.i18n[l];
    return [x.name, x.excerpt, x.duration].filter(Boolean).length + (x.included.length ? 1 : 0) + (x.itinerary.length ? 1 : 0);
  };

  useEffect(() => {
    if (state.saved) setDirty(false);
  }, [state]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const paid = d.prices.filter((p) => p.group === 'guests' && p.price > 0);
  const from = paid.length ? Math.min(...paid.map((p) => p.price)) : null;

  const checklist = [
    { ok: d.name.trim().length >= 3 && d.name !== 'Yangi tur' && d.name !== 'New tour', label: E.ckName },
    { ok: d.photos.length > 0, label: E.ckPhoto },
    { ok: paid.length > 0, label: E.ckPrice },
    { ok: !!d.excerpt.trim(), label: E.ckExcerpt },
    { ok: !!d.duration.trim(), label: E.ckDuration },
  ];

  return (
    <form action={action} className={s.layout}>
      <input type="hidden" name="data" value={JSON.stringify(d)} />

      <nav className={s.sideNav} aria-label={E.navAria}>
        {SECTIONS.map((id, i) => (
          <a key={id} href={`#${id}`}>
            {E.nav[i]}
          </a>
        ))}
      </nav>

      <div className={s.main}>
        {state.error && (
          <p className={s.alertErr} role="alert">
            ⚠️ {state.error}
          </p>
        )}
        {state.saved && !state.error && !dirty && (
          <p className={s.alertOk} role="status">
            {t.common.savedSite}
          </p>
        )}

        <div className={s.langBar}>
          <span>{E.textLang}</span>
          <div className={s.langTabs} role="tablist" aria-label={E.textLang}>
            {LANG_TABS.map((l) => (
              <button key={l} type="button" role="tab" aria-selected={lang === l} className={lang === l ? s.langOn : s.lang} onClick={() => setLang(l)}>
                {t.common.langTab[l]}
                {l !== 'en' && trCount(l) < 5 && <i className={s.langWarn} title={E.incomplete}>!</i>}
              </button>
            ))}
          </div>
          <small>
            {lang === 'en' ? E.mainLangNote : E.trNote}
          </small>
        </div>

        <Section id="basics" title={E.sBasics} hint={E.sBasicsHint}>
          <Field label={E.name} hint={E.nameHint}>
            <input
              value={txt('name')}
              onChange={(e) => {
                if (lang !== 'en') return setTxt('name', e.target.value);
                set('name', e.target.value);
                if (!slugTouched.current) setD((p) => ({ ...p, name: e.target.value, slug: slugify(e.target.value) || p.slug }));
              }}
              placeholder={ph('name', 'Sunset Boat Trip')}
              required={lang === 'en'}
            />
          </Field>
          <Field label={E.category}>
            <div className={s.chips}>
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  className={d.category === c.key ? s.chipOn : s.chip}
                  aria-pressed={d.category === c.key}
                  onClick={() => set('category', c.key)}
                >
                  {t.categories[c.key]}
                </button>
              ))}
            </div>
          </Field>
          <Field label={E.excerpt} hint={E.excerptHint}>
            <textarea value={txt('excerpt')} onChange={(e) => setTxt('excerpt', e.target.value)} rows={3} placeholder={ph('excerpt', 'Relax on a yacht, snorkel two coral reefs and enjoy lunch on board.')} />
          </Field>
          <Field label={E.badge} hint={E.badgeHint}>
            <div className={s.chips}>
              {['', 'Bestseller', 'New', 'VIP', 'Top Rated'].map((b) => (
                <button type="button" key={b || 'none'} className={d.badge === b ? s.chipOn : s.chip} onClick={() => set('badge', b)}>
                  {b || E.none}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        <Section id="photos" title={E.sPhotos} hint={E.sPhotosHint}>
          <PhotoUploader t={t} photos={d.photos} onChange={(p) => set('photos', p)} />
        </Section>

        <Section id="prices" title={E.sPrices} hint={E.sPricesHint}>
          <div className={s.priceList}>
            {d.prices.map((p, i) => (
              <PriceRow
                key={i}
                t={t}
                p={p}
                label={lang === 'en' ? p.label : (d.i18n[lang].options[p.key] ?? '')}
                labelPlaceholder={lang === 'en' ? 'Adults' : p.label}
                onLabel={(v) =>
                  lang === 'en'
                    ? set('prices', d.prices.map((x, j) => (j === i ? { ...x, label: v } : x)))
                    : setTr({ options: { ...d.i18n[lang].options, [p.key]: v } })
                }
                onChange={(np) => set('prices', d.prices.map((x, j) => (j === i ? np : x)))}
                onRemove={() => set('prices', d.prices.filter((_, j) => j !== i))}
              />
            ))}
          </div>
          <div className={s.chips}>
            {PRESETS.map((pr) => (
              <button
                type="button"
                key={pr.label}
                className={s.addBtn}
                onClick={() => set('prices', [...d.prices, { ...pr.row, key: `${pr.title.toLowerCase()}_${Date.now().toString(36)}` }])}
              >
                {E[pr.label]}
              </button>
            ))}
          </div>
          <div className={s.row2}>
            <Field label={E.oldPrice} hint={E.oldPriceHint}>
              <div className={s.money}>
                <span>£</span>
                <input
                  type="number"
                  min={0}
                  value={d.oldPrice ?? ''}
                  onChange={(e) => set('oldPrice', e.target.value ? Number(e.target.value) : null)}
                  placeholder="—"
                />
              </div>
            </Field>
            <Field label={E.prepay}>
              <label className={s.switch}>
                <input type="checkbox" checked={d.requiresDeposit} onChange={(e) => set('requiresDeposit', e.target.checked)} />
                <span>{E.deposit}</span>
              </label>
            </Field>
          </div>
        </Section>

        <Section id="schedule" title={E.sSchedule}>
          <div className={s.row2}>
            <Field label={E.duration} hint={E.durationHint}>
              <input value={txt('duration')} onChange={(e) => setTxt('duration', e.target.value)} placeholder={ph('duration', '9 hours')} />
            </Field>
            <Field label={E.timeText} hint={E.timeTextHint}>
              <input value={txt('timeText')} onChange={(e) => setTxt('timeText', e.target.value)} placeholder={ph('timeText', '8:00 AM – 6:00 PM')} />
            </Field>
          </div>
          <Field label={E.whichDays}>
            <div className={s.chips}>
              <button type="button" className={d.days.length === 0 ? s.chipOn : s.chip} onClick={() => set('days', [])}>
                {E.daily}
              </button>
              {DAYS.map((day, i) => {
                const on = d.days.includes(i);
                return (
                  <button
                    type="button"
                    key={i}
                    title={E.daysFull[i]}
                    className={on ? s.chipOn : s.chip}
                    aria-pressed={on}
                    onClick={() => set('days', on ? d.days.filter((x) => x !== i) : [...d.days, i])}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label={E.slots} hint={E.slotsHint}>
            <TagInput values={d.timeSlots} onChange={(v) => set('timeSlots', v)} placeholder="10:00 AM" t={t} />
          </Field>
        </Section>

        <Section id="details" title={E.sDetails}>
          <ListEditor t={t} label={E.included} values={list('included')} refs={lang === 'en' ? undefined : d.included} onChange={(v) => setList('included', v)} placeholder="Hotel pick-up and drop-off" tone="green" />
          <ListEditor t={t} label={E.notIncluded} values={list('notIncluded')} refs={lang === 'en' ? undefined : d.notIncluded} onChange={(v) => setList('notIncluded', v)} placeholder="Snorkel equipment rental" tone="red" />
          <ListEditor t={t} label={E.bring} values={list('bring')} refs={lang === 'en' ? undefined : d.bring} onChange={(v) => setList('bring', v)} placeholder="Swimwear and a towel" tone="blue" />
          <ListEditor t={t} label={E.highlights} values={list('highlights')} refs={lang === 'en' ? undefined : d.highlights} onChange={(v) => setList('highlights', v)} placeholder="English-speaking guide" />
          <PairEditor
            t={t}
            label={E.itinerary}
            items={itin.map((x) => ({ a: x.title, b: x.text }))}
            refs={lang === 'en' ? undefined : d.itinerary.map((x) => ({ a: x.title, b: x.text }))}
            onChange={(v) => {
              const next = v.map((x) => ({ title: x.a, text: x.b }));
              if (lang === 'en') set('itinerary', next);
              else setTr({ itinerary: next });
            }}
            aLabel={E.stepName}
            bLabel={E.stepText}
            aPlaceholder="Hotel pick-up"
            bPlaceholder="We pick you up from your hotel at 8:00 AM…"
            addLabel={E.addStep}
          />
          <PairEditor
            t={t}
            label={E.faq}
            items={faq.map((x) => ({ a: x.q, b: x.a }))}
            refs={lang === 'en' ? undefined : d.faq.map((x) => ({ a: x.q, b: x.a }))}
            onChange={(v) => {
              const next = v.map((x) => ({ q: x.a, a: x.b }));
              if (lang === 'en') set('faq', next);
              else setTr({ faq: next });
            }}
            aLabel={E.question}
            bLabel={E.answer}
            aPlaceholder="Is the tour suitable for children?"
            bPlaceholder="Yes, children from 5 years old are welcome."
            addLabel={E.addQuestion}
          />
        </Section>

        <Section id="advanced" title={E.sAdvanced} hint={E.sAdvancedHint}>
          <details className={s.more}>
            <summary>{E.open}</summary>
            <Field label={E.url} hint={E.urlHint(d.slug)}>
              <input
                value={d.slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  set('slug', slugify(e.target.value));
                }}
              />
            </Field>
            <Field label={E.pageTitle}>
              <input value={txt('title')} onChange={(e) => setTxt('title', e.target.value)} placeholder={txt('name') || d.name} />
            </Field>
            <Field label={E.priceUnit} hint={E.priceUnitHint}>
              <input value={d.priceUnit} onChange={(e) => set('priceUnit', e.target.value)} placeholder="per boat" />
            </Field>
            <Field label={E.seoTitle}>
              <input value={txt('metaTitle')} onChange={(e) => setTxt('metaTitle', e.target.value)} placeholder={txt('title') || txt('name') || d.name} />
            </Field>
            <Field label={E.seoDesc}>
              <textarea value={txt('metaDescription')} onChange={(e) => setTxt('metaDescription', e.target.value)} rows={2} placeholder={txt('excerpt') || d.excerpt} />
            </Field>
          </details>
        </Section>
      </div>

      <aside className={s.aside}>
        <div className={s.asideInner}>
          <div className={s.previewLabel}>{E.preview}</div>
          <div className={s.preview}>
            <div className={s.previewImg}>
              {d.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageSrc(d.photos[0], 600, 400)} alt="" />
              ) : (
                <span>{t.common.noImage}</span>
              )}
              {d.badge && <b>{d.badge}</b>}
            </div>
            <div className={s.previewBody}>
              <div className={s.previewName}>{txt('name') || d.name || E.previewName}</div>
              <div className={s.previewMeta}>
                {d.duration || '— hours'} · {d.days.length && d.days.length < 7 ? d.days.map((x) => DAYS[x]).join(', ') : 'Daily'}
              </div>
              <div className={s.previewPrice}>
                <small>from</small> {from !== null ? `£${from}` : '£—'}
                {d.oldPrice && from !== null && d.oldPrice > from && <s>£{d.oldPrice}</s>}
              </div>
            </div>
          </div>

          <ul className={s.checklist}>
            {checklist.map((c) => (
              <li key={c.label} className={c.ok ? s.ok : undefined}>
                {c.ok ? '✓' : '○'} {c.label}
              </li>
            ))}
          </ul>

          <label className={`${s.switch} ${s.visible}`}>
            <input type="checkbox" checked={d.active} onChange={(e) => set('active', e.target.checked)} />
            <span>{d.active ? t.common.visibleOnSite : t.common.hiddenOffSite}</span>
          </label>

          <button type="submit" className={s.save} disabled={pending}>
            {pending ? t.common.saving : dirty ? t.common.save : t.common.savedBtn}
          </button>
          {dirty && <p className={s.unsaved}>{t.common.unsaved}</p>}
        </div>
      </aside>
    </form>
  );
}

function Section({ id, title, hint, children }: { id: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={s.section}>
      <h2>{title}</h2>
      {hint && <p className={s.hint}>{hint}</p>}
      <div className={s.sectionBody}>{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className={s.field}>
      <div className={s.label}>{label}</div>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}

function PriceRow({
  t,
  p,
  label,
  labelPlaceholder,
  onLabel,
  onChange,
  onRemove,
}: {
  t: AdminDict;
  p: Price;
  label: string;
  labelPlaceholder: string;
  onLabel: (v: string) => void;
  onChange: (p: Price) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const E = t.editor;
  return (
    <div className={s.priceRow}>
      <div className={s.priceMain}>
        <span className={p.group === 'guests' ? s.tagGuest : s.tagExtra}>{p.group === 'guests' ? E.guest : E.extra}</span>
        <input className={s.priceLabel} value={label} onChange={(e) => onLabel(e.target.value)} placeholder={labelPlaceholder} aria-label={E.priceName} />
        <div className={s.money}>
          <span>£</span>
          <input type="number" min={0} step="0.5" value={p.price} onChange={(e) => onChange({ ...p, price: Number(e.target.value) })} aria-label={E.price} />
        </div>
        <span className={s.per}>{p.price === 0 ? t.common.free : p.unit ? `/ ${p.unit}` : ''}</span>
        <button type="button" className={s.iconBtn} onClick={() => setOpen((o) => !o)} aria-expanded={open} title={E.priceSettings}>
          ⚙
        </button>
        <button type="button" className={`${s.iconBtn} ${s.danger}`} onClick={onRemove} title={t.common.delete} aria-label={E.removePrice}>
          ✕
        </button>
      </div>
      {open && (
        <div className={s.priceMore}>
          <label>
            {E.unitFor}
            <select value={p.unit} onChange={(e) => onChange({ ...p, unit: e.target.value })}>
              {['person', 'boat', 'hour', 'group', 'buggy', 'seat', ''].map((u) => (
                <option key={u} value={u}>
                  {u ? E.unitEach(u) : '—'}
                </option>
              ))}
              {!['person', 'boat', 'hour', 'group', 'buggy', 'seat', ''].includes(p.unit) && <option value={p.unit}>{p.unit}</option>}
            </select>
          </label>
          <label>
            {E.type}
            <select value={p.group} onChange={(e) => onChange({ ...p, group: e.target.value as Price['group'] })}>
              <option value="guests">{E.typeGuest}</option>
              <option value="extras">{E.typeExtra}</option>
            </select>
          </label>
          <label>
            {E.pickMode}
            <select value={p.kind} onChange={(e) => onChange({ ...p, kind: e.target.value as Price['kind'] })}>
              <option value="counter">{E.modeCounter}</option>
              <option value="toggle">{E.modeToggle}</option>
            </select>
          </label>
          <label>
            {E.max}
            <input
              type="number"
              min={1}
              max={99}
              value={p.max ?? ''}
              placeholder="30"
              onChange={(e) => onChange({ ...p, max: e.target.value ? Number(e.target.value) : undefined })}
            />
          </label>
        </div>
      )}
    </div>
  );
}

function ListEditor({
  t,
  label,
  values,
  refs,
  onChange,
  placeholder,
  tone,
}: {
  t: AdminDict;
  label: string;
  values: string[];
  /** English originals shown as placeholders while translating. */
  refs?: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  tone?: 'green' | 'red' | 'blue';
}) {
  return (
    <div className={`${s.listBox} ${tone ? s[`tone_${tone}`] : ''}`}>
      <div className={s.label}>{label}</div>
      {values.map((v, i) => (
        <div key={i} className={s.listRow}>
          <input value={v} onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))} placeholder={refs?.[i] ?? placeholder} />
          <button type="button" className={`${s.iconBtn} ${s.danger}`} onClick={() => onChange(values.filter((_, j) => j !== i))} aria-label={t.common.delete}>
            ✕
          </button>
        </div>
      ))}
      <div className={s.listBtns}>
        <button type="button" className={s.addLink} onClick={() => onChange([...values, ''])}>
          {t.common.add}
        </button>
        {refs && refs.length > 0 && values.length < refs.length && (
          <button type="button" className={s.addLink} onClick={() => onChange([...values, ...Array(refs.length - values.length).fill('')])}>
            {t.editor.addFromEn(refs.length - values.length)}
          </button>
        )}
      </div>
    </div>
  );
}

function PairEditor(props: {
  t: AdminDict;
  label: string;
  items: { a: string; b: string }[];
  refs?: { a: string; b: string }[];
  onChange: (v: { a: string; b: string }[]) => void;
  aLabel: string;
  bLabel: string;
  aPlaceholder: string;
  bPlaceholder: string;
  addLabel: string;
}) {
  const { items, onChange, t } = props;
  const upd = (i: number, patch: Partial<{ a: string; b: string }>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className={s.listBox}>
      <div className={s.label}>{props.label}</div>
      {items.map((it, i) => (
        <div key={i} className={s.pair}>
          <span className={s.pairNum}>{i + 1}</span>
          <div className={s.pairFields}>
            <input value={it.a} onChange={(e) => upd(i, { a: e.target.value })} placeholder={props.refs?.[i]?.a ?? props.aPlaceholder} aria-label={props.aLabel} />
            <textarea value={it.b} onChange={(e) => upd(i, { b: e.target.value })} placeholder={props.refs?.[i]?.b ?? props.bPlaceholder} rows={2} aria-label={props.bLabel} />
          </div>
          <div className={s.pairBtns}>
            <button type="button" className={s.iconBtn} onClick={() => move(i, -1)} aria-label={t.editor.up}>
              ↑
            </button>
            <button type="button" className={s.iconBtn} onClick={() => move(i, 1)} aria-label={t.editor.down}>
              ↓
            </button>
            <button type="button" className={`${s.iconBtn} ${s.danger}`} onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={t.common.delete}>
              ✕
            </button>
          </div>
        </div>
      ))}
      <div className={s.listBtns}>
        <button type="button" className={s.addLink} onClick={() => onChange([...items, { a: '', b: '' }])}>
          {props.addLabel}
        </button>
        {props.refs && props.refs.length > items.length && (
          <button
            type="button"
            className={s.addLink}
            onClick={() => onChange([...items, ...Array.from({ length: props.refs!.length - items.length }, () => ({ a: '', b: '' }))])}
          >
            {t.editor.addFromEn(props.refs.length - items.length)}
          </button>
        )}
      </div>
    </div>
  );
}

function TagInput({ t, values, onChange, placeholder }: { t: AdminDict; values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [v, setV] = useState('');
  const add = () => {
    const val = v.trim();
    if (val && !values.includes(val)) onChange([...values, val]);
    setV('');
  };
  return (
    <div className={s.tags}>
      {values.map((tag) => (
        <span key={tag} className={s.tag}>
          {tag}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== tag))} aria-label={t.editor.removeTag(tag)}>
            ✕
          </button>
        </span>
      ))}
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={placeholder}
      />
      <button type="button" className={s.addLink} onClick={add}>
        {t.common.add}
      </button>
    </div>
  );
}

function PhotoUploader({ t, photos, onChange }: { t: AdminDict; photos: string[]; onChange: (p: string[]) => void }) {
  const E = t.editor;
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    setBusy(true);
    setErrors([]);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append('files', f));
      const res = await fetch('/api/admin/upload/', { method: 'POST', body: fd });
      const data = (await res.json()) as { paths?: string[]; errors?: string[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? t.common.uploadFailed);
      onChange([...photos, ...(data.paths ?? [])]);
      setErrors(data.errors ?? []);
    } catch (e) {
      setErrors([e instanceof Error ? e.message : t.common.uploadFailed]);
    } finally {
      setBusy(false);
    }
  };

  const move = (i: number, j: number) => {
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    const [x] = next.splice(i, 1);
    next.splice(j, 0, x);
    onChange(next);
  };

  return (
    <div>
      <div
        className={`${s.drop} ${drag ? s.dropOn : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void upload(e.dataTransfer.files);
        }}
        onClick={() => input.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
      >
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void upload(e.target.files);
            e.target.value = '';
          }}
        />
        <div className={s.dropIcon}>📷</div>
        <b>{busy ? t.common.uploading : E.drop}</b>
        <small>{E.dropHint}</small>
      </div>
      {errors.length > 0 && (
        <ul className={s.uploadErrors} role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      {photos.length > 0 && (
        <div className={s.thumbs}>
          {photos.map((p, i) => (
            <figure key={p + i} className={s.thumb}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc(p, 320, 220)} alt="" />
              {i === 0 && <span className={s.cover}>{E.cover}</span>}
              <figcaption>
                {i !== 0 && (
                  <button type="button" onClick={() => move(i, 0)} title={E.makeCover}>
                    ★
                  </button>
                )}
                <button type="button" onClick={() => move(i, i - 1)} title={E.left} aria-label={E.left}>
                  ←
                </button>
                <button type="button" onClick={() => move(i, i + 1)} title={E.right} aria-label={E.right}>
                  →
                </button>
                <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))} title={t.common.delete} aria-label={E.removePhoto} className={s.danger}>
                  ✕
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
