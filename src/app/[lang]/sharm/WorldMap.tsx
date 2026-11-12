import type { Locale } from '@/i18n/config';
import { getT } from '@/i18n/messages';
import { site } from '@/data/site';
import { imageSrc } from '@/lib/images';
import styles from './sharm.module.css';

/**
 * Decorative "the world flies to us" map: dotted continents, flight arcs from
 * source cities into the hub, and three destination bubbles below it. Pure SVG
 * (SMIL + CSS animations), rendered on the server.
 */
const W = 340;
const H = 372;
const HUB = { x: 170, y: 163 };

const CITIES = [
  { n: 'Moscow', x: 252, y: 28 },
  { n: 'London', x: 48, y: 44 },
  { n: 'Warsaw', x: 170, y: 18 },
  { n: 'Berlin', x: 26, y: 138 },
  { n: 'Almaty', x: 312, y: 84 },
  { n: 'Kyiv', x: 226, y: 44 },
  { n: 'Minsk', x: 104, y: 60 },
  { n: 'Rome', x: 70, y: 102 },
  { n: 'Istanbul', x: 296, y: 124 },
  { n: 'Paris', x: 40, y: 76 },
];

const DESTS = [
  { n: 'Diving', x: 66, y: 300, img: '/images/TIRAN.webp' },
  { n: 'Safari', x: 170, y: 318, img: '/images/buggy05.webp' },
  { n: 'Pyramids', x: 274, y: 300, img: '/images/CAIRO_PLANE.webp' },
];

/** Rough continent blobs (ellipses) used to decide where land dots go. */
const LAND = [
  [60, 75, 32, 34], [72, 50, 42, 16], [24, 54, 12, 10], [102, 120, 8, 16], [92, 196, 17, 46],
  [120, 32, 12, 12], [162, 64, 18, 16], [165, 46, 9, 12], [181, 156, 28, 54], [202, 110, 16, 14],
  [255, 82, 56, 38], [250, 48, 56, 18], [235, 122, 14, 18], [288, 140, 20, 12], [302, 214, 22, 15],
];

const DOTS: { x: number; y: number }[] = [];
for (let y = 20; y < 256; y += 7) {
  for (let x = 6; x < 336; x += 7) {
    if (LAND.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1)) DOTS.push({ x, y });
  }
}

function arc(a: { x: number; y: number }, b: { x: number; y: number }, bow: number) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const cx = mx + (mx - HUB.x) * 0.22;
  return `M${a.x} ${a.y} Q${cx.toFixed(1)} ${(my + bow).toFixed(1)} ${b.x} ${b.y}`;
}

const ARCS = [
  ...CITIES.map((c, i) => ({ id: `m2a${i}`, d: arc(c, HUB, -22 - (i % 3) * 5) })),
  ...DESTS.map((d, i) => ({ id: `m2b${i}`, d: arc(HUB, d, 20) })),
];

export function WorldMap({ lang }: { lang: Locale }) {
  const t = getT(lang);
  return (
    <div className={styles.mapBox}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.mapSvg} role="img" aria-label={t('sharm.map.aria')}>
        <defs>
          <radialGradient id="m2bg" cx="50%" cy="34%" r="85%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#eef3fb" />
          </radialGradient>
          <radialGradient id="m2hub" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#fff1e0" />
            <stop offset="42%" stopColor="#ff9540" />
            <stop offset="100%" stopColor="#FF6B00" />
          </radialGradient>
          <linearGradient id="m2arc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffb06a" stopOpacity=".75" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity=".15" />
          </linearGradient>
          <linearGradient id="m2ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffc089" />
            <stop offset="100%" stopColor="#FF6B00" />
          </linearGradient>
          <filter id="m2glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="m2soft" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          {DESTS.map((d, i) => (
            <clipPath key={d.n} id={`m2c${i}`}>
              <circle cx={d.x} cy={d.y} r="38" />
            </clipPath>
          ))}
        </defs>

        <rect width={W} height={H} fill="url(#m2bg)" />
        <g opacity=".6">
          {DOTS.map((p) => (
            <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r="1.05" fill="#9fb4d4" />
          ))}
        </g>
        <circle cx={HUB.x} cy={HUB.y} r="56" fill="none" stroke="rgba(8,20,45,.07)" />
        <circle cx={HUB.x} cy={HUB.y} r="98" fill="none" stroke="rgba(8,20,45,.045)" />

        {ARCS.map((a) => (
          <path key={a.id} id={a.id} d={a.d} fill="none" stroke="url(#m2arc)" strokeWidth="1" strokeLinecap="round" />
        ))}
        {ARCS.map((a, i) => {
          const dur = `${(3.4 + (i % 4) * 0.5).toFixed(1)}s`;
          const begin = `${((i * 0.5) % 3.4).toFixed(2)}s`;
          return (
            <circle key={`p${a.id}`} r="2.4" fill="#FF6B00" filter="url(#m2glow)" opacity="0">
              <animateMotion dur={dur} begin={begin} repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines="0.45 0 0.25 1">
                <mpath href={`#${a.id}`} />
              </animateMotion>
              <animate attributeName="opacity" dur={dur} begin={begin} repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.1;0.82;1" />
            </circle>
          );
        })}

        {CITIES.map((c, i) => {
          let anchor: 'start' | 'end';
          let dx: number;
          if (c.x < 55) [anchor, dx] = ['start', 8];
          else if (c.x > 270) [anchor, dx] = ['end', -8];
          else [anchor, dx] = c.x < HUB.x ? ['end', -6] : ['start', 6];
          return (
            <g key={c.n}>
              <circle cx={c.x} cy={c.y} r="3" fill="none" stroke="#FF6B00" strokeWidth="1.3" className={styles.m2ping} style={{ animationDelay: `${(i * 0.32).toFixed(2)}s` }} />
              <circle cx={c.x} cy={c.y} r="2.4" fill="#ffb060" filter="url(#m2glow)" />
              <text x={c.x + dx} y={c.y + 3} fontSize="8.5" fill="#5a6a85" fontWeight="600" textAnchor={anchor}>
                {t(`sharm.map.cities.${c.n.toLowerCase()}`)}
              </text>
            </g>
          );
        })}

        <circle cx={HUB.x} cy={HUB.y} r="9" fill="#FF6B00" className={styles.m2pulse} />
        <circle cx={HUB.x} cy={HUB.y} r="9" fill="#FF6B00" className={styles.m2pulse} style={{ animationDelay: '1.4s' }} />
        <circle cx={HUB.x} cy={HUB.y} r="11" fill="url(#m2hub)" filter="url(#m2glow)" />
        <circle cx={HUB.x} cy={HUB.y} r="3.6" fill="#fff" />
        <rect x={HUB.x - 58} y={HUB.y + 16} width="116" height="22" rx="11" fill="#FF6B00" />
        <text x={HUB.x} y={HUB.y + 31} fontSize="11.5" fill="#fff" fontWeight="800" textAnchor="middle">
          {site.name}
        </text>

        {DESTS.map((d, i) => (
          <g key={d.n}>
            <circle cx={d.x} cy={d.y} r="44" fill="#FF6B00" opacity=".2" filter="url(#m2soft)" />
            <circle cx={d.x} cy={d.y} r="40" fill="none" stroke="url(#m2ring)" strokeWidth="2.5" />
            <image
              href={imageSrc(d.img, 240, 240)}
              x={d.x - 38}
              y={d.y - 38}
              width="76"
              height="76"
              clipPath={`url(#m2c${i})`}
              preserveAspectRatio="xMidYMid slice"
            />
            <rect x={d.x - 46} y={d.y + 30} width="92" height="16" rx="8" fill="rgba(7,16,36,.92)" stroke="url(#m2ring)" strokeWidth="1" />
            <text x={d.x} y={d.y + 41} fontSize="8" fill="#fff" fontWeight="700" textAnchor="middle">
              {t(`sharm.map.destinations.${d.n.toLowerCase()}`)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
