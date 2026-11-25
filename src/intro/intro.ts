import { t } from '../i18n';
import { h } from '../ui/dom';
import { AUTO, COUNTDOWN_MS, next, type IntroEvent, type IntroState } from './machine';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Plays the matchmaking intro over the page (which is already rendered underneath, so the content
 * is there for search engines and for anyone who skips). Resolves when the visitor reaches the
 * lobby. Everything outside the intro is inert meanwhile, so keyboard focus stays inside it.
 */
export function runIntro(opts: { name: string; nickname: string; role: string }): Promise<void> {
  return new Promise((resolve) => {
    let state: IntroState = 'idle';
    let autoTimer = 0;
    let tickTimer = 0;

    const outside = [...document.body.children].filter((el) => !el.classList.contains('intro')) as HTMLElement[];
    for (const el of outside) el.inert = true;
    document.documentElement.classList.add('intro-open');

    // --- Build the overlay -------------------------------------------------------------------
    const skip = h(
      'button',
      { type: 'button', class: 'intro-skip' },
      t('intro.skip'),
      h('kbd', { 'aria-hidden': 'true' }, 'Esc'),
    );
    const find = h(
      'button',
      { type: 'button', class: 'intro-find' },
      h('span', { class: 'intro-find-main' }, t('intro.find')),
      h('span', { class: 'intro-find-sub' }, t('intro.findSub')),
    );
    const timer = h('span', { class: 'intro-timer' }, '00:00');
    const searching = h(
      'div',
      { class: 'intro-searching' },
      h('div', { class: 'intro-radar', 'aria-hidden': 'true' }),
      h('p', { class: 'intro-searching-text' }, t('intro.searching')),
      timer,
    );
    const queue = h(
      'div',
      { class: 'intro-panel intro-queue', 'data-for': 'idle searching' },
      h('p', { class: 'intro-mode' }, t('intro.mode')),
      find,
      searching,
    );

    const count = h('span', { class: 'intro-count' }, String(COUNTDOWN_MS / 1000));
    const accept = h('button', { type: 'button', class: 'intro-accept' }, t('intro.accept'));
    const found = h(
      'div',
      { class: 'intro-panel intro-found', 'data-for': 'found' },
      h('p', { class: 'intro-found-title' }, t('intro.found')),
      h('p', { class: 'intro-found-sub' }, t('intro.foundSub')),
      h('div', { class: 'intro-ring', 'aria-hidden': 'true' }, count),
      accept,
      h('p', { class: 'intro-hint' }, t('intro.acceptHint')),
    );

    const loading = h(
      'div',
      { class: 'intro-panel intro-loading', 'data-for': 'loading' },
      h('p', { class: 'intro-loading-nick' }, opts.nickname),
      h('p', { class: 'intro-loading-name' }, opts.name),
      h('p', { class: 'intro-loading-role' }, opts.role),
      h('div', { class: 'intro-bar', 'aria-hidden': 'true' }, h('span')),
      h('p', { class: 'intro-loading-text' }, t('intro.loading', { name: opts.nickname })),
      h('p', { class: 'intro-tip' }, t('intro.tip')),
    );

    const live = h('p', { class: 'visually-hidden', 'aria-live': 'polite' });
    const overlay = h(
      'div',
      { class: 'intro', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('intro.label'), 'data-state': state },
      h('p', { class: 'intro-brand', 'aria-hidden': 'true' }, 'STING', h('span', {}, 'TAW')),
      skip,
      queue,
      found,
      loading,
      live,
    );
    document.body.append(overlay);

    // --- Behaviour ---------------------------------------------------------------------------
    function show(s: IntroState) {
      overlay.dataset.state = s;
      for (const panel of overlay.querySelectorAll<HTMLElement>('.intro-panel'))
        panel.hidden = !panel.dataset.for!.split(' ').includes(s);
      searching.hidden = s !== 'searching';
      find.hidden = s !== 'idle';
    }

    function startTicks(s: IntroState) {
      clearInterval(tickTimer);
      let n = 0;
      if (s === 'searching') {
        timer.textContent = '00:00';
        tickTimer = window.setInterval(() => (timer.textContent = `00:${pad(++n)}`), 1000);
      } else if (s === 'found') {
        const total = COUNTDOWN_MS / 1000;
        count.textContent = String(total);
        tickTimer = window.setInterval(() => (count.textContent = String(Math.max(0, total - ++n))), 1000);
      }
    }

    function enter(s: IntroState) {
      state = s;
      clearTimeout(autoTimer);
      if (s === 'done') return finish();
      show(s);
      startTicks(s);
      const auto = AUTO[s];
      if (auto) autoTimer = window.setTimeout(() => send(auto.event), auto.after);
      if (s === 'idle') find.focus();
      if (s === 'searching') live.textContent = t('intro.searching');
      if (s === 'found') {
        live.textContent = t('intro.found');
        accept.focus();
      }
      if (s === 'loading') live.textContent = t('intro.loading', { name: opts.nickname });
    }

    function send(event: IntroEvent) {
      const to = next(state, event);
      if (to !== state) enter(to);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        send('SKIP');
      } else if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) {
        // Enter on a focused button already clicks it.
        send(state === 'idle' ? 'FIND_MATCH' : 'ACCEPT');
      }
    }

    function finish() {
      clearInterval(tickTimer);
      document.removeEventListener('keydown', onKey);
      overlay.dataset.state = 'done';
      overlay.classList.add('is-leaving');
      for (const el of outside) el.inert = false;
      document.documentElement.classList.remove('intro-open');
      window.setTimeout(() => overlay.remove(), 350);
      const heading = document.querySelector<HTMLElement>('main h1');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
      resolve();
    }

    skip.addEventListener('click', () => send('SKIP'));
    find.addEventListener('click', () => send('FIND_MATCH'));
    accept.addEventListener('click', () => send('ACCEPT'));
    document.addEventListener('keydown', onKey);
    enter('idle');
  });
}
