import type { TemplateId } from '../invitations/types';
import { PRICING } from './homeInfo';

// Search-engine text for the site's public pages: the title and meta description (also used
// as og:title / og:description), and each page's canonical address. One list, shared by:
//   - the Worker (worker/index.ts), which writes these into the HTML crawlers receive;
//   - the build (scripts/blog/build.ts), which lists these pages in sitemap.xml, followed by
//     STATIC_PAGES and the blog's;
//   - the app (src/main.tsx), which updates the tab title when moving between pages.
// Only pages that should appear in search belong here. The price follows PRICING, so the
// descriptions change along with the pricing section.

export const SITE_URL = 'https://nicemice.id';

const price = PRICING.regular.price;

export interface PageSeo {
  title: string;
  description: string;
  /** On a template demo: which template, sent to Analytics as demo_view. */
  theme?: TemplateId;
}

export const PAGES: Record<string, PageSeo> = {
  '/': {
    title: 'Undangan Pernikahan Digital yang Kamu Banget | Nice Mice',
    description: `Undangan pernikahan digital dengan tema yang kamu banget. Kirim detail acara, tim Nice Mice siapkan sampai siap disebar. Mulai ${price}, cek temanya!`,
  },
  '/template/friends': {
    title: 'Undangan Pernikahan Digital Tema Friends | Nice Mice',
    description: `Undangan pernikahan digital tema Friends, dari Central Perk sampai kisah Monica & Chandler. Ada RSVP & amplop digital. Mulai ${price}, lihat demonya!`,
    theme: 'friends',
  },
  '/template/lalaland': {
    title: 'Undangan Pernikahan Digital Tema La La Land | Nice Mice',
    description: `Undangan pernikahan digital tema La La Land, romantis seperti kisah Mia & Sebastian. Ada musik, RSVP & amplop digital. Mulai ${price}, lihat demonya!`,
    theme: 'lalaland',
  },
  '/template/notebook': {
    title: 'Undangan Pernikahan Digital Tema The Notebook | Nice Mice',
    description: `Undangan pernikahan digital tema The Notebook, hangat seperti kisah Noah & Allie. Ada galeri foto, RSVP & amplop digital. Mulai ${price}, lihat demonya!`,
    theme: 'notebook',
  },
  '/template/crazy-little-thing': {
    title: 'Undangan Digital Tema Crazy Little Thing Called Love | Nice Mice',
    description: `Undangan pernikahan digital tema Crazy Little Thing Called Love, semanis kisah Nam & P'Chon. Ada RSVP & amplop digital. Mulai ${price}, lihat demonya!`,
    theme: 'crazylove',
  },
};

/**
 * Pages built outside the app as finished HTML, like the blog's (scripts/blog/build.ts writes
 * dist/<path>.html, with its own title, description and canonical, from content/pages/). The
 * Worker serves them as they are; the build lists them in sitemap.xml.
 */
export const STATIC_PAGES = new Set(['/tentang-kami']);

/**
 * Pages the app has (src/main.tsx) that stay out of search: templates hidden from the
 * catalog, and the "Segera Hadir" pages. They open as usual, marked noindex. A hidden
 * template moves to PAGES when it joins the catalog.
 */
export const NOINDEX_PATHS = new Set([
  '/template/cherry',
  '/template/sage',
  '/template/batik',
  '/template/noir',
  '/template/indigo',
  '/harga',
  '/faq',
  '/blog',
  '/testimoni',
]);

/** Old or mistyped addresses, sent on to the right page (301). */
export const REDIRECTS: Record<string, string> = {
  '/template/crazylove': '/template/crazy-little-thing',
};

/** '/template/friends/' → '/template/friends'; '/' stays '/'. */
export const normalizePath = (pathname: string) => (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname);

/** The page's SEO text for a URL path, ignoring a trailing slash ('/template/friends/'). */
export function pageSeo(pathname: string): { path: string; seo: PageSeo } | undefined {
  const path = normalizePath(pathname);
  return Object.hasOwn(PAGES, path) ? { path, seo: PAGES[path] } : undefined;
}

/** The address search engines should index for this page. */
export const canonicalUrl = (path: string) => `${SITE_URL}${path}`;
