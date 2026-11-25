import { describe, expect, it } from 'vitest';
import { activeNavHref } from './shell';

describe('activeNavHref', () => {
  it('marks the lobby only on the home page', () => {
    expect(activeNavHref('/')).toBe('/');
    expect(activeNavHref('/apa-ini')).toBeNull();
  });

  it('marks a section for its own page and its sub-pages', () => {
    expect(activeNavHref('/projects')).toBe('/projects');
    expect(activeNavHref('/projects/')).toBe('/projects');
    expect(activeNavHref('/projects/high-availability')).toBe('/projects');
    expect(activeNavHref('/writing/artikel')).toBe('/writing');
  });

  it('does not confuse paths that only share a prefix', () => {
    expect(activeNavHref('/projectsx')).toBeNull();
  });
});
