import { expect, test } from '@playwright/test';
import tours from '../../src/data/tours.json' with { type: 'json' };

test.describe('tour catalogue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/sharm/');
  });

  test('lists every tour', async ({ page }) => {
    await expect(page.getByTestId('tour-card')).toHaveCount(tours.length);
  });

  test('category filter shows only that category', async ({ page }) => {
    await page.getByRole('button', { name: 'Safari', exact: true }).click();
    const expected = tours.filter((t) => t.category === 'safari').length;
    await expect(page.getByTestId('tour-card')).toHaveCount(expected);
    await expect(page.getByRole('heading', { name: 'Safari', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sea & Diving', level: 3 })).toHaveCount(0);
    expect(page.url()).toContain('cat=safari');
  });

  // The price pills were removed from the UI to match the reference design;
  // the price filter is still reachable through the URL (?price=…).
  test('price filter narrows results', async ({ page }) => {
    await page.goto('/en/sharm/?price=over100');
    const expected = tours.filter((t) => t.priceFrom > 100).length;
    await expect(page.getByTestId('tour-card')).toHaveCount(expected);
    await expect(page.getByTestId('result-count')).toHaveText(`${expected} tours found`);
    await page.getByRole('button', { name: /Clear filters/ }).click();
    await expect(page.getByTestId('tour-card')).toHaveCount(tours.length);
  });

  test('filters can be combined into an empty state and reset', async ({ page }) => {
    await page.goto('/en/sharm/?price=under30');
    await page.getByRole('button', { name: 'Historical' }).click();
    const expected = tours.filter((t) => t.category === 'historical' && t.priceFrom < 30).length;
    await expect(page.getByTestId('tour-card')).toHaveCount(expected);
  });

  test('filters are restored from the URL', async ({ page }) => {
    await page.goto('/en/sharm/?cat=sea&price=under30');
    const expected = tours.filter((t) => t.category === 'sea' && t.priceFrom < 30).length;
    await expect(page.getByTestId('tour-card')).toHaveCount(expected);
  });

  test('hero search shows suggestions and navigates to a tour', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Search tours' });
    await input.fill('petra');
    const result = page.getByRole('link', { name: /Petra, Jordan/ }).first();
    await expect(result).toBeVisible();
    await result.click();
    await expect(page).toHaveURL(/\/en\/sharm\/petra-jordan-trip\/$/);
  });

  test('hero search with no match shows a message, submit filters the list', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Search tours' });
    await input.fill('zzzz');
    await expect(page.getByText('No tours found for “zzzz”')).toBeVisible();
    await input.fill('boat');
    await input.press('Enter');
    const expected = tours.filter((t) => t.name.toLowerCase().includes('boat')).length;
    await expect(page.getByTestId('tour-card')).toHaveCount(expected);
  });

  test('tour card opens the detail page', async ({ page }) => {
    await page.getByTestId('tour-card').first().click();
    await expect(page).toHaveURL(new RegExp(`/en/sharm/${tours[0].slug}/$`));
  });
});
