import { t } from './i18n';
import { teardown } from './ui/dom';

export interface RouteContext {
  url: URL;
  params: Record<string, string>;
  navigate(to: string, opts?: { replace?: boolean }): void;
}

export type Page = (ctx: RouteContext) => HTMLElement;

/** Lifecycle hooks so motion (ticket 02) stays out of the router. */
export interface RouterHooks {
  leave?(): Promise<void>;
  unmount?(): void;
  enter?(el: HTMLElement, info: { url: URL; transition: boolean }): void;
  scrollTop?(): void;
}

interface Route {
  pattern: RegExp;
  keys: string[];
  page: Page;
}


/** Scroll to the element a `#hash` names (if any) and move focus there for keyboard users. */
function scrollToHash(hash: string) {
  const el = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!el) return;
  el.scrollIntoView();
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/**
 * Minimal History API router (same shape as the one in datworks). Pages are pure functions
 * returning an element; links opt in with `data-link`; back/forward re-render via popstate.
 * A page can set `data-title` on its root element to name the browser tab.
 */
export function createRouter(outlet: HTMLElement, notFound: Page, hooks: RouterHooks = {}) {
  const routes: Route[] = [];
  let renderedPath: string | null = null;
  let renderedKey: string | null = null;
  let seq = 0;
  let done = 0;

  function add(path: string, page: Page) {
    const keys: string[] = [];
    const pattern = new RegExp(
      '^' + path.replace(/\/:([a-z]+)/gi, (_, k: string) => (keys.push(k), '/([^/]+)')) + '/?$',
    );
    routes.push({ pattern, keys, page });
    return api;
  }

  function match(pathname: string): { page: Page; params: Record<string, string> } {
    for (const r of routes) {
      const m = r.pattern.exec(pathname);
      if (m) {
        const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
        return { page: r.page, params };
      }
    }
    return { page: notFound, params: {} };
  }

  async function render() {
    if (location.pathname + location.search === renderedKey && done === seq) return;
    const token = ++seq;
    const pathChanged = renderedPath !== null && renderedPath !== location.pathname;

    if (pathChanged && hooks.leave) await hooks.leave();
    if (token !== seq) return;

    const url = new URL(location.href);
    const { page, params } = match(url.pathname);
    const el = page({ url, params, navigate });

    hooks.unmount?.();
    if (outlet.firstElementChild) teardown(outlet.firstElementChild);
    outlet.replaceChildren(el);
    document.title = el.dataset.title ? `${el.dataset.title} · Kanta Khanigara` : t('site.title');

    if (url.hash) scrollToHash(url.hash);
    else if (pathChanged) {
      if (hooks.scrollTop) hooks.scrollTop();
      else window.scrollTo(0, 0);
      outlet.focus({ preventScroll: true });
    }
    renderedPath = url.pathname;
    renderedKey = url.pathname + url.search;
    done = token;
    hooks.enter?.(el, { url, transition: pathChanged });
  }

  function navigate(to: string, opts: { replace?: boolean } = {}) {
    const target = new URL(to, location.href);
    const samePage = target.pathname + target.search === location.pathname + location.search;
    if (samePage && target.hash) {
      // A section of the page already on screen (e.g. /#contact from the lobby): just scroll.
      if (target.href !== location.href) history[opts.replace ? 'replaceState' : 'pushState'](null, '', target);
      scrollToHash(target.hash);
      return;
    }
    if (target.href === location.href) return;
    history[opts.replace ? 'replaceState' : 'pushState'](null, '', target);
    void render();
  }

  function onClick(e: MouseEvent) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-link]');
    if (!a || a.target || a.origin !== location.origin) return;
    e.preventDefault();
    navigate(a.href);
  }

  function start() {
    history.scrollRestoration = 'manual';
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', () => void render());
    void render();
  }

  /** Re-render the current page in place (e.g. after a language change), keeping the scroll position. */
  function refresh() {
    renderedKey = null;
    const y = window.scrollY;
    void render().then(() => window.scrollTo(0, y));
  }

  const api = { add, start, navigate, refresh };
  return api;
}
