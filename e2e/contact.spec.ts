import { expect, test } from '@playwright/test';

const WA = 'https://wa.me/6281310043238?text=';
const decodedText = (href: string | null) => decodeURIComponent(new URL(href!).searchParams.get('text') ?? '');

test('the contact section links to WhatsApp, email, LinkedIn and GitHub', async ({ page }) => {
  await page.goto('/#contact');
  const contact = page.locator('#contact');

  const wa = contact.getByRole('link', { name: /Chat WhatsApp/ });
  expect((await wa.getAttribute('href'))!.startsWith(WA)).toBe(true);
  await expect(wa).toHaveAttribute('target', '_blank');
  expect(decodedText(await wa.getAttribute('href'))).toBe('Halo Kanta, aku lihat portofoliomu dan ingin ngobrol.');

  await expect(contact.getByRole('link', { name: 'Kirim email' })).toHaveAttribute(
    'href',
    'mailto:kanta.khanigaraa@gmail.com?subject=Halo%20dari%20portofoliomu',
  );
  await expect(contact.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/kantakhanigara',
  );
  await expect(contact.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/khanigaraa');
  await expect(contact).toContainText('kanta.khanigaraa@gmail.com');
});

test('the email can be copied, with feedback read out to screen readers', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/#contact');
  await page.getByRole('button', { name: 'Salin email' }).click();
  await expect(page.getByRole('status')).toHaveText('Email tersalin: kanta.khanigaraa@gmail.com');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('kanta.khanigaraa@gmail.com');
});

test('the CV downloads as a real PDF', async ({ page, request }) => {
  await page.goto('/#contact');
  const cv = page.getByRole('link', { name: 'Unduh CV (PDF)' });
  await expect(cv).toHaveAttribute('href', '/cv/CV-Kanta-Khanigara.pdf');
  await expect(cv).toHaveAttribute('download', 'CV-Kanta-Khanigara.pdf');

  const res = await request.get('/cv/CV-Kanta-Khanigara.pdf');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('application/pdf');
  expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-');

  const [download] = await Promise.all([page.waitForEvent('download'), cv.click()]);
  expect(download.suggestedFilename()).toBe('CV-Kanta-Khanigara.pdf');
});

test('three services, no prices, each with a WhatsApp message naming it', async ({ page }) => {
  await page.goto('/#services');
  const services = page.locator('#services');
  await expect(services.getByText('Item Shop · Layanan')).toBeVisible();
  await expect(services.getByRole('heading', { level: 3 })).toHaveText([
    'Website Bisnis & UMKM',
    'Setup Server Linux & Hosting',
    'Olah Data & Excel',
  ]);
  await expect(services).toContainText('Harga dibicarakan langsung');
  await expect(services).not.toContainText(/Rp\s?\d/);

  const cta = services.locator('[data-service="data"]').getByRole('link', { name: /Diskusikan via WhatsApp/ });
  expect(decodedText(await cta.getAttribute('href'))).toBe(
    'Halo Kanta, aku lihat portofoliomu dan tertarik dengan layanan "Olah Data & Excel". Boleh ngobrol soal kebutuhanku?',
  );
  expect((await cta.getAttribute('href'))!.startsWith(WA)).toBe(true);
});

test.describe('in English', () => {
  test.use({ locale: 'en-US' });

  test('services and contact messages are in English', async ({ page }) => {
    await page.goto('/#services');
    const cta = page.locator('[data-service="website"]').getByRole('link', { name: /Discuss on WhatsApp/ });
    expect(decodedText(await cta.getAttribute('href'))).toBe(
      'Hi Kanta, I saw your portfolio and I am interested in "Business & Small-Business Websites". Could we talk about what I need?',
    );
    await expect(page.getByRole('link', { name: 'Download CV (PDF)' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Send an email' })).toHaveAttribute(
      'href',
      'mailto:kanta.khanigaraa@gmail.com?subject=Hello%20from%20your%20portfolio',
    );
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 740 } });

  test('contact buttons are big enough to tap and nothing overflows', async ({ page }) => {
    await page.goto('/#contact');
    for (const el of await page.locator('#contact .btn, #services .btn').all()) {
      const box = (await el.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
