import { setAdminLangAction } from './actions';
import { ADMIN_LANGS, ADMIN_LANG_SHORT, type AdminLang } from './config';
import styles from '../admin.module.css';

/** Server-rendered UZ / RU / EN switch; each button posts a tiny server action that sets the cookie. */
export function AdminLangSwitcher({ lang, label }: { lang: AdminLang; label: string }) {
  return (
    <div className={styles.langSwitch} role="group" aria-label={label}>
      {ADMIN_LANGS.map((l) => (
        <form key={l} action={setAdminLangAction.bind(null, l)}>
          <button type="submit" className={l === lang ? styles.langOn : undefined} aria-pressed={l === lang} lang={l}>
            {ADMIN_LANG_SHORT[l]}
          </button>
        </form>
      ))}
    </div>
  );
}
