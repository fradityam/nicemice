import { z } from 'zod';

// What an article's frontmatter (content/blog/<slug>.md), content/authors.json,
// content/blog.json and content/pages/tentang-kami.yaml may contain. Checked by the build (scripts/blog/build.ts); anything else,
// a missing field or a misspelt one, stops it. docs/blog.md describes the fields.

/** Lowercase letters and digits, words joined by single hyphens: 'undangan-digital-2027'. */
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// YAML reads an unquoted 2026-10-26 as a Date; quoted, it stays a string. Either becomes '2026-10-26'.
const date = z.preprocess(
  (value) => (value instanceof Date && !isNaN(value.getTime()) ? value.toISOString().slice(0, 10) : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be a date written YYYY-MM-DD')
    .refine((value) => !isNaN(Date.parse(value)), 'is not a real date'),
);

const text = z.string().trim().min(1, 'must not be empty');

/** Who writes an article when its frontmatter doesn't say. */
export const DEFAULT_AUTHORS = ['ratu', 'fadil'];

export const frontmatterSchema = z.strictObject({
  title: text,
  description: text,
  date,
  updated: date.optional(),
  /** One slug from content/authors.json, or a list of them. */
  author: z.union([text.transform((slug) => [slug]), z.array(text).min(1, 'needs at least one author')]).default(DEFAULT_AUTHORS),
  cover: z.string().startsWith('/images/blog/', 'must be an image in public/images/blog/, written /images/blog/<file>'),
  coverAlt: text,
  cluster: text,
  pillar: z.boolean().optional(),
  summary: z.array(text).min(3, 'needs 3 to 7 points').max(7, 'needs 3 to 7 points').optional(),
  related: z.array(text).optional(),
  draft: z.boolean(),
  faq: z.array(z.strictObject({ q: text, a: text })).min(1).optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export const authorsSchema = z.strictObject({
  authors: z.array(
    z.strictObject({
      slug: z.string().regex(SLUG, 'must be lowercase letters, digits and hyphens'),
      name: text,
      role: text,
      bio: text,
      url: z.string().regex(/^(\/|https:\/\/)/, "must be a site path ('/tentang-kami') or an https:// address"),
      sameAs: z.array(z.url()).default([]),
    }),
  ),
});

export const blogIndexSchema = z.strictObject({
  title: text,
  description: text,
  heading: text,
  intro: text,
  /** Each cluster slug's label, shown above an article's H1: { "sebar-undangan": "Sebar Undangan" }. */
  clusterLabel: z.record(z.string(), text),
});

const aboutImage = z.string().startsWith('/images/about/', 'must be an image in public/images/about/, written /images/about/<file>');

export const aboutPageSchema = z.strictObject({
  /** `ogImage`: the link-preview image (og:image, twitter:image), 1200x630. */
  meta: z.strictObject({ title: text, description: text, ogImage: aboutImage }),
  hero: z.strictObject({ label: text, h1: text, intro: text, photo: aboutImage, photoAlt: text }),
  timeline: z.strictObject({
    heading: text,
    steps: z.array(z.strictObject({ heading: text, text })).min(1),
  }),
  values: z.strictObject({
    heading: text,
    items: z.array(z.strictObject({ title: text, text })).min(1),
  }),
  team: z.strictObject({
    heading: text,
    people: z
      .array(
        z.strictObject({
          slug: z.string().regex(SLUG, 'must be lowercase letters, digits and hyphens'),
          name: text,
          role: text,
          bio: text,
          /** null: a placeholder box until there's a photo. */
          photo: aboutImage.nullable(),
        }),
      )
      .min(1),
  }),
  facts: z.strictObject({
    heading: text,
    items: z.array(z.strictObject({ value: text, label: text })).min(1),
  }),
  testimonials: z.strictObject({
    heading: text,
    /** Couples from TESTIMONIALS in src/content/homeInfo.ts, e.g. "Nabila & Arga". */
    couples: z.array(text).min(1).max(2, 'at most 2'),
  }),
  closing: z.strictObject({
    heading: text,
    text,
    primaryCta: z.strictObject({ label: text, href: z.string().startsWith('/', "must be a site path, e.g. '/#tema'") }),
    whatsappLabel: text,
  }),
});

export type AboutPageContent = z.infer<typeof aboutPageSchema>;

/** "authors.0.url: must be …", "coverAlt: is required" */
export const describeZodError = (error: z.ZodError) =>
  error.issues.map((issue) => {
    const where = issue.path.length ? issue.path.join('.') : '(root)';
    const message = /received undefined$/.test(issue.message) ? 'is required' : issue.message;
    return `${where}: ${message}`;
  });
