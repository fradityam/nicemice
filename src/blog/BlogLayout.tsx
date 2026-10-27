import type { ReactNode } from 'react';
import { ORDER_MESSAGE, whatsappLink } from '../config';
import { fontsHref } from '../content/fonts';
import { SITE_URL } from '../content/seo';
import SiteFooter from '../components/home/SiteFooter';
import SiteHeader from '../components/home/SiteHeader';
import type { ArticleCard, PageHead, SiteAssets } from './types';

// A whole blog page (or /tentang-kami, src/blog/AboutPage.tsx): <head> with its own title, description, canonical, link-preview tags and
// structured data, then the homepage's header and footer around the content. Rendered once at
// build time (scripts/blog/build.ts), never hydrated: the page loads no app JavaScript, only
// Google Analytics (the same snippet as index.html) and the small script below.

// The page view, and whatsapp_click for every WhatsApp link (data-wa-button), as the app does
// (src/analytics.ts): same event and parameters, the address without ?to=.
const PAGE_SCRIPT = `(function () {
  if (!window.gtag) return;
  var url = new URL(location.href);
  url.searchParams.delete('to');
  url.hash = '';
  var page = { page_location: url.href, page_title: document.title };
  gtag('set', page);
  gtag('event', 'page_view', page);
  document.addEventListener('click', function (e) {
    var a = e.target instanceof Element && e.target.closest('a[data-wa-button]');
    if (!a) return;
    var params = { button: a.getAttribute('data-wa-button') };
    var theme = a.getAttribute('data-wa-theme');
    if (theme) params.theme = theme;
    gtag('event', 'whatsapp_click', params);
  });
})();`;

/**
 * `wide`: the homepage sections' width (the blog index), instead of an article's reading width.
 * `mainClass`: <main>'s class instead of the blog's. `headScript`, `script`: the page's own
 * inline scripts, at the start of <head> and after the page script.
 */
export default function BlogLayout({
  head,
  assets,
  wide = false,
  mainClass = wide ? 'nm-blog nm-blog-wide' : 'nm-blog',
  headScript,
  script,
  children,
}: {
  head: PageHead;
  assets: SiteAssets;
  wide?: boolean;
  mainClass?: string;
  headScript?: string;
  script?: string;
  children: ReactNode;
}) {
  const image = `${SITE_URL}${head.image.src}`;
  return (
    <html lang="id">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {headScript && <script dangerouslySetInnerHTML={{ __html: headScript }} />}
        <title>{head.title}</title>
        <meta name="description" content={head.description} />
        <link rel="canonical" href={head.canonical} />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={fontsHref('home')} rel="stylesheet" />
        {assets.css.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        <meta property="og:type" content={head.ogType} />
        <meta property="og:site_name" content="Nice Mice" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:title" content={head.title} />
        <meta property="og:description" content={head.description} />
        <meta property="og:url" content={head.canonical} />
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content={String(head.image.width)} />
        <meta property="og:image:height" content={String(head.image.height)} />
        <meta property="og:image:alt" content={head.image.alt} />
        {Object.entries(head.meta ?? {}).map(([property, content]) => (
          <meta key={property} property={property} content={content} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:image:alt" content={head.image.alt} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: head.jsonLd }} />
        <script dangerouslySetInnerHTML={{ __html: assets.analytics }} />
      </head>
      <body className="bg-[#FAF9F6] text-zinc-800 antialiased font-sans">
        <div className="nm-home">
          <SiteHeader home="/" />
          <main className={mainClass}>{children}</main>
          <SiteFooter home="/" />
        </div>
        <script dangerouslySetInnerHTML={{ __html: PAGE_SCRIPT }} />
        {script && <script dangerouslySetInnerHTML={{ __html: script }} />}
      </body>
    </html>
  );
}

/** Beranda › Blog (› the article), as in the page's BreadcrumbList. */
export function Breadcrumb({ current }: { current?: string }) {
  return (
    <nav className="blog-breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li>
          <a href="/">Beranda</a>
        </li>
        <li>{current ? <a href="/blog">Blog</a> : <span aria-current="page">Blog</span>}</li>
        {current && (
          <li>
            <span aria-current="page">{current}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}

const DATE_FORMAT = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** '2026-10-26' → <time dateTime="2026-10-26">26 Oktober 2026</time> */
export function DateText({ date }: { date: string }) {
  return <time dateTime={date}>{DATE_FORMAT.format(new Date(`${date}T00:00:00Z`))}</time>;
}

/**
 * An article's card: cover (3:2), title, description, date. The cover and the title both link
 * to it; the cover's link is skipped by keyboard and screen readers, which get the title's.
 * `featured`: the blog index's large first card, cover beside the text on wide screens.
 */
export function ArticleCardView({ article, heading: Heading, featured = false }: { article: ArticleCard; heading: 'h2' | 'h3'; featured?: boolean }) {
  const href = `/blog/${article.slug}`;
  return (
    <article className={featured ? 'blog-card blog-card-featured' : 'blog-card'}>
      <a className="blog-card-cover" href={href} tabIndex={-1} aria-hidden="true">
        <img
          src={article.cover.src}
          alt={article.cover.alt}
          width={article.cover.width}
          height={article.cover.height}
          loading={featured ? undefined : 'lazy'}
          fetchPriority={featured ? 'high' : undefined}
          decoding="async"
        />
      </a>
      <div className="blog-card-text">
        <Heading>
          <a href={href}>{article.title}</a>
        </Heading>
        <p>{article.description}</p>
        <DateText date={article.date} />
      </div>
    </article>
  );
}

/** Related articles under an article: a small cover beside the title and date. */
export function RelatedList({ articles }: { articles: ArticleCard[] }) {
  return (
    <ul className="blog-related-list">
      {articles.map((article) => {
        const href = `/blog/${article.slug}`;
        return (
          <li key={article.slug}>
            <a className="blog-card-cover" href={href} tabIndex={-1} aria-hidden="true">
              <img src={article.cover.src} alt={article.cover.alt} width={article.cover.width} height={article.cover.height} loading="lazy" decoding="async" />
            </a>
            <div>
              <h3>
                <a href={href}>{article.title}</a>
              </h3>
              <DateText date={article.date} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Cards in a grid: the blog index's articles after the featured one. */
export function ArticleGrid({ articles, heading }: { articles: ArticleCard[]; heading: 'h2' | 'h3' }) {
  return (
    <ul className="blog-grid">
      {articles.map((article) => (
        <li key={article.slug}>
          <ArticleCardView article={article} heading={heading} />
        </li>
      ))}
    </ul>
  );
}

/** The WhatsApp box closing every blog page. Nothing while there's no WhatsApp number. */
export function WhatsAppCta() {
  const href = whatsappLink(ORDER_MESSAGE);
  if (!href) return null;
  return (
    <section className="blog-final-cta" aria-labelledby="ngobrol">
      <h2 id="ngobrol">Mau undangan yang kamu banget?</h2>
      <p>Ceritakan acaramu, tim Nice Mice bantu siapkan undangannya sampai siap disebar.</p>
      <a className="button button-primary" href={href} target="_blank" rel="noopener noreferrer" data-wa-button="blog_cta">
        Chat lewat WhatsApp
      </a>
    </section>
  );
}
