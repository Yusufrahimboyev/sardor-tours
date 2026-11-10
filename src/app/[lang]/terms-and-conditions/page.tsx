import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { MailIcon, WhatsAppIcon } from '@/components/icons';
import { SiteHeader } from '@/components/SiteHeader';
import { site, whatsappLink } from '@/data/site';
import { pageAlternates, pageOpenGraph } from '@/i18n/metadata';
import { getList, getT } from '@/i18n/messages';
import { langFrom } from '@/i18n/params';
import styles from '../legal.module.css';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  const t = getT(lang);
  const description = t('meta.terms.description', { name: site.name });
  return {
    title: t('meta.terms.title'),
    description,
    alternates: pageAlternates(lang, '/terms-and-conditions/'),
    openGraph: pageOpenGraph(lang, '/terms-and-conditions/', { title: t('meta.terms.title'), description }),
  };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langFrom(params);
  const t = getT(lang);
  const prepaid = getList<string[]>(lang, 'terms.prepaid');
  const name = site.name;
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <header className={styles.intro}>
          <h1>{t('terms.title')}</h1>
          <p>{t('terms.intro', { name })}</p>
          <div className={styles.updated}>{t('terms.updated')}</div>
        </header>

        <section className={styles.card} aria-labelledby="t1">
          <h2 id="t1">
            <span className={styles.n}>1</span> {t('terms.booking.title')}
          </h2>
          <h3>
            <span className={styles.cn}>1.1</span> {t('terms.booking.confirmation.title')}
          </h3>
          <p>{t('terms.booking.confirmation.text')}</p>
          <p className={styles.introLine}>{t('terms.booking.confirmation.listIntro')}</p>
          <ul className={styles.list}>
            {prepaid.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p>{t('terms.booking.confirmation.after')}</p>

          <h3>
            <span className={styles.cn}>1.2</span> {t('terms.booking.balance.title')}
          </h3>
          <p>{t('terms.booking.balance.text')}</p>

          <h3>
            <span className={styles.cn}>1.3</span> {t('terms.booking.methods.title')}
          </h3>
          <div className={styles.pay}>
            <div>
              <div className={styles.payTitle}>{t('terms.booking.methods.cash')}</div>
              <div className={styles.cur}>
                <span>€ EUR</span>
                <span>$ USD</span>
                <span>£ GBP</span>
                <span>E£ EGP</span>
              </div>
            </div>
            <div>
              <div className={styles.payTitle}>{t('terms.booking.methods.card')}</div>
              <div className={styles.fee}>
                +3.5% <span>{t('terms.booking.methods.feeSuffix')}</span>
              </div>
              <p className={styles.payD}>{t('terms.booking.methods.request')}</p>
            </div>
          </div>
          <p className={styles.note}>{t('terms.booking.methods.note')}</p>
        </section>

        <section className={styles.card} aria-labelledby="t2">
          <h2 id="t2">
            <span className={styles.n}>2</span> {t('terms.cancel.title')}
          </h2>
          <h3>
            <span className={styles.cn}>2.1</span> {t('terms.cancel.standard.title')}
          </h3>
          <p className={styles.introLine}>{t('terms.cancel.standard.intro')}</p>
          <div className={styles.table}>
            <div>
              <span>{t('terms.cancel.standard.early')}</span>
              <b className={styles.ok}>{t('terms.cancel.standard.earlyResult')}</b>
            </div>
            <div>
              <span>{t('terms.cancel.standard.late')}</span>
              <b className={styles.no}>{t('terms.cancel.standard.lateResult')}</b>
            </div>
          </div>
          <h3>
            <span className={styles.cn}>2.2</span> {t('terms.cancel.nonRefundable.title')}
          </h3>
          <p className={styles.introLine}>{t('terms.cancel.nonRefundable.intro')}</p>
          <ul className={styles.list}>
            {prepaid.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <h3>
            <span className={styles.cn}>2.3</span> {t('terms.cancel.byUs.title', { name })}
          </h3>
          <p>{t('terms.cancel.byUs.text')}</p>
        </section>

        <section className={styles.ask} aria-labelledby="ask-h">
          <h2 id="ask-h">{t('terms.ask.title')}</h2>
          <p>{t('terms.ask.text')}</p>
          <div className={styles.askBtns}>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={styles.btn}>
              <WhatsAppIcon size={16} /> {site.phoneDisplay || t('client.nav.whatsapp')}
            </a>
            {site.email && (
              <a href={`mailto:${site.email}`} className={`${styles.btn} ${styles.ghost}`}>
                <MailIcon size={16} /> {site.email}
              </a>
            )}
          </div>
        </section>
      </main>
      <Footer lang={lang} tone="light" />
    </div>
  );
}
