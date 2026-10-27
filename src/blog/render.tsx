import { Fragment, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CheckIcon } from '../components/home/icons';
import BlogLayout, { ArticleCardView, ArticleGrid, Breadcrumb, DateText, RelatedList, WhatsAppCta } from './BlogLayout';
import AboutPage from './AboutPage';
import type { AboutPageData, ArticlePageData, Author, IndexPageData } from './types';

// The blog's pages, and /tentang-kami, as finished HTML. Built by Vite as a server bundle
// (`vite build --ssr`, see package.json), so the header and footer get the same /assets/ image
// URLs as the app, and called by scripts/blog/build.ts, which writes the files into dist/.

const page = (element: ReactElement) => `<!doctype html>\n${renderToStaticMarkup(element)}\n`;

/** "Ratu", "Ratu & Fadil", "A, B & C", each name linking to the author's page. */
function AuthorNames({ authors }: { authors: Author[] }) {
  return authors.map((author, i) => (
    <Fragment key={author.slug}>
      {i > 0 && (i === authors.length - 1 ? ' & ' : ', ')}
      <a href={author.url} rel="author">
        {author.name}
      </a>
    </Fragment>
  ));
}

export function renderArticle(data: ArticlePageData): string {
  const { authors, cover } = data;
  return page(
    <BlogLayout head={data.head} assets={data.assets}>
      <article className="blog-article">
        <Breadcrumb current={data.title} />
        <p className="blog-cluster">{data.cluster}</p>
        <h1>{data.title}</h1>
        <p className="blog-byline">
          Oleh <AuthorNames authors={authors} />
          <span aria-hidden="true"> · </span>
          <DateText date={data.date} />
          {data.updated && (
            <>
              <span aria-hidden="true"> · </span>
              Diperbarui <DateText date={data.updated} />
            </>
          )}
          <span aria-hidden="true"> · </span>
          {data.readingMinutes} menit baca
        </p>
        <img
          className="blog-cover"
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          fetchPriority="high"
          decoding="async"
        />

        {data.summary && (
          <aside className="blog-summary" aria-labelledby="ringkasan">
            <h2 id="ringkasan">Ringkasan</h2>
            <ul>
              {data.summary.map((point) => (
                <li key={point}>
                  <CheckIcon />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="blog-body" dangerouslySetInnerHTML={{ __html: data.bodyHtml }} />

        {data.faq && (
          <section className="blog-faq" aria-labelledby="pertanyaan-umum">
            <h2 id="pertanyaan-umum">Pertanyaan Umum</h2>
            {data.faq.map(({ q, a }) => (
              <div key={q}>
                <h3>{q}</h3>
                <p>{a}</p>
              </div>
            ))}
          </section>
        )}

        {data.pillar && (
          <p className="blog-pillar">
            Baca panduan lengkapnya: <a href={`/blog/${data.pillar.slug}`}>{data.pillar.title}</a>
          </p>
        )}
      </article>

      {data.related.length > 0 && (
        <section className="blog-related" aria-labelledby="artikel-terkait">
          <h2 id="artikel-terkait">Artikel Terkait</h2>
          <RelatedList articles={data.related} />
        </section>
      )}

      <section className="blog-author" aria-label="Tentang penulis">
        <p className="blog-kicker">Tentang Penulis</p>
        {authors.map((author) => (
          <div key={author.slug}>
            <p className="blog-author-name">
              <a href={author.url}>{author.name}</a>
            </p>
            <p className="blog-author-role">{author.role}</p>
            <p>{author.bio}</p>
          </div>
        ))}
      </section>

      <WhatsAppCta />
    </BlogLayout>,
  );
}

export function renderIndex(data: IndexPageData): string {
  return page(
    <BlogLayout head={data.head} assets={data.assets} wide>
      <div className="blog-index">
        <header className="blog-index-header">
          <Breadcrumb />
          <h1>{data.heading}</h1>
          <p className="blog-intro">{data.intro}</p>
        </header>
        <ArticleCardView article={data.featured} heading="h2" featured />
        {data.articles.length > 0 && (
          <section className="blog-more" aria-labelledby="artikel-lainnya">
            <h2 id="artikel-lainnya">Artikel Lainnya</h2>
            <ArticleGrid articles={data.articles} heading="h3" />
          </section>
        )}
        <WhatsAppCta />
      </div>
    </BlogLayout>,
  );
}

export function renderAbout(data: AboutPageData): string {
  return page(<AboutPage {...data} />);
}
