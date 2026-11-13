import Link from 'next/link';
import { headers } from 'next/headers';
import { DEFAULT_LOCALE, getDict, href, isLocale, PATHS } from '@/i18n';
import s from '@/components/site/site.module.css';

export default async function LocaleNotFound() {
  const loc = (await headers()).get('x-locale');
  const lang = isLocale(loc) ? loc : DEFAULT_LOCALE;
  const t = getDict(lang);
  return (
    <section className={s.section} style={{ minHeight: '50vh' }}>
      <div className={s.wrap}>
        <p className={s.hint}>404</p>
        <h1 className={s.h1}>{t.notFound.title}</h1>
        <p className={s.lead}>{t.notFound.text}</p>
        <div className={s.btns}>
          <Link href={href(lang, PATHS.home)} className={s.btn}>
            {t.notFound.home}
          </Link>
          <Link href={href(lang, PATHS.tours)} className={s.btnLine}>
            {t.common.allTours}
          </Link>
        </div>
      </div>
    </section>
  );
}
