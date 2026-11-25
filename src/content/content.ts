import { marked } from 'marked';
import { isFilled, isHttpUrl, isRecord, readFrontmatter, text, unknownKeys } from './parse-utils';
import { createQueries, type ContentData } from './queries';
import { parseAbout, parseCertificates, parseEducation, parseExperience } from './career';
import { parseProfile, parseServices, parseSkills } from './site';
import { parseWriting } from './writing';
import {
  LANGS,
  type AboutPage,
  type Certificate,
  type ContentFiles,
  type Education,
  type Image,
  type Job,
  type Lang,
  type Profile,
  type Project,
  type Service,
  type SkillGroup,
  type Stat,
  type Writing,
} from './types';

/**
 * The content module: turns the owner's Markdown files into typed, queryable data.
 * It never touches the DOM or the file system: callers hand it the raw files (fs in the
 * build and in tests). It runs at build time only; the browser gets `data()` as JSON.
 */
export interface ContentOptions {
  /**
   * Whether a file exists under /public (e.g. '/cv/CV.pdf'). Given by the build, so a missing
   * CV fails it; when left out, those paths are not checked.
   */
  publicFileExists?: (path: string) => boolean;
}

export function createContent(files: ContentFiles, options: ContentOptions = {}) {
  const errors: string[] = [];
  const projects: Project[] = [];
  let profile: Record<Lang, Profile> | null = null;
  let skills: Record<Lang, SkillGroup[]> | null = null;
  let experience: Record<Lang, Job[]> | null = null;
  let certificates: Record<Lang, Certificate[]> | null = null;
  let education: Record<Lang, Education[]> | null = null;
  let services: Record<Lang, Service[]> | null = null;
  const writings: Writing[] = [];
  const about: Partial<Record<Lang, AboutPage>> = {};
  // Files that exist, valid or not: a broken file is reported as broken, not as missing.
  const present = new Set<string>();

  /** Runs a parser on one file, prefixing its errors with the file name; null if anything is wrong. */
  function parseFile<T>(path: string, parse: (errs: string[]) => T | null): T | null {
    const fileErrors: string[] = [];
    const result = parse(fileErrors);
    errors.push(...fileErrors.map((e) => `${path}: ${e}`));
    return fileErrors.length ? null : result;
  }

  for (const [path, raw] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
    const m = /^projects\/(.+)\.md$/.exec(path);
    if (m) {
      present.add(m[1]);
      const project = parseFile(path, (errs) => parseProject(m[1], raw, errs));
      if (project) projects.push(project);
    } else if (/^writing\/.+\.md$/.test(path)) {
      const name = path.slice('writing/'.length, -'.md'.length);
      const article = parseFile(path, (errs) => parseWriting(name, raw, errs));
      if (article) writings.push(article);
    } else if (path === 'profile.md') profile = parseFile(path, (errs) => parseProfile(raw, errs));
    else if (path === 'skills.md') skills = parseFile(path, (errs) => parseSkills(raw, errs));
    else if (path === 'services.md') services = parseFile(path, (errs) => parseServices(raw, errs));
    else if (path === 'experience.md') experience = parseFile(path, (errs) => parseExperience(raw, errs));
    else if (path === 'certificates.md') certificates = parseFile(path, (errs) => parseCertificates(raw, errs));
    else if (path === 'education.md') education = parseFile(path, (errs) => parseEducation(raw, errs));
    else if (/^about\.(id|en)\.md$/.test(path)) {
      const lang = path.split('.')[1] as Lang;
      const page = parseFile(path, (errs) => parseAbout(raw, errs));
      if (page) about[lang] = page;
    } else errors.push(`${path}: file tidak dikenal (cek nama dan foldernya)`);
  }
  const required: [string, string][] = [
    ['profile.md', 'file profil belum ada'],
    ['skills.md', 'file keahlian belum ada'],
    ['services.md', 'file layanan belum ada'],
    ['experience.md', 'file pengalaman kerja belum ada'],
    ['certificates.md', 'file sertifikat belum ada'],
    ['education.md', 'file pendidikan belum ada'],
    ['about.id.md', 'halaman Tentang versi ID belum ada'],
    ['about.en.md', 'halaman Tentang versi EN belum ada'],
  ];
  for (const [file, msg] of required) if (!(file in files)) errors.push(`${file}: ${msg}`);
  errors.push(...crossCheckProjects(projects, present));
  const exists = options.publicFileExists;
  if (exists) {
    const cv = profile?.id.cv;
    if (cv && !exists(cv)) errors.push(`profile.md: file CV "${cv}" tidak ada di folder public`);
    const photo = profile?.id.photo?.src;
    if (photo && !exists(photo)) errors.push(`profile.md: foto "${photo}" tidak ada di folder public`);
    for (const p of projects)
      for (const img of [p.cover, p.diagram])
        if (img && !exists(img.src))
          errors.push(`projects/${p.slug}.${p.lang}.md: gambar "${img.src}" tidak ada di folder public`);
  }

  const data: ContentData = {
    projects,
    writings,
    profile,
    skills,
    services,
    experience,
    certificates,
    education,
    about: about.id && about.en ? (about as Record<Lang, AboutPage>) : null,
  };

  return {
    /** Every problem found in the content, each naming the file it is in. Empty when all is well. */
    validate(): string[] {
      return [...errors];
    },
    /** The parsed content, serialisable to JSON for the browser. */
    data(): ContentData {
      return data;
    },
    ...createQueries(data),
  };
}

export type Content = ReturnType<typeof createContent>;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROJECT_KEYS = [
  'title', 'summary', 'role', 'team', 'period', 'stack', 'order',
  'featured', 'stats', 'links', 'cover', 'diagram',
];

function parseProject(name: string, raw: string, errs: string[]): Project | null {
  const nm = /^(.+)\.([a-z]+)$/.exec(name);
  if (!nm) {
    errs.push('nama file harus <slug>.<id|en>.md');
    return null;
  }
  const [, slug, lang] = nm;
  if (!SLUG.test(slug)) errs.push(`slug "${slug}" tidak valid (pakai huruf kecil, angka, dan tanda -)`);
  if (!(LANGS as readonly string[]).includes(lang)) errs.push(`bahasa "${lang}" tidak dikenal (pakai id atau en)`);

  const parsed = readFrontmatter(raw, errs);
  if (!parsed) return null;
  const d = parsed.data;
  unknownKeys(d, PROJECT_KEYS, '', errs);
  // YAML reads `period: 2026` as a number: text() accepts it as text.
  const str = (key: string) => text(d, key, '', errs);

  const stack = Array.isArray(d.stack) ? d.stack : [];
  if (!stack.length || stack.some((s) => !isFilled(s)))
    errs.push('field "stack" wajib berisi daftar teknologi yang tidak kosong');

  if (typeof d.order !== 'number' || !Number.isInteger(d.order)) errs.push('field "order" wajib berupa angka bulat');
  if (d.featured !== undefined && typeof d.featured !== 'boolean') errs.push('field "featured" harus true atau false');

  const stats: Stat[] = [];
  if (d.stats !== undefined) {
    if (!Array.isArray(d.stats)) errs.push('field "stats" harus berupa daftar');
    else
      d.stats.forEach((s, i) => {
        if (isRecord(s) && isFilled(s.label) && isFilled(s.value)) stats.push({ label: String(s.label), value: String(s.value) });
        else errs.push(`stats ke-${i + 1} wajib punya label dan value`);
      });
  }

  const links: Project['links'] = {};
  if (d.links !== undefined) {
    if (!isRecord(d.links)) errs.push('field "links" harus berisi demo dan/atau repo');
    else
      for (const [k, v] of Object.entries(d.links)) {
        if (k !== 'demo' && k !== 'repo') errs.push(`links.${k} tidak dikenal (pakai demo atau repo)`);
        else if (typeof v !== 'string' || !isHttpUrl(v)) errs.push(`links.${k} bukan URL http(s) yang valid`);
        else links[k] = v;
      }
  }

  const image = (key: string): Image | undefined => {
    const v = d[key];
    if (v === undefined) return undefined;
    if (!isRecord(v) || !isFilled(v.src)) {
      errs.push(`${key}.src wajib diisi`);
      return undefined;
    }
    if (!isFilled(v.alt)) errs.push(`${key}.alt wajib diisi (teks alternatif gambar)`);
    return { src: String(v.src), alt: String(v.alt ?? '') };
  };

  const body = parsed.body.trim();
  if (!body) errs.push('isi studi kasus (di bawah frontmatter) masih kosong');

  return {
    slug,
    lang: lang as Lang,
    title: str('title'),
    summary: str('summary'),
    role: str('role'),
    team: str('team'),
    period: str('period'),
    stack: stack.map(String),
    order: typeof d.order === 'number' ? d.order : 0,
    featured: d.featured === true,
    stats,
    links,
    cover: image('cover'),
    diagram: image('diagram'),
    html: marked.parse(body, { async: false }) as string,
  };
}

/** Rules that span files: both languages present, shared fields equal, exactly one featured. */
function crossCheckProjects(projects: Project[], present: Set<string>): string[] {
  const errs: string[] = [];
  const slugs = [...new Set(projects.map((p) => p.slug))].sort();

  for (const slug of slugs) {
    const versions = LANGS.map((lang) => projects.find((p) => p.slug === slug && p.lang === lang));
    LANGS.forEach((lang) => {
      if (!present.has(`${slug}.${lang}`)) errs.push(`projects/${slug}.${lang}.md: versi ${lang.toUpperCase()} belum ada`);
    });
    const [a, b] = versions;
    if (!a || !b) continue;
    const shared: [string, unknown, unknown][] = [
      ['order', a.order, b.order],
      ['featured', a.featured, b.featured],
      ['links', JSON.stringify(a.links), JSON.stringify(b.links)],
    ];
    for (const [key, x, y] of shared)
      if (x !== y) errs.push(`projects/${slug}: field "${key}" harus sama di versi ID dan EN`);
  }

  const featured = slugs.filter((s) => projects.some((p) => p.slug === s && p.featured));
  if (slugs.length && featured.length !== 1)
    errs.push(
      featured.length
        ? `projects: hanya boleh satu proyek featured, sekarang ada ${featured.length} (${featured.join(', ')})`
        : 'projects: belum ada proyek featured (tandai satu dengan featured: true)',
    );

  const orders = new Map<number, string>();
  for (const p of projects.filter((p) => p.lang === 'id')) {
    const other = orders.get(p.order);
    if (other) errs.push(`projects: ${other} dan ${p.slug} punya order yang sama (${p.order})`);
    orders.set(p.order, p.slug);
  }
  return errs;
}

