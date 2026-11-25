import type { RouterHooks } from './router';

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Motion layer, kept out of the pages: a short fade between pages (Web Animations API, no
 * library needed) and reveals on scroll (CSS transitions toggled by one IntersectionObserver,
 * cheap on phones). With reduced motion there is none of it: content is simply there.
 */
export function createMotion(outlet: HTMLElement) {
  const reduce = reducedMotion();
  let observer: IntersectionObserver | null = null;
  let fade: Animation | null = null;

  // `.motion` hides [data-reveal] until revealed (see styles.css); never set with reduced motion.
  if (!reduce) document.documentElement.classList.add('motion');

  function reveal(el: HTMLElement, i: number) {
    // Elements arriving together are staggered.
    el.style.setProperty('--reveal-delay', `${Math.min(i, 8) * 70}ms`);
    el.classList.add('is-in');
  }

  function observeReveals(root: HTMLElement) {
    observer = new IntersectionObserver(
      (entries) => {
        let i = 0;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          reveal(e.target as HTMLElement, i++);
          observer?.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -6% 0px' },
    );
    // What is already on screen is revealed right away rather than waiting for the observer's
    // first callback, which some embedded/emulated viewports never deliver: content must never
    // stay hidden. The rest reveals as it scrolls in.
    let i = 0;
    for (const el of root.querySelectorAll<HTMLElement>('[data-reveal]')) {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) reveal(el, i++);
      else observer.observe(el);
    }
  }

  const hooks: Required<RouterHooks> = {
    leave() {
      if (reduce) return Promise.resolve();
      fade?.cancel();
      fade = outlet.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-8px)' }], {
        duration: 180,
        easing: 'ease-in',
        fill: 'forwards',
      });
      // A cancelled fade (a newer navigation) also counts as done.
      return fade.finished.then(
        () => undefined,
        () => undefined,
      );
    },
    unmount() {
      observer?.disconnect();
      observer = null;
    },
    enter(el, { transition }) {
      if (reduce) return;
      // Cancelling also clears a leave-fade that was overtaken (quick back-and-forth), so the
      // page can never stay hidden.
      fade?.cancel();
      fade = transition
        ? outlet.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], {
            duration: 300,
            easing: 'ease-out',
          })
        : null;
      observeReveals(el);
    },
    scrollTop() {
      window.scrollTo(0, 0);
    },
  };

  return { hooks };
}
