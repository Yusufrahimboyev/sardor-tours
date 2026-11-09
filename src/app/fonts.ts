import { Inter, Plus_Jakarta_Sans, Poppins } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-poppins', display: 'swap' });

/** Font CSS variables for <html className>; shared by [lang]/layout.tsx and global-not-found.tsx. */
export const fontVariables = `${jakarta.variable} ${inter.variable} ${poppins.variable}`;
