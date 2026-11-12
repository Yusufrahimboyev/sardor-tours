import { expect, type Page } from '@playwright/test';

/** Collects console errors and uncaught exceptions; images from the placeholder CDN are ignored. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if (/images\.unsplash\.com|Failed to load resource/.test(text)) return;
    errors.push(`console: ${text}`);
  });
  return errors;
}

/** A future date (YYYY-MM-DD) that falls on one of `weekdays` (0 = Sunday). */
export function futureDate(weekdays?: number[], minDaysAhead = 3): string {
  const d = new Date();
  d.setDate(d.getDate() + minDaysAhead);
  while (weekdays && !weekdays.includes(d.getDay())) d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'page should not scroll horizontally').toBeLessThanOrEqual(1);
}
