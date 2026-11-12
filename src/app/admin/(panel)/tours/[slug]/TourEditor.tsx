'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '@/data/categories';
import type { Tour } from '@/data/tours';
import { imageSrc } from '@/lib/images';
import { saveTourAction, type TourEditorData, type TourFormState } from '../../../tourActions';
import s from './editor.module.css';

const DAYS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']; // Sun..Sat (Yakshanba … Shanba)
const DAY_FULL = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

type Price = TourEditorData['prices'][number];

const PRESETS: { label: string; title: string; row: Omit<Price, 'key'> }[] = [
  { label: '+ Kattalar', title: 'Adults', row: { label: 'Adults', price: 0, unit: 'person', kind: 'counter', group: 'guests' } },
  { label: '+ Bolalar', title: 'Children', row: { label: 'Children 5–11 years', price: 0, unit: 'person', kind: 'counter', group: 'guests' } },
  { label: '+ Chaqaloqlar (bepul)', title: 'Infants', row: { label: 'Infants 0–4 years', price: 0, unit: '', kind: 'counter', group: 'guests' } },
  { label: '+ Qo‘shimcha xizmat', title: 'Extra', row: { label: '', price: 0, unit: 'person', kind: 'counter', group: 'extras' } },
];

const SECTIONS = [
  ['basics', '1. Asosiy'],
  ['photos', '2. Rasmlar'],
  ['prices', '3. Narxlar'],
  ['schedule', '4. Vaqt'],
  ['details', '5. Tafsilotlar'],
  ['advanced', '6. Qo‘shimcha'],
] as const;

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

function fromTour(t: Tour): TourEditorData {
  return {
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
  const [d, setD] = useState<TourEditorData>(() => fromTour(tour));
  const [dirty, setDirty] = useState(false);
  const slugTouched = useRef(!tour.slug.startsWith('new-tour'));
  const [state, action, pending] = useActionState<TourFormState, FormData>(saveTourAction.bind(null, tour.slug), { saved: justSaved });

  const set = <K extends keyof TourEditorData>(k: K, v: TourEditorData[K]) => {
    setD((prev) => ({ ...prev, [k]: v }));
    setDirty(true);
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
    { ok: d.name.trim().length >= 3 && d.name !== 'Yangi tur', label: 'Nomi' },
    { ok: d.photos.length > 0, label: 'Kamida 1 ta rasm' },
    { ok: paid.length > 0, label: 'Narx' },
    { ok: !!d.excerpt.trim(), label: 'Qisqa tavsif' },
    { ok: !!d.duration.trim(), label: 'Davomiyligi' },
  ];

  return (
    <form action={action} className={s.layout}>
      <input type="hidden" name="data" value={JSON.stringify(d)} />

      <nav className={s.sideNav} aria-label="Bo‘limlar">
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`}>
            {label}
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
            ✓ Saqlandi — saytda yangilandi.
          </p>
        )}

        <Section id="basics" title="1. Asosiy ma’lumot" hint="Saytdagi matnlarni ingliz tilida yozing — mijozlar inglizcha o‘qiydi.">
          <Field label="Tur nomi" hint="Masalan: Sunset Boat Trip with Snorkeling">
            <input
              value={d.name}
              onChange={(e) => {
                set('name', e.target.value);
                if (!slugTouched.current) setD((p) => ({ ...p, name: e.target.value, slug: slugify(e.target.value) || p.slug }));
              }}
              placeholder="Sunset Boat Trip"
              required
            />
          </Field>
          <Field label="Kategoriya">
            <div className={s.chips}>
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  className={d.category === c.key ? s.chipOn : s.chip}
                  aria-pressed={d.category === c.key}
                  onClick={() => set('category', c.key)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Qisqa tavsif" hint="1–2 gap. Tur kartasida va qidiruvda ko‘rinadi.">
            <textarea value={d.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={3} placeholder="Relax on a yacht, snorkel two coral reefs and enjoy lunch on board." />
          </Field>
          <Field label="Belgi (ixtiyoriy)" hint="Kartaning burchagida chiqadi.">
            <div className={s.chips}>
              {['', 'Bestseller', 'New', 'VIP', 'Top Rated'].map((b) => (
                <button type="button" key={b || 'none'} className={d.badge === b ? s.chipOn : s.chip} onClick={() => set('badge', b)}>
                  {b || 'Yo‘q'}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        <Section id="photos" title="2. Rasmlar" hint="Birinchi rasm — muqova (kartada chiqadi). Rasmlarni sudrab tashlang yoki tanlang.">
          <PhotoUploader photos={d.photos} onChange={(p) => set('photos', p)} />
        </Section>

        <Section id="prices" title="3. Narxlar" hint="Mijoz har bir qatorni − / + bilan tanlaydi. 0 yozilsa — bepul.">
          <div className={s.priceList}>
            {d.prices.map((p, i) => (
              <PriceRow
                key={i}
                p={p}
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
                {pr.label}
              </button>
            ))}
          </div>
          <div className={s.row2}>
            <Field label="Eski narx (ixtiyoriy)" hint="Chizilgan holda ko‘rsatiladi, chegirma % avtomatik. Faqat haqiqiy eski narxni yozing.">
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
            <Field label="Oldindan to‘lov">
              <label className={s.switch}>
                <input type="checkbox" checked={d.requiresDeposit} onChange={(e) => set('requiresDeposit', e.target.checked)} />
                <span>Depozit talab qilinadi</span>
              </label>
            </Field>
          </div>
        </Section>

        <Section id="schedule" title="4. Vaqt va jadval">
          <div className={s.row2}>
            <Field label="Davomiyligi" hint="Masalan: 9 hours, 4 hours">
              <input value={d.duration} onChange={(e) => set('duration', e.target.value)} placeholder="9 hours" />
            </Field>
            <Field label="Vaqti (matn)" hint="Masalan: 8:00 AM – 6:00 PM">
              <input value={d.timeText} onChange={(e) => set('timeText', e.target.value)} placeholder="8:00 AM – 6:00 PM" />
            </Field>
          </div>
          <Field label="Qaysi kunlari?">
            <div className={s.chips}>
              <button type="button" className={d.days.length === 0 ? s.chipOn : s.chip} onClick={() => set('days', [])}>
                Har kuni
              </button>
              {DAYS.map((day, i) => {
                const on = d.days.includes(i);
                return (
                  <button
                    type="button"
                    key={day}
                    title={DAY_FULL[i]}
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
          <Field label="Jo‘nash vaqtlari (ixtiyoriy)" hint="Agar mijoz vaqt tanlashi kerak bo‘lsa qo‘shing. Bo‘sh — vaqt so‘ralmaydi.">
            <TagInput values={d.timeSlots} onChange={(v) => set('timeSlots', v)} placeholder="10:00 AM" />
          </Field>
        </Section>

        <Section id="details" title="5. Tur sahifasidagi tafsilotlar">
          <ListEditor label="Narxga kiradi ✓" values={d.included} onChange={(v) => set('included', v)} placeholder="Hotel pick-up and drop-off" tone="green" />
          <ListEditor label="Narxga kirmaydi ✕" values={d.notIncluded} onChange={(v) => set('notIncluded', v)} placeholder="Snorkel equipment rental" tone="red" />
          <ListEditor label="O‘zingiz bilan oling" values={d.bring} onChange={(v) => set('bring', v)} placeholder="Swimwear and a towel" tone="blue" />
          <ListEditor label="Afzalliklar qatori (narx ostida, 4 ta)" values={d.highlights} onChange={(v) => set('highlights', v)} placeholder="English-speaking guide" />
          <PairEditor
            label="Marshrut (bosqichma-bosqich)"
            items={d.itinerary.map((x) => ({ a: x.title, b: x.text }))}
            onChange={(v) => set('itinerary', v.map((x) => ({ title: x.a, text: x.b })))}
            aLabel="Bosqich nomi"
            bLabel="Tavsifi"
            aPlaceholder="Hotel pick-up"
            bPlaceholder="We pick you up from your hotel at 8:00 AM…"
            addLabel="+ Bosqich qo‘shish"
          />
          <PairEditor
            label="Savol-javob (FAQ)"
            items={d.faq.map((x) => ({ a: x.q, b: x.a }))}
            onChange={(v) => set('faq', v.map((x) => ({ q: x.a, a: x.b })))}
            aLabel="Savol"
            bLabel="Javob"
            aPlaceholder="Is the tour suitable for children?"
            bPlaceholder="Yes, children from 5 years old are welcome."
            addLabel="+ Savol qo‘shish"
          />
        </Section>

        <Section id="advanced" title="6. Qo‘shimcha sozlamalar" hint="Odatda o‘zgartirish shart emas — avtomatik to‘ldiriladi.">
          <details className={s.more}>
            <summary>Ochish</summary>
            <Field label="Sahifa manzili (URL)" hint={`Sayt manzili: /en/sharm/${d.slug}/`}>
              <input
                value={d.slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  set('slug', slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Sahifadagi sarlavha (bo‘sh = tur nomi)">
              <input value={d.title} onChange={(e) => set('title', e.target.value)} placeholder={d.name} />
            </Field>
            <Field label="Kartadagi narx izohi" hint='Masalan: "per boat". Bo‘sh = kishi boshiga'>
              <input value={d.priceUnit} onChange={(e) => set('priceUnit', e.target.value)} placeholder="per boat" />
            </Field>
            <Field label="Google uchun sarlavha (SEO)">
              <input value={d.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} placeholder={d.title || d.name} />
            </Field>
            <Field label="Google uchun tavsif (SEO)">
              <textarea value={d.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} rows={2} placeholder={d.excerpt} />
            </Field>
          </details>
        </Section>
      </div>

      <aside className={s.aside}>
        <div className={s.asideInner}>
          <div className={s.previewLabel}>Saytda shunday ko‘rinadi</div>
          <div className={s.preview}>
            <div className={s.previewImg}>
              {d.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageSrc(d.photos[0], 600, 400)} alt="" />
              ) : (
                <span>Rasm yo‘q</span>
              )}
              {d.badge && <b>{d.badge}</b>}
            </div>
            <div className={s.previewBody}>
              <div className={s.previewName}>{d.name || 'Tur nomi'}</div>
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
            <span>{d.active ? 'Saytda ko‘rinadi' : 'Yashirin (saytda yo‘q)'}</span>
          </label>

          <button type="submit" className={s.save} disabled={pending}>
            {pending ? 'Saqlanmoqda…' : dirty ? 'Saqlash' : 'Saqlangan ✓'}
          </button>
          {dirty && <p className={s.unsaved}>Saqlanmagan o‘zgarishlar bor</p>}
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

function PriceRow({ p, onChange, onRemove }: { p: Price; onChange: (p: Price) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={s.priceRow}>
      <div className={s.priceMain}>
        <span className={p.group === 'guests' ? s.tagGuest : s.tagExtra}>{p.group === 'guests' ? 'Mehmon' : 'Qo‘shimcha'}</span>
        <input className={s.priceLabel} value={p.label} onChange={(e) => onChange({ ...p, label: e.target.value })} placeholder="Adults" aria-label="Narx nomi" />
        <div className={s.money}>
          <span>£</span>
          <input type="number" min={0} step="0.5" value={p.price} onChange={(e) => onChange({ ...p, price: Number(e.target.value) })} aria-label="Narx" />
        </div>
        <span className={s.per}>{p.price === 0 ? 'bepul' : p.unit ? `/ ${p.unit}` : ''}</span>
        <button type="button" className={s.iconBtn} onClick={() => setOpen((o) => !o)} aria-expanded={open} title="Sozlamalar">
          ⚙
        </button>
        <button type="button" className={`${s.iconBtn} ${s.danger}`} onClick={onRemove} title="O‘chirish" aria-label="Narxni o‘chirish">
          ✕
        </button>
      </div>
      {open && (
        <div className={s.priceMore}>
          <label>
            Nima uchun
            <select value={p.unit} onChange={(e) => onChange({ ...p, unit: e.target.value })}>
              {['person', 'boat', 'hour', 'group', 'buggy', 'seat', ''].map((u) => (
                <option key={u} value={u}>
                  {u ? `har bir ${u}` : '—'}
                </option>
              ))}
              {!['person', 'boat', 'hour', 'group', 'buggy', 'seat', ''].includes(p.unit) && <option value={p.unit}>{p.unit}</option>}
            </select>
          </label>
          <label>
            Turi
            <select value={p.group} onChange={(e) => onChange({ ...p, group: e.target.value as Price['group'] })}>
              <option value="guests">Mehmon (soni)</option>
              <option value="extras">Qo‘shimcha xizmat</option>
            </select>
          </label>
          <label>
            Tanlash usuli
            <select value={p.kind} onChange={(e) => onChange({ ...p, kind: e.target.value as Price['kind'] })}>
              <option value="counter">Soni (− 1 +)</option>
              <option value="toggle">Ha / yo‘q</option>
            </select>
          </label>
          <label>
            Ko‘pi bilan
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
  label,
  values,
  onChange,
  placeholder,
  tone,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  tone?: 'green' | 'red' | 'blue';
}) {
  return (
    <div className={`${s.listBox} ${tone ? s[`tone_${tone}`] : ''}`}>
      <div className={s.label}>{label}</div>
      {values.map((v, i) => (
        <div key={i} className={s.listRow}>
          <input value={v} onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))} placeholder={placeholder} />
          <button type="button" className={`${s.iconBtn} ${s.danger}`} onClick={() => onChange(values.filter((_, j) => j !== i))} aria-label="O‘chirish">
            ✕
          </button>
        </div>
      ))}
      <button type="button" className={s.addLink} onClick={() => onChange([...values, ''])}>
        + Qo‘shish
      </button>
    </div>
  );
}

function PairEditor(props: {
  label: string;
  items: { a: string; b: string }[];
  onChange: (v: { a: string; b: string }[]) => void;
  aLabel: string;
  bLabel: string;
  aPlaceholder: string;
  bPlaceholder: string;
  addLabel: string;
}) {
  const { items, onChange } = props;
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
            <input value={it.a} onChange={(e) => upd(i, { a: e.target.value })} placeholder={props.aPlaceholder} aria-label={props.aLabel} />
            <textarea value={it.b} onChange={(e) => upd(i, { b: e.target.value })} placeholder={props.bPlaceholder} rows={2} aria-label={props.bLabel} />
          </div>
          <div className={s.pairBtns}>
            <button type="button" className={s.iconBtn} onClick={() => move(i, -1)} aria-label="Yuqoriga">
              ↑
            </button>
            <button type="button" className={s.iconBtn} onClick={() => move(i, 1)} aria-label="Pastga">
              ↓
            </button>
            <button type="button" className={`${s.iconBtn} ${s.danger}`} onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="O‘chirish">
              ✕
            </button>
          </div>
        </div>
      ))}
      <button type="button" className={s.addLink} onClick={() => onChange([...items, { a: '', b: '' }])}>
        {props.addLabel}
      </button>
    </div>
  );
}

function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [v, setV] = useState('');
  const add = () => {
    const t = v.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setV('');
  };
  return (
    <div className={s.tags}>
      {values.map((t) => (
        <span key={t} className={s.tag}>
          {t}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== t))} aria-label={`${t} ni o‘chirish`}>
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
        + Qo‘shish
      </button>
    </div>
  );
}

function PhotoUploader({ photos, onChange }: { photos: string[]; onChange: (p: string[]) => void }) {
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
      if (!res.ok) throw new Error(data.error ?? 'Yuklab bo‘lmadi');
      onChange([...photos, ...(data.paths ?? [])]);
      setErrors(data.errors ?? []);
    } catch (e) {
      setErrors([e instanceof Error ? e.message : 'Yuklab bo‘lmadi']);
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
        <b>{busy ? 'Yuklanmoqda…' : 'Rasmlarni shu yerga tashlang yoki bosing'}</b>
        <small>JPG, PNG yoki WebP · har biri 8 MB gacha · bir vaqtda 20 tagacha</small>
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
              {i === 0 && <span className={s.cover}>Muqova</span>}
              <figcaption>
                {i !== 0 && (
                  <button type="button" onClick={() => move(i, 0)} title="Muqova qilish">
                    ★
                  </button>
                )}
                <button type="button" onClick={() => move(i, i - 1)} title="Chapga" aria-label="Chapga">
                  ←
                </button>
                <button type="button" onClick={() => move(i, i + 1)} title="O‘ngga" aria-label="O‘ngga">
                  →
                </button>
                <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))} title="O‘chirish" aria-label="Rasmni o‘chirish" className={s.danger}>
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
