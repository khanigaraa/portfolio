/** Original line icons (24×24, stroke = currentColor) for the skill groups. */
const PATHS: Record<string, string> = {
  // A rack of servers.
  infra:
    '<rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="18" height="7" rx="1"/><path d="M7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6"/>',
  // Code brackets.
  web: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/>',
  // A database cylinder.
  database:
    '<ellipse cx="12" cy="5.5" rx="8" ry="2.5"/><path d="M4 5.5v13c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-13M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5"/>',
  // Sliders.
  tools:
    '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  // Speech bubbles.
  languages: '<path d="M4 5h11v8H8l-4 3V5Z"/><path d="M15 9h5v8l-3-2h-6v-2"/>',
  // A medal (certificates).
  medal: '<circle cx="12" cy="14" r="6"/><path d="m8.5 9.2-3-6.2h4L12 8l2.5-5h4l-3 6.2M12 11.5l.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3.9-1.8Z"/>',
  // A graduation cap (education).
  school: '<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
  // Fallback: a star.
  default: '<path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z"/>',
};

export function skillIcon(groupId: string): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'icon');
  svg.innerHTML = PATHS[groupId] ?? PATHS.default;
  return svg;
}
