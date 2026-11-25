import { marked } from 'marked';
import { isFilled, isHttpUrl, isRecord, localized, readFrontmatter, text, unknownKeys } from './parse-utils';
import { LANGS, type AboutPage, type Certificate, type Education, type Job, type Lang } from './types';

type PerLang<T> = Record<Lang, T>;
const YM = /^\d{4}-(0[1-9]|1[0-2])$/;

/** A `YYYY-MM` month; `required` false allows it to be missing. */
function month(v: unknown, where: string, errs: string[], required = true): string | undefined {
  if (v === undefined || v === null || v === '') {
    if (required) errs.push(`${where} wajib diisi (format TTTT-BB, mis. 2024-10)`);
    return undefined;
  }
  const s = String(v).trim();
  if (!YM.test(s)) {
    errs.push(`${where} "${s}" harus berformat TTTT-BB, mis. 2024-10`);
    return undefined;
  }
  return s;
}

function checkRange(start: string | undefined, end: string | undefined, where: string, errs: string[]) {
  if (start && end && end < start) errs.push(`${where}: tanggal selesai (${end}) lebih awal dari tanggal mulai (${start})`);
}

/** A list of `{id, en}` (or plain, untranslated) texts. */
function localizedList(v: unknown, where: string, errs: string[], required: boolean): PerLang<string[]> | null {
  if (v === undefined && !required) return { id: [], en: [] };
  if (!Array.isArray(v) || (required && !v.length)) {
    errs.push(`${where} wajib berisi daftar`);
    return null;
  }
  const items = v.map((it, i) => localized(it, `${where} ke-${i + 1}`, errs, true));
  if (items.some((x) => !x)) return null;
  return { id: items.map((x) => x!.id), en: items.map((x) => x!.en) };
}

/** experience.md: `jobs:`, each with `roles:` (newest first). */
export function parseExperience(raw: string, errs: string[]): PerLang<Job[]> | null {
  const fm = readFrontmatter(raw, errs);
  if (!fm) return null;
  unknownKeys(fm.data, ['jobs'], '', errs);
  const jobs = fm.data.jobs;
  if (!Array.isArray(jobs) || !jobs.length) {
    errs.push('field "jobs" wajib berisi daftar pekerjaan');
    return null;
  }
  const before = errs.length;
  const out: PerLang<Job[]> = { id: [], en: [] };

  jobs.forEach((j, i) => {
    const where = `jobs ke-${i + 1}`;
    if (!isRecord(j)) return void errs.push(`${where} harus berisi company, place, dan roles`);
    unknownKeys(j, ['company', 'place', 'roles'], where, errs);
    const company = text(j, 'company', `${where}.`, errs);
    const place = localized(j.place, `${where}.place`, errs, true);
    const roles = Array.isArray(j.roles) ? j.roles : [];
    if (!roles.length) errs.push(`${where}.roles wajib berisi minimal satu peran`);

    const parsed = roles.map((r, k) => {
      const rw = `${where}.roles ke-${k + 1}`;
      if (!isRecord(r)) return void errs.push(`${rw} harus berisi title, start, dan points`);
      unknownKeys(r, ['title', 'type', 'start', 'end', 'points'], rw, errs);
      const title = localized(r.title, `${rw}.title`, errs, true);
      const type = r.type === undefined ? undefined : localized(r.type, `${rw}.type`, errs, true);
      const start = month(r.start, `${rw}.start`, errs);
      const end = month(r.end, `${rw}.end`, errs, false);
      checkRange(start, end, rw, errs);
      const points = localizedList(r.points, `${rw}.points`, errs, false);
      if (!title || !start || !points || type === null) return undefined;
      return { title, type, start, end, points };
    });

    if (!place || parsed.some((r) => !r)) return;
    for (const lang of LANGS)
      out[lang].push({
        company,
        place: place[lang],
        roles: parsed.map((r) => ({
          title: r!.title[lang],
          type: r!.type?.[lang],
          start: r!.start,
          end: r!.end,
          points: r!.points[lang],
        })),
      });
  });
  return errs.length > before ? null : out;
}

/** certificates.md: `certificates:` with name, issuer, date and optional expires/verify/note. */
export function parseCertificates(raw: string, errs: string[]): PerLang<Certificate[]> | null {
  const fm = readFrontmatter(raw, errs);
  if (!fm) return null;
  unknownKeys(fm.data, ['certificates'], '', errs);
  const list = fm.data.certificates;
  if (!Array.isArray(list) || !list.length) {
    errs.push('field "certificates" wajib berisi daftar sertifikat');
    return null;
  }
  const before = errs.length;
  const out: PerLang<Certificate[]> = { id: [], en: [] };

  list.forEach((c, i) => {
    const where = `certificates ke-${i + 1}`;
    if (!isRecord(c)) return void errs.push(`${where} harus berisi name, issuer, dan date`);
    unknownKeys(c, ['name', 'issuer', 'date', 'expires', 'verify', 'note'], where, errs);
    const name = localized(c.name, `${where}.name`, errs, true);
    const issuer = text(c, 'issuer', `${where}.`, errs);
    const date = month(c.date, `${where}.date`, errs);
    const expires = month(c.expires, `${where}.expires`, errs, false);
    checkRange(date, expires, where, errs);
    if (c.verify !== undefined && !isHttpUrl(c.verify)) errs.push(`${where}.verify bukan URL http(s) yang valid`);
    const note = c.note === undefined ? undefined : localized(c.note, `${where}.note`, errs, true);
    if (!name || !date || note === null) return;
    for (const lang of LANGS)
      out[lang].push({
        name: name[lang],
        issuer,
        date,
        expires,
        verifyUrl: isHttpUrl(c.verify) ? String(c.verify) : undefined,
        note: note?.[lang],
      });
  });
  return errs.length > before ? null : out;
}

/** education.md: `schools:` with school, place, degree, dates, and optional gpa/thesis/courses. */
export function parseEducation(raw: string, errs: string[]): PerLang<Education[]> | null {
  const fm = readFrontmatter(raw, errs);
  if (!fm) return null;
  unknownKeys(fm.data, ['schools'], '', errs);
  const list = fm.data.schools;
  if (!Array.isArray(list) || !list.length) {
    errs.push('field "schools" wajib berisi daftar pendidikan');
    return null;
  }
  const before = errs.length;
  const out: PerLang<Education[]> = { id: [], en: [] };

  list.forEach((s, i) => {
    const where = `schools ke-${i + 1}`;
    if (!isRecord(s)) return void errs.push(`${where} harus berisi school, place, degree, dan start`);
    unknownKeys(s, ['school', 'place', 'degree', 'gpa', 'start', 'end', 'thesis', 'courses'], where, errs);
    const school = text(s, 'school', `${where}.`, errs);
    const place = localized(s.place, `${where}.place`, errs, true);
    const degree = localized(s.degree, `${where}.degree`, errs, true);
    const start = month(s.start, `${where}.start`, errs);
    const end = month(s.end, `${where}.end`, errs, false);
    checkRange(start, end, where, errs);
    const thesis = s.thesis === undefined ? undefined : localized(s.thesis, `${where}.thesis`, errs, true);
    const courses = localizedList(s.courses, `${where}.courses`, errs, false);
    if (!place || !degree || !start || !courses || thesis === null) return;
    for (const lang of LANGS)
      out[lang].push({
        school,
        place: place[lang],
        degree: degree[lang],
        gpa: isFilled(s.gpa) ? String(s.gpa) : undefined,
        start,
        end,
        thesis: thesis?.[lang],
        courses: courses[lang],
      });
  });
  return errs.length > before ? null : out;
}

/** about.<lang>.md: `title` and `lede` in the frontmatter, the story in Markdown below. */
export function parseAbout(raw: string, errs: string[]): AboutPage | null {
  const fm = readFrontmatter(raw, errs);
  if (!fm) return null;
  unknownKeys(fm.data, ['title', 'lede'], '', errs);
  const title = text(fm.data, 'title', '', errs);
  const lede = text(fm.data, 'lede', '', errs);
  const body = fm.body.trim();
  if (!body) errs.push('cerita (di bawah frontmatter) masih kosong');
  return { title, lede, html: marked.parse(body, { async: false }) as string };
}

