import styles from './sharm.module.css';

// Equirectangular projection onto a 360x200 viewBox, cropped to Europe / Middle East.
const W = 360;
const H = 200;
const proj = (lat: number, lon: number) => ({ x: ((lon + 15) / 75) * W, y: ((65 - lat) / 42) * H });

const HUB = { name: 'Sharm El Sheikh', ...proj(27.9, 34.3) };
const CITIES = [
  { name: 'London', lat: 51.5, lon: -0.1 },
  { name: 'Paris', lat: 48.9, lon: 2.35 },
  { name: 'Berlin', lat: 52.5, lon: 13.4 },
  { name: 'Rome', lat: 41.9, lon: 12.5 },
  { name: 'Warsaw', lat: 52.2, lon: 21 },
  { name: 'Istanbul', lat: 41, lon: 29 },
  { name: 'Moscow', lat: 55.8, lon: 37.6 },
  { name: 'Riyadh', lat: 24.7, lon: 46.7 },
].map((c) => ({ ...c, ...proj(c.lat, c.lon) }));

/** Decorative "flight routes" map — purely visual, hidden from assistive tech. */
export function WorldMap() {
  return (
    <div className={styles.mapBox}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Flight routes from Europe to Sharm El Sheikh">
        <defs>
          <pattern id="mapgrid" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,.12)" />
          </pattern>
          <radialGradient id="hubglow">
            <stop offset="0" stopColor="#FF6B00" stopOpacity=".55" />
            <stop offset="1" stopColor="#FF6B00" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#mapgrid)" />
        {CITIES.map((c, i) => {
          const mx = (c.x + HUB.x) / 2;
          const my = Math.min(c.y, HUB.y) - 28;
          const d = `M${c.x},${c.y} Q${mx},${my} ${HUB.x},${HUB.y}`;
          return (
            <g key={c.name}>
              <path d={d} fill="none" stroke="rgba(255,150,60,.45)" strokeWidth="0.8" strokeDasharray="3 3" />
              <circle r="1.6" fill="#ffb060">
                <animateMotion dur={`${3 + (i % 4) * 0.6}s`} repeatCount="indefinite" path={d} />
              </circle>
              <circle cx={c.x} cy={c.y} r="2.2" fill="#ffb060" />
              <text x={c.x + 4} y={c.y - 3} fontSize="6.5" fill="rgba(255,255,255,.7)" fontWeight="600">
                {c.name}
              </text>
            </g>
          );
        })}
        <circle cx={HUB.x} cy={HUB.y} r="22" fill="url(#hubglow)" />
        <circle cx={HUB.x} cy={HUB.y} r="4.5" fill="#FF6B00" stroke="#fff" strokeWidth="1.2" />
        <text x={HUB.x - 30} y={HUB.y + 16} fontSize="8" fill="#fff" fontWeight="800">
          {HUB.name}
        </text>
      </svg>
    </div>
  );
}
