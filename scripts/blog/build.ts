import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import matter from 'gray-matter';
import { parse as parseYaml } from 'yaml';
import { TESTIMONIALS } from '../../src/content/homeInfo';
import { canonicalUrl, PAGES, SITE_URL, STATIC_PAGES } from '../../src/content/seo';
import type { AboutPageData, ArticleCard, Author, Image, SiteAssets } from '../../src/blog/types';
import { aboutJsonLd, articleJsonLd, blogIndexJsonLd } from './jsonLd';
import { imageSize, internalPath, PUBLIC_DIR, renderBody, type Issues, type RenderedBody } from './markdown';
import { aboutPageSchema, authorsSchema, blogIndexSchema, describeZodError, frontmatterSchema, SLUG, type Frontmatter } from './schema';

// The blog, built after the app (`npm run build`, see package.json): every article in
// content/blog/<slug>.md becomes dist/blog/<slug>.html, a finished page with its own tags and
// structured data, and the list of them dist/blog.html; content/pages/tentang-kami.yaml
// becomes dist/tentang-kami.html (STATIC_PAGES); then sitemap.xml. Drafts are checked but
// never written. With nothing published there's no dist/blog.html, and /blog stays the app's
// "Segera Hadir" page (worker/index.ts).
//
// Problems that would put a broken page online stop the build; the rest are printed as
// warnings. docs/blog.md lists them all.

const DIST = path.resolve('dist');
const BLOG_DIR = path.resolve('content/blog');
const IMAGE_DIRS = ['images/blog', 'images/about'];
const ABOUT_FILE = path.resolve('content/pages/tentang-kami.yaml');
const ABOUT_PATH = '/tentang-kami';
const SSR_ENTRY = path.resolve('build/blog-ssr/render.js');

const TITLE_SUFFIX = ' | Nice Mice';
const MAX_TITLE = 60;
const DESCRIPTION = { min: 140, max: 160 };
const MAX_IMAGE_BYTES = 300 * 1024;
const MIN_INTERNAL_LINKS = 2;
const WORDS_PER_MINUTE = 200;
const MAX_RELATED = 3;
const IMAGE_FILE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+$/;

const errors: string[] = [];
const warnings: string[] = [];
const issuesFor = (where: string): Issues => ({
  fail: (message) => errors.push(`${where}: ${message}`),
  warn: (message) => warnings.push(`${where}: ${message}`),
});

interface Article {
  slug: string;
  file: string;
  fm: Frontmatter;
  body: RenderedBody;
  cover: Image;
  issues: Issues;
}

const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
const relative = (file: string) => path.relative(process.cwd(), file).replaceAll('\\', '/');
/** '/tentang-kami#ratu' → '/tentang-kami'; '/blog/' → '/blog'; '/#tema' → '/'. */
const pagePath = (url: string) => {
  const p = url.replace(/[?#].*$/, '') || '/';
  return p.length > 1 ? p.replace(/\/+$/, '') : p;
};

function checkLengths(issues: Issues, title: string, description: string) {
  const fullTitle = title + TITLE_SUFFIX;
  if (fullTitle.length > MAX_TITLE) issues.warn(`"${fullTitle}" is ${fullTitle.length} characters; search results show about ${MAX_TITLE}`);
  if (description.length < DESCRIPTION.min || description.length > DESCRIPTION.max) {
    issues.warn(`description is ${description.length} characters; aim for ${DESCRIPTION.min}-${DESCRIPTION.max}`);
  }
}

// --- Authors and the blog index's text ------------------------------------------------------

const authorsFile = path.resolve('content/authors.json');
const authorsResult = authorsSchema.safeParse(readJson(authorsFile));
const authors = new Map<string, Author>();
if (!authorsResult.success) describeZodError(authorsResult.error).forEach((m) => issuesFor(relative(authorsFile)).fail(m));
else {
  for (const author of authorsResult.data.authors) {
    if (authors.has(author.slug)) issuesFor(relative(authorsFile)).fail(`author "${author.slug}" is listed twice`);
    authors.set(author.slug, author);
  }
}

const indexFile = path.resolve('content/blog.json');
const indexResult = blogIndexSchema.safeParse(readJson(indexFile));
if (!indexResult.success) describeZodError(indexResult.error).forEach((m) => issuesFor(relative(indexFile)).fail(m));

// --- /tentang-kami --------------------------------------------------------------------------

const aboutIssues = issuesFor(relative(ABOUT_FILE));
let aboutYaml: unknown;
try {
  aboutYaml = parseYaml(fs.readFileSync(ABOUT_FILE, 'utf8'));
} catch (e) {
  aboutIssues.fail(`isn't valid YAML: ${(e as Error).message}`);
}
const aboutResult = aboutYaml === undefined ? undefined : aboutPageSchema.safeParse(aboutYaml);
if (aboutResult && !aboutResult.success) describeZodError(aboutResult.error).forEach((m) => aboutIssues.fail(m));
const about = aboutResult?.success ? aboutResult.data : undefined;

/** An image on /tentang-kami, with its size; the build stops when the file is missing. */
async function aboutImage(src: string, alt: string, where: string): Promise<Image> {
  const size = await imageSize(src);
  if (!size) aboutIssues.fail(`${where}: ${src} not found in public${src}`);
  return { src, alt, width: size?.width ?? 0, height: size?.height ?? 0 };
}

let aboutPage: Omit<AboutPageData, 'head' | 'assets'> | undefined;
let aboutOgImage: Image | undefined;
if (about) {
  checkLengths(aboutIssues, about.meta.title, about.meta.description);
  const slugs = about.team.people.map((p) => p.slug);
  for (const slug of new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))) aboutIssues.fail(`team: "${slug}" is listed twice`);
  const testimonials = about.testimonials.couples.flatMap((couple) => {
    const found = TESTIMONIALS.find((t) => t.couple === couple);
    if (!found) aboutIssues.fail(`testimonials: no "${couple}" in TESTIMONIALS (src/content/homeInfo.ts: ${TESTIMONIALS.map((t) => t.couple).join(', ')})`);
    return found ? [found] : [];
  });
  aboutOgImage = await aboutImage(about.meta.ogImage, about.hero.photoAlt, 'meta.ogImage');
  if (aboutOgImage.width && (aboutOgImage.width !== 1200 || aboutOgImage.height !== 630)) {
    aboutIssues.warn(`meta.ogImage is ${aboutOgImage.width}x${aboutOgImage.height}; link previews expect 1200x630`);
  }
  aboutPage = {
    hero: { ...about.hero, photo: await aboutImage(about.hero.photo, about.hero.photoAlt, 'hero.photo') },
    timeline: about.timeline,
    values: about.values,
    team: {
      heading: about.team.heading,
      people: await Promise.all(
        about.team.people.map(async ({ photo, photoAlt, ...person }, i) => {
          if (!photo) return person;
          const image = await aboutImage(photo, photoAlt!, `team.people.${i}.photo`);
          if (image.width && image.width !== image.height) aboutIssues.warn(`team.people.${i}.photo is ${image.width}x${image.height}; the round avatar needs a square photo`);
          return { ...person, photo: image };
        }),
      ),
    },
    facts: about.facts,
    testimonials: { heading: about.testimonials.heading, items: testimonials },
    closing: about.closing,
  };
}

// --- Articles: frontmatter, then the Markdown ------------------------------------------------

const articles: Article[] = [];
const seenSlugs = new Map<string, string>();
for (const name of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md')).sort()) {
  const file = path.join(BLOG_DIR, name);
  const issues = issuesFor(relative(file));
  const slug = name.slice(0, -'.md'.length);
  if (!SLUG.test(slug)) issues.fail(`the file name is the address (/blog/${slug}) and must be lowercase letters, digits and single hyphens`);
  const key = slug.toLowerCase();
  if (seenSlugs.has(key)) issues.fail(`same slug as ${seenSlugs.get(key)}`);
  seenSlugs.set(key, relative(file));

  const source = fs.readFileSync(file, 'utf8');
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(source);
  } catch (e) {
    issues.fail(`frontmatter isn't valid YAML: ${(e as Error).message}`);
    continue;
  }
  const firstLine = source.split('\n').length - parsed.content.split('\n').length + 1;
  const result = frontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    describeZodError(result.error).forEach((m) => issues.fail(m));
    await renderBody(parsed.content, issues, firstLine); // the body's problems too, all in one go
    continue;
  }
  const fm = result.data;
  if (fm.updated && fm.updated < fm.date) issues.warn(`updated (${fm.updated}) is before date (${fm.date})`);
  checkLengths(issues, fm.title, fm.description);

  const size = await imageSize(fm.cover);
  if (!size) issues.fail(`cover ${fm.cover} not found in public${fm.cover}`);
  const body = await renderBody(parsed.content, issues, firstLine);
  if (body.internalLinks.length < MIN_INTERNAL_LINKS) {
    issues.warn(`the body has ${body.internalLinks.length} internal link(s); aim for at least ${MIN_INTERNAL_LINKS}`);
  }
  articles.push({ slug, file, fm, body, cover: { src: fm.cover, alt: fm.coverAlt, width: size?.width ?? 0, height: size?.height ?? 0 }, issues });
}

const bySlug = new Map(articles.map((a) => [a.slug, a]));
const published = articles
  .filter((a) => !a.fm.draft)
  .sort((a, b) => b.fm.date.localeCompare(a.fm.date) || a.fm.title.localeCompare(b.fm.title));
const isPublished = (slug: string) => bySlug.get(slug)?.fm.draft === false;

// --- Checks across articles ------------------------------------------------------------------

const pillars = new Map<string, Article[]>();
for (const article of articles) {
  const { fm, issues } = article;
  for (const slug of fm.author) {
    if (!authors.has(slug)) issues.fail(`author "${slug}" isn't in content/authors.json (${[...authors.keys()].join(', ')})`);
  }
  if (new Set(fm.author).size < fm.author.length) issues.fail('author lists someone twice');
  for (const slug of fm.related ?? []) {
    if (!bySlug.has(slug)) issues.fail(`related: no article "${slug}" (content/blog/${slug}.md)`);
    else if (slug === article.slug) issues.fail(`related: lists itself`);
    else if (!fm.draft && !isPublished(slug)) issues.warn(`related: "${slug}" is a draft, left out until it's published`);
  }
  if (fm.pillar) pillars.set(fm.cluster, [...(pillars.get(fm.cluster) ?? []), article]);
}
for (const [cluster, list] of pillars) {
  if (list.length > 1) {
    issuesFor(`cluster "${cluster}"`).fail(`has ${list.length} pillar articles (${list.map((a) => a.slug).join(', ')}); at most one`);
  }
}

// Pages that will exist once this build is online.
const routes = new Set([...Object.keys(PAGES), ...STATIC_PAGES, ...(published.length ? ['/blog'] : []), ...published.map((a) => `/blog/${a.slug}`)]);

if (aboutPage) {
  const { href } = aboutPage.closing.primaryCta;
  if (!routes.has(pagePath(href))) aboutIssues.warn(`closing.primaryCta links to ${href}, which isn't one of the site's pages`);
}

for (const article of articles) {
  for (const link of new Set(article.body.internalLinks)) {
    const slug = link.match(/^\/blog\/([^/]+)$/)?.[1];
    if (slug && !bySlug.has(slug)) article.issues.warn(`links to ${link}, but there's no such article`);
    else if (slug && !article.fm.draft && !isPublished(slug)) article.issues.warn(`links to ${link}, a draft (not found until it's published)`);
    else if (!slug && !routes.has(link) && link !== '/blog') article.issues.warn(`links to ${link}, which isn't one of the site's pages`);
  }
}

// An author's page on this site must exist before an article naming them is published. On
// /tentang-kami, the #part must be someone in its team (their id there, and in the JSON-LD).
for (const author of authors.values()) {
  if (!author.url.startsWith('/')) continue;
  const hash = author.url.match(/#(.+)$/)?.[1];
  const target = pagePath(author.url);
  const problem = !routes.has(target)
    ? "isn't one of the site's pages (src/content/seo.ts PAGES or STATIC_PAGES, or a published article)"
    : target === ABOUT_PATH && hash && aboutPage && !aboutPage.team.people.some((p) => p.slug === hash)
      ? `has no #${hash} (team.people in ${relative(ABOUT_FILE)}: ${aboutPage.team.people.map((p) => p.slug).join(', ')})`
      : undefined;
  if (!problem) continue;
  const used = articles.filter((a) => a.fm.author.includes(author.slug));
  if (!used.length) continue;
  const message = `author "${author.slug}" links to ${author.url}, which ${problem}`;
  if (used.some((a) => !a.fm.draft)) issuesFor(relative(authorsFile)).fail(message);
  else issuesFor(relative(authorsFile)).warn(`${message}; fine while their articles are drafts`);
}

// Every cluster needs a label (content/blog.json clusterLabel) once one of its articles is published.
if (indexResult.success) {
  const labels = indexResult.data.clusterLabel;
  for (const cluster of new Set(articles.map((a) => a.fm.cluster))) {
    if (Object.hasOwn(labels, cluster)) continue;
    const inCluster = articles.filter((a) => a.fm.cluster === cluster);
    const message = `cluster "${cluster}" (${inCluster.map((a) => a.slug).join(', ')}) has no label in clusterLabel`;
    if (inCluster.some((a) => !a.fm.draft)) issuesFor(relative(indexFile)).fail(message);
    else issuesFor(relative(indexFile)).warn(`${message}; fine while its articles are drafts`);
  }
}

if (published.length && indexResult.success) checkLengths(issuesFor(relative(indexFile)), indexResult.data.title.replace(TITLE_SUFFIX, ''), indexResult.data.description);

// Every file in public/images/blog/ and public/images/about/, used or not.
for (const dir of IMAGE_DIRS) {
  const full = path.join(PUBLIC_DIR, dir);
  if (!fs.existsSync(full)) continue;
  for (const name of fs.readdirSync(full)) {
    const issues = issuesFor(`public/${dir}/${name}`);
    if (!IMAGE_FILE_NAME.test(name)) issues.warn('name it in lowercase words joined by hyphens, e.g. undangan-digital-friends.webp');
    const bytes = fs.statSync(path.join(full, name)).size;
    if (bytes > MAX_IMAGE_BYTES) issues.warn(`${Math.round(bytes / 1024)} KB; keep images under ${MAX_IMAGE_BYTES / 1024} KB (WebP, at most 1600px wide)`);
  }
}

// --- Stop, or write the pages ---------------------------------------------------------------

for (const warning of warnings) console.warn(`  warn  ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`  ERROR ${error}`);
  console.error(`\nBlog: ${errors.length} problem(s) above stop the build (docs/blog.md lists the rules).`);
  process.exit(1);
}

const indexHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
// The app's main stylesheet (Tailwind, and home.css with the header and footer)…
const appCss = [...indexHtml.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)]
  .map((m) => m[0].match(/href="(\/assets\/[^"]+\.css)"/)?.[1])
  .filter((href): href is string => !!href);
// …and the page's own (vite.config.ts): blog-<hash>.css, about-<hash>.css.
const ownCss = (name: 'blog' | 'about') =>
  fs
    .readdirSync(path.join(DIST, 'assets'))
    .filter((f) => f.startsWith(`${name}-`) && /^[a-z]+-[\w-]+\.css$/.test(f))
    .map((f) => `/assets/${f}`);
const analytics = indexHtml.match(/<script>\s*(window\.dataLayer[\s\S]*?)<\/script>/)?.[1] ?? '';
const assets: SiteAssets = { css: [...appCss, ...ownCss('blog')], analytics };
const aboutAssets: SiteAssets = { css: [...appCss, ...ownCss('about')], analytics };
for (const [name, { css }] of [['blog', assets], ['about', aboutAssets]] as const) {
  if (css.length !== 2) throw new Error(`Blog: expected the app's stylesheet and ${name}.css in dist/, found ${JSON.stringify(css)}`);
}
if (!analytics) throw new Error("Blog: Google Analytics' script not found in dist/index.html");

const { renderAbout, renderArticle, renderIndex } = (await import(pathToFileURL(SSR_ENTRY).href)) as typeof import('../../src/blog/render');

if (about && aboutPage && aboutOgImage) {
  const url = canonicalUrl(ABOUT_PATH);
  const { photo } = aboutPage.hero;
  fs.writeFileSync(
    path.join(DIST, 'tentang-kami.html'),
    renderAbout({
      head: {
        title: about.meta.title + TITLE_SUFFIX,
        description: about.meta.description,
        canonical: url,
        ogType: 'website',
        image: aboutOgImage,
        jsonLd: aboutJsonLd({ url, title: about.meta.title, description: about.meta.description, photo, people: aboutPage.team.people }),
      },
      assets: aboutAssets,
      ...aboutPage,
    }),
  );
}

const card = (a: Article): ArticleCard => ({ slug: a.slug, title: a.fm.title, description: a.fm.description, date: a.fm.date, cover: a.cover });

if (published.length) fs.mkdirSync(path.join(DIST, 'blog'), { recursive: true });
for (const article of published) {
  const { fm, slug } = article;
  const url = `${SITE_URL}/blog/${slug}`;
  const articleAuthors = fm.author.map((slug) => authors.get(slug)!);
  const pillar = fm.pillar ? undefined : published.find((a) => a.fm.pillar && a.fm.cluster === fm.cluster);
  const chosen = (fm.related ?? []).filter(isPublished).map((s) => bySlug.get(s)!);
  const related = (chosen.length ? chosen : published.filter((a) => a !== article && a.fm.cluster === fm.cluster && a !== pillar)).slice(0, MAX_RELATED);

  const html = renderArticle({
    head: {
      title: fm.title + TITLE_SUFFIX,
      description: fm.description,
      canonical: url,
      ogType: 'article',
      image: article.cover,
      meta: {
        'article:published_time': fm.date,
        'article:modified_time': fm.updated ?? fm.date,
      },
      jsonLd: articleJsonLd({ url, title: fm.title, description: fm.description, cover: article.cover, date: fm.date, updated: fm.updated, authors: articleAuthors, faq: fm.faq }),
    },
    assets,
    cluster: indexResult.success ? indexResult.data.clusterLabel[fm.cluster] : fm.cluster,
    title: fm.title,
    date: fm.date,
    updated: fm.updated,
    readingMinutes: Math.max(1, Math.round(article.body.words / WORDS_PER_MINUTE)),
    authors: articleAuthors,
    cover: article.cover,
    summary: fm.summary,
    bodyHtml: article.body.html,
    faq: fm.faq,
    pillar: pillar && card(pillar),
    related: related.map(card),
  });
  fs.writeFileSync(path.join(DIST, 'blog', `${slug}.html`), html);
}

if (published.length && indexResult.success) {
  const index = indexResult.data;
  const cards = published.map(card);
  const featured = published.find((a) => a.fm.pillar) ?? published[0];
  fs.writeFileSync(
    path.join(DIST, 'blog.html'),
    renderIndex({
      head: {
        title: index.title,
        description: index.description,
        canonical: `${SITE_URL}/blog`,
        ogType: 'website',
        image: { src: '/og-default.jpg', alt: 'Nice Mice', width: 1200, height: 630 },
        jsonLd: blogIndexJsonLd({ title: index.title, description: index.description, articles: cards }),
      },
      assets,
      heading: index.heading,
      intro: index.intro,
      featured: card(featured),
      articles: published.filter((a) => a !== featured).map(card),
    }),
  );
}

// --- sitemap.xml: the pages in src/content/seo.ts (PAGES, STATIC_PAGES), then the blog -------
// <lastmod> only for the blog, from the articles' own dates: the build date isn't when a page
// changed, and Google ignores a lastmod it can't trust.

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lastmod = (a: Article) => a.fm.updated ?? a.fm.date;
const sitemapUrls: { loc: string; lastmod?: string }[] = [
  ...[...Object.keys(PAGES), ...STATIC_PAGES].map((p) => ({ loc: canonicalUrl(p) })),
  ...(published.length ? [{ loc: canonicalUrl('/blog'), lastmod: published.map(lastmod).sort().at(-1) }] : []),
  ...published.map((a) => ({ loc: canonicalUrl(`/blog/${a.slug}`), lastmod: lastmod(a) })),
];
fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
    .map((u) => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}  </url>\n`)
    .join('')}</urlset>\n`,
);

// --- Report: links between articles (in the body) --------------------------------------------

const linksOut = new Map(articles.map((a) => [a.slug, new Set(a.body.internalLinks.map((l) => l.match(/^\/blog\/([^/]+)$/)?.[1]).filter((s): s is string => !!s && s !== a.slug && bySlug.has(s)))]));
const linksIn = (slug: string) => articles.filter((a) => linksOut.get(a.slug)!.has(slug)).map((a) => a.slug);

console.log(`\n${ABOUT_PATH}: written to dist/tentang-kami.html.`);
console.log(`Blog: ${published.length} published, ${articles.length - published.length} draft(s)${published.length ? `, written to dist/blog/` : '; /blog stays "Segera Hadir"'}. sitemap.xml: ${sitemapUrls.length} pages.`);
if (articles.length) {
  console.log('  Article links (in the body; in = other articles linking here, out = articles linked):');
  for (const a of articles) {
    const links = new Set(a.body.internalLinks);
    console.log(`    ${a.slug}${a.fm.draft ? ' [draft]' : ''}: ${links.size} internal link(s), in ${linksIn(a.slug).length}, out ${linksOut.get(a.slug)!.size}`);
  }
  const orphans = articles.filter((a) => !linksIn(a.slug).length).map((a) => a.slug + (a.fm.draft ? ' [draft]' : ''));
  console.log(`  Orphans (no other article links to them): ${orphans.length ? orphans.join(', ') : 'none'}`);
}
