// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Production origin — drives the sitemap, canonical + hreflang links
  // and absolute OG image URLs. CHANGE this if the final domain differs
  // from fottapopadic.sk (matches the atelier@fottapopadic.sk email).
  site: 'https://fottapopadic.sk',

  integrations: [
    // Generates /sitemap-index.xml + /sitemap-0.xml at build. The 404
    // pages carry noindex, so exclude them from the sitemap too.
    sitemap({
      filter: (page) => !/\/404\/?$/.test(page),
    }),
  ],

  // Hide the Astro Dev Toolbar — the floating "A" panel at the bottom
  // of the viewport in dev mode. Useful for Astro debugging but it
  // overlaps the design and gets in the way during visual QA.
  devToolbar: {
    enabled: false,
  },

  // Dev-only: let the dev server answer through a cloudflared quick
  // tunnel (phone previews over HTTPS — sensor APIs need a secure
  // context). Vite otherwise 403s any non-localhost Host header.
  vite: {
    server: {
      allowedHosts: ['.trycloudflare.com'],
    },
  },
});
