import type { Lang } from '../content/types';
import { getLang, setLang, t, type MessageKey } from '../i18n';
import { h } from './dom';

/** Main navigation. Pages that do not exist yet (About, Writing, the lobby's Contact) arrive in later tickets. */
export const NAV_LINKS: { href: string; label: MessageKey }[] = [
  { href: '/', label: 'nav.home' },
  { href: '/projects', label: 'nav.projects' },
  { href: '/about', label: 'nav.about' },
  { href: '/writing', label: 'nav.writing' },
  { href: '/#contact', label: 'nav.contact' },
];

/** Which nav link marks the current page. Anchors on the lobby (/#contact) never do. */
export function activeNavHref(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '') || '/';
  const hit = NAV_LINKS.filter((l) => !l.href.includes('#')).find((l) =>
    l.href === '/' ? path === '/' : path === l.href || path.startsWith(l.href + '/'),
  );
  return hit?.href ?? null;
}

/**
 * Site header (brand, navigation, language switch) and footer. On phones the navigation folds
 * into a "Menu" button that opens a panel under the header; Esc or choosing a link closes it.
 * Call `render()` again after a language change.
 */
export function createShell(header: HTMLElement, footer: HTMLElement, opts: { onReplayIntro(): void }) {
  let activePath = location.pathname;
  let nav: HTMLElement;
  let toggle: HTMLButtonElement;
  let links: HTMLAnchorElement[] = [];

  function setOpen(open: boolean) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav?.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  function langSwitch(): HTMLElement {
    const current = getLang();
    const button = (lang: Lang) => {
      const b = h(
        'button',
        {
          type: 'button',
          class: 'lang-option',
          lang,
          'aria-pressed': String(lang === current),
          'aria-label': t(lang === 'id' ? 'lang.id' : 'lang.en'),
        },
        lang.toUpperCase(),
      );
      b.addEventListener('click', () => setLang(lang));
      return b;
    };
    return h('div', { class: 'lang-switch', role: 'group', 'aria-label': t('lang.label') }, button('id'), button('en'));
  }

  function markActive() {
    const active = activeNavHref(activePath);
    links.forEach((a, i) => {
      if (NAV_LINKS[i].href === active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function render() {
    const focusedLang = (document.activeElement as HTMLElement | null)?.closest('.lang-switch')
      ? getLang()
      : null;

    links = NAV_LINKS.map((l) => h('a', { href: l.href, 'data-link': true }, t(l.label)));
    nav = h(
      'nav',
      { class: 'site-nav', id: 'site-nav', 'aria-label': t('nav.label') },
      h('ul', { class: 'nav-list' }, ...links.map((a) => h('li', {}, a))),
    );
    nav.addEventListener('click', (e) => {
      if ((e.target as Element).closest('a')) setOpen(false);
    });
    toggle = h(
      'button',
      { class: 'menu-toggle', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'site-nav' },
      h('span', { class: 'menu-toggle-bars', 'aria-hidden': 'true' }),
      t('nav.menu'),
    );
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));

    header.replaceChildren(
      h(
        'a',
        { class: 'brand', href: '/', 'data-link': true, 'aria-label': t('nav.brandLabel') },
        h('span', { class: 'brand-name' }, 'STING', h('span', {}, 'TAW')),
        h('span', { class: 'brand-sub' }, 'Kanta Khanigara'),
      ),
      h('div', { class: 'header-actions' }, langSwitch(), toggle),
      nav,
    );
    markActive();
    // Keep keyboard focus on the language switch when it was just used.
    if (focusedLang) header.querySelector<HTMLElement>(`.lang-option[lang="${focusedLang}"]`)?.focus();

    const replay = h('button', { type: 'button', class: 'replay-intro' }, t('intro.replay'));
    replay.addEventListener('click', () => opts.onReplayIntro());
    footer.replaceChildren(
      h(
        'div',
        { class: 'site-footer-inner' },
        h('p', {}, `© ${new Date().getFullYear()} Kanta Khanigara · Stingtaw`),
        h('p', {}, t('site.role')),
        replay,
      ),
    );
    document.querySelector('.skip-link')!.textContent = t('site.skip');
  }

  render();

  return {
    render,
    /** Mark the link of the current page with aria-current. */
    setActive(pathname: string) {
      activePath = pathname;
      markActive();
      setOpen(false);
    },
  };
}
