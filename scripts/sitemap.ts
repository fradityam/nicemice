import type { Plugin } from 'vite';
import { canonicalUrl, PAGES } from '../src/content/seo';

// Writes dist/sitemap.xml at build: the canonical address of every page in src/content/seo.ts
// (the homepage and the template demos), nothing else. No <lastmod>: the build date isn't
// when a page's content changed, and Google ignores a lastmod it can't trust.

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function sitemap(): Plugin {
  return {
    name: 'nicemice-sitemap',
    apply: 'build',
    generateBundle() {
      const urls = Object.keys(PAGES).map((path) => `  <url>\n    <loc>${escapeXml(canonicalUrl(path))}</loc>\n  </url>\n`);
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('')}</urlset>\n`,
      });
    },
  };
}
