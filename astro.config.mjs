// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
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
