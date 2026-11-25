import { describe, expect, it } from 'vitest';
import { formatDate, formatMonth, formatPeriod } from './dates';

describe('dates', () => {
  it('formats a month in each language', () => {
    expect(formatMonth('2024-10', 'id')).toBe('Okt 2024');
    expect(formatMonth('2024-10', 'en')).toBe('Oct 2024');
    expect(formatMonth('2026-05', 'id')).toBe('Mei 2026');
    expect(formatMonth('2026-09', 'en')).toBe('Sep 2026');
  });

  it('formats a full date in each language', () => {
    expect(formatDate('2026-11-25', 'id')).toBe('25 November 2026');
    expect(formatDate('2026-08-03', 'id')).toBe('3 Agustus 2026');
    expect(formatDate('2026-11-25', 'en')).toBe('November 25, 2026');
  });

  it('formats a period, a single month, and an ongoing one', () => {
    expect(formatPeriod('2024-10', '2025-04', 'id')).toBe('Okt 2024 – Apr 2025');
    expect(formatPeriod('2025-11', '2025-11', 'en')).toBe('Nov 2025');
    expect(formatPeriod('2026-02', undefined, 'id')).toBe('Feb 2026 – sekarang');
    expect(formatPeriod('2026-02', undefined, 'en')).toBe('Feb 2026 – present');
  });
});
