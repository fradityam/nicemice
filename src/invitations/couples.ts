import type { Invitation } from './types';

// Every couple is one file in src/couples/: radit-ratu.ts is nicemice.id/radit-ratu. Files
// whose name starts with "_" are examples to copy from and never get a page.
//
// Each file is loaded only when its page is opened, so one couple's details never ship with
// another couple's invitation (the list of slugs itself is in the main bundle).

const files = import.meta.glob<Invitation>('../couples/*.ts', { import: 'default' });

/** Page names the site itself uses; a couple can't have these. */
const RESERVED = new Set(['template', 'harga', 'faq', 'blog', 'testimoni', 'couples', 'assets', 'index']);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const loaders = new Map<string, () => Promise<Invitation>>();
for (const [path, load] of Object.entries(files)) {
  const slug = path.slice('../couples/'.length, -'.ts'.length);
  if (slug.startsWith('_')) continue;
  if (!SLUG.test(slug) || RESERVED.has(slug)) {
    console.error(`src/couples/${slug}.ts: use lowercase letters, numbers and dashes, and not one of: ${[...RESERVED].join(', ')}`);
    continue;
  }
  loaders.set(slug, load);
}

/** The couple's invitation, or null when no couple has this slug. */
export function loadCouple(slug: string): Promise<Invitation | null> {
  return loaders.get(slug)?.() ?? Promise.resolve(null);
}

/** Where a couple's photos and music live: public/couples/<slug>/<file>. */
export const coupleFiles = (slug: string) => (file: string) => `${import.meta.env.BASE_URL}couples/${slug}/${file}`;
