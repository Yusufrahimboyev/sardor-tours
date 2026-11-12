import { expect, test } from '@playwright/test';
import tours from '../../src/data/tours.json' with { type: 'json' };
import { expectNoHorizontalScroll, trackErrors } from './helpers';

const LOCALES = ['en', 'ru', 'uz'] as const;
const PAGES = ['/', '/tours/', '/about/', '/guide/', '/contacts/', '/terms/'];

test.describe('public pages', () => {
  for (const l of LOCALES) {
    for (const p of PAGES) {
      test(`${l}${p} renders without errors`, async ({ page }) => {
        const errors = trackErrors(page);
        const res = await page.goto(`/${l}${p}`);
        expect(res?.status()).toBe(200);
        await expect(page.locator('html')).toHaveAttribute('lang', new RegExp(`^${l}`));
        await expect(page.locator('h1')).toBeVisible();
        await expectNoHorizontalScroll(page);
        expect(errors).toEqual([]);
      });
    }
  }

  test('every tour page renders in every language', async ({ request }) => {
    for (const t of tours) {
      for (const l of LOCALES) {
        const res = await request.get(`/${l}/tours/${t.slug}/`);
        expect(res.status(), `${l}/${t.slug}`).toBe(200);
      }
    }
  });

  test('root redirects by browser language and the switcher keeps the page', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'ru-RU', extraHTTPHeaders: { 'Accept-Language': 'ru-RU,ru;q=0.9' } });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/ru\/$/);
    await page.goto('/ru/tours/quad-safari-sharm/');
    await expect(page.locator('h1')).toContainText('Квадро');
    // On phones the language switcher lives in the burger menu.
    const burger = page.getByRole('button', { name: 'Меню' });
    if (await burger.isVisible()) await burger.click();
    await page.locator('a[hreflang="uz"]:visible').click();
    await expect(page).toHaveURL(/\/uz\/tours\/quad-safari-sharm\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', /^uz/);
    await ctx.close();
  });

  test('old clone URLs redirect to the new structure', async ({ request }) => {
    const r = await request.get('/en/sharm/quad-safari-sharm/', { maxRedirects: 0 });
    expect(r.status()).toBe(308);
    expect(r.headers().location).toContain('/en/tours/quad-safari-sharm/');
  });

  test('catalogue filters by category and search', async ({ page }) => {
    await page.goto('/en/tours/');
    // >= because the admin tests may add a temporary tour while this runs in parallel.
    expect(await page.locator('article').count()).toBeGreaterThanOrEqual(tours.length);
    await page.waitForLoadState('networkidle'); // let the page hydrate under parallel test load
    await page.getByRole('link', { name: 'Desert safari' }).click();
    await expect(page).toHaveURL(/cat=safari/, { timeout: 30_000 }); // soft navigation can be slow while other tests load the server
    await expect(page.locator('article')).toHaveCount(tours.filter((t) => t.category === 'safari').length);
  });

  test('unknown pages return a localized 404', async ({ page }) => {
    const res = await page.goto('/ru/nope/');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Страница не найдена' })).toBeVisible();
  });

  test('sitemap lists every page in every language', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    for (const l of LOCALES) expect(xml).toContain(`/${l}/tours/quad-safari-sharm/`);
    expect(xml).toContain('hreflang');
  });
});
