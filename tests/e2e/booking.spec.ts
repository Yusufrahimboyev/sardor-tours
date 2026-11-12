import { expect, test, type Locator, type Page } from '@playwright/test';
import { futureDate, trackErrors } from './helpers';

/** The visible booking form: sidebar on desktop, bottom-sheet on mobile. */
async function openForm(page: Page, isMobile: boolean): Promise<Locator> {
  if (isMobile) {
    await page.getByRole('button', { name: 'Book', exact: true }).click();
    return page.getByRole('dialog', { name: /^Book:/ });
  }
  return page.getByRole('complementary', { name: 'Book this tour' });
}

test.describe('booking flow', () => {
  test('desktop sidebar: single-screen form validates and creates a booking', async ({ page, request, isMobile }) => {
    test.skip(isMobile, 'the sidebar is desktop-only');
    const errors = trackErrors(page);
    await page.goto('/en/sharm/quad-safari-sharm/');
    const form = await openForm(page, false);

    await form.getByRole('button', { name: 'Book now' }).click();
    await expect(form.getByText('Select a date to continue')).toBeVisible();
    await expect(form.getByText('Please choose a departure time')).toBeVisible();
    await expect(form.getByText('Please enter your hotel name')).toBeVisible();
    await expect(form.getByText('Please enter your full name')).toBeVisible();

    await form.getByLabel('Hotel name').fill('Rixos Premium Seagate');
    await form.getByLabel('Select a date').fill(futureDate());
    await form.getByRole('button', { name: '10:00 AM' }).click();
    await form.getByLabel('Full name').fill('Ada Lovelace');
    await form.getByLabel('Phone / WhatsApp').fill('+44 7700 900123');
    await form.getByRole('button', { name: 'Book now' }).click();
    await expect(form.getByRole('alert')).toHaveText('Please add at least one guest');

    await form.getByRole('button', { name: 'Increase Single quad' }).click();
    await form.getByRole('button', { name: 'Increase Single quad' }).click();
    await form.getByRole('button', { name: 'Increase Camel ride' }).click();
    await form.getByRole('button', { name: 'Add Private ride' }).click();
    await expect(form.getByTestId('booking-total')).toHaveText('£55');
    await form.getByRole('button', { name: 'Decrease Single quad' }).click();
    await expect(form.getByTestId('booking-total')).toHaveText('£40');
    await form.getByRole('button', { name: 'Book now' }).click();

    await expect(page).toHaveURL(/\/booking\/ST-[A-Z0-9]{6}\/$/);
    const ref = (await page.getByTestId('booking-ref').textContent())!;
    const res = await request.get('/api/bookings/', { headers: { Authorization: 'Bearer test-admin-token' } });
    const { items } = await res.json();
    expect(items.find((b: { id: string }) => b.id === ref)).toMatchObject({ tourSlug: 'quad-safari-sharm', total: 40 });
    expect(errors).toEqual([]);
  });

  test('mobile dialog: validates each step and creates a booking', async ({ page, request, isMobile }) => {
    test.skip(!isMobile, 'the stepped dialog is the mobile booking UI');
    const errors = trackErrors(page);
    await page.goto('/en/sharm/quad-safari-sharm/');
    const form = await openForm(page, isMobile);

    // Step 1 — required fields
    await form.getByRole('button', { name: 'Next' }).first().click();
    await expect(form.getByText('Select a date to continue')).toBeVisible();
    await expect(form.getByText('Please choose a departure time')).toBeVisible();
    await expect(form.getByText('Please enter your hotel name')).toBeVisible();

    await form.getByLabel('Select a date').fill(futureDate());
    await form.getByRole('button', { name: '10:00 AM' }).click();
    await form.getByLabel('Hotel name').fill('Rixos Premium Seagate');
    await form.getByRole('button', { name: 'Next' }).first().click();

    // Step 2 — guests & live total (hidden step panes are excluded from role queries)
    const step2Next = form.getByRole('button', { name: 'Next' });
    await expect(form.getByText('Guests', { exact: true })).toBeVisible();
    await step2Next.click();
    await expect(form.getByRole('alert')).toHaveText('Please add at least one guest');
    await form.getByRole('button', { name: 'Increase Single quad' }).click();
    await form.getByRole('button', { name: 'Increase Single quad' }).click();
    await form.getByRole('button', { name: 'Increase Camel ride' }).click();
    await form.getByRole('button', { name: 'Add Private ride' }).click();
    await expect(form.getByTestId('booking-total')).toHaveText('£55');
    await form.getByRole('button', { name: 'Decrease Single quad' }).click();
    await expect(form.getByTestId('booking-total')).toHaveText('£40');
    await step2Next.click();

    // Step 3 — contact details
    await form.getByRole('button', { name: 'Send booking request' }).click();
    await expect(form.getByText('Please enter your full name')).toBeVisible();
    await form.getByLabel('Full name').fill('Ada Lovelace');
    await form.getByLabel('Phone / WhatsApp').fill('abc');
    await form.getByRole('button', { name: 'Send booking request' }).click();
    await expect(form.getByText('Please enter a valid phone / WhatsApp number')).toBeVisible();
    await form.getByLabel('Phone / WhatsApp').fill('+44 7700 900123');
    await form.getByLabel(/^Email/).fill('ada@example.com');
    await form.getByRole('button', { name: 'Send booking request' }).click();

    // Confirmation
    await expect(page).toHaveURL(/\/en\/booking\/ST-[A-Z0-9]{6}\/$/);
    await expect(page.getByRole('heading', { name: 'Booking request received' })).toBeVisible();
    const ref = (await page.getByTestId('booking-ref').textContent())!;
    await expect(page.getByText('£40').last()).toBeVisible();
    const wa = page.getByRole('link', { name: /Confirm faster on WhatsApp/ });
    expect(decodeURIComponent((await wa.getAttribute('href'))!)).toContain(ref);

    // Persisted server-side with a server-computed total
    const res = await request.get('/api/bookings/', { headers: { Authorization: 'Bearer test-admin-token' } });
    const { items } = await res.json();
    const saved = items.find((b: { id: string }) => b.id === ref);
    expect(saved).toMatchObject({ tourSlug: 'quad-safari-sharm', time: '10:00 AM', total: 40, name: 'Ada Lovelace' });
    expect(errors).toEqual([]);
  });

  test('rejects dates outside the tour schedule', async ({ page, isMobile }) => {
    await page.goto('/en/sharm/mount-moses-sinai/');
    const form = await openForm(page, isMobile);
    const submit = form.getByRole('button', { name: isMobile ? 'Next' : 'Book now' }).first();
    await form.getByLabel('Select a date').fill(futureDate([1])); // Monday — tour runs Sun, Wed, Fri
    await form.getByLabel('Hotel name').fill('Hilton');
    await submit.click();
    await expect(form.getByText('This tour runs on Sunday, Wednesday, Friday only')).toBeVisible();
    await form.getByLabel('Select a date').fill(futureDate([3]));
    await submit.click();
    await expect(form.getByText('This tour runs on Sunday, Wednesday, Friday only')).toBeHidden();
  });

  test('"Book this tour" CTA opens the booking dialog', async ({ page }) => {
    await page.goto('/en/sharm/white-island-ras-mohamed/');
    await page.getByRole('button', { name: 'Book this tour' }).click();
    const dialog = page.getByRole('dialog', { name: /^Book:/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('Select a date')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});

test.describe('booking API', () => {
  const valid = () => ({
    tourSlug: 'glass-bottom-boat',
    date: futureDate(),
    time: '10:30 AM',
    hotel: 'Sunrise',
    qty: { adult: 2, child: 1 },
    name: 'Grace Hopper',
    phone: '+1 202 555 0143',
    email: '',
    notes: '',
  });

  test('computes the price on the server', async ({ request }) => {
    const res = await request.post('/api/bookings/', { data: { ...valid(), total: 1 } });
    expect(res.status()).toBe(201);
    expect((await res.json()).total).toBe(50);
  });

  test('returns field errors for invalid input', async ({ request }) => {
    const bad = await request.post('/api/bookings/', { data: { ...valid(), hotel: '', qty: { adult: 0 } } });
    expect(bad.status()).toBe(400);
    expect((await bad.json()).fieldErrors.hotel).toBeTruthy();

    const past = await request.post('/api/bookings/', { data: { ...valid(), date: '2020-01-01' } });
    expect(past.status()).toBe(400);

    const unknown = await request.post('/api/bookings/', { data: { ...valid(), tourSlug: 'nope' } });
    expect(unknown.status()).toBe(404);

    const extra = await request.post('/api/bookings/', { data: { ...valid(), qty: { adult: 1, hacked: 5 } } });
    expect(extra.status()).toBe(400);

    const spam = await request.post('/api/bookings/', { data: { ...valid(), company: 'bot inc' } });
    expect(spam.status()).toBe(400);
  });

  test('admin listing requires a token', async ({ request }) => {
    expect((await request.get('/api/bookings/')).status()).toBe(401);
    expect((await request.get('/api/bookings/', { headers: { Authorization: 'Bearer wrong' } })).status()).toBe(401);
  });
});
