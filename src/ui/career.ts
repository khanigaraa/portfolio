import type { Certificate, Education, Job, Lang } from '../content/types';
import { t } from '../i18n';
import { formatMonth, formatPeriod } from './dates';
import { h } from './dom';
import { skillIcon } from './icons';

/** Work experience as a rank ladder: the newest (highest) role on top. */
export function experienceList(jobs: Job[], lang: Lang): HTMLElement {
  return h(
    'div',
    { class: 'jobs' },
    ...jobs.map((job) =>
      h(
        'article',
        { class: 'job', 'data-reveal': true },
        h('h3', { class: 'job-company' }, job.company, h('span', { class: 'job-place' }, job.place)),
        h(
          'ol',
          { class: 'rank-ladder', reversed: true },
          ...job.roles.map((r, i) =>
            h(
              'li',
              { class: `rank${i === 0 ? ' is-top' : ''}` },
              h('span', { class: 'rank-badge' }, t('lobby.rank', { n: job.roles.length - i })),
              h(
                'div',
                { class: 'rank-body' },
                h('h4', {}, r.title),
                h(
                  'p',
                  { class: 'rank-meta' },
                  h('time', {}, formatPeriod(r.start, r.end, lang)),
                  r.type ? h('span', {}, r.type) : null,
                ),
                r.points.length ? h('ul', { class: 'rank-points' }, ...r.points.map((p) => h('li', {}, p))) : null,
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

/** Certificates as achievement badges. */
export function certificateList(certs: Certificate[], lang: Lang): HTMLElement {
  return h(
    'ul',
    { class: 'badge-grid' },
    ...certs.map((c) =>
      h(
        'li',
        { class: 'achievement', 'data-reveal': true },
        skillIcon('medal'),
        h(
          'div',
          {},
          h('h3', {}, c.name),
          h(
            'p',
            { class: 'achievement-meta' },
            h('span', {}, c.issuer),
            h('time', {}, formatMonth(c.date, lang)),
          ),
          c.expires ? h('p', { class: 'achievement-valid' }, t('lobby.validUntil', { date: formatMonth(c.expires, lang) })) : null,
          c.note ? h('p', { class: 'achievement-note' }, c.note) : null,
          c.verifyUrl ? h('a', { href: c.verifyUrl, target: '_blank', rel: 'noopener' }, t('lobby.verify')) : null,
        ),
      ),
    ),
  );
}

export function educationList(schools: Education[], lang: Lang): HTMLElement {
  return h(
    'div',
    { class: 'schools' },
    ...schools.map((s) =>
      h(
        'article',
        { class: 'school', 'data-reveal': true },
        h(
          'div',
          { class: 'school-head' },
          skillIcon('school'),
          h(
            'div',
            {},
            h('h3', {}, s.degree),
            h('p', { class: 'rank-meta' }, h('span', {}, `${s.school}, ${s.place}`), h('time', {}, formatPeriod(s.start, s.end, lang))),
          ),
        ),
        h(
          'dl',
          { class: 'school-facts' },
          s.gpa ? h('div', {}, h('dt', {}, t('about.gpa')), h('dd', {}, s.gpa)) : null,
          s.thesis ? h('div', {}, h('dt', {}, t('about.thesis')), h('dd', {}, s.thesis)) : null,
        ),
        s.courses.length
          ? h(
              'div',
              {},
              h('p', { class: 'school-courses-label' }, t('about.courses')),
              h('ul', { class: 'stack' }, ...s.courses.map((c) => h('li', {}, c))),
            )
          : null,
      ),
    ),
  );
}
