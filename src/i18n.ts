import { LANGS, type Lang } from './content/types';

/** UI text. Content (projects, …) lives in the Markdown files; this is only the interface. */
const id = {
  'site.title': 'Kanta Khanigara · Portofolio',
  'site.skip': 'Langsung ke isi',
  'site.role': 'Infra + Web Developer · Bandung, Indonesia',

  'nav.label': 'Navigasi utama',
  'nav.menu': 'Menu',
  'nav.home': 'Lobby',
  'nav.projects': 'Proyek',
  'nav.about': 'Tentang',
  'nav.writing': 'Tulisan',
  'nav.contact': 'Kontak',
  'nav.brandLabel': 'Stingtaw, Kanta Khanigara: ke lobby',

  'lang.label': 'Bahasa',
  'lang.id': 'Bahasa Indonesia',
  'lang.en': 'English',

  'projects.title': 'Proyek',
  'projects.eyebrow': 'Riwayat Pertandingan',
  'projects.lede': 'Sistem dan website yang pernah aku bangun, dari server sampai tampilan.',
  'projects.match': 'Match #{n}',
  'projects.featured': 'MVP · Unggulan',
  'projects.role': 'Peran',
  'projects.team': 'Tim',
  'projects.period': 'Waktu',
  'projects.stack': 'Teknologi',
  'projects.back': '← Semua proyek',
  'projects.caseStudy': 'Studi kasus',
  'projects.caseStudyMvp': 'Studi kasus · MVP',
  'projects.demo': 'Lihat demo ↗',
  'projects.repo': 'Lihat kode ↗',
  'projects.diagramLabel': 'Diagram arsitektur',
  'projects.diagramCaption': 'Arsitektur sistem (disederhanakan).',
  'projects.diagramHint': 'Geser ke samping untuk melihat semuanya.',

  'lobby.eyebrow': 'Profil Pemain',
  'lobby.ctaFeatured': 'Lihat proyek unggulan',
  'lobby.ctaContact': 'Hubungi aku',
  'lobby.photoPlaceholder': 'Foto profil menyusul',
  'lobby.featuredEyebrow': 'MVP · Proyek unggulan',
  'lobby.featuredCta': 'Baca studi kasus →',
  'lobby.allProjects': 'Semua proyek →',
  'lobby.skillsEyebrow': 'Skill Tree · Keahlian',
  'lobby.skillsTitle': 'Keahlian',
  'lobby.experienceEyebrow': 'Rank Journey · Pengalaman',
  'lobby.experienceTitle': 'Pengalaman Kerja',
  'lobby.rank': 'Rank {n}',
  'lobby.certificatesEyebrow': 'Achievements · Sertifikat',
  'lobby.certificatesTitle': 'Sertifikat',
  'lobby.validUntil': 'Berlaku sampai {date}',
  'lobby.verify': 'Verifikasi ↗',
  'lobby.aboutMore': 'Cerita lengkapku →',

  'about.eyebrow': 'Lore · Tentang',
  'about.educationEyebrow': 'Training Grounds · Pendidikan',
  'about.educationTitle': 'Pendidikan',
  'about.gpa': 'IPK',
  'about.thesis': 'Skripsi',
  'about.courses': 'Mata kuliah relevan',

  'lobby.contactEyebrow': 'Party Invite · Kontak',
  'lobby.contactTitle': 'Ajak aku satu tim',
  'lobby.contactLede': 'Sedang mencari kerja dan terbuka untuk proyek. Kirim pesan, aku balas secepatnya.',

  'services.eyebrow': 'Item Shop · Layanan',
  'services.title': 'Layanan',
  'services.lede': 'Untuk usaha dan tim yang butuh bantuan. Harga dibicarakan langsung, menyesuaikan kebutuhanmu.',
  'services.for': 'Cocok untuk',
  'services.get': 'Yang kamu dapat',
  'services.cta': 'Diskusikan via WhatsApp',

  'contact.whatsapp': 'Chat WhatsApp',
  'contact.email': 'Kirim email',
  'contact.copy': 'Salin email',
  'contact.copied': 'Email tersalin: {email}',
  'contact.copyFailed': 'Gagal menyalin. Emailku: {email}',
  'contact.cv': 'Unduh CV (PDF)',
  'contact.newTab': '(buka di tab baru)',
  'contact.waGeneral': 'Halo Kanta, aku lihat portofoliomu dan ingin ngobrol.',
  'contact.waService':
    'Halo Kanta, aku lihat portofoliomu dan tertarik dengan layanan "{service}". Boleh ngobrol soal kebutuhanku?',
  'contact.mailSubject': 'Halo dari portofoliomu',

  'writing.title': 'Tulisan',
  'writing.eyebrow': 'Patch Notes · Tulisan',
  'writing.lede': 'Catatan tentang server, web, dan hal-hal yang aku pelajari di jalan.',
  'writing.emptyTitle': 'Segera hadir',
  'writing.emptyText': 'Patch pertama sedang disiapkan. Sementara itu, lihat proyek-proyekku.',
  'writing.minutes': '{n} menit baca',
  'writing.back': '← Semua tulisan',
  'writing.inLang': 'Ditulis dalam {lang}',

  'intro.label': 'Intro: mencari pertandingan',
  'intro.skip': 'Lewati',
  'intro.mode': 'Mode: Ranked · Server: Bandung',
  'intro.find': 'Find Match',
  'intro.findSub': 'Cari pertandingan',
  'intro.searching': 'Mencari pertandingan…',
  'intro.found': 'Pertandingan ditemukan!',
  'intro.foundSub': 'Lawan: rekruter & klien',
  'intro.accept': 'Accept',
  'intro.acceptHint': 'Tekan Enter untuk menerima',
  'intro.loading': 'Memuat profil {name}…',
  'intro.tip': 'Tip: ganti bahasa lewat tombol ID | EN di pojok kanan atas.',
  'intro.replay': 'Putar ulang intro',

  'notFound.title': 'Pertandingan tidak ditemukan',
  'notFound.eyebrow': 'Error 404 · Matchmaking gagal',
  'notFound.lede': 'Halaman yang kamu cari tidak ada, atau sudah pindah server.',
  'notFound.home': 'Kembali ke lobby',
  'notFound.projects': 'Lihat proyek',
} as const;

export type MessageKey = keyof typeof id;

const en: Record<MessageKey, string> = {
  'site.title': 'Kanta Khanigara · Portfolio',
  'site.skip': 'Skip to content',
  'site.role': 'Infra + Web Developer · Bandung, Indonesia',

  'nav.label': 'Main navigation',
  'nav.menu': 'Menu',
  'nav.home': 'Lobby',
  'nav.projects': 'Projects',
  'nav.about': 'About',
  'nav.writing': 'Writing',
  'nav.contact': 'Contact',
  'nav.brandLabel': 'Stingtaw, Kanta Khanigara: to the lobby',

  'lang.label': 'Language',
  'lang.id': 'Bahasa Indonesia',
  'lang.en': 'English',

  'projects.title': 'Projects',
  'projects.eyebrow': 'Match History',
  'projects.lede': 'Systems and websites I have built, from the server to the screen.',
  'projects.match': 'Match #{n}',
  'projects.featured': 'MVP · Featured',
  'projects.role': 'Role',
  'projects.team': 'Team',
  'projects.period': 'When',
  'projects.stack': 'Tech stack',
  'projects.back': '← All projects',
  'projects.caseStudy': 'Case study',
  'projects.caseStudyMvp': 'Case study · MVP',
  'projects.demo': 'View demo ↗',
  'projects.repo': 'View code ↗',
  'projects.diagramLabel': 'Architecture diagram',
  'projects.diagramCaption': 'System architecture (simplified).',
  'projects.diagramHint': 'Scroll sideways to see all of it.',

  'lobby.eyebrow': 'Player Profile',
  'lobby.ctaFeatured': 'See the featured project',
  'lobby.ctaContact': 'Get in touch',
  'lobby.photoPlaceholder': 'Profile photo coming soon',
  'lobby.featuredEyebrow': 'MVP · Featured project',
  'lobby.featuredCta': 'Read the case study →',
  'lobby.allProjects': 'All projects →',
  'lobby.skillsEyebrow': 'Skill Tree',
  'lobby.skillsTitle': 'Skills',
  'lobby.experienceEyebrow': 'Rank Journey · Experience',
  'lobby.experienceTitle': 'Work Experience',
  'lobby.rank': 'Rank {n}',
  'lobby.certificatesEyebrow': 'Achievements · Certificates',
  'lobby.certificatesTitle': 'Certificates',
  'lobby.validUntil': 'Valid until {date}',
  'lobby.verify': 'Verify ↗',
  'lobby.aboutMore': 'My full story →',

  'about.eyebrow': 'Lore · About',
  'about.educationEyebrow': 'Training Grounds · Education',
  'about.educationTitle': 'Education',
  'about.gpa': 'GPA',
  'about.thesis': 'Thesis',
  'about.courses': 'Relevant courses',

  'lobby.contactEyebrow': 'Party Invite · Contact',
  'lobby.contactTitle': 'Invite me to your team',
  'lobby.contactLede': 'Looking for a job and open to projects. Send a message and I will reply as soon as I can.',

  'services.eyebrow': 'Item Shop · Services',
  'services.title': 'Services',
  'services.lede': 'For businesses and teams that need a hand. Pricing is discussed directly, based on what you need.',
  'services.for': 'Good for',
  'services.get': 'What you get',
  'services.cta': 'Discuss on WhatsApp',

  'contact.whatsapp': 'WhatsApp me',
  'contact.email': 'Send an email',
  'contact.copy': 'Copy email',
  'contact.copied': 'Email copied: {email}',
  'contact.copyFailed': 'Could not copy. My email: {email}',
  'contact.cv': 'Download CV (PDF)',
  'contact.newTab': '(opens in a new tab)',
  'contact.waGeneral': 'Hi Kanta, I saw your portfolio and would like to talk.',
  'contact.waService': 'Hi Kanta, I saw your portfolio and I am interested in "{service}". Could we talk about what I need?',
  'contact.mailSubject': 'Hello from your portfolio',

  'writing.title': 'Writing',
  'writing.eyebrow': 'Patch Notes · Writing',
  'writing.lede': 'Notes on servers, the web, and things I learn along the way.',
  'writing.emptyTitle': 'Coming soon',
  'writing.emptyText': 'The first patch is being prepared. Meanwhile, take a look at my projects.',
  'writing.minutes': '{n} min read',
  'writing.back': '← All writing',
  'writing.inLang': 'Written in {lang}',

  'intro.label': 'Intro: finding a match',
  'intro.skip': 'Skip',
  'intro.mode': 'Mode: Ranked · Server: Bandung',
  'intro.find': 'Find Match',
  'intro.findSub': 'Start matchmaking',
  'intro.searching': 'Finding a match…',
  'intro.found': 'Match found!',
  'intro.foundSub': 'Opponents: recruiters & clients',
  'intro.accept': 'Accept',
  'intro.acceptHint': 'Press Enter to accept',
  'intro.loading': 'Loading {name}’s profile…',
  'intro.tip': 'Tip: switch language with the ID | EN buttons at the top right.',
  'intro.replay': 'Replay intro',

  'notFound.title': 'Match not found',
  'notFound.eyebrow': 'Error 404 · Matchmaking failed',
  'notFound.lede': 'The page you are looking for does not exist, or has moved servers.',
  'notFound.home': 'Back to the lobby',
  'notFound.projects': 'See projects',
};

export const MESSAGES: Record<Lang, Record<MessageKey, string>> = { id, en };

/** Where the chosen language is remembered. Injected so tests can use memory instead of localStorage. */
export interface LangStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

export const STORAGE_KEY = 'stingtaw:lang';

export function memoryStorage(): LangStorage {
  const data = new Map<string, string>();
  return { get: (k) => data.get(k) ?? null, set: (k, v) => void data.set(k, v) };
}

/** localStorage, but never throwing (private mode, blocked storage). */
export function browserStorage(): LangStorage {
  return {
    get(k) {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, v);
      } catch {
        /* the choice just won't be remembered */
      }
    },
  };
}

export const isLang = (v: unknown): v is Lang => (LANGS as readonly unknown[]).includes(v);

/**
 * Which language to show: `?lang=` (a shared link) → the visitor's saved choice →
 * the browser language (`id*` → Indonesian, anything else → English).
 */
export function detectLang(opts: { search: string; storage: LangStorage; browserLangs: readonly string[] }): Lang {
  const fromUrl = new URLSearchParams(opts.search).get('lang');
  if (isLang(fromUrl)) return fromUrl;
  const saved = opts.storage.get(STORAGE_KEY);
  if (isLang(saved)) return saved;
  return opts.browserLangs[0]?.toLowerCase().startsWith('id') ? 'id' : 'en';
}

let current: Lang = 'id';
let storage: LangStorage = memoryStorage();
const listeners = new Set<(lang: Lang) => void>();

/** Decide the language once at start-up. A `?lang=` choice is remembered like a click on the toggle. */
export function initLang(opts: { search: string; storage: LangStorage; browserLangs: readonly string[] }): Lang {
  storage = opts.storage;
  current = detectLang(opts);
  if (isLang(new URLSearchParams(opts.search).get('lang'))) storage.set(STORAGE_KEY, current);
  return current;
}

export const getLang = (): Lang => current;

export function setLang(lang: Lang) {
  storage.set(STORAGE_KEY, lang);
  if (lang === current) return;
  current = lang;
  for (const fn of listeners) fn(lang);
}

export function onLangChange(fn: (lang: Lang) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Translate a UI message, filling `{name}` placeholders. */
export function t(key: MessageKey, params: Record<string, string | number> = {}, lang: Lang = current): string {
  return MESSAGES[lang][key].replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m));
}
