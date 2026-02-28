import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://melbamorph.github.io',
  base: '/zoningordinance',
  output: 'static',
  markdown: { headingIds: 'github' }
});

