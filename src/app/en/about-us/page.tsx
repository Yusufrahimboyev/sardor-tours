import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { FaqList } from '@/components/FaqList';
import { Footer } from '@/components/Footer';
import { CheckIcon, ClockIcon, InfoIcon, InstagramIcon, PinIcon, TelegramIcon, WhatsAppIcon } from '@/components/icons';
import { JsonLd, faqJsonLd } from '@/components/JsonLd';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { SiteHeader } from '@/components/SiteHeader';
import { BOOK_TOUR_MSG, generalFaq, site, whatsappLink } from '@/data/site';
import { collectReviews } from '@/data/tours';
import { imageSrc } from '@/lib/images';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About Us — Excursions in Sharm El Sheikh',
  description:
    "Sardor Tours is a team of local guides born and raised in Egypt, with 17+ years of experience. Own offices in Old Market, Dahab Mall and Cairo. 150,000+ happy guests.",
  alternates: { canonical: '/en/about-us/' },
  openGraph: { url: '/en/about-us/', title: 'About Sardor Tours', images: [imageSrc('/images/about-hero.webp', 1200, 630)] },
};

const TEAM = [
  ['Hussein Sobhy', 'CEO & Founder'],
  ['Julia', 'General Manager'],
  ['Saeed', 'Operations Manager'],
  ['Olga', 'Customer service'],
  ['Svitlana', 'Customer service'],
  ['Mohammed', 'Customer service'],
  ['Ziko', 'Customer service'],
  ['Ashraf', 'Customer service'],
  ['Emma', 'Customer service'],
  ['Osama', 'Customer service'],
];

const REASONS = [
  [
    'Prices up to 50% lower',
    "We're not middlemen — we're official partners and run many of the excursions ourselves. No hotel commissions, no extra links in the chain. Those savings go straight into your pocket.",
  ],
  [
    "Licensed by Egypt's authorities",
    "We hold all the certificates required to run excursions. Under Egypt's strict tourism law, every excursion needs a daily permit from the tourist police — and we have them.",
  ],
  [
    'Hotel transfer included',
    "We pick you up from your hotel's main entrance in air-conditioned, safety-checked vehicles — cars, jeeps, minivans or buses depending on the excursion.",
  ],
  [
    'Available 24/7',
    "Our team answers on WhatsApp around the clock — whether you're booking from home or asking a question the night before, right from your hotel.",
  ],
  [
    'Multilingual team',
    'We serve guests in English, Russian, Italian and Turkish. Our support team includes native speakers, so meaning is never lost or distorted in translation.',
  ],
  [
    '150,000+ happy guests',
    "Thousands of real reviews on Google, TripAdvisor and social media speak for themselves. We're proud of every one — even the ones that pushed us to get better.",
  ],
];

const HUE = ['#ff6b00', '#0057ff', '#1db88a', '#a855f7', '#f59e0b', '#ef4444', '#0ea5e9', '#14b8a6', '#ec4899', '#6366f1'];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <JsonLd data={faqJsonLd(generalFaq)} />
      <SiteHeader overlay />

      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero}>
          <Image src={imageSrc('/images/about-hero.webp', 1920, 1080)} alt="" fill priority sizes="100vw" className={styles.heroImg} />
          <div className={styles.heroScrim} />
          <div className={styles.heroIn}>
            <div>
              <div className={styles.tag}>
                <i aria-hidden /> The leading local tour operator in Sharm El Sheikh — since 2009
              </div>
              <h1>
                We <span>know every wave</span> and every dune
              </h1>
              <p>
                Sardor Tours is not a hotel excursion desk or a booking app. We&apos;re a team of local guides and adventure
                lovers, born and raised in Egypt, with over 17 years of experience creating unforgettable travel experiences.
              </p>
              <p>
                We don&apos;t just sell tours—we share the places we call home. From the crystal-clear waters of the Red Sea
                to the golden dunes of the Sinai Desert and the timeless wonders of Cairo, every experience is personally
                selected and operated by us.
              </p>
              <div className={styles.actions}>
                <Link href="/en/sharm/" className={styles.btnWhite}>
                  <InfoIcon size={16} /> All excursions
                </Link>
                <a href={whatsappLink(BOOK_TOUR_MSG)} target="_blank" rel="noopener noreferrer" className={styles.btnGlass}>
                  <WhatsAppIcon size={16} /> Message us on WhatsApp
                </a>
                <a href={site.instagram} target="_blank" rel="noopener noreferrer" className={styles.btnIg}>
                  <InstagramIcon size={16} /> Instagram
                </a>
              </div>
            </div>
            <div className={styles.cards}>
              {[
                ['Offices', '3 offices in Egypt', <PinIcon key="p" />],
                ['Our team', '100+ specialists', <InfoIcon key="i" size={18} />],
                ['Available', '24/7 on WhatsApp', <ClockIcon key="c" size={18} />],
                ['Languages', 'EN · RU · IT · TR', <ChatBubble key="l" />],
              ].map(([l, v, ic]) => (
                <div key={l as string} className={styles.hc}>
                  <span className={styles.hcIc}>{ic}</span>
                  <span>
                    <small>{l}</small>
                    <b>{v}</b>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.statsWrap}>
          <div className={styles.stats}>
            {[
              ['17+', 'Years in business'],
              ['100+', 'Excursions'],
              ['150K+', 'Happy guests'],
              ['3', 'Offices'],
            ].map(([n, l]) => (
              <div key={l}>
                <b>{n}</b>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <section className={styles.sec} aria-labelledby="story-h">
          <div className={styles.head}>
            <span className={styles.secTag}>Our story</span>
            <h2 id="story-h">
              Built in Sharm, <span>grown on trust</span>
            </h2>
          </div>
          <div className={styles.story}>
            <div className={styles.storyImg}>
              <Image src={imageSrc('/images/about-story.webp', 900, 1100)} alt="Our team in Sharm El Sheikh" fill sizes="(max-width: 900px) 100vw, 45vw" />
              <div className={styles.storyBadge}>
                <b>Est. 2009</b>
                <span>Sharm El Sheikh, Egypt</span>
              </div>
            </div>
            <div className={styles.storyText}>
              <p className={styles.lead}>
                Sardor Tours began with a simple idea: the best person to show you Sharm El Sheikh is someone who truly lives
                here.
              </p>
              <p>
                Founded in 2009 by Hussein Sobhy — we started as a small local team with deep knowledge of the region and a
                genuine passion for creating unforgettable experiences. Over the years, we&apos;ve grown into a dedicated
                team of guides, travel specialists, and customer support experts, all united by the same goal: helping
                travellers discover the very best of Egypt.
              </p>
              <p>
                Unlike many online booking platforms, we work directly with our trusted partners and operate our own boats,
                watersports, safari and Cairo services, giving us full control over quality, safety, and every detail of
                your experience.
              </p>
              <p>
                Today, more than 150,000 travellers from around the world have trusted us to create their Egyptian
                adventure.
              </p>
              <ul className={styles.checks}>
                {[
                  ['No middlemen', "We're official partners and run many of the excursions ourselves"],
                  ['Licensed and insured', "Operating officially under a licence from Egypt's Ministry of Tourism"],
                  ['Hotel transfer', "Free pickup from your hotel's main entrance"],
                  ['Best price', 'Up to 50% cheaper than hotel guides'],
                ].map(([t, d]) => (
                  <li key={t}>
                    <CheckIcon size={16} />
                    <span>
                      <b>{t}</b> {d}
                    </span>
                  </li>
                ))}
              </ul>
              <blockquote className={styles.quote}>
                <p>
                  &ldquo;We don&apos;t sell tours — we share the Egypt we call home. Come as a guest. Leave with
                  unforgettable memories and new friends.&rdquo;
                </p>
                <footer>
                  <b>Hussein Sobhy</b> Founder &amp; CEO · since 2009
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        <section className={`${styles.sec} ${styles.alt}`} aria-labelledby="team-h">
          <div className={styles.head}>
            <span className={styles.secTag}>Team</span>
            <h2 id="team-h">
              Real people, <span>ready to help</span>
            </h2>
            <p>Ten specialists on the front line — and a whole team of guides and professionals behind the scenes.</p>
          </div>
          <ul className={styles.team}>
            {TEAM.map(([n, r], i) => (
              <li key={n}>
                <span className={styles.avatar} style={{ background: HUE[i] }} aria-hidden>
                  {n
                    .split(' ')
                    .map((w) => w[0])
                    .join('')}
                </span>
                {i === 0 && <span className={styles.badge}>Founder</span>}
                <b>{n}</b>
                <small>{r}</small>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.sec} aria-labelledby="why-h">
          <div className={styles.head}>
            <span className={styles.secTag}>Why us</span>
            <h2 id="why-h">
              Six reasons guests <span>keep coming back</span>
            </h2>
          </div>
          <div className={styles.reasons}>
            {REASONS.map(([t, d], i) => (
              <div key={t} className={`${styles.reason} reveal`}>
                <span className={styles.reasonN}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.sec} ${styles.alt}`} aria-labelledby="faq-h">
          <div className={styles.head}>
            <span className={styles.secTag}>FAQ</span>
            <h2 id="faq-h">
              Questions we <span>hear every day</span>
            </h2>
          </div>
          <div className={styles.narrow}>
            <FaqList items={generalFaq} />
          </div>
        </section>

        <section className={styles.sec} aria-labelledby="offices-h">
          <div className={styles.head}>
            <span className={styles.secTag}>Where to find us</span>
            <h2 id="offices-h">
              Come visit us in <span>Sharm El Sheikh</span>
            </h2>
            <p>Three comfortable offices in convenient locations — or just message us on WhatsApp and we&apos;ll come to you at your hotel.</p>
          </div>
          <div className={styles.offices}>
            {site.offices.map((o, i) => (
              <div key={o.name} className={styles.office}>
                <span className={styles.officeN}>{i + 1}</span>
                <h3>{o.name}</h3>
                <p>{o.address}</p>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`} target="_blank" rel="noopener noreferrer">
                  <PinIcon size={15} /> Open in Google Maps
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.sec} ${styles.alt}`} aria-labelledby="rev-h">
          <div className={styles.head}>
            <span className={styles.secTag}>Reviews</span>
            <h2 id="rev-h">What our guests say</h2>
          </div>
          <ReviewsCarousel reviews={collectReviews(1, 12)} />
        </section>

        <section className={styles.cta} aria-labelledby="cta-h">
          <h2 id="cta-h">Ready to discover Sharm El Sheikh?</h2>
          <p>Browse our excursions or message us — we&apos;ll help you find the perfect excursion for your group, budget and interests.</p>
          <div className={styles.ctaBtns}>
            <Link href="/en/sharm/" className={styles.btnWhite}>
              All excursions
            </Link>
            <a href={whatsappLink(BOOK_TOUR_MSG)} target="_blank" rel="noopener noreferrer" className={styles.btnGlass}>
              <WhatsAppIcon size={16} /> WhatsApp
            </a>
            <a href={site.telegram} target="_blank" rel="noopener noreferrer" className={styles.btnGlass}>
              <TelegramIcon size={16} /> Telegram
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className={styles.btnGlass}>
              <InstagramIcon size={16} /> Instagram
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ChatBubble() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 20l1.3-3.8A8.38 8.38 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" />
    </svg>
  );
}
