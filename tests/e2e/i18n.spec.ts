import { expect, test } from '@playwright/test';

// Playwright Test defaults every context to locale en-US, and that emulation overrides an
// Accept-Language set through extraHTTPHeaders, so the contexts below set `locale` as well.
test.describe('locale routing', () => {
  test('/ follows cookie, then Accept-Language, then en', async ({ browser }) => {
    const ctx1 = await browser.newContext({ locale: 'ru-RU', extraHTTPHeaders: { 'accept-language': 'ru-RU,ru;q=0.9' } });
    const p1 = await ctx1.newPage(); await p1.goto('/'); await expect(p1).toHaveURL(/\/ru\/$/);
    await ctx1.addCookies([{ name: 'lang', value: 'uz', url: 'http://localhost:3200' }]);
    await p1.goto('/'); await expect(p1).toHaveURL(/\/uz\/$/);
    const ctx2 = await browser.newContext({ locale: 'de-DE', extraHTTPHeaders: { 'accept-language': 'de-DE' } });
    const p2 = await ctx2.newPage(); await p2.goto('/'); await expect(p2).toHaveURL(/\/en\/$/);
  });
  test('<html lang> matches the prefix', async ({ page }) => {
    for (const l of ['uz', 'en', 'ru']) { await page.goto(`/${l}/sharm/`); await expect(page.locator('html')).toHaveAttribute('lang', l); }
  });
  test('unprefixed paths redirect with query preserved (307)', async ({ request }) => {
    const r = await request.get('/sharm/?cat=sea', { maxRedirects: 0, headers: { 'accept-language': 'ru' } });
    expect(r.status()).toBe(307); expect(r.headers()['location']).toMatch(/\/ru\/sharm\/\?cat=sea$/);
  });
  test('legacy booking links redirect', async ({ request }) => {
    const r = await request.get('/booking/ST-ABC234/', { maxRedirects: 0 });
    expect(r.status()).toBe(307); expect(r.headers()['location']).toMatch(/\/en\/booking\/ST-ABC234\/$/);
  });
  test('non-page URLs are never redirected', async ({ request }) => {
    for (const u of ['/api/tours/', '/sitemap.xml', '/robots.txt', '/icon.svg', '/manifest.webmanifest']) {
      const r = await request.get(u, { maxRedirects: 0 }); expect(r.status(), u).toBe(200);
    }
  });
  test('404 pages are server-rendered in the URL locale', async ({ request }) => {
    // request.get returns the raw server HTML; no JavaScript runs.
    for (const [u, l] of [
      ['/ru/sharm/no-such-tour/', 'ru'],
      ['/ru/no-such-page/', 'ru'],
      ['/uz/sharm/no-such-tour/', 'uz'],
      ['/en/no-such-page/', 'en'],
    ]) {
      const r = await request.get(u, { maxRedirects: 0 });
      expect(r.status(), u).toBe(404);
      const html = await r.text();
      expect(html, u).toContain(`<html lang="${l}"`);
      expect(html, u).toContain('This page sailed away');
      expect(html, u).toContain(`href="/${l}/sharm/"`);
    }
  });
  test('unsupported locale ends in a 404', async ({ page }) => {
    const r = await page.goto('/de/'); expect(r!.status()).toBe(404);
  });
});
