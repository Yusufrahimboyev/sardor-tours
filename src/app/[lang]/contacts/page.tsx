import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/site/ContactForm';
import { ContactList } from '@/components/site/ContactList';
import { getDict, isLocale } from '@/i18n';
import { alternates } from '@/i18n/seo';
import { getContacts } from '@/lib/server/settings';
import { HydrationBoundary } from '@/components/site/HydrationBoundary';
import s from '@/components/site/site.module.css';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.contact.title,
    description: t.contact.intro,
    alternates: alternates(lang, '/contacts/'),
  };
}

export default async function ContactsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const c = await getContacts(lang);
  return (
    <HydrationBoundary>
      <>
        <section className={s.section}>
          <div className={s.wrap}>
            <h1 className={s.h1}>{t.contact.title}</h1>
            <p className={s.lead}>{t.contact.intro}</p>
            <ContactList c={c} t={t.common} />
            <p className={s.hint} style={{ marginTop: 16 }}>
              {t.contact.hours}: {t.contact.hoursValue}
            </p>
          </div>
        </section>
        <section className={s.section} aria-labelledby="form-h">
          <div className={s.wrap}>
            <h2 id="form-h" className={s.h2}>
              {t.contact.formTitle}
            </h2>
            <ContactForm t={t.contact} />
          </div>
        </section>
      </>
    </HydrationBoundary>
  );
}
