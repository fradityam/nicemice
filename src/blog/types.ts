// What the blog build (scripts/blog/build.ts) hands the page components (src/blog/render.tsx):
// everything already checked, resolved and formatted, so the components only lay it out.

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  /** Site path or full URL of the author's page, e.g. '/tentang-kami#ratu'. */
  url: string;
  sameAs: string[];
}

export interface Image {
  /** Site path, e.g. '/images/blog/sampul.webp'. */
  src: string;
  alt: string;
  width: number;
  height: number;
}

/** A link to another article: related articles, the cluster's pillar, the blog index. */
export interface ArticleCard {
  slug: string;
  title: string;
  description: string;
  /** 'YYYY-MM-DD' */
  date: string;
  cover: Image;
}

/** What every blog page's <head> needs. */
export interface PageHead {
  title: string;
  description: string;
  canonical: string;
  ogType: 'article' | 'website';
  image: Image;
  /** Extra og:/article: tags, by property. */
  meta?: Record<string, string>;
  /** JSON-LD, already safe to put inside <script>. */
  jsonLd: string;
}

/** Files from the SPA's build that blog pages reuse. */
export interface SiteAssets {
  /** Stylesheets, e.g. ['/assets/index-abc.css', '/assets/blog-def.css'] (about-….css on /tentang-kami). */
  css: string[];
  /** The Google Analytics <script> from dist/index.html, exactly as built. */
  analytics: string;
}

export interface ArticlePageData {
  head: PageHead;
  assets: SiteAssets;
  /** The cluster's label (content/blog.json clusterLabel), shown above the H1. */
  cluster: string;
  title: string;
  /** 'YYYY-MM-DD' */
  date: string;
  updated?: string;
  readingMinutes: number;
  /** In the frontmatter's order; the byline joins them: "Ratu & Fadil". */
  authors: Author[];
  cover: Image;
  summary?: string[];
  /** The article's Markdown, as HTML (scripts/blog/markdown.ts). */
  bodyHtml: string;
  faq?: { q: string; a: string }[];
  /** The cluster's pillar article, on the others in its cluster. */
  pillar?: ArticleCard;
  related: ArticleCard[];
}

export interface IndexPageData {
  head: PageHead;
  assets: SiteAssets;
  heading: string;
  intro: string;
  /** Shown large on top: the newest pillar article, or else the newest article. */
  featured: ArticleCard;
  /** The rest, newest first. */
  articles: ArticleCard[];
}

/** /tentang-kami: content/pages/tentang-kami.yaml, with image sizes and the chosen testimonials. */
export interface AboutPageData {
  head: PageHead;
  assets: SiteAssets;
  hero: { label: string; h1: string; intro: string; photo: Image };
  timeline: { heading: string; steps: { heading: string; text: string }[] };
  values: { heading: string; items: { title: string; text: string }[] };
  team: {
    heading: string;
    /** `slug` is the person's id on the page (/tentang-kami#ratu). No photo: a placeholder. */
    people: { slug: string; name: string; role: string; bio: string; photo?: Image }[];
  };
  facts: { heading: string; items: { value: string; label: string }[] };
  testimonials: { heading: string; items: { quote: string; couple: string; city: string }[] };
  closing: { heading: string; text: string; primaryCta: { label: string; href: string }; whatsappLabel: string };
}
