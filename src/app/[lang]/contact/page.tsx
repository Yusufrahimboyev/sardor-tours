import type { Metadata } from 'next';
import { ContactOptions } from '@/components/ContactOptions';
import { Footer } from '@/components/Footer';
import { SiteHeader } from '@/components/SiteHeader';
import { site } from '@/data/site';
import { langFrom } from '@/i18n/params';
import { localeHref } from '@/i18n/routing';
import { ContactForm } from './ContactForm';
import styles from './contact.module.css';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  return {
    title: 'Contact Us',
    description: `Contact ${site.name}: WhatsApp, email or the contact form — we reply fast.`,
    alternates: { canonical: localeHref(lang, '/contact/') },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langFrom(params);
  return (
    <div className={styles.page}>
      <SiteHeader lang={lang} />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <header className={styles.intro}>
          <span className={styles.tag}>Contact</span>
          <h1>
            We&apos;re here <span>24/7</span>
          </h1>
          <p>Message us on your favourite messenger for the fastest reply, or send us a note below and we&apos;ll answer by email.</p>
        </header>
        <div className={styles.grid}>
          <section className={styles.card} aria-labelledby="form-h">
            <h2 id="form-h" className={styles.cardTitle}>
              Send us a message
            </h2>
            <ContactForm />
          </section>
          <aside className={styles.side}>
            <div className={styles.card}>
              <ContactOptions lang={lang} />
            </div>
          </aside>
        </div>
      </main>
      <Footer lang={lang} tone="light" />
    </div>
  );
}
