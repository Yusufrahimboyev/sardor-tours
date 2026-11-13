import { expect, test } from '@playwright/test';
import { futureDate, trackErrors } from './helpers';

test.describe('booking', () => {
  test('validates and creates a booking (Russian page)', async ({ page, request }) => {
    const errors = trackErrors(page);
    await page.goto('/ru/tours/quad-safari-sharm/');
    const form = page.locator('#book');

    await form.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(form.getByText('Выберите дату')).toBeVisible();
    await expect(form.getByText('Укажите название отеля')).toBeVisible();
    await expect(form.getByText('Выберите время выезда')).toBeVisible();

    await form.getByLabel('Дата').fill(futureDate());
    await form.getByLabel('Название отеля').fill('Rixos Premium Seagate');
    await form.getByRole('button', { name: '10:00' }).first().click();
    await form.getByLabel('Имя и фамилия').fill('Ada Lovelace');
    await form.getByLabel('Телефон / WhatsApp').fill('+44 7700 900123');

    const total = form.getByTestId('booking-total');
    const before = await total.textContent();
    await form.getByRole('button', { name: /^Увеличить/ }).first().click();
    await expect(total).not.toHaveText(before!);

    await form.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page).toHaveURL(/\/ru\/booking\/ST-[A-Z0-9]{6}\/$/);
    await expect(page.getByRole('heading', { name: 'Заявка получена' })).toBeVisible();
    const ref = (await page.getByTestId('booking-ref').textContent())!;

    const res = await request.get('/api/bookings/', { headers: { Authorization: 'Bearer test-admin-token' } });
    const { items } = await res.json();
    expect(items.find((b: { id: string }) => b.id === ref)).toMatchObject({ tourSlug: 'quad-safari-sharm', name: 'Ada Lovelace' });
    expect(errors).toEqual([]);
  });

  test('rejects dates outside the tour schedule (Uzbek page)', async ({ page }) => {
    await page.goto('/uz/tours/mount-moses-sinai/');
    const form = page.locator('#book');
    await form.getByLabel('Sana').fill(futureDate([1])); // Monday — runs Sun, Wed, Fri
    await form.getByLabel('Sana').blur();
    await expect(form.getByText(/faqat .* kunlari o‘tkaziladi/)).toBeVisible();
  });

  test('server recomputes the price and rejects tampering', async ({ request }) => {
    const base = { tourSlug: 'quad-safari-sharm', date: futureDate(), time: '10:00 AM', hotel: 'Hilton', notes: '', name: 'Test Guest', phone: '+44 7700 900123', email: '' };
    const bad = await request.post('/api/bookings/', { data: { ...base, qty: { hacker: 3 } } });
    expect(bad.status()).toBe(400);
    const ok = await request.post('/api/bookings/', { data: { ...base, qty: { single: 2 }, total: 1 } });
    expect(ok.status()).toBe(201);
    expect((await ok.json()).total).toBeGreaterThan(1);
  });
});

test('contact form sends a message', async ({ page }) => {
  await page.goto('/en/contacts/');
  await page.getByLabel('Your name').fill('Grace');
  await page.getByLabel('Email').fill('grace@example.com');
  await page.getByRole('textbox', { name: 'Message' }).fill('Do you have a tour for a group of 12?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText(/Thank you! Your message has been sent/)).toBeVisible();
});
