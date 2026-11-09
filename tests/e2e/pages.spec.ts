import { expect, test } from '@playwright/test';
import { allTours } from '../../src/data/tours';
import { expectNoHorizontalScroll, trackErrors } from './helpers';

const tours = allTours('en');

const STATIC_PAGES = [
  { path: '/en/', h1: /Red Sea/ },
  { path: '/en/sharm/', h1: /Sharm El Sheikh/ },
  { path: '/en/about-us/', h1: /know every wave/ },
  { path: '/en/terms-and-conditions/', h1: /Terms/ },
  { path: '/en/contact/', h1: /here/ },
  { path: '/en/sharm/video/', h1: /Videos/ },
];

for (const p of STATIC_PAGES) {
  test(`page ${p.path} renders without errors`, async ({ page }) => {
    const errors = trackErrors(page);
    const res = await page.goto(p.path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1').first()).toContainText(p.h1);
    await expect(page).toHaveTitle(/Sardor Tours/);
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy();
    await expectNoHorizontalScroll(page);
    expect(errors).toEqual([]);
  });
}

test('every tour detail page renders', async ({ page }) => {
  test.slow();
  const errors = trackErrors(page);
  for (const t of tours) {
    const res = await page.goto(`/en/sharm/${t.slug}/`);
    expect(res?.status(), t.slug).toBe(200);
    await expect(page.locator('h1')).toHaveText(t.title);
    await expect(page.getByRole('heading', { name: 'Tour Itinerary' })).toBeVisible();
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.some((s) => s.includes('"TouristTrip"')), `${t.slug} structured data`).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('unknown routes return 404 page', async ({ page }) => {
  const res = await page.goto('/en/sharm/does-not-exist/');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: /sailed away/ })).toBeVisible();
  const res2 = await page.goto('/en/booking/ST-ZZZZZZ/');
  expect(res2?.status()).toBe(404);
});

test('SEO files are served', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain('Sitemap:');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  for (const t of tours) expect(xml).toContain(`/en/sharm/${t.slug}/`);
});

test('all internal links resolve', async ({ page, request }) => {
  test.slow();
  const seen = new Set<string>();
  for (const start of ['/en/', '/en/sharm/', '/en/sharm/quad-safari-sharm/', '/en/about-us/', '/en/contact/']) {
    await page.goto(start);
    const hrefs = await page.$$eval('a[href^="/"]', (as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!));
    for (const h of hrefs) seen.add(h.split('#')[0] || '/');
  }
  for (const href of seen) {
    const res = await request.get(href);
    expect(res.status(), href).toBeLessThan(400);
  }
});
