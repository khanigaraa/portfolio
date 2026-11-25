import { expect, test, type Page } from '@playwright/test';

const h1 = (page: Page) => page.getByRole('heading', { level: 1 });
const langButton = (page: Page, name: 'Bahasa Indonesia' | 'English') =>
  page.getByRole('group', { name: /Bahasa|Language/ }).getByRole('button', { name });

test('switching to English translates the page, the navigation and <html lang>', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  await expect(langButton(page, 'Bahasa Indonesia')).toHaveAttribute('aria-pressed', 'true');

  await page.evaluate(() => ((window as unknown as { marker: number }).marker = 1));
  await langButton(page, 'English').click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(h1(page)).toHaveText('Projects');
  await expect(page).toHaveTitle('Projects · Kanta Khanigara');
  await expect(page.locator('.match-card h2').first()).toHaveText('Multi-Node High Availability System');
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' })).toBeVisible();
  await expect(langButton(page, 'English')).toHaveAttribute('aria-pressed', 'true');
  await expect(langButton(page, 'English')).toBeFocused();
  // No reload: the page was re-rendered in place.
  expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(1);
});

test('the chosen language survives navigation and a reload', async ({ page }) => {
  await page.goto('/projects');
  await langButton(page, 'English').click();
  await page.getByRole('main').getByRole('link', { name: 'Multi-Node High Availability System' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'The problem' })).toBeVisible();
  await expect(page.locator('.stats')).toContainText('99.95%');

  await page.reload();
  await expect(h1(page)).toHaveText('Multi-Node High Availability System');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await langButton(page, 'Bahasa Indonesia').click();
  await expect(h1(page)).toHaveText('Sistem High Availability Multi-Node');
  await page.reload();
  await expect(h1(page)).toHaveText('Sistem High Availability Multi-Node');
});

test('the 404 page is translated too', async ({ page }) => {
  await page.goto('/apa-ini');
  await langButton(page, 'English').click();
  await expect(h1(page)).toHaveText('Match not found');
  await expect(page.getByRole('link', { name: 'Back to the lobby' })).toBeVisible();
});

test('a shared ?lang=en link opens in English, is remembered, and leaves the URL clean', async ({ page }) => {
  await page.goto('/projects/datworks?lang=en');
  await expect(h1(page)).toHaveText('Datworks: photography portfolio website');
  await expect(page).toHaveURL(/\/projects\/datworks$/);
  await page.goto('/projects');
  await expect(h1(page)).toHaveText('Projects');
});

test.describe('an English-language browser', () => {
  test.use({ locale: 'en-GB' });

  test('starts in English, and ?lang=id still forces Indonesian', async ({ page }) => {
    await page.goto('/projects');
    await expect(h1(page)).toHaveText('Projects');
    await page.goto('/projects?lang=id');
    await expect(h1(page)).toHaveText('Proyek');
  });
});

test.describe('a phone, in English', () => {
  test.use({ viewport: { width: 375, height: 740 }, locale: 'en-US' });

  test('the header still fits, with the language switch and the menu', async ({ page }) => {
    await page.goto('/projects');
    await expect(langButton(page, 'English')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
