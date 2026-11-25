import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { ContentFiles } from './types';

/** Reads every Markdown file under `dir` (Node only: the build and the tests). */
export function readContentFiles(dir: string): ContentFiles {
  const files: ContentFiles = {};
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const full = join(entry.parentPath, entry.name);
    files[relative(dir, full).split(sep).join('/')] = readFileSync(full, 'utf8');
  }
  return files;
}
