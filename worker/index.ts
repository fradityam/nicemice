import { fontsHref, type FontSet } from '../src/content/fonts';
import { canonicalUrl, normalizePath, NOINDEX_PATHS, pageSeo, REDIRECTS, STATIC_PAGES } from '../src/content/seo';
import { HOMEPAGE_JSON_LD } from '../src/content/structuredData';
import { guestNameFromSearch, MAX_GUEST_NAME } from '../src/invitations/guestNameText';
import ogDataJson from './og-data.json';
import type { OgData } from './ogData';

// The "nicemice" Worker. Every page URL comes here first (see run_worker_first in
// wrangler.jsonc); files go straight to the static assets, and a missing file gets 404.html
// from there. Crawlers (Google, WhatsApp) read the HTML without running JavaScript, so the
// app can't set these tags itself. Every page is index.html, with:
//   - the homepage and template demos (src/content/seo.ts): their own title, description and
//     canonical, and on the homepage its structured data;
//   - a couple's page (nicemice.id/<slug>?to=<guest>): that couple's og: tags, so a WhatsApp
//     link shows their names, date and photo, and noindex;
//   - the app's other pages (hidden templates, "Segera Hadir"): noindex;
//   - any other address: a 404 status and noindex, and the app shows its "not found" page.
// Each also gets only the fonts that page uses (src/content/fonts.ts).
// Old addresses in REDIRECTS get a 301 to the right page. The blog's published pages and
// STATIC_PAGES (/tentang-kami) are finished HTML files with their own tags
// (scripts/blog/build.ts), served as they are.

interface Env {
  ASSETS: Fetcher;
}

const ogData = ogDataJson as OgData;

/** WhatsApp cuts long descriptions; the guest's name gives way first. */
const MAX_DESCRIPTION = 150;

const NOINDEX = '<meta name="robots" content="noindex" />';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD') return env.ASSETS.fetch(request);

    const path = normalizePath(url.pathname);
    if (Object.hasOwn(REDIRECTS, path)) {
      return Response.redirect(new URL(REDIRECTS[path] + url.search, url).href, 301);
    }

    if (path === '/blog' || path.startsWith('/blog/') || STATIC_PAGES.has(path)) {
      const builtPage = await staticFile(request, url, path, env);
      if (builtPage) return builtPage;
    }

    const page = await env.ASSETS.fetch(new Request(new URL('/', url), request));
    if (!page.ok) return page;

    const site = pageSeo(path);
    if (site) {
      const canonical = canonicalUrl(site.path);
      const extra = [`<link rel="canonical" href="${escapeAttr(canonical)}" />`];
      if (site.path === '/') extra.push(`<script type="application/ld+json">${HOMEPAGE_JSON_LD}</script>`);
      return withTags(page, {
        title: site.seo.title,
        fonts: site.seo.theme ?? 'home',
        content: {
          'og:title': site.seo.title,
          'og:description': site.seo.description,
          'og:url': canonical,
          description: site.seo.description,
        },
        extra,
      });
    }

    if (NOINDEX_PATHS.has(path)) return withTags(page, { fonts: 'other', extra: [NOINDEX] });

    const slug = path.match(/^\/([^/]+)$/)?.[1];
    const couple = slug && Object.hasOwn(ogData, slug) ? ogData[slug] : undefined;
    if (!couple) return withTags(page, { fonts: 'other', extra: [NOINDEX], status: 404 });

    const room = MAX_DESCRIPTION - `${couple.greeting} , ${couple.invited}`.length;
    const guest = guestNameFromSearch(url.searchParams, Math.max(10, Math.min(MAX_GUEST_NAME, room))) ?? couple.guestFallback;
    const description = `${couple.greeting} ${guest}, ${couple.invited}`;
    const content: Record<string, string> = {
      'og:title': couple.title,
      'og:description': description,
      'og:url': url.href,
      description,
    };
    // Without a photo of their own, the couple's link shows the default image in index.html.
    if (couple.image) {
      const image = new URL(couple.image.path, url).href;
      Object.assign(content, {
        'og:image': image,
        'og:image:secure_url': image,
        'og:image:width': String(couple.image.width),
        'og:image:height': String(couple.image.height),
        'og:image:alt': couple.title,
        'twitter:card': couple.image.width > couple.image.height ? 'summary_large_image' : 'summary',
      });
    }
    return withTags(page, { title: couple.title, fonts: couple.template, content, extra: ['<meta name="robots" content="noindex, nofollow" />'] });
  },
} satisfies ExportedHandler<Env>;

/**
 * A page built as finished HTML (scripts/blog/build.ts: dist/blog.html, dist/blog/<slug>.html,
 * dist/tentang-kami.html) exactly as it is: it has its own tags. '/blog/<slug>/' gets a 301 to
 * '/blog/<slug>' (Cloudflare's own redirect for it would be a 307); '/blog/<slug>.html' never
 * reaches the Worker and gets Cloudflare's 307. Undefined when there's no such page: an unknown
 * article gets the usual 404, and /blog, before anything is published, the app's "Segera
 * Hadir" page, as before.
 */
async function staticFile(request: Request, url: URL, path: string, env: Env): Promise<Response | undefined> {
  const file = await env.ASSETS.fetch(new Request(new URL(path, url), request));
  if (!file.ok && file.status !== 304) {
    await file.body?.cancel();
    return undefined;
  }
  if (url.pathname === path) return file;
  await file.body?.cancel();
  return Response.redirect(new URL(path + url.search, url).href, 301);
}

/**
 * index.html with its <title> replaced (when given), the page's fonts, the <meta> tags named
 * in `content` set (og: ones by property, the rest by name), `extra` tags added at the end of
 * <head>, and the given status.
 */
function withTags(
  page: Response,
  {
    title,
    fonts,
    content = {},
    extra = [],
    status = page.status,
  }: { title?: string; fonts: FontSet; content?: Record<string, string>; extra?: string[]; status?: number },
) {
  const missing = { ...content };
  const set = (el: Element) => {
    const key = el.getAttribute('property') ?? el.getAttribute('name');
    if (key && key in missing) {
      el.setAttribute('content', missing[key]);
      delete missing[key];
    }
  };

  let rewriter = new HTMLRewriter();
  if (title !== undefined) rewriter = rewriter.on('title', { element: (el) => void el.setInnerContent(title) });
  return rewriter
    .on('link[data-fonts]', { element: (el) => void el.setAttribute('href', fontsHref(fonts)) })
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
    .transform(new Response(page.body, { status, statusText: status === 404 ? 'Not Found' : page.statusText, headers: page.headers }));
}

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
