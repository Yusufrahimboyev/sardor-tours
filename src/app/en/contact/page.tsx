import type { Metadata } from 'next';
import { ContactOptions } from '@/components/ContactOptions';
import { Footer } from '@/components/Footer';
import { SiteHeader } from '@/components/SiteHeader';
import { site } from '@/data/site';
import { ContactForm } from './ContactForm';
import styles from './contact.module.css';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Contact ${site.name}: WhatsApp, email or the contact form — we reply fast.`,
  alternates: { canonical: '/en/contact/' },
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />
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
              <ContactOptions />
            </div>
          </aside>
        </div>
      </main>
      <Footer tone="light" />
    </div>
  );
}
