import { isFilled, isHttpUrl, isRecord, localized, readFrontmatter, text, unknownKeys } from './parse-utils';
import { LANGS, type Image, type Lang, type Profile, type Service, type SkillGroup } from './types';

const PROFILE_KEYS = ['name', 'nickname', 'location', 'role', 'headline', 'summary', 'photo', 'contact', 'cv'];
const CONTACT_KEYS = ['whatsapp', 'email', 'linkedin', 'github'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * profile.md: one file for who the site is about. Texts that differ per language are written
 * as `{ id: …, en: … }`; names and contact details are written once.
 */
export function parseProfile(raw: string, errs: string[]): Record<Lang, Profile> | null {
  const fm = readFrontmatter(raw, errs);
  if (!fm) return null;
  const d = fm.data;
  unknownKeys(d, PROFILE_KEYS, '', errs);

  const name = text(d, 'name', '', errs);
  const nickname = text(d, 'nickname', '', errs);
  const location = localized(d.location, 'location', errs, true);
  const role = localized(d.role, 'role', errs, true);
  const headline = localized(d.headline, 'headline', errs);
  const summary = localized(d.summary, 'summary', errs);

  let photo: { src: string; alt: Record<Lang, string> } | undefined;
  if (d.photo !== undefined) {
    if (!isRecord(d.photo) || !isFilled(d.photo.src)) errs.push('photo.src wajib diisi');
    else {
      unknownKeys(d.photo, ['src', 'alt'], 'photo', errs);
      const alt = localized(d.photo.alt, 'photo.alt', errs);
      if (alt) photo = { src: String(d.photo.src), alt };
    }
  }

  const c = isRecord(d.contact) ? d.contact : null;
  if (!c) errs.push('field "contact" wajib diisi (whatsapp, email, linkedin, github)');
  const contact = { whatsapp: '', email: '', linkedin: '', github: '' };
  if (c) {
    unknownKeys(c, CONTACT_KEYS, 'contact', errs);
    contact.whatsapp = text(c, 'whatsapp', 'contact.', errs);
    contact.email = text(c, 'email', 'contact.', errs);
    contact.linkedin = text(c, 'linkedin', 'contact.', errs);
    contact.github = text(c, 'github', 'contact.', errs);
    if (contact.whatsapp && !/^\d{8,15}$/.test(contact.whatsapp))
      errs.push('contact.whatsapp harus angka saja dengan kode negara, mis. 6281234567890 (tanpa +, spasi, atau 0 di depan)');
    if (contact.email && !EMAIL.test(contact.email)) errs.push('contact.email bukan alamat email yang valid');
    for (const k of ['linkedin', 'github'] as const)
      if (contact[k] && !isHttpUrl(contact[k])) errs.push(`contact.${k} bukan URL http(s) yang valid`);
  }

  const cv = text(d, 'cv', '', errs);
  if (cv && !/^\/.+\.pdf$/i.test(cv)) errs.push('field "cv" harus berupa path PDF di folder public, mis. /cv/CV.pdf');

  if (!location || !role || !headline || !summary) return null;
  const out = {} as Record<Lang, Profile>;
  for (const lang of LANGS) {
    const img: Image | undefined = photo ? { src: photo.src, alt: photo.alt[lang] } : undefined;
    out[lang] = {
      name,
      nickname,
      location: location[lang],
      role: role[lang],
      headline: headline[lang],
      summary: summary[lang],
      photo: img,
      contact,
      cv,
    };
  }
  return out;
}

const GROUP_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * skills.md: `groups:` with an `id`, a `label` in both languages, and `items`. An item that
 * needs no translation ("Linux") is a plain string; one that does is `{ id: …, en: … }`.
 */
export function parseSkills(raw: string, errs: string[]): Record<Lang, SkillGroup[]> | null {
  const fm = readFrontmatter(raw, errs);
  if (!fm) return null;
  unknownKeys(fm.data, ['groups'], '', errs);
  const groups = fm.data.groups;
  if (!Array.isArray(groups) || !groups.length) {
    errs.push('field "groups" wajib berisi daftar grup keahlian');
    return null;
  }

  const out: Record<Lang, SkillGroup[]> = { id: [], en: [] };
  const seen = new Set<string>();
  groups.forEach((g, i) => {
    const where = `groups ke-${i + 1}`;
    if (!isRecord(g)) {
      errs.push(`${where} harus berisi id, label, dan items`);
      return;
    }
    unknownKeys(g, ['id', 'label', 'items'], where, errs);
    const id = isFilled(g.id) ? String(g.id) : '';
    if (!GROUP_ID.test(id)) errs.push(`${where}: id wajib diisi (huruf kecil, angka, dan tanda -)`);
    else if (seen.has(id)) errs.push(`${where}: id "${id}" sudah dipakai grup lain`);
    seen.add(id);

    const label = localized(g.label, `${where}.label`, errs);
    const items = Array.isArray(g.items) ? g.items : [];
    if (!items.length) errs.push(`${where}.items wajib berisi minimal satu keahlian`);
    const texts = items.map((it, j) => localized(it, `${where}.items ke-${j + 1}`, errs, true));
    if (!label || texts.some((x) => !x)) return;
    for (const lang of LANGS) out[lang].push({ id, label: label[lang], items: texts.map((x) => x![lang]) });
  });
  return out;
}

const SERVICE_KEYS = ['id', 'title', 'for', 'deliverables'];

/**
 * services.md: `services:` with an `id`, a `title`, who it is `for`, and what the client gets
 * (`deliverables`), all in both languages. No prices.
 */
export function parseServices(raw: string, errs: string[]): Record<Lang, Service[]> | null {
  const fm = readFrontmatter(raw, errs);
  if (!fm) return null;
  unknownKeys(fm.data, ['services'], '', errs);
  const list = fm.data.services;
  if (!Array.isArray(list) || !list.length) {
    errs.push('field "services" wajib berisi daftar layanan');
    return null;
  }
  const before = errs.length;
  const out: Record<Lang, Service[]> = { id: [], en: [] };
  const seen = new Set<string>();

  list.forEach((sv, i) => {
    const where = `services ke-${i + 1}`;
    if (!isRecord(sv)) return void errs.push(`${where} harus berisi id, title, for, dan deliverables`);
    unknownKeys(sv, SERVICE_KEYS, where, errs);
    const id = isFilled(sv.id) ? String(sv.id) : '';
    if (!GROUP_ID.test(id)) errs.push(`${where}: id wajib diisi (huruf kecil, angka, dan tanda -)`);
    else if (seen.has(id)) errs.push(`${where}: id "${id}" sudah dipakai layanan lain`);
    seen.add(id);
    const title = localized(sv.title, `${where}.title`, errs);
    const forWho = localized(sv.for, `${where}.for`, errs);
    const items = Array.isArray(sv.deliverables) ? sv.deliverables : [];
    if (!items.length) errs.push(`${where}.deliverables wajib berisi minimal satu poin`);
    const deliverables = items.map((it, j) => localized(it, `${where}.deliverables ke-${j + 1}`, errs, true));
    if (!title || !forWho || deliverables.some((x) => !x)) return;
    for (const lang of LANGS)
      out[lang].push({ id, title: title[lang], forWho: forWho[lang], deliverables: deliverables.map((x) => x![lang]) });
  });
  return errs.length > before ? null : out;
}
