import data from 'virtual:portfolio-content';
import { createQueries } from './queries';

// Parsed and validated at build time by the Vite plugin in vite.config.ts.
export const content = createQueries(data);
export * from './types';
