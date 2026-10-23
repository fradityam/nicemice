import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {sharePreviews} from './scripts/sharePreviews';
import {sitemap} from './scripts/sitemap';
import {notFoundPage} from './scripts/notFoundPage';
import {GA_MEASUREMENT_ID} from './src/config';
import {fontsHref} from './src/content/fonts';
import {PAGES} from './src/content/seo';

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Fills %HOME_TITLE% and %HOME_DESCRIPTION% in index.html with the homepage's text from
// src/content/seo.ts, so the default tags match it (and its price follows PRICING), and
// %GA_ID% with the Analytics ID from src/config.ts, and %HOME_FONTS% with the homepage's
// fonts (src/content/fonts.ts).
function homeMeta(): Plugin {
  return {
    name: 'nicemice-home-meta',
    transformIndexHtml: (html) =>
      html
        .replaceAll('%HOME_TITLE%', escapeHtml(PAGES['/'].title))
        .replaceAll('%HOME_DESCRIPTION%', escapeHtml(PAGES['/'].description))
        .replaceAll('%GA_ID%', escapeHtml(GA_MEASUREMENT_ID))
        .replaceAll('%HOME_FONTS%', escapeHtml(fontsHref('home'))),
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), homeMeta(), sharePreviews(), sitemap(), notFoundPage()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
