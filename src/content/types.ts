export const LANGS = ['id', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export interface Image {
  src: string;
  /** Required and meaningful: read aloud by screen readers. */
  alt: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  lang: Lang;
  title: string;
  summary: string;
  role: string;
  /** e.g. "Individu", "Tim 5 orang". */
  team: string;
  /** e.g. "2025–2026", "3 bulan". */
  period: string;
  stack: string[];
  /** Position in the project list (ascending). The same in both languages. */
  order: number;
  /** Exactly one project is featured. The same in both languages. */
  featured: boolean;
  stats: Stat[];
  links: { demo?: string; repo?: string };
  cover?: Image;
  diagram?: Image;
  /** The case study, rendered from Markdown to HTML. */
  html: string;
}

/** Who the site is about, in one language. Contact details are the same in both. */
export interface Profile {
  name: string;
  nickname: string;
  location: string;
  role: string;
  /** One bold line for the lobby. */
  headline: string;
  summary: string;
  /** Until the owner adds a photo the lobby shows a placeholder. */
  photo?: Image;
  contact: {
    /** International format, digits only, e.g. 6281310043238. */
    whatsapp: string;
    email: string;
    linkedin: string;
    github: string;
  };
  /** Path of the CV PDF under /public, e.g. /cv/CV-Kanta-Khanigara.pdf. */
  cv: string;
}

/** A service offered to clients. No prices: those are discussed directly. */
export interface Service {
  /** Stable id (also picks the icon), e.g. "website". */
  id: string;
  title: string;
  forWho: string;
  deliverables: string[];
}

export interface SkillGroup {
  /** Stable id (also picks the icon), e.g. "infra". */
  id: string;
  label: string;
  items: string[];
}

/** Months are written `YYYY-MM` in the content files and formatted per language on screen. */
export interface Role {
  title: string;
  /** e.g. "Penuh waktu" / "Full-time". */
  type?: string;
  start: string;
  /** Missing = still in this role. Equal to `start` = a single month. */
  end?: string;
  points: string[];
}

export interface Job {
  company: string;
  place: string;
  /** Newest first, as written in the file. */
  roles: Role[];
}

export interface Certificate {
  name: string;
  issuer: string;
  date: string;
  expires?: string;
  verifyUrl?: string;
  note?: string;
}

export interface Education {
  school: string;
  place: string;
  degree: string;
  gpa?: string;
  start: string;
  end?: string;
  thesis?: string;
  courses: string[];
}

/** An article. It may exist in one language only; `lang` is the language it is written in. */
export interface Writing {
  slug: string;
  lang: Lang;
  title: string;
  /** YYYY-MM-DD. */
  date: string;
  summary: string;
  /** Estimated reading time, at least 1. */
  minutes: number;
  html: string;
}

/** The About page: a story written in Markdown, per language. */
export interface AboutPage {
  title: string;
  lede: string;
  html: string;
}

/** Raw content files: path relative to the content folder (e.g. `projects/ha.id.md`) → file text. */
export type ContentFiles = Record<string, string>;
