import { fontVariables } from '../fonts';
import '../globals.css';

/** The public root layout lives in app/[lang], so the admin panel needs its own <html>. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
