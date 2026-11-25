import { describe, expect, it } from 'vitest';
import { siteUrl } from '../vite.config';

describe('siteUrl (link-preview tags)', () => {
  it('uses SITE_URL when set, without a trailing slash', () => {
    expect(siteUrl({ SITE_URL: 'https://stingtaw.dev/' })).toBe('https://stingtaw.dev');
  });

  it('falls back to the Vercel production domain', () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'khanigaraa.vercel.app' })).toBe('https://khanigaraa.vercel.app');
  });

  it('falls back to the local preview server', () => {
    expect(siteUrl({})).toBe('http://localhost:4173');
  });
});
