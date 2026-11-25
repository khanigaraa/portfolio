import { defineConfig } from '@playwright/test';

/**
 * End-to-end tests run against the production build (vite preview) in the Microsoft Edge
 * already installed on Windows, so no Playwright browser download is needed.
 * Set BASE_URL to run the same tests against a deployment instead.
 */
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5191';
const remote = !!process.env.BASE_URL;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    channel: 'msedge',
    headless: true,
    trace: 'retain-on-failure',
    // An Indonesian browser, so the site starts in Indonesian. e2e/i18n.spec.ts covers English.
    locale: 'id-ID',
    // Tests start as returning visitors who have seen the intro; e2e/intro.spec.ts clears this.
    storageState: {
      cookies: [],
      origins: [{ origin: new URL(BASE_URL).origin, localStorage: [{ name: 'stingtaw:intro-seen', value: '1' }] }],
    },
  },
  webServer: remote
    ? undefined
    : {
        command: 'npm run build && npx vite preview --port 5191 --strictPort',
        url: 'http://localhost:5191',
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
