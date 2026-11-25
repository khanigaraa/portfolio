import { content } from '../content';
import { getLang, t } from '../i18n';
import { educationList } from '../ui/career';
import { h, trustedHtml } from '../ui/dom';

/** "From café to server": the owner's story (Markdown) and education. */
export function aboutPage(): HTMLElement {
  const lang = getLang();
  const about = content.about(lang);
  return h(
    'article',
    { class: 'page about', 'data-title': t('nav.about') },
    h(
      'header',
      { class: 'page-head' },
      h('p', { class: 'eyebrow' }, t('about.eyebrow')),
      h('h1', {}, about.title),
      h('p', { class: 'lede' }, about.lede),
    ),
    trustedHtml('div', { class: 'case-study story', 'data-reveal': true }, about.html),
    h(
      'section',
      { class: 'lobby-section', id: 'education', 'aria-labelledby': 'education-title' },
      h('p', { class: 'eyebrow' }, t('about.educationEyebrow')),
      h('h2', { id: 'education-title' }, t('about.educationTitle')),
      educationList(content.listEducation(lang), lang),
    ),
    h(
      'div',
      { class: 'hero-actions about-actions' },
      h('a', { href: '/projects', 'data-link': true, class: 'btn' }, t('notFound.projects')),
      h('a', { href: '/#contact', 'data-link': true, class: 'btn btn-quiet' }, t('lobby.ctaContact')),
    ),
  );
}
