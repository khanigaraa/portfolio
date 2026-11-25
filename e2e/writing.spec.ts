import { expect, test, type Page } from '@playwright/test';

const h1 = (page: Page) => page.getByRole('heading', { level: 1 });

test('Writing has a tidy "coming soon" while there are no articles', async ({ page }) => {
  await page.goto('/writing');
  await expect(h1(page)).toHaveText('Tulisan');
  await expect(page).toHaveTitle('Tulisan · Kanta Khanigara');
  await expect(page.getByText('Patch Notes · Tulisan')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Segera hadir' })).toBeVisible();
  await page.getByRole('main').getByRole('link', { name: 'Lihat proyek' }).click();
  await expect(page).toHaveURL(/\/projects$/);
});

test('the Writing link in the navigation works and is marked current', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Navigasi utama' });
  await nav.getByRole('link', { name: 'Tulisan' }).click();
  await expect(page).toHaveURL(/\/writing$/);
  await expect(nav.getByRole('link', { name: 'Tulisan' })).toHaveAttribute('aria-current', 'page');
});

test('an unknown article shows the not-found page', async ({ page }) => {
  await page.goto('/writing/belum-ada');
  await expect(h1(page)).toHaveText('Pertandingan tidak ditemukan');
});

test.describe('in English', () => {
  test.use({ locale: 'en-US' });

  test('the empty state is translated', async ({ page }) => {
    await page.goto('/writing');
    await expect(h1(page)).toHaveText('Writing');
    await expect(page.getByRole('heading', { level: 2, name: 'Coming soon' })).toBeVisible();
  });
});
