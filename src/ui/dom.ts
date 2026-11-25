type Attrs = Record<string, string | number | boolean | undefined>;

/** Tiny element helper: `h('a', { href: '/projects' }, 'Proyek')`. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children) if (c) el.append(c);
  return el;
}

/**
 * An element whose content is trusted HTML: the owner's own Markdown, rendered at build time.
 * Never use it for anything a visitor can type.
 */
export function trustedHtml<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs, html: string) {
  const el = h(tag, attrs);
  el.innerHTML = html;
  return el;
}

const teardowns = new Map<Element, (() => void)[]>();

/** Register cleanup for an element; the router runs it when the page leaves. */
export function onTeardown(el: Element, fn: () => void) {
  teardowns.set(el, [...(teardowns.get(el) ?? []), fn]);
}

export function teardown(root: Element) {
  for (const [el, fns] of teardowns) {
    if (!root.contains(el)) continue;
    for (const fn of fns) fn();
    teardowns.delete(el);
  }
}
