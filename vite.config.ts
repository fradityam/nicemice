import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {sharePreviews} from './scripts/sharePreviews';
import {PRICING} from './src/content/homeInfo';

// Fills %PROMO_PRICE% in index.html (the meta description) with the current price, so it
// changes along with the pricing section.
function promoPrice(): Plugin {
  return {
    name: 'nicemice-promo-price',
    transformIndexHtml: (html) => html.replaceAll('%PROMO_PRICE%', PRICING.regular.price),
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), promoPrice(), sharePreviews()],
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
