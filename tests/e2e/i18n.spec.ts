import { expect, test } from '@playwright/test';
import { futureDate, trackErrors } from './helpers';
import en from '../../src/i18n/messages/en.json';
import ru from '../../src/i18n/messages/ru.json';

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

test('switcher keeps path + query and sets cookie', async ({ page, context }) => {
  await page.goto('/ru/sharm/?cat=safari');
  await page.getByRole('link', { name: 'UZ' }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/uz\/sharm\/\?cat=safari$/);
  expect((await context.cookies()).find((c) => c.name === 'lang')?.value).toBe('uz');
});

const PAGES = ['/', '/sharm/', '/sharm/quad-safari-sharm/', '/sharm/video/', '/about-us/', '/contact/', '/terms-and-conditions/'];
test('every page renders in every locale with localized title and hreflang', async ({ page }) => {
  const errors = trackErrors(page);
  for (const p of PAGES) for (const l of ['uz', 'en', 'ru']) {
    const r = await page.goto(`/${l}${p}`); expect(r!.status(), `${l}${p}`).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', l);
    await expect(page.locator(`link[rel="canonical"]`)).toHaveAttribute('href', new RegExp(`/${l}${p}$`));
    for (const h of ['uz', 'en', 'ru', 'x-default'])
      await expect(page.locator(`link[rel="alternate"][hreflang="${h}"]`), `${l}${p} ${h}`).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

test('full booking in Russian', async ({ page, isMobile }) => {
  const errors = trackErrors(page);
  await page.goto('/ru/sharm/quad-safari-sharm/');
  const form = isMobile
    ? (await page.getByRole('button', { name: ru.client.booking.book, exact: true }).click(), page.getByRole('dialog'))
    : page.getByRole('complementary', { name: ru.tour.side.aria });
  const b = ru.client.booking;
  await form.getByRole('button', { name: b.next }).first().click();
  await expect(form.getByText(ru.client.errors.dateRequired)).toBeVisible();
  await form.getByLabel(b.selectDate).fill(futureDate());
  await form.getByRole('button', { name: '10:00 AM' }).click();
  await form.getByLabel(b.hotelName).fill('Rixos Premium Seagate');
  await form.getByRole('button', { name: b.next }).first().click();
  await form.getByRole('button', { name: b.increase.replace('{label}', 'Single quad') }).click();
  await form.getByRole('button', { name: b.increase.replace('{label}', 'Single quad') }).click();
  await form.getByRole('button', { name: b.next }).click();
  await form.getByLabel(b.fullName).fill('Ali Valiyev');
  await form.getByLabel(b.phone).fill('+998 93 212 99 05');
  await form.getByRole('button', { name: b.submit }).click();
  await expect(page).toHaveURL(/\/ru\/booking\/ST-[A-Z0-9]{6}\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  const wa = await page.getByRole('link', { name: ru.booking.confirm.whatsappCta }).getAttribute('href');
  expect(decodeURIComponent(wa!)).toContain(ru.client.whatsapp.bookingIntro.split('{')[0].trim());
  expect(errors).toEqual([]);
});
test('API accepts unknown lang as en', async ({ request }) => {
  const r = await request.post('/api/bookings/', { data: { lang: 'de', tourSlug: 'quad-safari-sharm' } });
  expect(r.status()).toBe(400);
  expect((await r.json()).error).toBe(en.client.errors.checkFields);
});
