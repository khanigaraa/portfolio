import { expect, test } from '@playwright/test';

test('one global link preview, with an absolute image URL that really exists', async ({ page, request }) => {
  await page.goto('/projects/datworks');
  const meta = (property: string) => page.locator(`meta[property="${property}"]`);
  await expect(meta('og:title')).toHaveAttribute('content', 'Kanta Khanigara · Infra + Web Developer');
  const image = await meta('og:image').getAttribute('content');
  expect(image).toMatch(/^https?:\/\/[^/]+\/og\.png$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');

  const res = await request.get('/og.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
});

test('favicon and robots.txt are served', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  expect((await request.get('/favicon.svg')).status()).toBe(200);
  expect(await (await request.get('/robots.txt')).text()).toContain('Allow: /');
});
