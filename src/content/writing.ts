import { marked } from 'marked';
import { readFrontmatter, text, unknownKeys } from './parse-utils';
import { LANGS, type Lang, type Writing } from './types';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const WORDS_PER_MINUTE = 200;

/** A real calendar date written YYYY-MM-DD (so 2026-02-30 is rejected). */
function isValidDate(s: string): boolean {
  const m = DATE.exec(s);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

export function readingMinutes(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`[\]()-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/**
 * writing/<slug>.<id|en>.md: `title`, `date` (YYYY-MM-DD) and `summary` in the frontmatter, the
 * article in Markdown below. One language is enough; write both files to translate it.
 */
export function parseWriting(name: string, raw: string, errs: string[]): Writing | null {
  const nm = /^(.+)\.([a-z]+)$/.exec(name);
  if (!nm) {
    errs.push('nama file harus <slug>.<id|en>.md');
    return null;
  }
  const [, slug, lang] = nm;
  if (!SLUG.test(slug)) errs.push(`slug "${slug}" tidak valid (pakai huruf kecil, angka, dan tanda -)`);
  if (!(LANGS as readonly string[]).includes(lang)) errs.push(`bahasa "${lang}" tidak dikenal (pakai id atau en)`);

  const fm = readFrontmatter(raw, errs);
  if (!fm) return null;
  unknownKeys(fm.data, ['title', 'date', 'summary'], '', errs);
  const title = text(fm.data, 'title', '', errs);
  const summary = text(fm.data, 'summary', '', errs);
  // YAML turns an unquoted 2026-11-25 into a Date: accept both.
  const rawDate = fm.data.date instanceof Date ? fm.data.date.toISOString().slice(0, 10) : String(fm.data.date ?? '');
  if (!rawDate) errs.push('field "date" wajib diisi (format TTTT-BB-HH, mis. 2026-11-25)');
  else if (!isValidDate(rawDate)) errs.push(`field "date" "${rawDate}" harus tanggal valid berformat TTTT-BB-HH`);
  const body = fm.body.trim();
  if (!body) errs.push('isi tulisan (di bawah frontmatter) masih kosong');

  return {
    slug,
    lang: lang as Lang,
    title,
    date: rawDate,
    summary,
    minutes: readingMinutes(body),
    html: marked.parse(body, { async: false }) as string,
  };
}
