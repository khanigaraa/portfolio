import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vitest/config';
import { createContent } from './src/content/content';
import { readContentFiles } from './src/content/node';

const CONTENT_DIR = fileURLToPath(new URL('./content', import.meta.url));
const PUBLIC_DIR = fileURLToPath(new URL('./public', import.meta.url));
const publicFileExists = (path: string) => existsSync(join(PUBLIC_DIR, path));
const VIRTUAL_ID = 'virtual:portfolio-content';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/**
 * Reads the owner's Markdown content at build time, validates it, and hands the browser the
 * parsed result as JSON (so no Markdown/YAML parser ships to visitors). Invalid content fails
 * the build, and shows as an error overlay in the dev server. Editing a content file reloads.
 */
function portfolioContent(): Plugin {
  return {
    name: 'portfolio:content',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return;
      const content = createContent(readContentFiles(CONTENT_DIR), { publicFileExists });
      const errors = content.validate();
      if (errors.length) this.error(`Konten tidak valid:\n- ${errors.join('\n- ')}`);
      // Watching the content folder is done in configureServer: addWatchFile on a folder
      // makes the dev server try to import it.
      return `export default ${JSON.stringify(content.data())};`;
    },
    configureServer(server) {
      server.watcher.add(CONTENT_DIR);
      server.watcher.on('all', (_event, file) => {
        if (!file.startsWith(CONTENT_DIR) || !file.endsWith('.md')) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

/**
 * The site's own address, for the link-preview tags (they need absolute URLs). On Vercel it is
 * taken from the production domain automatically; set SITE_URL to override it (e.g. once a
 * custom domain is attached). Locally it falls back to the preview server.
 */
export function siteUrl(env: NodeJS.ProcessEnv = process.env): string {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/+$/, '');
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'http://localhost:4173';
}

function linkPreview(): Plugin {
  return {
    name: 'portfolio:link-preview',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl()),
  };
}

export default defineConfig({
  // Absolute base: the site uses History API routes like /projects/<slug>.
  base: '/',
  plugins: [portfolioContent(), linkPreview()],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
