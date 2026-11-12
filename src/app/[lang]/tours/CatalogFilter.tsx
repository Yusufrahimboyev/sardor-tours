import Link from 'next/link';
import s from './catalog.module.css';

/**
 * Category links + search box as a plain GET form — no client JS needed, so it works
 * everywhere and can't disagree with the server render.
 */
export function CatalogFilter(props: { base: string; cat: string; q: string; categories: { key: string; label: string }[]; placeholder: string; submit: string }) {
  const hrefFor = (cat: string) => {
    const sp = new URLSearchParams();
    if (cat !== 'all') sp.set('cat', cat);
    if (props.q) sp.set('q', props.q);
    return sp.size ? `${props.base}?${sp}` : props.base;
  };
  return (
    <div className={s.filter}>
      <nav className={s.chips} aria-label={props.placeholder}>
        {props.categories.map((c) => (
          <Link
            key={c.key}
            href={hrefFor(c.key)}
            scroll={false}
            className={c.key === props.cat ? s.chipOn : s.chip}
            aria-current={c.key === props.cat ? 'true' : undefined}
          >
            {c.label}
          </Link>
        ))}
      </nav>
      <form role="search" action={props.base} className={s.searchRow}>
        {props.cat !== 'all' && <input type="hidden" name="cat" value={props.cat} />}
        <input type="search" name="q" defaultValue={props.q} placeholder={props.placeholder} aria-label={props.placeholder} className={s.search} />
        <button type="submit" className={s.searchBtn}>
          {props.submit}
        </button>
      </form>
    </div>
  );
}
