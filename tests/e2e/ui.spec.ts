import { expect, test } from '@playwright/test';

test('contact form validates and submits', async ({ page, request }) => {
  await page.goto('/en/contact/');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Please enter your name')).toBeVisible();
  await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  await expect(page.getByText('Please write at least 10 characters')).toBeVisible();

  await page.getByLabel('Your name').fill('Alan Turing');
  await page.getByLabel('Email').fill('alan@example.com');
  await page.getByLabel('Topic').selectOption('group');
  await page.getByRole('textbox', { name: 'Message' }).fill('We are a group of 12 — can you arrange a private boat?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('heading', { name: 'Thank you!' })).toBeVisible();

  const res = await request.get('/api/contact/', { headers: { Authorization: 'Bearer test-admin-token' } });
  const { items } = await res.json();
  expect(items.some((m: { email: string }) => m.email === 'alan@example.com')).toBe(true);
});

test('home: destinations, FAQ accordion and mobile menu', async ({ page, isMobile }) => {
  await page.goto('/en/');
  await expect(page.getByRole('link', { name: /Sharm El Sheikh/ }).first()).toBeVisible();
  await expect(page.getByLabel('Hurghada — coming soon')).toBeVisible();

  const q = page.getByText('Do I have to pay in advance?');
  await q.click();
  await expect(page.getByText(/Reserve your place in just a few minutes/)).toBeVisible();

  if (isMobile) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menu = page.getByRole('dialog', { name: 'Menu' });
    await expect(menu).toBeVisible();
    await menu.getByRole('link', { name: 'About us' }).click();
    await expect(page).toHaveURL(/\/en\/about-us\/$/);
  } else {
    await page.locator('#destinations a[href="/en/sharm/"]').click();
    await expect(page).toHaveURL(/\/en\/sharm\/$/);
  }
});

test('tour gallery navigates and opens fullscreen', async ({ page }) => {
  await page.goto('/en/sharm/quad-safari-sharm/');
  const gallery = page.getByRole('region', { name: 'Tour photo gallery' }).locator('..');
  await expect(gallery.getByText(/^1 \/ \d+$/)).toBeVisible();
  await gallery.getByRole('button', { name: 'Next photo' }).click();
  await expect(gallery.getByText(/^2 \/ \d+$/)).toBeVisible();
  await page.getByRole('button', { name: /Open photo 2 of/ }).click();
  const viewer = page.getByRole('dialog', { name: 'Photo viewer' });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByText(/^2 \/ \d+$/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
});

test('included / not included / what to bring panels', async ({ page }) => {
  await page.goto('/en/sharm/quad-safari-sharm/');
  await expect(page.getByRole('region', { name: 'Included in the Price' })).toContainText('English-speaking guide');
  await expect(page.getByRole('region', { name: 'Not Included' })).toContainText('Shisha');
  await expect(page.getByRole('region', { name: 'What to Bring' })).toContainText('Sunglasses');
});

test('quick nav search and contact panels', async ({ page }) => {
  await page.goto('/en/sharm/quad-safari-sharm/');
  const nav = page.getByRole('navigation', { name: 'Quick navigation' });
  await nav.getByRole('button', { name: 'Search' }).click();
  const panel = page.getByRole('dialog', { name: 'Search tours' });
  await panel.getByLabel('Search tours').fill('dolphin');
  await panel.getByRole('link', { name: /Dolphin Show/ }).click();
  await expect(page).toHaveURL(/dolphin-show-sharm/);

  await nav.getByRole('button', { name: 'Contact' }).click();
  const contact = page.getByRole('dialog', { name: 'Get in touch' });
  await expect(contact.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', /wa\.me/);
  await page.keyboard.press('Escape');
  await expect(contact).toBeHidden();
});
