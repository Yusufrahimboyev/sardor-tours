import Link from 'next/link';

/** Fallback 404 outside the language sections (e.g. unknown /admin/… paths). */
export default function NotFound() {
  return (
    <main id="main-content" style={{ maxWidth: 640, margin: '0 auto', padding: '96px 24px', fontFamily: 'var(--font)' }}>
      <p style={{ color: '#6b778c' }}>404</p>
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#14213d' }}>Page not found</h1>
      <p style={{ margin: '12px 0 24px' }}>The page you are looking for does not exist or has moved.</p>
      <Link href="/" style={{ color: '#ff6b00', fontWeight: 700 }}>
        Go to the home page →
      </Link>
    </main>
  );
}
