import { t } from '../i18n';
import { h } from '../ui/dom';

export function notFoundPage(): HTMLElement {
  return h(
    'section',
    { class: 'page not-found', 'data-title': t('notFound.title') },
    h('div', { class: 'not-found-radar', 'aria-hidden': 'true' }),
    h('p', { class: 'eyebrow' }, t('notFound.eyebrow')),
    h('h1', {}, t('notFound.title')),
    h('p', { class: 'lede' }, t('notFound.lede')),
    h(
      'div',
      { class: 'not-found-actions' },
      h('a', { href: '/', 'data-link': true, class: 'btn' }, t('notFound.home')),
      h('a', { href: '/projects', 'data-link': true, class: 'btn btn-quiet' }, t('notFound.projects')),
    ),
  );
}
