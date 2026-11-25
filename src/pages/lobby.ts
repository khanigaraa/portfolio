import { content, type Lang, type Profile, type Project, type SkillGroup } from '../content';
import { getLang, t } from '../i18n';
import { copyText, mailtoUrl, whatsappMessage, whatsappUrl } from '../contact';
import { certificateList, experienceList } from '../ui/career';
import { h } from '../ui/dom';
import { skillIcon } from '../ui/icons';

function hero(p: Profile, featured: Project | undefined): HTMLElement {
  const initials = p.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  const portrait = p.photo
    ? h('img', { src: p.photo.src, alt: p.photo.alt, class: 'portrait-img', width: 480, height: 600 })
    : h(
        'div',
        { class: 'portrait-placeholder', role: 'img', 'aria-label': t('lobby.photoPlaceholder') },
        h('span', { 'aria-hidden': 'true' }, initials),
      );

  return h(
    'section',
    { class: 'hero', 'aria-labelledby': 'hero-title' },
    h(
      'div',
      { class: 'hero-text' },
      h('p', { class: 'eyebrow' }, t('lobby.eyebrow')),
      h('p', { class: 'hero-nick' }, p.nickname),
      h('h1', { id: 'hero-title' }, p.name),
      h('p', { class: 'hero-role' }, h('span', {}, p.role), h('span', { class: 'hero-loc' }, p.location)),
      h('p', { class: 'hero-headline' }, p.headline),
      // Buttons before the longer summary, so they are on the first screen of a laptop.
      h(
        'div',
        { class: 'hero-actions' },
        featured ? h('a', { href: '#featured', 'data-link': true, class: 'btn' }, t('lobby.ctaFeatured')) : null,
        h('a', { href: '#contact', 'data-link': true, class: 'btn btn-quiet' }, t('lobby.ctaContact')),
      ),
      h('p', { class: 'lede hero-summary' }, p.summary),
    ),
    h('div', { class: 'portrait' }, portrait),
  );
}

function featuredSection(p: Project): HTMLElement {
  return h(
    'section',
    { class: 'lobby-section', id: 'featured', 'aria-labelledby': 'featured-title' },
    h('p', { class: 'eyebrow' }, t('lobby.featuredEyebrow')),
    h(
      'article',
      { class: 'match-card is-featured featured-card', 'data-reveal': true },
      h('div', { class: 'match-head' }, h('span', { class: 'badge' }, t('projects.featured'))),
      h('h2', { id: 'featured-title' }, h('a', { href: `/projects/${p.slug}`, 'data-link': true }, p.title)),
      h('p', { class: 'summary' }, p.summary),
      p.stats.length
        ? h('dl', { class: 'stats' }, ...p.stats.map((s) => h('div', {}, h('dt', {}, s.label), h('dd', {}, s.value))))
        : null,
      h('ul', { class: 'stack', 'aria-label': t('projects.stack') }, ...p.stack.map((s) => h('li', {}, s))),
      h('p', { class: 'featured-cta', 'aria-hidden': 'true' }, t('lobby.featuredCta')),
    ),
    h('p', { class: 'section-more' }, h('a', { href: '/projects', 'data-link': true }, t('lobby.allProjects'))),
  );
}

function skillsSection(groups: SkillGroup[]): HTMLElement {
  return h(
    'section',
    { class: 'lobby-section', id: 'skills', 'aria-labelledby': 'skills-title' },
    h('p', { class: 'eyebrow' }, t('lobby.skillsEyebrow')),
    h('h2', { id: 'skills-title' }, t('lobby.skillsTitle')),
    h(
      'ul',
      { class: 'skill-grid' },
      ...groups.map((g) =>
        h(
          'li',
          { class: 'skill-slot', 'data-reveal': true, 'data-group': g.id },
          h('div', { class: 'skill-head' }, skillIcon(g.id), h('h3', {}, g.label)),
          h('ul', { class: 'stack' }, ...g.items.map((s) => h('li', {}, s))),
        ),
      ),
    ),
  );
}

function experienceSection(lang: Lang): HTMLElement {
  return h(
    'section',
    { class: 'lobby-section', id: 'experience', 'aria-labelledby': 'experience-title' },
    h('p', { class: 'eyebrow' }, t('lobby.experienceEyebrow')),
    h('h2', { id: 'experience-title' }, t('lobby.experienceTitle')),
    experienceList(content.listExperience(lang), lang),
    h('p', { class: 'section-more' }, h('a', { href: '/about', 'data-link': true }, t('lobby.aboutMore'))),
  );
}

function certificatesSection(lang: Lang): HTMLElement {
  return h(
    'section',
    { class: 'lobby-section', id: 'certificates', 'aria-labelledby': 'certificates-title' },
    h('p', { class: 'eyebrow' }, t('lobby.certificatesEyebrow')),
    h('h2', { id: 'certificates-title' }, t('lobby.certificatesTitle')),
    certificateList(content.listCertificates(lang), lang),
  );
}

const SERVICE_ICON: Record<string, string> = { website: 'web', server: 'infra', data: 'database' };

/** Services for clients, each with a WhatsApp button whose message names the service. No prices. */
function servicesSection(lang: Lang, profile: Profile): HTMLElement {
  return h(
    'section',
    { class: 'lobby-section', id: 'services', 'aria-labelledby': 'services-title' },
    h('p', { class: 'eyebrow' }, t('services.eyebrow')),
    h('h2', { id: 'services-title' }, t('services.title')),
    h('p', { class: 'lede' }, t('services.lede')),
    h(
      'ul',
      { class: 'service-grid' },
      ...content.listServices(lang).map((s) =>
        h(
          'li',
          { class: 'service', 'data-reveal': true, 'data-service': s.id },
          h('div', { class: 'skill-head' }, skillIcon(SERVICE_ICON[s.id] ?? s.id), h('h3', {}, s.title)),
          h('p', { class: 'service-label' }, t('services.for')),
          h('p', { class: 'service-for' }, s.forWho),
          h('p', { class: 'service-label' }, t('services.get')),
          h('ul', { class: 'service-list' }, ...s.deliverables.map((d) => h('li', {}, d))),
          h(
            'a',
            {
              class: 'btn service-cta',
              href: whatsappUrl(profile.contact.whatsapp, whatsappMessage(lang, s.title)),
              target: '_blank',
              rel: 'noopener',
              'aria-label': `${t('services.cta')}: ${s.title} ${t('contact.newTab')}`,
            },
            t('services.cta'),
          ),
        ),
      ),
    ),
  );
}

/** How to get in touch: WhatsApp, email (send or copy), LinkedIn, GitHub, and the CV. */
function contactSection(lang: Lang, p: Profile): HTMLElement {
  const ext = (href: string, label: string, cls = 'btn btn-quiet') =>
    h('a', { href, target: '_blank', rel: 'noopener', class: cls, 'aria-label': `${label} ${t('contact.newTab')}` }, label);
  const status = h('p', { class: 'copy-status', role: 'status', 'aria-live': 'polite' });
  const copy = h('button', { type: 'button', class: 'btn btn-quiet' }, t('contact.copy'));
  copy.addEventListener('click', async () => {
    const ok = await copyText(p.contact.email);
    status.textContent = t(ok ? 'contact.copied' : 'contact.copyFailed', { email: p.contact.email });
  });

  return h(
    'section',
    { class: 'lobby-section contact', id: 'contact', 'aria-labelledby': 'contact-title' },
    h('p', { class: 'eyebrow' }, t('lobby.contactEyebrow')),
    h('h2', { id: 'contact-title' }, t('lobby.contactTitle')),
    h('p', { class: 'lede' }, t('lobby.contactLede')),
    h(
      'div',
      { class: 'contact-actions' },
      ext(whatsappUrl(p.contact.whatsapp, whatsappMessage(lang)), t('contact.whatsapp'), 'btn'),
      h('a', { href: mailtoUrl(p.contact.email, t('contact.mailSubject')), class: 'btn btn-quiet' }, t('contact.email')),
      copy,
      ext(p.contact.linkedin, 'LinkedIn'),
      ext(p.contact.github, 'GitHub'),
    ),
    h('p', { class: 'contact-email' }, p.contact.email),
    status,
    h(
      'p',
      { class: 'contact-cv' },
      h('a', { href: p.cv, download: 'CV-Kanta-Khanigara.pdf', class: 'btn' }, t('contact.cv')),
    ),
  );
}

/** The home page: who Kanta is in five seconds, the best project, the skills, and how to get in touch. */
export function lobbyPage(): HTMLElement {
  const lang = getLang();
  const profile = content.profile(lang);
  const featured = content.featuredProject(lang);
  return h(
    'div',
    { class: 'page lobby' },
    hero(profile, featured),
    featured ? featuredSection(featured) : null,
    skillsSection(content.listSkills(lang)),
    experienceSection(lang),
    certificatesSection(lang),
    servicesSection(lang, profile),
    contactSection(lang, profile),
  );
}
