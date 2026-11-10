import type { Metadata } from 'next';
import { ContactOptions } from '@/components/ContactOptions';
import { Footer } from '@/components/Footer';
import { SiteHeader } from '@/components/SiteHeader';
import { site } from '@/data/site';
import { pageAlternates, pageOpenGraph } from '@/i18n/metadata';
import { getT } from '@/i18n/messages';
import { langFrom } from '@/i18n/params';
import { ContactForm } from './ContactForm';
import styles from './contact.module.css';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  const t = getT(lang);
  const description = t('meta.contact.description', { name: site.name });
  return {
    title: t('meta.contact.title'),
    description,
    alternates: pageAlternates(lang, '/contact/'),
    openGraph: pageOpenGraph(lang, '/contact/', { title: t('meta.contact.title'), description }),
  };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langFrom(params);
  const t = getT(lang);
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <header className={styles.intro}>
          <span className={styles.tag}>{t('contact.tag')}</span>
          <h1>
            {t('contact.h1.before')}<span>{t('contact.h1.em')}</span>
          </h1>
          <p>{t('contact.text')}</p>
        </header>
        <div className={styles.grid}>
          <section className={styles.card} aria-labelledby="form-h">
            <h2 id="form-h" className={styles.cardTitle}>
              {t('contact.formTitle')}
            </h2>
            <ContactForm />
          </section>
          <aside className={styles.side}>
            <div className={styles.card}>
              <ContactOptions />
            </div>
          </aside>
        </div>
      </main>
      <Footer lang={lang} tone="light" />
    </div>
  );
}
