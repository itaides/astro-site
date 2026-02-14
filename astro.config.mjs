// @ts-check
import { defineConfig } from 'astro/config';
import { browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
  vite: {
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        targets: browserslistToTargets(browserslist('>= 0.25%, not dead')),
      },
    },
    build: {
      cssMinify: 'lightningcss',
    },
  },
});