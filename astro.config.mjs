// @ts-check

import cloudflare from '@astrojs/cloudflare';
import { defineConfig, passthroughImageService } from 'astro/config';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  image: {
    service: passthroughImageService(),
  },
  security: {
    checkOrigin: true,
  },
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
