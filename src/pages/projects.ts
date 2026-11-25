import { content, type Project } from '../content';
import { getLang, t } from '../i18n';
import type { RouteContext } from '../router';
import { h, trustedHtml } from '../ui/dom';
import { notFoundPage } from './not-found';

function meta(p: Project): HTMLElement {
  return h(
    'dl',
    { class: 'project-meta' },
    h('div', {}, h('dt', {}, t('projects.role')), h('dd', {}, p.role)),
    h('div', {}, h('dt', {}, t('projects.team')), h('dd', {}, p.team)),
    h('div', {}, h('dt', {}, t('projects.period')), h('dd', {}, p.period)),
  );
}

function stack(p: Project): HTMLElement {
  return h('ul', { class: 'stack', 'aria-label': t('projects.stack') }, ...p.stack.map((s) => h('li', {}, s)));
}

/** A project as a "match" in the match history. */
function matchCard(p: Project, index: number): HTMLElement {
  return h(
    'li',
    { id: p.slug, 'data-reveal': true },
    h(
      'article',
      { class: `match-card${p.featured ? ' is-featured' : ''}` },
      h(
        'div',
        { class: 'match-head' },
        h('span', { class: 'match-no' }, t('projects.match', { n: String(index + 1).padStart(2, '0') })),
        p.featured ? h('span', { class: 'badge' }, t('projects.featured')) : null,
      ),
      h('h2', {}, h('a', { href: `/projects/${p.slug}`, 'data-link': true }, p.title)),
      h('p', { class: 'summary' }, p.summary),
      meta(p),
      stack(p),
    ),
  );
}

export function projectListPage(): HTMLElement {
  return h(
    'section',
    { class: 'page projects', 'data-title': t('projects.title') },
    h(
      'header',
      { class: 'page-head' },
      h('p', { class: 'eyebrow' }, t('projects.eyebrow')),
      h('h1', {}, t('projects.title')),
      h('p', { class: 'lede' }, t('projects.lede')),
    ),
    h('ul', { class: 'project-list' }, ...content.listProjects(getLang()).map(matchCard)),
  );
}

export function projectDetailPage(ctx: RouteContext): HTMLElement {
  const p = content.getProject(ctx.params.slug, getLang());
  if (!p) return notFoundPage();

  const links = [
    p.links.demo && h('a', { href: p.links.demo, target: '_blank', rel: 'noopener', class: 'btn' }, t('projects.demo')),
    p.links.repo &&
      h('a', { href: p.links.repo, target: '_blank', rel: 'noopener', class: 'btn btn-quiet' }, t('projects.repo')),
  ].filter(Boolean) as HTMLElement[];

  return h(
    'article',
    { class: 'page project-detail', 'data-title': p.title },
    h('p', {}, h('a', { href: '/projects', 'data-link': true, class: 'back-link' }, t('projects.back'))),
    h(
      'header',
      { class: 'page-head' },
      h('p', { class: 'eyebrow' }, t(p.featured ? 'projects.caseStudyMvp' : 'projects.caseStudy')),
      h('h1', {}, p.title),
      h('p', { class: 'lede' }, p.summary),
    ),
    meta(p),
    p.stats.length
      ? h(
          'dl',
          { class: 'stats', 'data-reveal': true },
          ...p.stats.map((s) => h('div', {}, h('dt', {}, s.label), h('dd', {}, s.value))),
        )
      : null,
    stack(p),
    links.length ? h('p', { class: 'project-links' }, ...links) : null,
    p.diagram
      ? h(
          'figure',
          { class: 'diagram', 'data-reveal': true },
          // On narrow screens the diagram keeps a readable size and scrolls sideways.
          h(
            'div',
            { class: 'diagram-scroll', tabindex: 0, role: 'region', 'aria-label': t('projects.diagramLabel') },
            h('img', { src: p.diagram.src, alt: p.diagram.alt, width: 760, height: 470, loading: 'lazy' }),
          ),
          h(
            'figcaption',
            {},
            t('projects.diagramCaption'),
            h('span', { class: 'diagram-hint' }, ` ${t('projects.diagramHint')}`),
          ),
        )
      : null,
    trustedHtml('div', { class: 'case-study', 'data-reveal': true }, p.html),
  );
}
