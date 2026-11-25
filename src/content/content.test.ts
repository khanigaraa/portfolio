import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createContent } from './content';
import { readContentFiles } from './node';
import type { ContentFiles } from './types';

const CONTENT_DIR = fileURLToPath(new URL('../../content', import.meta.url));

function project(fields: Record<string, string | undefined>, body = 'Isi studi kasus.'): string {
  const base: Record<string, string | undefined> = {
    title: 'Judul',
    summary: 'Ringkasan',
    role: 'Developer',
    team: 'Individu',
    period: '2026',
    order: '1',
    stack: '\n  - Linux',
    ...fields,
  };
  const yaml = Object.entries(base)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  return `---\n${yaml}\n---\n\n${body}\n`;
}

const PROFILE = `---
name: Kanta Khanigara
nickname: Stingtaw
location: Bandung, Indonesia
role: Infra + Web Developer
headline: { id: Judul, en: Headline }
summary: { id: Ringkasan, en: Summary }
contact:
  whatsapp: "6281234567890"
  email: kanta@example.com
  linkedin: https://www.linkedin.com/in/contoh
  github: https://github.com/contoh
cv: /cv/cv.pdf
---
`;

const SERVICES = `---
services:
  - id: website
    title: { id: Website Bisnis, en: Business Websites }
    for: { id: Untuk UMKM, en: For small businesses }
    deliverables:
      - { id: Rapi di HP, en: Works on phones }
      - SEO
  - id: data
    title: { id: Olah Data, en: Data Work }
    for: { id: Untuk toko, en: For shops }
    deliverables:
      - { id: Laporan, en: Reports }
---
`;

const SKILLS = `---
groups:
  - id: infra
    label: { id: Infrastruktur, en: Infrastructure }
    items:
      - Linux
      - { id: Jaringan, en: Networking }
  - id: languages
    label: { id: Bahasa, en: Languages }
    items:
      - { id: Inggris (menengah), en: English (intermediate) }
---
`;

const EXPERIENCE = `---
jobs:
  - company: Kafe
    place: Bandung
    roles:
      - title: { id: Manajer Stok, en: Stock Manager }
        start: 2026-02
        end: 2026-05
        points:
          - { id: Selisih nol, en: Zero discrepancy }
      - title: Waiters
        type: { id: Paruh waktu, en: Part-time }
        start: 2024-10
---
`;

const CERTIFICATES = `---
certificates:
  - name: Lama
    issuer: Cisco
    date: 2024-02
    verify: https://www.credly.com/badges/abc
  - name: { id: Analis Data, en: Data Analyst }
    issuer: LSP
    date: 2026-09
    expires: 2029-09
---
`;

const EDUCATION = `---
schools:
  - school: Kampus
    place: Bandung
    degree: { id: S1 Informatika, en: BSc Informatics }
    gpa: 3,38 / 4,00
    start: 2022-09
    end: 2026-10
    thesis: { id: Skripsi, en: Thesis }
    courses:
      - { id: Komputasi Awan, en: Cloud Computing }
---
`;

const about = (title: string) => `---\ntitle: ${title}\nlede: Pengantar\n---\n\n## Cerita\n\nIsi.\n`;

/** A valid set: `alpha` (featured, order 1) and `beta` (order 2), each in ID and EN, plus every site file. */
function validFiles(): ContentFiles {
  return {
    'projects/alpha.id.md': project({ title: 'Alfa', order: '1', featured: 'true' }),
    'projects/alpha.en.md': project({ title: 'Alpha', order: '1', featured: 'true' }),
    'projects/beta.id.md': project({ title: 'Beta', order: '2' }),
    'projects/beta.en.md': project({ title: 'Beta EN', order: '2' }),
    'profile.md': PROFILE,
    'skills.md': SKILLS,
    'services.md': SERVICES,
    'experience.md': EXPERIENCE,
    'certificates.md': CERTIFICATES,
    'education.md': EDUCATION,
    'about.id.md': about('Dari kafe ke server'),
    'about.en.md': about('From café to server'),
  };
}

function errorsFor(overrides: ContentFiles, without: string[] = []): string[] {
  const files = { ...validFiles(), ...overrides };
  for (const f of without) delete files[f];
  return createContent(files).validate();
}

describe('content: real files', () => {
  it('the owner’s content passes validation', () => {
    expect(createContent(readContentFiles(CONTENT_DIR)).validate()).toEqual([]);
  });

  it('features the high availability project, in both languages', () => {
    const content = createContent(readContentFiles(CONTENT_DIR));
    expect(content.featuredProject('id')?.slug).toBe('high-availability');
    expect(content.featuredProject('en')?.stats).toContainEqual({ label: 'Measured availability', value: '99.95%' });
  });
});

describe('content: queries', () => {
  const content = createContent(validFiles());

  it('lists projects of one language in order', () => {
    expect(content.listProjects('id').map((p) => p.title)).toEqual(['Alfa', 'Beta']);
    expect(content.listProjects('en').map((p) => p.title)).toEqual(['Alpha', 'Beta EN']);
  });

  it('sorts by order, not by file name', () => {
    const c = createContent({
      ...validFiles(),
      'projects/alpha.id.md': project({ order: '5', featured: 'true' }),
      'projects/alpha.en.md': project({ order: '5', featured: 'true' }),
    });
    expect(c.listProjects('id').map((p) => p.slug)).toEqual(['beta', 'alpha']);
  });

  it('finds the featured project and a project by slug', () => {
    expect(content.featuredProject('en')?.slug).toBe('alpha');
    expect(content.getProject('beta', 'en')?.title).toBe('Beta EN');
    expect(content.getProject('missing', 'id')).toBeUndefined();
  });

  it('renders the Markdown body to HTML', () => {
    const c = createContent({
      ...validFiles(),
      'projects/beta.id.md': project({ order: '2' }, '## Masalah\n\nSatu **server**.'),
    });
    expect(c.getProject('beta', 'id')?.html).toContain('<h2>Masalah</h2>');
    expect(c.getProject('beta', 'id')?.html).toContain('<strong>server</strong>');
  });

  it('reads stats, links and images', () => {
    const c = createContent({
      ...validFiles(),
      'projects/beta.id.md': project({
        order: '2',
        stats: '\n  - label: Node\n    value: "3"',
        links: '\n  demo: https://example.com\n  repo: https://github.com/x/y',
        diagram: '\n  src: /img/d.svg\n  alt: Diagram',
      }),
      'projects/beta.en.md': project({
        order: '2',
        links: '\n  demo: https://example.com\n  repo: https://github.com/x/y',
      }),
    });
    const beta = c.getProject('beta', 'id')!;
    expect(beta.stats).toEqual([{ label: 'Node', value: '3' }]);
    expect(beta.links).toEqual({ demo: 'https://example.com', repo: 'https://github.com/x/y' });
    expect(beta.diagram).toEqual({ src: '/img/d.svg', alt: 'Diagram' });
  });
});

describe('content: validation', () => {
  it('passes a valid set', () => {
    expect(createContent(validFiles()).validate()).toEqual([]);
  });

  it('rejects a missing language version, naming the file', () => {
    expect(errorsFor({}, ['projects/beta.en.md'])).toEqual(['projects/beta.en.md: versi EN belum ada']);
  });

  it('rejects an empty required field', () => {
    const errs = errorsFor({ 'projects/beta.id.md': project({ order: '2', summary: '""' }) });
    expect(errs).toEqual(['projects/beta.id.md: field "summary" wajib diisi']);
  });

  it('rejects a missing stack and a non-number order', () => {
    const errs = errorsFor({ 'projects/beta.id.md': project({ order: 'dua', stack: undefined }) });
    expect(errs).toContain('projects/beta.id.md: field "stack" wajib berisi daftar teknologi yang tidak kosong');
    expect(errs).toContain('projects/beta.id.md: field "order" wajib berupa angka bulat');
  });

  it('rejects zero or more than one featured project', () => {
    expect(
      errorsFor({
        'projects/alpha.id.md': project({ order: '1' }),
        'projects/alpha.en.md': project({ order: '1' }),
      }),
    ).toEqual(['projects: belum ada proyek featured (tandai satu dengan featured: true)']);
    expect(
      errorsFor({
        'projects/beta.id.md': project({ order: '2', featured: 'true' }),
        'projects/beta.en.md': project({ order: '2', featured: 'true' }),
      }),
    ).toEqual(['projects: hanya boleh satu proyek featured, sekarang ada 2 (alpha, beta)']);
  });

  it('rejects shared fields that differ between ID and EN', () => {
    expect(errorsFor({ 'projects/beta.en.md': project({ order: '3' }) })).toContain(
      'projects/beta: field "order" harus sama di versi ID dan EN',
    );
  });

  it('rejects an image without alt text', () => {
    const errs = errorsFor({ 'projects/beta.id.md': project({ order: '2', cover: '\n  src: /img/c.png' }) });
    expect(errs).toEqual(['projects/beta.id.md: cover.alt wajib diisi (teks alternatif gambar)']);
  });

  it('rejects invalid URLs', () => {
    const errs = errorsFor({
      'projects/beta.id.md': project({ order: '2', links: '\n  demo: datworks.app' }),
      'projects/beta.en.md': project({ order: '2', links: '\n  demo: datworks.app' }),
    });
    expect(errs).toContain('projects/beta.id.md: links.demo bukan URL http(s) yang valid');
  });

  it('rejects an invalid slug or language in the file name', () => {
    expect(errorsFor({ 'projects/Beta_2.id.md': project({ order: '9' }) })).toContain(
      'projects/Beta_2.id.md: slug "Beta_2" tidak valid (pakai huruf kecil, angka, dan tanda -)',
    );
    expect(errorsFor({ 'projects/beta.fr.md': project({ order: '2' }) })).toContain(
      'projects/beta.fr.md: bahasa "fr" tidak dikenal (pakai id atau en)',
    );
  });

  it('rejects two projects with the same order', () => {
    const errs = errorsFor({
      'projects/beta.id.md': project({ order: '1' }),
      'projects/beta.en.md': project({ order: '1' }),
    });
    expect(errs).toEqual(['projects: alpha dan beta punya order yang sama (1)']);
  });

  it('rejects unknown fields (typos) and an empty body', () => {
    const errs = errorsFor({ 'projects/beta.id.md': project({ order: '2', titel: 'Typo' }, '') });
    expect(errs).toContain('projects/beta.id.md: field "titel" tidak dikenal');
    expect(errs).toContain('projects/beta.id.md: isi studi kasus (di bawah frontmatter) masih kosong');
  });

  it('reports broken YAML instead of crashing', () => {
    const errs = errorsFor({ 'projects/beta.id.md': '---\ntitle: Datworks: rusak\n---\nIsi' });
    expect(errs[0]).toMatch(/^projects\/beta\.id\.md: frontmatter YAML tidak bisa dibaca/);
  });

  it('reports an unexpected file instead of ignoring it', () => {
    expect(errorsFor({ 'profil.md': PROFILE })).toEqual(['profil.md: file tidak dikenal (cek nama dan foldernya)']);
  });

  it('reports a file without frontmatter', () => {
    expect(errorsFor({ 'projects/beta.id.md': 'Hanya teks' })).toContain(
      'projects/beta.id.md: file harus diawali frontmatter di antara dua baris ---',
    );
  });
});

describe('content: profile', () => {
  it('gives the profile per language, with contact details shared', () => {
    const c = createContent(validFiles());
    expect(c.profile('id')).toMatchObject({ name: 'Kanta Khanigara', headline: 'Judul', role: 'Infra + Web Developer' });
    expect(c.profile('en')).toMatchObject({ headline: 'Headline', summary: 'Summary' });
    expect(c.profile('en').contact).toEqual(c.profile('id').contact);
    expect(c.profile('id').photo).toBeUndefined();
  });

  it('reads an optional photo with alt text in both languages', () => {
    const withPhoto = PROFILE.replace('contact:', 'photo:\n  src: /img/k.jpg\n  alt: { id: Foto, en: Photo }\ncontact:');
    const c = createContent({ ...validFiles(), 'profile.md': withPhoto });
    expect(c.validate()).toEqual([]);
    expect(c.profile('en').photo).toEqual({ src: '/img/k.jpg', alt: 'Photo' });
  });

  it('requires both languages for translated texts', () => {
    const errs = errorsFor({ 'profile.md': PROFILE.replace('{ id: Judul, en: Headline }', '{ id: Judul }') });
    expect(errs).toEqual(['profile.md: headline.en wajib diisi']);
  });

  it('rejects a plain string where a translation is needed', () => {
    const errs = errorsFor({ 'profile.md': PROFILE.replace('{ id: Ringkasan, en: Summary }', 'Ringkasan saja') });
    expect(errs).toEqual(['profile.md: summary wajib ditulis dalam dua bahasa (id: … dan en: …)']);
  });

  it('checks the contact details', () => {
    const bad = PROFILE.replace('"6281234567890"', '"0812-3456-7890"')
      .replace('kanta@example.com', 'kanta.example.com')
      .replace('https://github.com/contoh', 'github.com/contoh');
    const errs = errorsFor({ 'profile.md': bad });
    expect(errs).toEqual([
      'profile.md: contact.whatsapp harus angka saja dengan kode negara, mis. 6281234567890 (tanpa +, spasi, atau 0 di depan)',
      'profile.md: contact.email bukan alamat email yang valid',
      'profile.md: contact.github bukan URL http(s) yang valid',
    ]);
  });

  it('reports a missing profile or skills file', () => {
    expect(errorsFor({}, ['profile.md', 'skills.md'])).toEqual([
      'profile.md: file profil belum ada',
      'skills.md: file keahlian belum ada',
    ]);
  });
});

describe('content: skills', () => {
  it('lists skill groups per language, with untranslated items shared', () => {
    const c = createContent(validFiles());
    expect(c.listSkills('id')).toEqual([
      { id: 'infra', label: 'Infrastruktur', items: ['Linux', 'Jaringan'] },
      { id: 'languages', label: 'Bahasa', items: ['Inggris (menengah)'] },
    ]);
    expect(c.listSkills('en')[0]).toEqual({ id: 'infra', label: 'Infrastructure', items: ['Linux', 'Networking'] });
  });

  it('rejects a group without a translated label, items or a valid id', () => {
    const bad = `---
groups:
  - id: Infra Sistem
    label: Infrastruktur
    items: []
  - id: web
    label: { id: Web, en: Web }
    items:
      - { id: Dasar }
---
`;
    expect(errorsFor({ 'skills.md': bad })).toEqual([
      'skills.md: groups ke-1: id wajib diisi (huruf kecil, angka, dan tanda -)',
      'skills.md: groups ke-1.label wajib ditulis dalam dua bahasa (id: … dan en: …)',
      'skills.md: groups ke-1.items wajib berisi minimal satu keahlian',
      'skills.md: groups ke-2.items ke-1.en wajib diisi',
    ]);
  });

  it('rejects two groups with the same id', () => {
    const dup = SKILLS.replace('id: languages', 'id: infra');
    expect(errorsFor({ 'skills.md': dup })).toEqual(['skills.md: groups ke-2: id "infra" sudah dipakai grup lain']);
  });

  it('the real content has the five CV skill groups and no English test score', () => {
    const c = createContent(readContentFiles(CONTENT_DIR));
    expect(c.listSkills('id').map((g) => g.id)).toEqual(['infra', 'web', 'database', 'tools', 'languages']);
    expect(c.listSkills('en').at(-1)?.items).toContain('English (intermediate)');
    expect(JSON.stringify(c.data())).not.toMatch(/487/);
  });
});

describe('content: experience', () => {
  it('lists jobs with roles newest first, per language', () => {
    const c = createContent(validFiles());
    const [job] = c.listExperience('en');
    expect(job.company).toBe('Kafe');
    expect(job.roles.map((r) => r.title)).toEqual(['Stock Manager', 'Waiters']);
    expect(job.roles[0]).toMatchObject({ start: '2026-02', end: '2026-05', points: ['Zero discrepancy'] });
    expect(job.roles[1]).toMatchObject({ type: 'Part-time', end: undefined, points: [] });
    expect(c.listExperience('id')[0].roles[1].type).toBe('Paruh waktu');
  });

  it('checks month formats and date order', () => {
    const bad = EXPERIENCE.replace('start: 2026-02', 'start: Feb 2026').replace('start: 2024-10', 'start: 2025-10\n        end: 2025-01');
    expect(errorsFor({ 'experience.md': bad })).toEqual([
      'experience.md: jobs ke-1.roles ke-1.start "Feb 2026" harus berformat TTTT-BB, mis. 2024-10',
      'experience.md: jobs ke-1.roles ke-2: tanggal selesai (2025-01) lebih awal dari tanggal mulai (2025-10)',
    ]);
  });

  it('points out the comma trap in YAML flow maps', () => {
    const bad = EXPERIENCE.replace('{ id: Manajer Stok, en: Stock Manager }', '{ id: Staf (Kasir, Barista), en: Staff }');
    expect(errorsFor({ 'experience.md': bad })).toEqual([
      'experience.md: jobs ke-1.roles ke-1.title: "Barista)" tidak dikenal (pakai id dan en; kalau teksnya mengandung koma di dalam { }, beri tanda kutip)',
    ]);
  });
});

describe('content: certificates', () => {
  it('lists certificates newest first, with verify links and expiry', () => {
    const c = createContent(validFiles());
    expect(c.listCertificates('id').map((x) => x.name)).toEqual(['Analis Data', 'Lama']);
    expect(c.listCertificates('en')[0]).toMatchObject({ name: 'Data Analyst', expires: '2029-09' });
    expect(c.listCertificates('en')[1].verifyUrl).toBe('https://www.credly.com/badges/abc');
  });

  it('rejects an invalid verify link and a missing issuer', () => {
    const bad = CERTIFICATES.replace('https://www.credly.com/badges/abc', 'credly.com/abc').replace('    issuer: LSP\n', '');
    expect(errorsFor({ 'certificates.md': bad })).toEqual([
      'certificates.md: certificates ke-1.verify bukan URL http(s) yang valid',
      'certificates.md: certificates ke-2.issuer wajib diisi',
    ]);
  });
});

describe('content: education and about', () => {
  it('reads education per language', () => {
    const [s] = createContent(validFiles()).listEducation('en');
    expect(s).toMatchObject({ degree: 'BSc Informatics', gpa: '3,38 / 4,00', thesis: 'Thesis', courses: ['Cloud Computing'] });
  });

  it('renders the About story per language', () => {
    const c = createContent(validFiles());
    expect(c.about('en').title).toBe('From café to server');
    expect(c.about('id').html).toContain('<h2>Cerita</h2>');
  });

  it('requires both About files and the career files', () => {
    expect(errorsFor({}, ['about.en.md', 'experience.md', 'certificates.md', 'education.md'])).toEqual([
      'experience.md: file pengalaman kerja belum ada',
      'certificates.md: file sertifikat belum ada',
      'education.md: file pendidikan belum ada',
      'about.en.md: halaman Tentang versi EN belum ada',
    ]);
  });

  it('the real content follows the CV, without the English test', () => {
    const c = createContent(readContentFiles(CONTENT_DIR));
    expect(c.listExperience('id')[0].roles.map((r) => r.title)).toEqual([
      'Manajer Stok (4 Outlet)',
      'Headbar',
      'Staf Mobile (Kasir, Barista, Waiters)',
      'Waiters',
    ]);
    expect(c.listCertificates('en').map((x) => x.issuer)).toEqual([
      'LSP Informatika',
      'Cisco Networking Academy',
      'Cisco Networking Academy',
    ]);
    expect(JSON.stringify(c.data())).not.toMatch(/English Proficiency|487/);
  });
});

describe('content: services and CV', () => {
  it('lists services per language, without prices', () => {
    const c = createContent(validFiles());
    expect(c.listServices('en')).toEqual([
      { id: 'website', title: 'Business Websites', forWho: 'For small businesses', deliverables: ['Works on phones', 'SEO'] },
      { id: 'data', title: 'Data Work', forWho: 'For shops', deliverables: ['Reports'] },
    ]);
    expect(c.listServices('id')[0].title).toBe('Website Bisnis');
  });

  it('rejects a service without a translated title or deliverables', () => {
    const bad = SERVICES.replace('{ id: Olah Data, en: Data Work }', 'Olah Data').replace(
      '      - { id: Laporan, en: Reports }\n',
      '',
    );
    expect(errorsFor({ 'services.md': bad })).toEqual([
      'services.md: services ke-2.title wajib ditulis dalam dua bahasa (id: … dan en: …)',
      'services.md: services ke-2.deliverables wajib berisi minimal satu poin',
    ]);
  });

  it('a price field is not part of a service', () => {
    const priced = SERVICES.replace('  - id: data', '    price: 500000\n  - id: data');
    expect(errorsFor({ 'services.md': priced })).toEqual(['services.md: services ke-1.price tidak dikenal']);
  });

  it('checks that the CV file exists, when the build can tell', () => {
    const files = validFiles();
    expect(createContent(files, { publicFileExists: () => true }).validate()).toEqual([]);
    expect(createContent(files, { publicFileExists: () => false }).validate()).toEqual([
      'profile.md: file CV "/cv/cv.pdf" tidak ada di folder public',
    ]);
    expect(errorsFor({ 'profile.md': PROFILE.replace('/cv/cv.pdf', 'cv.docx') })).toEqual([
      'profile.md: field "cv" harus berupa path PDF di folder public, mis. /cv/CV.pdf',
    ]);
  });

  it('the real CV is in the public folder', () => {
    const publicDir = fileURLToPath(new URL('../../public', import.meta.url));
    const c = createContent(readContentFiles(CONTENT_DIR), {
      publicFileExists: (p) => existsSync(publicDir + p),
    });
    expect(c.validate()).toEqual([]);
    expect(c.profile('id').cv).toBe('/cv/CV-Kanta-Khanigara.pdf');
    expect(c.listServices('id').map((s) => s.id)).toEqual(['website', 'server', 'data']);
  });
});

describe('content: writing', () => {
  const article = (title: string, date: string, body = 'Isi artikel.') =>
    `---\ntitle: ${title}\ndate: ${date}\nsummary: Ringkasan ${title}\n---\n\n${body}\n`;

  const withArticles = (extra: ContentFiles) => createContent({ ...validFiles(), ...extra });

  it('has no articles yet in the real content, and that is fine', () => {
    const c = createContent(readContentFiles(CONTENT_DIR));
    expect(c.listWritings('id')).toEqual([]);
    expect(c.listWritings('en')).toEqual([]);
  });

  it('lists articles newest first, in the reader’s language when translated', () => {
    const c = withArticles({
      'writing/galera.id.md': article('Belajar Galera', '2026-11-01'),
      'writing/galera.en.md': article('Learning Galera', '2026-11-01'),
      'writing/kafe.id.md': article('Dari Kafe', '2026-12-10'),
    });
    expect(c.validate()).toEqual([]);
    expect(c.listWritings('en').map((w) => [w.title, w.lang])).toEqual([
      ['Dari Kafe', 'id'],
      ['Learning Galera', 'en'],
    ]);
    expect(c.listWritings('id').map((w) => w.title)).toEqual(['Dari Kafe', 'Belajar Galera']);
  });

  it('an article in one language is still shown, marked with its language', () => {
    const c = withArticles({ 'writing/kafe.id.md': article('Dari Kafe', '2026-12-10') });
    expect(c.getWriting('kafe', 'en')).toMatchObject({ title: 'Dari Kafe', lang: 'id' });
    expect(c.getWriting('tidak-ada', 'en')).toBeUndefined();
  });

  it('estimates the reading time and renders Markdown', () => {
    const long = Array.from({ length: 600 }, () => 'kata').join(' ');
    const c = withArticles({
      'writing/pendek.id.md': article('Pendek', '2026-11-01', '## Judul\n\nSingkat.'),
      'writing/panjang.id.md': article('Panjang', '2026-11-02', long),
    });
    expect(c.getWriting('pendek', 'id')!.minutes).toBe(1);
    expect(c.getWriting('panjang', 'id')!.minutes).toBe(3);
    expect(c.getWriting('pendek', 'id')!.html).toContain('<h2>Judul</h2>');
  });

  it('accepts a date written with or without quotes', () => {
    const c = withArticles({ 'writing/a.id.md': article('A', '"2026-11-25"'), 'writing/b.id.md': article('B', '2026-11-24') });
    expect(c.validate()).toEqual([]);
    expect(c.listWritings('id').map((w) => w.date)).toEqual(['2026-11-25', '2026-11-24']);
  });

  it('rejects an impossible date, a missing title, an empty body and a bad file name', () => {
    const errs = errorsFor({
      'writing/a.id.md': article('A', '2026-02-30'),
      'writing/b.id.md': '---\ndate: 2026-11-25\nsummary: S\n---\n',
      'writing/Catatan Baru.id.md': article('C', '2026-11-25'),
    });
    expect(errs).toEqual([
      'writing/a.id.md: field "date" "2026-02-30" harus tanggal valid berformat TTTT-BB-HH',
      'writing/b.id.md: field "title" wajib diisi',
      'writing/b.id.md: isi tulisan (di bawah frontmatter) masih kosong',
      'writing/Catatan Baru.id.md: slug "Catatan Baru" tidak valid (pakai huruf kecil, angka, dan tanda -)',
    ]);
  });
});

describe('content: images in public', () => {
  it('fails when a project image or the profile photo is missing from /public', () => {
    const files = {
      ...validFiles(),
      'projects/beta.id.md': project({ order: '2', diagram: '\n  src: /img/d.svg\n  alt: Diagram' }),
      'profile.md': PROFILE.replace('contact:', 'photo:\n  src: /img/k.jpg\n  alt: { id: Foto, en: Photo }\ncontact:'),
    };
    const only = (present: string[]) => (p: string) => present.includes(p);
    expect(createContent(files, { publicFileExists: only(['/cv/cv.pdf', '/img/d.svg', '/img/k.jpg']) }).validate()).toEqual([]);
    expect(createContent(files, { publicFileExists: only(['/cv/cv.pdf']) }).validate()).toEqual([
      'profile.md: foto "/img/k.jpg" tidak ada di folder public',
      'projects/beta.id.md: gambar "/img/d.svg" tidak ada di folder public',
    ]);
  });

  it('the real HA case study has its diagram, with alt text in both languages', () => {
    const c = createContent(readContentFiles(CONTENT_DIR));
    expect(c.getProject('high-availability', 'id')!.diagram).toMatchObject({ src: '/img/ha-architecture.svg' });
    expect(c.getProject('high-availability', 'en')!.diagram!.alt).toMatch(/^Architecture diagram/);
    expect(c.getProject('high-availability', 'id')!.html).toContain('<h2>Pengujian</h2>');
  });
});
