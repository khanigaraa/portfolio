import type { Lang } from '../content/types';

const LOCALE: Record<Lang, string> = { id: 'id-ID', en: 'en-US' };
const PRESENT: Record<Lang, string> = { id: 'sekarang', en: 'present' };

/** `2024-10` → "Okt 2024" / "Oct 2024". */
export function formatMonth(ym: string, lang: Lang): string {
  const [y, m] = ym.split('-').map(Number);
  return new Intl.DateTimeFormat(LOCALE[lang], { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, 1)))
    .replace('.', '');
}

/** `2026-11-25` → "25 November 2026" / "November 25, 2026". */
export function formatDate(ymd: string, lang: Lang): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

/** "Okt 2024 – Apr 2025"; one month when start = end; "… – sekarang" when there is no end. */
export function formatPeriod(start: string, end: string | undefined, lang: Lang): string {
  if (end === start) return formatMonth(start, lang);
  return `${formatMonth(start, lang)} – ${end ? formatMonth(end, lang) : PRESENT[lang]}`;
}
