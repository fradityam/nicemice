import { PRICING } from './homeInfo';

// Search-engine text for the site's public pages: the title and meta description (also used
// as og:title / og:description), and each page's canonical address. One list, shared by:
//   - the Worker (worker/index.ts), which writes these into the HTML crawlers receive;
//   - the build (scripts/sitemap.ts), which lists exactly these pages in sitemap.xml;
//   - the app (src/main.tsx), which updates the tab title when moving between pages.
// Only pages that should appear in search belong here. The price follows PRICING, so the
// descriptions change along with the pricing section.

export const SITE_URL = 'https://nicemice.id';

const price = PRICING.regular.price;

export interface PageSeo {
  title: string;
  description: string;
}

export const PAGES: Record<string, PageSeo> = {
  '/': {
    title: 'Undangan Pernikahan Digital yang Kamu Banget | Nice Mice',
    description: `Undangan pernikahan digital dengan tema yang kamu banget. Kirim detail acara, tim Nice Mice siapkan sampai siap disebar. Mulai ${price}, cek temanya!`,
  },
  '/template/friends': {
    title: 'Undangan Pernikahan Digital Tema Friends | Nice Mice',
    description: `Undangan pernikahan digital tema Friends, dari Central Perk sampai kisah Monica & Chandler. Ada RSVP & amplop digital. Mulai ${price}, lihat demonya!`,
  },
  '/template/lalaland': {
    title: 'Undangan Pernikahan Digital Tema La La Land | Nice Mice',
    description: `Undangan pernikahan digital tema La La Land, romantis seperti kisah Mia & Sebastian. Ada musik, RSVP & amplop digital. Mulai ${price}, lihat demonya!`,
  },
  '/template/notebook': {
    title: 'Undangan Pernikahan Digital Tema The Notebook | Nice Mice',
    description: `Undangan pernikahan digital tema The Notebook, hangat seperti kisah Noah & Allie. Ada galeri foto, RSVP & amplop digital. Mulai ${price}, lihat demonya!`,
  },
  '/template/crazy-little-thing': {
    title: 'Undangan Digital Tema Crazy Little Thing Called Love | Nice Mice',
    description: `Undangan pernikahan digital tema Crazy Little Thing Called Love, semanis kisah Nam & P'Chon. Ada RSVP & amplop digital. Mulai ${price}, lihat demonya!`,
  },
};

/** The page's SEO text for a URL path, ignoring a trailing slash ('/template/friends/'). */
export function pageSeo(pathname: string): { path: string; seo: PageSeo } | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return Object.hasOwn(PAGES, path) ? { path, seo: PAGES[path] } : undefined;
}

/** The address search engines should index for this page. */
export const canonicalUrl = (path: string) => `${SITE_URL}${path}`;
