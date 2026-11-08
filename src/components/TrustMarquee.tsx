import styles from './TrustMarquee.module.css';

export function TrustMarquee() {
  const line = (
    <span>
      Trusted by <b>150,000+</b> Travellers <i>•</i> Highly Rated on Google, Tripadvisor &amp; GetYourGuide <i>•</i>{' '}
    </span>
  );
  return (
    <div className={styles.marquee} aria-hidden>
      <div className={styles.track}>
        {line}
        {line}
        {line}
        {line}
      </div>
    </div>
  );
}
