import { expect, test, type Page } from '@playwright/test';
import { futureDate } from './helpers';

async function signIn(page: Page) {
  await page.goto('/admin/login/');
  await page.getByLabel('Parol').fill('test-admin-password');
  await page.getByRole('button', { name: 'Kirish' }).click();
  await expect(page.getByRole('heading', { name: 'Bronlar' })).toBeVisible();
}

test.describe('admin panel', () => {
  test.skip(({ isMobile }) => isMobile, 'admin flows are covered on desktop');

  test('is protected and rejects a wrong password', async ({ page }) => {
    await page.goto('/admin/');
    await expect(page).toHaveURL(/\/admin\/login\/$/);
    await page.getByLabel('Parol').fill('nope');
    await page.getByRole('button', { name: 'Kirish' }).click();
    await expect(page.getByRole('alert')).toHaveText('Parol noto‘g‘ri.');
  });

  test('lists a new booking and confirms it', async ({ page, request }) => {
    const res = await request.post('/api/bookings/', {
      data: {
        tourSlug: 'white-island-ras-mohamed',
        date: futureDate(),
        time: '',
        hotel: 'Admin Test Hotel',
        qty: { single: 1 },
        notes: '',
        name: 'Grace Hopper',
        phone: '+44 7700 900456',
        email: '',
      },
    });
    expect(res.status()).toBe(201);
    const { reference } = await res.json();

    await signIn(page);
    await page.getByLabel('Bronlarni qidirish').fill(reference);
    await page.getByRole('button', { name: 'Qidirish' }).click();
    await page.getByRole('link', { name: reference }).click();

    await expect(page.getByText('Admin Test Hotel')).toBeVisible();
    await page.getByRole('button', { name: /Tasdiqlash/ }).click();
    await expect(page.locator('h1')).toContainText('Tasdiqlangan');

    await page.getByLabel(/Ichki izoh/).fill('Haydovchi: Ahmed, 7:30');
    await page.getByRole('button', { name: 'Izohni saqlash' }).click();
    await page.reload();
    await expect(page.getByLabel(/Ichki izoh/)).toHaveValue('Haydovchi: Ahmed, 7:30');

    await page.getByRole('button', { name: 'Chiqish' }).click();
    await expect(page).toHaveURL(/\/admin\/login\/$/);
  });

  test('creates a tour with a photo and price, hides and deletes it', async ({ page }, testInfo) => {
    page.on('dialog', (d) => d.accept());
    await signIn(page);
    await page.getByRole('link', { name: 'Turlar' }).click();
    await page.getByRole('button', { name: '+ Yangi tur qo‘shish' }).click();
    await expect(page).toHaveURL(/\/admin\/tours\/new-tour[-\d]*\/$/);

    const name = `E2E Sunset Trip ${testInfo.workerIndex}${Date.now() % 100000}`;
    await page.getByPlaceholder('Sunset Boat Trip').fill(name);
    await page.getByPlaceholder(/Relax on a yacht/).fill('A short e2e tour.');
    await page.getByPlaceholder('9 hours').fill('3 hours');

    // Photo upload (tiny PNG fixture generated on the fly).
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    await page.locator('input[type=file]').setInputFiles({ name: 'pic.png', mimeType: 'image/png', buffer: png });
    await expect(page.getByText('Muqova')).toBeVisible();

    await page.getByRole('spinbutton', { name: 'Narx' }).first().fill('77');
    await page.getByRole('checkbox', { name: /Yashirin|Saytda ko‘rinadi/ }).check();
    await page.getByRole('button', { name: 'Saqlash' }).click();
    await expect(page.getByRole('status')).toContainText('Saqlandi');
    const slug = new URL(page.url()).pathname.split('/').filter(Boolean).pop()!;

    await page.goto(`/en/sharm/${slug}/`);
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
    await expect(page.getByText('£77').first()).toBeVisible();

    await page.goto(`/admin/tours/?q=${encodeURIComponent(name)}`);
    await page.getByRole('button', { name: 'Yashirish' }).click();
    await expect(page.getByRole('button', { name: 'Saytga chiqarish' })).toBeVisible();
    expect((await page.request.get(`/en/sharm/${slug}/`)).status()).toBe(404);

    await page.getByRole('link', { name: 'Tahrirlash' }).click();
    await page.getByRole('button', { name: 'O‘chirish' }).first().click();
    await expect(page).toHaveURL(/\/admin\/tours\/$/);
    await expect(page.getByRole('link', { name })).toHaveCount(0);
  });
});
