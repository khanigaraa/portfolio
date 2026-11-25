import { expect, test, type Page } from '@playwright/test';

const h1 = (page: Page) => page.getByRole('heading', { level: 1 });
const nav = (page: Page) => page.getByRole('navigation', { name: 'Navigasi utama' });

/** Every page that exists so far; later tickets add theirs. */
const PAGES = [
  '/',
  '/projects',
  '/projects/high-availability',
  '/projects/datworks',
  '/projects/e-commerce',
  '/projects/ashen-thread-store',
  '/about',
  '/writing',
  '/tidak-ada',
];

test('an unknown route shows the themed 404, whose button leads back to the lobby', async ({ page }) => {
  await page.goto('/apa-ini');
  await expect(h1(page)).toHaveText('Pertandingan tidak ditemukan');
  await expect(page).toHaveTitle('Pertandingan tidak ditemukan · Kanta Khanigara');
  await page.getByRole('link', { name: 'Kembali ke lobby' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(h1(page)).toHaveText('Kanta Khanigara');
});

test('the navigation marks the current page and works with back/forward', async ({ page }) => {
  await page.goto('/');
  await expect(nav(page).getByRole('link', { name: 'Lobby' })).toHaveAttribute('aria-current', 'page');

  await page.evaluate(() => ((window as unknown as { marker: number }).marker = 1));
  await nav(page).getByRole('link', { name: 'Proyek' }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(nav(page).getByRole('link', { name: 'Proyek' })).toHaveAttribute('aria-current', 'page');
  await expect(nav(page).getByRole('link', { name: 'Lobby' })).not.toHaveAttribute('aria-current', 'page');

  await page.getByRole('main').getByRole('link', { name: /High Availability/ }).click();
  await expect(page).toHaveTitle('Sistem High Availability Multi-Node · Kanta Khanigara');
  // A case study still belongs to "Proyek".
  await expect(nav(page).getByRole('link', { name: 'Proyek' })).toHaveAttribute('aria-current', 'page');

  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(h1(page)).toHaveText('Proyek');
  await page.goForward();
  await expect(h1(page)).toHaveText('Sistem High Availability Multi-Node');
  // Still the same document: no full reload.
  expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(1);
  // The page is fully visible again after the fade.
  await expect(page.locator('#main')).toHaveCSS('opacity', '1');
});

test('a link to a section scrolls to it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto('/projects#e-commerce');
  await expect(page.locator('#e-commerce')).toBeInViewport();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 740 } });

  test('no page scrolls sideways', async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      await expect(h1(page)).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test('the navigation folds into a menu button', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Menu' });
    await expect(nav(page)).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav(page)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(nav(page)).toBeHidden();
    await expect(toggle).toBeFocused();

    await toggle.click();
    await nav(page).getByRole('link', { name: 'Proyek' }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(nav(page)).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('content is shown straight away, without reveal animations', async ({ page }) => {
    await page.goto('/projects');
    expect(await page.evaluate(() => document.documentElement.classList.contains('motion'))).toBe(false);
    await expect(page.locator('#datworks')).toHaveCSS('opacity', '1');
  });
});

test('with motion, project cards reveal as they scroll in', async ({ page }) => {
  await page.goto('/projects');
  expect(await page.evaluate(() => document.documentElement.classList.contains('motion'))).toBe(true);
  await expect(page.locator('#high-availability')).toHaveClass(/is-in/);
  await expect(page.locator('#high-availability')).toHaveCSS('opacity', '1');
});
