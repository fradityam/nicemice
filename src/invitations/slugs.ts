// Which src/couples/<slug>.ts files get a page. Shared by the app (couples.ts) and the build
// step that writes the WhatsApp previews (scripts/sharePreviews.ts).

/** Page names the site itself uses; a couple can't have these. */
const RESERVED = new Set(['template', 'harga', 'faq', 'blog', 'testimoni', 'couples', 'assets', 'index']);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * The slug for src/couples/<file>.ts, or null when the file gets no page: examples starting
 * with "_" are skipped quietly; a bad name is reported.
 */
export function slugFromFile(file: string): string | null {
  if (file.startsWith('_')) return null;
  if (!SLUG.test(file) || RESERVED.has(file)) {
    console.error(`src/couples/${file}.ts: use lowercase letters, numbers and dashes, and not one of: ${[...RESERVED].join(', ')}`);
    return null;
  }
  return file;
}
