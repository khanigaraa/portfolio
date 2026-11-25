import { parse as parseYaml } from 'yaml';
import { LANGS, type Lang } from './types';

/** Splits `---\nyaml\n---\nmarkdown`. Throws on broken YAML; null when there is no frontmatter. */
export function splitFrontmatter(raw: string): { data: unknown; body: string } | null {
  const m = /^﻿?---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n([\s\S]*))?$/.exec(raw);
  if (!m) return null;
  return { data: parseYaml(m[1]), body: m[2] ?? '' };
}

/** Frontmatter as an object, or null after pushing a readable error. */
export function readFrontmatter(raw: string, errs: string[]): { data: Record<string, unknown>; body: string } | null {
  let parsed: ReturnType<typeof splitFrontmatter>;
  try {
    parsed = splitFrontmatter(raw);
  } catch (e) {
    const msg = (e as Error).message.split('\n')[0];
    // The usual cause: a title like `Datworks: website` needs quotes around it.
    const hint = /mapping/i.test(msg) ? ' (kalau teksnya mengandung titik dua ":" atau koma, beri tanda kutip "…")' : '';
    errs.push(`frontmatter YAML tidak bisa dibaca: ${msg}${hint}`);
    return null;
  }
  if (!parsed || !isRecord(parsed.data)) {
    errs.push('file harus diawali frontmatter di antara dua baris ---');
    return null;
  }
  return { data: parsed.data, body: parsed.body };
}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** A non-empty string, or a number (YAML reads `2026` as one). */
export function isFilled(v: unknown): boolean {
  return (typeof v === 'string' && v.trim() !== '') || typeof v === 'number';
}

export function isHttpUrl(v: unknown): boolean {
  if (typeof v !== 'string') return false;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Reports typos: keys that are not part of the schema. `where` is '' at the top level. */
export function unknownKeys(d: Record<string, unknown>, allowed: string[], where: string, errs: string[]) {
  for (const key of Object.keys(d))
    if (!allowed.includes(key)) errs.push(where ? `${where}.${key} tidak dikenal` : `field "${key}" tidak dikenal`);
}

/** A required text field. `where` prefixes the field name in the error, e.g. 'contact.'. */
export function text(d: Record<string, unknown>, key: string, where: string, errs: string[]): string {
  const v = d[key];
  if (!isFilled(v)) {
    errs.push(where ? `${where}${key} wajib diisi` : `field "${key}" wajib diisi`);
    return '';
  }
  return String(v).trim();
}

/**
 * A text written in both languages: `{ id: ..., en: ... }`. A plain string is also accepted
 * when `sameInBoth` (e.g. "Linux", which needs no translation).
 */
export function localized(
  v: unknown,
  where: string,
  errs: string[],
  sameInBoth = false,
): Record<Lang, string> | null {
  if (sameInBoth && isFilled(v)) {
    const s = String(v).trim();
    return { id: s, en: s };
  }
  if (!isRecord(v)) {
    errs.push(`${where} wajib ditulis dalam dua bahasa (id: … dan en: …)`);
    return null;
  }
  const out = {} as Record<Lang, string>;
  let ok = true;
  for (const lang of LANGS) {
    if (!isFilled(v[lang])) {
      errs.push(`${where}.${lang} wajib diisi`);
      ok = false;
    } else out[lang] = String(v[lang]).trim();
  }
  for (const key of Object.keys(v))
    if (!(LANGS as readonly string[]).includes(key))
      errs.push(
        `${where}: "${key}" tidak dikenal (pakai id dan en; kalau teksnya mengandung koma di dalam { }, beri tanda kutip)`,
      );
  return ok ? out : null;
}
