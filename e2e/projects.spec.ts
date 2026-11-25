import { expect, test } from '@playwright/test';

const h1 = (page: import('@playwright/test').Page) => page.getByRole('heading', { level: 1 });

test('the project list shows the four projects in order, featured first', async ({ page }) => {
  await page.goto('/projects');
  await expect(h1(page)).toHaveText('Proyek');
  await expect(page).toHaveTitle('Proyek · Kanta Khanigara');
  const titles = page.locator('.match-card h2');
  await expect(titles).toHaveText([
    'Sistem High Availability Multi-Node',
    'Datworks: website portofolio fotografi',
    'ashen.thread: demo toko online',
    'Aplikasi Web E-Commerce (Marketplace)',
  ]);
  await expect(page.locator('.match-card').first().locator('.badge')).toHaveText('MVP · Unggulan');
  await expect(page.locator('.match-no')).toHaveText(['Match #01', 'Match #02', 'Match #03', 'Match #04']);
});

test('the whole match card opens the case study', async ({ page }) => {
  await page.goto('/projects');
  // Click on the card's summary text, away from the title link: the card itself is the target.
  const summary = page.locator('#e-commerce .summary');
  await summary.scrollIntoViewIfNeeded();
  await expect(page.locator('#e-commerce')).toHaveCSS('opacity', '1');
  const box = (await summary.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page).toHaveURL(/\/projects\/e-commerce$/);
});

test('a case study opens straight from its URL', async ({ page }) => {
  await page.goto('/projects/high-availability');
  await expect(h1(page)).toHaveText('Sistem High Availability Multi-Node');
  await expect(page.locator('.stats')).toContainText('99,95%');
  await expect(page.getByRole('heading', { level: 2, name: 'Masalah' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Teknologi' })).toContainText('MariaDB Galera Cluster');
});

test('a project card leads to its case study, and back returns to the list', async ({ page }) => {
  await page.goto('/projects');
  await page.getByRole('main').getByRole('link', { name: 'Datworks: website portofolio fotografi' }).click();
  await expect(page).toHaveURL(/\/projects\/datworks$/);
  await expect(h1(page)).toHaveText('Datworks: website portofolio fotografi');
  await expect(page.getByRole('link', { name: 'Lihat demo ↗' })).toHaveAttribute(
    'href',
    'https://datworks-w9bw.vercel.app',
  );
  await expect(page.getByRole('link', { name: 'Lihat kode ↗' })).toHaveAttribute(
    'href',
    'https://github.com/khanigaraa/datworks',
  );
  await page.goBack();
  await expect(h1(page)).toHaveText('Proyek');
});

test('an unknown project shows the not-found page', async ({ page }) => {
  await page.goto('/projects/tidak-ada');
  await expect(h1(page)).toHaveText('Pertandingan tidak ditemukan');
});

test('the HA case study tells the full story, with the architecture diagram', async ({ page, request }) => {
  await page.goto('/projects/high-availability');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'Masalah',
    'Tujuan',
    'Arsitektur',
    'Pengujian',
    'Hasil',
    'Yang aku pelajari',
  ]);
  const stats = page.locator('.stats');
  await expect(stats).toContainText('99,95%');
  await expect(stats).toContainText('Single point of failure');

  const diagram = page.getByRole('img', { name: /^Diagram arsitektur: pengguna mengakses satu Virtual IP/ });
  await diagram.scrollIntoViewIfNeeded();
  await expect(diagram).toBeVisible();
  // Really loaded, not a broken image.
  expect(await diagram.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  // Failover goes to Node 2 only; Node 3 runs the database only (as built in the thesis).
  await expect(diagram).toHaveAttribute('alt', /pindah ke Node 2 \(BACKUP\).*Node 3 hanya menjalankan MariaDB Galera/);
  await expect(page.locator('.case-study')).toContainText('Node 3 (database saja)');
  const svg = await request.get('/img/ha-architecture.svg');
  expect(svg.status()).toBe(200);
  const text = await svg.text();
  expect(text).toContain('NODE 3 · DATABASE');
  expect(text).not.toContain('NODE 3 · BACKUP');
});

test('the Datworks case study is honest about the 2025 build and the 2026 rebuild', async ({ page }) => {
  await page.goto('/projects/datworks');
  await expect(page.getByRole('heading', { level: 2, name: 'Versi pertama (2025)' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Dibangun ulang (2026)' })).toBeVisible();
  await expect(page.locator('.case-study')).toContainText('disetujui klien dan dipakai sebagai portofolio online');
});

test('the ashen.thread case study links to its live demo and code', async ({ page }) => {
  await page.goto('/projects/ashen-thread-store');
  await expect(page.getByRole('link', { name: 'Lihat demo ↗' })).toHaveAttribute(
    'href',
    'https://khanigaraa.github.io/ashen-thread-store/',
  );
  await expect(page.getByRole('link', { name: 'Lihat kode ↗' })).toHaveAttribute(
    'href',
    'https://github.com/khanigaraa/ashen-thread-store',
  );
});

test('the HA case study links to the thesis code', async ({ page }) => {
  await page.goto('/projects/high-availability');
  await expect(page.getByRole('link', { name: 'Lihat kode ↗' })).toHaveAttribute(
    'href',
    'https://github.com/khanigaraa/ha-keepalived-galera',
  );
});

test('the E-Commerce case study states the role in the team of five', async ({ page }) => {
  await page.goto('/projects/e-commerce');
  await expect(page.locator('.project-meta')).toContainText('Tim 5 orang');
  await expect(page.locator('.case-study')).toContainText('dokumentasi proyek');
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 740 } });

  test('the diagram scrolls sideways inside its frame instead of shrinking or overflowing the page', async ({ page }) => {
    await page.goto('/projects/high-availability');
    const frame = page.getByRole('region', { name: 'Diagram arsitektur' });
    await frame.scrollIntoViewIfNeeded();
    const { scrollWidth, clientWidth } = await frame.evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
    expect(scrollWidth).toBeGreaterThan(clientWidth);
    await expect(page.getByText('Geser ke samping untuk melihat semuanya.')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('in English', () => {
  test.use({ locale: 'en-US' });

  test('the HA case study and its diagram description are in English', async ({ page }) => {
    await page.goto('/projects/high-availability');
    await expect(page.getByRole('heading', { level: 2, name: 'What I learned' })).toBeVisible();
    await expect(page.getByRole('img', { name: /^Architecture diagram/ })).toBeAttached();
    await expect(page.getByText('System architecture (simplified).')).toBeVisible();
  });
});
