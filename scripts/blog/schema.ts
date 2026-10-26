import { z } from 'zod';

// What an article's frontmatter (content/blog/<slug>.md), content/authors.json and
// content/blog.json may contain. Checked by the build (scripts/blog/build.ts); anything else,
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

export const frontmatterSchema = z.strictObject({
  title: text,
  description: text,
  date,
  updated: date.optional(),
  author: text,
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

/** "authors.0.url: must be …", "coverAlt: is required" */
export const describeZodError = (error: z.ZodError) =>
  error.issues.map((issue) => {
    const where = issue.path.length ? issue.path.join('.') : '(root)';
    const message = /received undefined$/.test(issue.message) ? 'is required' : issue.message;
    return `${where}: ${message}`;
  });
