import { content, type Lang, type Writing } from '../content';
import { getLang, t } from '../i18n';
import type { RouteContext } from '../router';
import { formatDate } from '../ui/dates';
import { h, trustedHtml } from '../ui/dom';
import { notFoundPage } from './not-found';

/** Date · reading time, plus the language when it is not the reader's. */
function meta(w: Writing, lang: Lang): HTMLElement {
  return h(
    'p',
    { class: 'writing-meta' },
    h('time', { datetime: w.date }, formatDate(w.date, lang)),
    h('span', {}, t('writing.minutes', { n: w.minutes })),
    w.lang !== lang
      ? h('span', { class: 'lang-chip' }, t('writing.inLang', { lang: t(w.lang === 'id' ? 'lang.id' : 'lang.en') }))
      : null,
  );
}

export function writingListPage(): HTMLElement {
  const lang = getLang();
  const articles = content.listWritings(lang);
  return h(
    'section',
    { class: 'page writing', 'data-title': t('writing.title') },
    h(
      'header',
      { class: 'page-head' },
      h('p', { class: 'eyebrow' }, t('writing.eyebrow')),
      h('h1', {}, t('writing.title')),
      h('p', { class: 'lede' }, t('writing.lede')),
    ),
    articles.length
      ? h(
          'ul',
          { class: 'writing-list' },
          ...articles.map((w) =>
            h(
              'li',
              { 'data-reveal': true },
              h(
                'article',
                { class: 'writing-card', lang: w.lang },
                h('h2', {}, h('a', { href: `/writing/${w.slug}`, 'data-link': true }, w.title)),
                meta(w, lang),
                h('p', { class: 'summary' }, w.summary),
              ),
            ),
          ),
        )
      : h(
          'div',
          { class: 'writing-empty' },
          h('div', { class: 'not-found-radar', 'aria-hidden': 'true' }),
          h('h2', {}, t('writing.emptyTitle')),
          h('p', {}, t('writing.emptyText')),
          h('a', { href: '/projects', 'data-link': true, class: 'btn' }, t('notFound.projects')),
        ),
  );
}

export function writingDetailPage(ctx: RouteContext): HTMLElement {
  const lang = getLang();
  const w = content.getWriting(ctx.params.slug, lang);
  if (!w) return notFoundPage();
  return h(
    'article',
    { class: 'page writing-detail', 'data-title': w.title, lang: w.lang },
    h('p', {}, h('a', { href: '/writing', 'data-link': true, class: 'back-link', lang }, t('writing.back'))),
    h(
      'header',
      { class: 'page-head' },
      h('p', { class: 'eyebrow', lang }, t('writing.eyebrow')),
      h('h1', {}, w.title),
      h('p', { class: 'lede' }, w.summary),
      h('div', { lang }, meta(w, lang)),
    ),
    trustedHtml('div', { class: 'case-study' }, w.html),
  );
}
