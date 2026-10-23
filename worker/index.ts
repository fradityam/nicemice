import { canonicalUrl, pageSeo } from '../src/content/seo';
import { guestNameFromSearch, MAX_GUEST_NAME } from '../src/invitations/guestNameText';
import ogDataJson from './og-data.json';
import type { OgData } from './ogData';

// The "nicemice" Worker. Every page URL comes here first (see run_worker_first in
// wrangler.jsonc); files go straight to the static assets. Crawlers (Google, WhatsApp) read
// the HTML without running JavaScript, so the app can't set these tags itself:
//   - the homepage and template demos (src/content/seo.ts) get their own title, description
//     and canonical;
//   - a couple's page (nicemice.id/<slug>?to=<guest>) gets that couple's og: tags, so a
//     WhatsApp link shows their names, date and photo, and stays out of search.
// Everything else gets the default tags in index.html.

interface Env {
  ASSETS: Fetcher;
}

const ogData = ogDataJson as OgData;

/** WhatsApp cuts long descriptions; the guest's name gives way first. */
const MAX_DESCRIPTION = 150;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD') return env.ASSETS.fetch(request);

    const site = pageSeo(url.pathname);
    if (site) {
      const page = await env.ASSETS.fetch(new Request(new URL('/', url), request));
      if (!page.ok) return page;
      const canonical = canonicalUrl(site.path);
      return withTags(page, site.seo.title, {
        'og:title': site.seo.title,
        'og:description': site.seo.description,
        'og:url': canonical,
        description: site.seo.description,
      }, [`<link rel="canonical" href="${escapeAttr(canonical)}" />`]);
    }

    const slug = url.pathname.match(/^\/([^/]+)\/?$/)?.[1];
    const couple = slug && Object.hasOwn(ogData, slug) ? ogData[slug] : undefined;
    if (!couple) return env.ASSETS.fetch(request);

    const page = await env.ASSETS.fetch(new Request(new URL('/', url), request));
    if (!page.ok) return page;

    const room = MAX_DESCRIPTION - `${couple.greeting} , ${couple.invited}`.length;
    const guest = guestNameFromSearch(url.searchParams, Math.max(10, Math.min(MAX_GUEST_NAME, room))) ?? couple.guestFallback;
    const description = `${couple.greeting} ${guest}, ${couple.invited}`;
    const image = new URL(couple.image.path, url).href;

    return withTags(page, couple.title, {
      'og:title': couple.title,
      'og:description': description,
      'og:url': url.href,
      'og:image': image,
      'og:image:secure_url': image,
      'og:image:width': String(couple.image.width),
      'og:image:height': String(couple.image.height),
      'og:image:alt': couple.title,
      'twitter:card': couple.image.width > couple.image.height ? 'summary_large_image' : 'summary',
      description,
    }, ['<meta name="robots" content="noindex, nofollow" />']);
  },
} satisfies ExportedHandler<Env>;

/**
 * index.html with its <title> replaced, the <meta> tags named in `content` set (og: ones by
 * property, the rest by name), and `extra` tags added at the end of <head>.
 */
function withTags(page: Response, title: string, content: Record<string, string>, extra: string[]) {
  const missing = { ...content };
  const set = (el: Element) => {
    const key = el.getAttribute('property') ?? el.getAttribute('name');
    if (key && key in missing) {
      el.setAttribute('content', missing[key]);
      delete missing[key];
    }
  };

  return new HTMLRewriter()
    .on('title', { element: (el) => void el.setInnerContent(title) })
    .on('meta[property], meta[name]', { element: set })
    .on('head', {
      // Tags index.html doesn't have (og:url, the image size…) go at the end of <head>.
      element: (el) =>
        el.onEndTag((end) => {
          for (const [key, value] of Object.entries(missing)) {
            const attr = key.startsWith('og:') ? 'property' : 'name';
            end.before(`<meta ${attr}="${key}" content="${escapeAttr(value)}" />`, { html: true });
          }
          for (const tag of extra) end.before(tag, { html: true });
        }),
    })
    .transform(new Response(page.body, page));
}

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
