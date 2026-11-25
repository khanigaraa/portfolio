import { expect, test, type Page } from '@playwright/test';

const h1 = (page: Page) => page.getByRole('heading', { level: 1 });

test('the lobby says who this is, straight away', async ({ page }) => {
  await page.goto('/');
  await expect(h1(page)).toHaveText('Kanta Khanigara');
  await expect(page).toHaveTitle('Kanta Khanigara · Portofolio');
  const hero = page.locator('.hero');
  await expect(hero).toContainText('Stingtaw');
  await expect(hero).toContainText('Infra + Web Developer');
  await expect(hero).toContainText('Bandung, Indonesia');
  const photo = page.getByRole('img', { name: 'Foto Kanta Khanigara memakai jas hitam dan dasi' });
  await expect(photo).toBeVisible();
  expect(await photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  // Everything that matters is in the first screen on a laptop.
  await expect(page.getByRole('link', { name: 'Lihat proyek unggulan' })).toBeInViewport();
});

test('the featured project card leads to its case study', async ({ page }) => {
  await page.goto('/');
  const featured = page.locator('#featured');
  await expect(featured.getByText('MVP · Proyek unggulan')).toBeVisible();
  await expect(featured.locator('.stats')).toContainText('99,95%');
  await featured.getByRole('link', { name: 'Sistem High Availability Multi-Node' }).click();
  await expect(page).toHaveURL(/\/projects\/high-availability$/);
  await expect(h1(page)).toHaveText('Sistem High Availability Multi-Node');
});

test('the hero buttons scroll to the featured project and to contact', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Hubungi aku' }).click();
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.locator('#contact')).toBeInViewport();
  await page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link', { name: 'Lobby' }).click();
  await page.getByRole('link', { name: 'Lihat proyek unggulan' }).click();
  await expect(page.locator('#featured')).toBeInViewport();
});

test('the Contact link in the navigation works from another page', async ({ page }) => {
  await page.goto('/projects');
  await page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link', { name: 'Kontak' }).click();
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.locator('#contact')).toBeInViewport();
});

test('skills are grouped, with a game label and a plain one', async ({ page }) => {
  await page.goto('/');
  const skills = page.locator('#skills');
  await expect(skills.getByText('Skill Tree · Keahlian')).toBeVisible();
  await expect(skills.getByRole('heading', { level: 3 })).toHaveText([
    'Infrastruktur & Sistem',
    'Web',
    'Database',
    'Lainnya',
    'Bahasa',
  ]);
  await expect(skills.locator('[data-group="infra"]')).toContainText('MariaDB Galera Cluster');
  await expect(skills.locator('[data-group="languages"]')).toContainText('Inggris (menengah)');
  await expect(skills).not.toContainText('487');
});

test.describe('in English', () => {
  test.use({ locale: 'en-US' });

  test('the lobby is translated', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero-headline')).toHaveText('I build servers that stay up, and websites people enjoy using.');
    await expect(page.locator('#featured .stats')).toContainText('99.95%');
    await expect(page.locator('#skills').getByRole('heading', { level: 2 })).toHaveText('Skills');
    await expect(page.locator('[data-group="languages"]')).toContainText('English (intermediate)');
    await expect(page.getByRole('link', { name: 'Get in touch' })).toBeVisible();
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 740 } });

  test('the lobby fits and shows the name first', async ({ page }) => {
    await page.goto('/');
    await expect(h1(page)).toBeInViewport();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
