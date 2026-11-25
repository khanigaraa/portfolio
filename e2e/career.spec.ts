import { expect, test, type Page } from '@playwright/test';

const h1 = (page: Page) => page.getByRole('heading', { level: 1 });

test('the lobby shows the work experience as a rank journey, highest rank on top', async ({ page }) => {
  await page.goto('/#experience');
  const exp = page.locator('#experience');
  await expect(exp.getByText('Rank Journey · Pengalaman')).toBeVisible();
  await expect(exp.getByRole('heading', { level: 3 })).toContainText('Ekara Coffee & Eatery');
  await expect(exp.getByRole('heading', { level: 4 })).toHaveText([
    'Manajer Stok (4 Outlet)',
    'Headbar',
    'Staf Mobile (Kasir, Barista, Waiters)',
    'Waiters',
  ]);
  await expect(exp.locator('.rank-badge')).toHaveText(['Rank 4', 'Rank 3', 'Rank 2', 'Rank 1']);
  await expect(exp.locator('.rank').first()).toContainText('Feb 2026 – Mei 2026');
  await expect(exp.locator('.rank').nth(2)).toContainText('Nov 2025');
  await expect(exp.locator('.rank').nth(3)).toContainText('Paruh waktu');
  await expect(exp).toContainText('selisih stok berhasil ditekan menjadi nol');
});

test('certificates are achievements, newest first, without the English test', async ({ page }) => {
  await page.goto('/#certificates');
  const certs = page.locator('#certificates');
  await expect(certs.getByText('Achievements · Sertifikat')).toBeVisible();
  await expect(certs.getByRole('heading', { level: 3 })).toHaveText([
    'Sertifikat Kompetensi BNSP – Analis Data',
    'Introduction to Cybersecurity',
    'CCNA: Introduction to Networks',
  ]);
  await expect(certs.locator('.achievement').first()).toContainText('Berlaku sampai Sep 2029');
  await expect(certs).not.toContainText('English Proficiency');
  await expect(certs).not.toContainText('487');
  // The two Cisco certificates can be verified on Credly.
  await expect(certs.getByRole('link', { name: 'Verifikasi ↗' })).toHaveCount(2);
  await expect(certs.locator('.achievement').nth(1).getByRole('link', { name: 'Verifikasi ↗' })).toHaveAttribute(
    'href',
    'https://www.credly.com/badges/0621ccbe-32e9-4cc9-a85f-789351aaa7cf/public_url',
  );
  await expect(certs.locator('.achievement').nth(2).getByRole('link', { name: 'Verifikasi ↗' })).toHaveAttribute(
    'href',
    'https://www.credly.com/badges/621f98fe-c9c2-4c64-9e73-9e6e14f3048c/public_url',
  );
});

test('the About page tells the story and lists education', async ({ page }) => {
  await page.goto('/about');
  await expect(h1(page)).toHaveText('Dari kafe ke server');
  await expect(page).toHaveTitle('Tentang · Kanta Khanigara');
  await expect(
    page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link', { name: 'Tentang' }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { level: 2, name: 'Server yang tidak boleh tumbang' })).toBeVisible();

  const edu = page.locator('#education');
  await expect(edu.getByRole('heading', { level: 3 })).toHaveText('S1 Teknik Informatika (S.Kom)');
  await expect(edu).toContainText('Universitas Komputer Indonesia');
  await expect(edu).toContainText('Sep 2022 – Okt 2026');
  await expect(edu).toContainText('3,38 / 4,00');
  await expect(edu).toContainText('Keepalived dan Galera Cluster');
  await expect(edu).toContainText('Komputasi Awan');
});

test('the lobby links to the full story', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Cerita lengkapku →' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(h1(page)).toHaveText('Dari kafe ke server');
});

test.describe('in English', () => {
  test.use({ locale: 'en-US' });

  test('experience, certificates and About are translated, with English dates', async ({ page }) => {
    await page.goto('/#experience');
    await expect(page.locator('#experience .rank').first()).toContainText('Stock Manager (4 Outlets)');
    await expect(page.locator('#experience .rank').first()).toContainText('Feb 2026 – May 2026');
    await expect(page.locator('#certificates .achievement').first()).toContainText('Valid until Sep 2029');

    await page.goto('/about');
    await expect(h1(page)).toHaveText('From café to server');
    await expect(page.locator('#education')).toContainText('Sep 2022 – Oct 2026');
    await expect(page.locator('#education')).toContainText('Relevant courses');
  });
});
