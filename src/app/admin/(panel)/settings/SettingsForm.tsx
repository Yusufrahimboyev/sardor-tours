'use client';

import { useActionState, useRef, useState } from 'react';
import type { Settings } from '@/lib/server/settings';
import { saveSettingsAction, type FormState } from '../../contentActions';
import styles from '../../admin.module.css';

const LANGS = [
  ['en', 'EN · Inglizcha versiya'],
  ['ru', 'RU · Ruscha versiya'],
  ['uz', 'UZ · O‘zbekcha versiya'],
] as const;

const FIELDS = [
  ['phoneDisplay', 'Telefon (saytda shunday ko‘rinadi)', '+20 122 710 0446'],
  ['whatsapp', 'WhatsApp raqami (mamlakat kodi bilan)', '201227100446'],
  ['email', 'Email', 'info@example.com'],
  ['telegram', 'Telegram havolasi', 'https://t.me/username'],
  ['instagram', 'Instagram havolasi', 'https://instagram.com/username'],
  ['address', 'Ofis manzili (ixtiyoriy)', 'Old Market, Sharm El Sheikh'],
] as const;

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettingsAction, {});
  const [video, setVideo] = useState(settings.video);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const copyFromEn = (form: HTMLFormElement | null, to: string) => {
    if (!form) return;
    for (const [k] of FIELDS) {
      const src = form.elements.namedItem(`en.${k}`) as HTMLInputElement | null;
      const dst = form.elements.namedItem(`${to}.${k}`) as HTMLInputElement | null;
      if (src && dst) dst.value = src.value;
    }
  };

  const upload = async (f: File) => {
    setUploading(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('files', f);
      const res = await fetch('/api/admin/upload/', { method: 'POST', body: fd });
      const data = (await res.json()) as { paths?: string[]; errors?: string[] };
      if (data.paths?.[0]) setVideo(data.paths[0]);
      else setErr(data.errors?.[0] ?? 'Yuklab bo‘lmadi');
    } catch {
      setErr('Yuklab bo‘lmadi');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={action} className={styles.tourForm}>
      {state.error && <p className={styles.alertErr}>{state.error}</p>}
      {state.saved && !state.error && <p className={styles.alertOk}>✓ Saqlandi — saytda yangilandi.</p>}

      {LANGS.map(([l, title]) => (
        <section key={l} className={styles.card}>
          <div className={styles.detailHead} style={{ marginBottom: 6 }}>
            <h2 style={{ marginBottom: 0 }}>{title}</h2>
            {l !== 'en' && (
              <button type="button" className={styles.btnGhost} onClick={(e) => copyFromEn(e.currentTarget.form, l)}>
                EN’dan nusxa olish
              </button>
            )}
          </div>
          <div className={styles.fields}>
            {FIELDS.map(([k, label, ph]) => (
              <div key={k} className={styles.field}>
                <label htmlFor={`${l}-${k}`}>{label}</label>
                <input id={`${l}-${k}`} name={`${l}.${k}`} defaultValue={settings.contacts[l][k]} placeholder={ph} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className={styles.card}>
        <h2>Bosh sahifadagi video taqdimot</h2>
        <input type="hidden" name="video" value={video} />
        {video ? (
          <video src={video} controls preload="metadata" style={{ width: '100%', maxWidth: 520, borderRadius: 12, background: '#000' }} />
        ) : (
          <p className={styles.muted}>Video yo‘q — bosh sahifada video bloki ko‘rinmaydi.</p>
        )}
        <div className={styles.actions} style={{ marginTop: 10 }}>
          <button type="button" className={styles.btnGhost} onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Yuklanmoqda…' : video ? 'Boshqa video yuklash' : 'Video yuklash (MP4, 60 MB gacha)'}
          </button>
          {video && (
            <button type="button" className={styles.btnRed} onClick={() => setVideo('')}>
              Videoni olib tashlash
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = '';
          }}
        />
        {err && <p className={styles.err}>{err}</p>}
        <p className={styles.muted} style={{ marginTop: 8 }}>
          O‘zgarish “Saqlash” bosilgandan keyin saytga chiqadi.
        </p>
      </section>

      <div className={styles.saveBar}>
        <button type="submit" className={styles.btnPrimary} disabled={pending}>
          {pending ? 'Saqlanmoqda…' : 'Saqlash'}
        </button>
      </div>
    </form>
  );
}
