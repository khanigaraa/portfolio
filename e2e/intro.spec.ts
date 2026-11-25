import { expect, test, type Page } from '@playwright/test';

const intro = (page: Page) => page.getByRole('dialog', { name: 'Intro: mencari pertandingan' });
const h1 = (page: Page) => page.getByRole('heading', { level: 1 });

/** The overlay fades out for 350 ms before it is removed; with time frozen, run that fade. */
async function expectIntroGone(page: Page) {
  await page.clock.runFor(400);
  await expect(intro(page)).toHaveCount(0);
}

/** Opens the lobby as a first-time visitor, with time frozen so each stage can be checked. */
async function firstVisit(page: Page, path = '/') {
  // Time stands still (pauseAt) so slow machines cannot move the intro on by themselves;
  // each test advances it explicitly with runFor.
  await page.clock.install({ time: new Date('2026-11-25T10:00:00') });
  await page.clock.pauseAt(new Date('2026-11-25T10:00:01'));
  await page.goto(path);
}

test.describe('first visit', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Find Match → searching → match found → Accept → loading → lobby', async ({ page }) => {
    await firstVisit(page);
    await expect(intro(page)).toBeVisible();
    await expect(intro(page)).toHaveAttribute('data-state', 'idle');
    const find = page.getByRole('button', { name: /Find Match/ });
    await expect(find).toBeFocused();
    // The page underneath is inert until the intro ends.
    await expect(page.locator('main')).toHaveAttribute('inert', '');

    await find.click();
    await expect(intro(page)).toHaveAttribute('data-state', 'searching');
    await expect(intro(page)).toContainText('Mencari pertandingan…');
    await page.clock.runFor(1000);
    await expect(page.locator('.intro-timer')).toHaveText('00:01');

    await page.clock.runFor(700);
    await expect(intro(page)).toHaveAttribute('data-state', 'found');
    await expect(intro(page)).toContainText('Pertandingan ditemukan!');
    const accept = page.getByRole('button', { name: 'Accept' });
    await expect(accept).toBeFocused();
    await expect(page.locator('.intro-count')).toHaveText('3');
    await page.clock.runFor(1000);
    await expect(page.locator('.intro-count')).toHaveText('2');

    await accept.click();
    await expect(intro(page)).toHaveAttribute('data-state', 'loading');
    await expect(intro(page)).toContainText('Memuat profil Stingtaw…');

    await page.clock.runFor(1000);
    await expectIntroGone(page);
    await expect(h1(page)).toHaveText('Kanta Khanigara');
    await expect(h1(page)).toBeFocused();
    await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  });

  test('nobody touches anything: the lobby arrives on its own within about 6 seconds', async ({ page }) => {
    await firstVisit(page);
    await expect(intro(page)).toBeVisible();
    // idle 0.8 s + searching 1.6 s + countdown 3 s: loading starts at 5.4 s.
    await page.clock.runFor(5500);
    await expect(intro(page)).toHaveAttribute('data-state', 'loading');
    // …and ends at 6.3 s.
    await page.clock.runFor(800);
    await expectIntroGone(page);
    await expect(h1(page)).toHaveText('Kanta Khanigara');
  });

  test('Enter finds a match and accepts it from the keyboard', async ({ page }) => {
    await firstVisit(page);
    await expect(intro(page)).toHaveAttribute('data-state', 'idle');
    await page.keyboard.press('Enter');
    await expect(intro(page)).toHaveAttribute('data-state', 'searching');
    await page.clock.runFor(1700);
    await expect(intro(page)).toHaveAttribute('data-state', 'found');
    await page.keyboard.press('Enter');
    await expect(intro(page)).toHaveAttribute('data-state', 'loading');
  });

  test('the Skip button ends it at once, and it does not come back', async ({ page }) => {
    await firstVisit(page);
    await page.getByRole('button', { name: 'Lewati' }).click();
    await expectIntroGone(page);
    await expect(h1(page)).toBeFocused();

    await page.reload();
    await expect(h1(page)).toHaveText('Kanta Khanigara');
    await expect(intro(page)).toHaveCount(0);
  });

  test('Esc skips it from any stage', async ({ page }) => {
    await firstVisit(page);
    await page.clock.runFor(2000);
    await expect(intro(page)).toHaveAttribute('data-state', 'searching');
    await page.keyboard.press('Escape');
    await expectIntroGone(page);
  });

  test('a deep link goes straight to what was asked for', async ({ page }) => {
    await firstVisit(page, '/projects/high-availability');
    await expect(h1(page)).toHaveText('Sistem High Availability Multi-Node');
    await expect(intro(page)).toHaveCount(0);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('there is no intro', async ({ page }) => {
      await page.goto('/');
      await expect(h1(page)).toHaveText('Kanta Khanigara');
      await expect(intro(page)).toHaveCount(0);
    });
  });

  test.describe('in English', () => {
    test.use({ locale: 'en-US' });

    test('the intro speaks English', async ({ page }) => {
      await firstVisit(page);
      const dialog = page.getByRole('dialog', { name: 'Intro: finding a match' });
      await expect(dialog).toContainText('Start matchmaking');
      await page.clock.runFor(2500);
      await expect(dialog).toContainText('Match found!');
      await expect(page.getByRole('button', { name: 'Skip' })).toBeVisible();
    });
  });

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 375, height: 740 } });

    test('every stage fits the screen', async ({ page }) => {
      await firstVisit(page);
      for (const ms of [0, 1000, 1700, 3200]) {
        await page.clock.runFor(ms);
        await expect(page.locator('.intro-panel:not([hidden])')).toBeInViewport({ ratio: 1 });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      }
    });
  });
});

test('a returning visitor goes straight to the lobby, and can replay the intro from the footer', async ({ page }) => {
  await page.goto('/');
  await expect(h1(page)).toHaveText('Kanta Khanigara');
  await expect(intro(page)).toHaveCount(0);

  await page.getByRole('button', { name: 'Putar ulang intro' }).click();
  await expect(intro(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(intro(page)).toBeHidden();
});
