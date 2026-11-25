import type { AboutPage, Certificate, Education, Job, Lang, Profile, Project, Service, SkillGroup, Writing } from './types';

/** Data parsed at build time: what the browser receives. */
export interface ContentData {
  projects: Project[];
  writings: Writing[];
  // Each of these is null only when its file is missing or invalid, which fails the build.
  profile: Record<Lang, Profile> | null;
  skills: Record<Lang, SkillGroup[]> | null;
  services: Record<Lang, Service[]> | null;
  experience: Record<Lang, Job[]> | null;
  certificates: Record<Lang, Certificate[]> | null;
  education: Record<Lang, Education[]> | null;
  about: Record<Lang, AboutPage> | null;
}

function pickWriting(all: Writing[], slug: string, lang: Lang): Writing | undefined {
  return all.find((w) => w.slug === slug && w.lang === lang) ?? all.find((w) => w.slug === slug);
}

const byOrder = (a: Project, b: Project) => a.order - b.order || a.slug.localeCompare(b.slug);

/** Pure queries over already-parsed content. No parser here, so the browser bundle stays small. */
export function createQueries(data: ContentData) {
  const { projects } = data;
  return {
    listProjects(lang: Lang): Project[] {
      return projects.filter((p) => p.lang === lang).sort(byOrder);
    },
    featuredProject(lang: Lang): Project | undefined {
      return projects.find((p) => p.lang === lang && p.featured);
    },
    getProject(slug: string, lang: Lang): Project | undefined {
      return projects.find((p) => p.slug === slug && p.lang === lang);
    },
    /**
     * One entry per article, newest first: in the reader's language when it exists, otherwise
     * in the language it was written in (its `lang` says which).
     */
    listWritings(lang: Lang): Writing[] {
      const slugs = [...new Set(data.writings.map((w) => w.slug))];
      return slugs
        .map((slug) => pickWriting(data.writings, slug, lang)!)
        .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
    },
    getWriting(slug: string, lang: Lang): Writing | undefined {
      return pickWriting(data.writings, slug, lang);
    },
    profile(lang: Lang): Profile {
      if (!data.profile) throw new Error('profile.md is missing or invalid');
      return data.profile[lang];
    },
    listSkills(lang: Lang): SkillGroup[] {
      return data.skills?.[lang] ?? [];
    },
    listServices(lang: Lang): Service[] {
      return data.services?.[lang] ?? [];
    },
    listExperience(lang: Lang): Job[] {
      return data.experience?.[lang] ?? [];
    },
    /** Newest first. */
    listCertificates(lang: Lang): Certificate[] {
      return [...(data.certificates?.[lang] ?? [])].sort((a, b) => b.date.localeCompare(a.date));
    },
    listEducation(lang: Lang): Education[] {
      return data.education?.[lang] ?? [];
    },
    about(lang: Lang): AboutPage {
      if (!data.about) throw new Error('about.id.md / about.en.md is missing or invalid');
      return data.about[lang];
    },
  };
}
