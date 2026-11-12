import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  // The root layout is app/[lang]/layout.tsx, so unmatched URLs need app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  images: {
    // Placeholder photos (Unsplash) are already sized by URL and served from a CDN, so they
    // bypass the optimizer. Real photos (NEXT_PUBLIC_IMAGE_BASE set) go through it.
    unoptimized: !process.env.NEXT_PUBLIC_IMAGE_BASE,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.sharmtours.org' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
