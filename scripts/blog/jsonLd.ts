import { SITE_URL } from '../../src/content/seo';
import { ORGANIZATION_ID } from '../../src/content/structuredData';
import type { ArticleCard, Author, Image } from '../../src/blog/types';

// The blog's structured data (JSON-LD). The publisher is the homepage's Organization, by the
// same @id; it's described again here because search engines read each page on its own.

const BLOG_ID = `${SITE_URL}/blog#blog`;

/** Dates are days; published at midnight Jakarta time. */
const dateTime = (date: string) => `${date}T00:00:00+07:00`;

export const absoluteUrl = (pathOrUrl: string) => (pathOrUrl.startsWith('/') ? `${SITE_URL}${pathOrUrl}` : pathOrUrl);

const publisher = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'Nice Mice',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/icon-512.png`,
};

const imageObject = (image: Image) => ({
  '@type': 'ImageObject',
  url: absoluteUrl(image.src),
  width: image.width,
  height: image.height,
});

function breadcrumb(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: item.url })),
  };
}

/** Safe inside <script>. */
const serialize = (graph: object[]) => JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');

export function articleJsonLd(article: {
  url: string;
  title: string;
  description: string;
  cover: Image;
  date: string;
  updated?: string;
  author: Author;
  faq?: { q: string; a: string }[];
}) {
  const { author } = article;
  return serialize([
    {
      '@type': 'BlogPosting',
      '@id': `${article.url}#article`,
      headline: article.title,
      description: article.description,
      image: imageObject(article.cover),
      datePublished: dateTime(article.date),
      dateModified: dateTime(article.updated ?? article.date),
      inLanguage: 'id-ID',
      author: {
        '@type': 'Person',
        name: author.name,
        url: absoluteUrl(author.url),
        jobTitle: author.role,
        ...(author.sameAs.length ? { sameAs: author.sameAs } : {}),
      },
      publisher,
      mainEntityOfPage: { '@type': 'WebPage', '@id': article.url },
      isPartOf: { '@id': BLOG_ID },
    },
    breadcrumb([
      { name: 'Beranda', url: `${SITE_URL}/` },
      { name: 'Blog', url: `${SITE_URL}/blog` },
      { name: article.title, url: article.url },
    ]),
    // The same questions and answers as the page's "Pertanyaan Umum".
    ...(article.faq
      ? [
          {
            '@type': 'FAQPage',
            mainEntity: article.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
          },
        ]
      : []),
  ]);
}

export function blogIndexJsonLd(index: { title: string; description: string; articles: ArticleCard[] }) {
  return serialize([
    {
      '@type': 'Blog',
      '@id': BLOG_ID,
      name: index.title,
      description: index.description,
      url: `${SITE_URL}/blog`,
      inLanguage: 'id-ID',
      publisher,
      blogPost: index.articles.map((article) => ({
        '@type': 'BlogPosting',
        '@id': `${SITE_URL}/blog/${article.slug}#article`,
        headline: article.title,
        url: `${SITE_URL}/blog/${article.slug}`,
        datePublished: dateTime(article.date),
      })),
    },
    breadcrumb([
      { name: 'Beranda', url: `${SITE_URL}/` },
      { name: 'Blog', url: `${SITE_URL}/blog` },
    ]),
  ]);
}
