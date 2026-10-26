import fs from 'fs';
import path from 'path';
import type { Element, Root as HastRoot } from 'hast';
import type { Root as MdastRoot, RootContent } from 'mdast';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import sharp from 'sharp';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { ORDER_MESSAGE, whatsappLink } from '../../src/config';
import { PAGES, SITE_URL } from '../../src/content/seo';

// An article's Markdown body → HTML, checking it on the way (docs/blog.md lists the rules).
// Plain Markdown plus GitHub's tables and task lists, and two directives:
//
//   :::whatsapp{message="Halo Nice Mice, …" label="Tanya lewat WhatsApp"}
//   Text of the box.
//   :::
//   A WhatsApp box; both attributes optional (message: the usual order message).
//
//   ::demo{theme="friends"}
//   A card linking to the theme's demo, /template/friends (a page in src/content/seo.ts).
//
// Headings get ids, images their size (read from the file), lazy loading; outbound links
// rel="noopener". Raw HTML isn't rendered.

export interface Issues {
  fail(message: string): void;
  warn(message: string): void;
}

export interface RenderedBody {
  html: string;
  words: number;
  /** Every link to a page of the site, as a path: '/', '/template/friends', '/blog/x'. */
  internalLinks: string[];
  /** Image paths, '/images/blog/…'. */
  images: string[];
}

export const PUBLIC_DIR = path.resolve('public');

/** Width and height of an image in public/, or undefined when the file is missing. */
export async function imageSize(src: string) {
  const file = path.join(PUBLIC_DIR, src);
  if (!fs.existsSync(file)) return undefined;
  const { width, height } = await sharp(file).metadata();
  return width && height ? { width, height } : undefined;
}

/**
 * The site path a link points to, or undefined for links elsewhere and for jumps within the
 * page ('#bagian'). '/#harga' → '/'.
 */
export function internalPath(href: string): string | undefined {
  if (!href.startsWith('/') && !href.startsWith(`${SITE_URL}/`) && href !== SITE_URL) return undefined;
  const url = new URL(href, `${SITE_URL}/`);
  if (url.origin !== SITE_URL) return undefined; // '//elsewhere.com'
  return url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;
}

const DEMO_TITLE_SUFFIX = / \| Nice Mice$/;

/** `firstLine`: the body's first line in the file, after the frontmatter, so messages name the file's lines. */
export async function renderBody(markdown: string, issues: Issues, firstLine = 1): Promise<RenderedBody> {
  const line = (node: { position?: { start: { line: number } } }) => `line ${(node.position?.start.line ?? 1) + firstLine - 1}`;
  const internalLinks: string[] = [];
  const images: string[] = [];
  let words = 0;

  // Markdown checks, and the directives turned into the elements they stand for.
  const checkAndExpand = () => (tree: MdastRoot) => {
    let previousDepth = 1; // the page's H1, from the title
    visit(tree, (node, index, parent) => {
      switch (node.type) {
        case 'heading':
          if (node.depth === 1) issues.fail(`${line(node)}: the body has an H1 ("# …"); the title is the page's only H1, start sections at "## "`);
          else if (node.depth > previousDepth + 1) issues.warn(`${line(node)}: heading jumps from H${previousDepth} to H${node.depth}`);
          previousDepth = node.depth;
          break;
        case 'image':
          if (!node.alt?.trim()) issues.fail(`${line(node)}: image ${node.url} has no alt text ("![description](${node.url})")`);
          if (!node.url.startsWith('/images/blog/')) issues.fail(`${line(node)}: image ${node.url} must be a file in public/images/blog/, written /images/blog/<file>`);
          images.push(node.url);
          break;
        case 'link': {
          const internal = internalPath(node.url);
          if (internal) internalLinks.push(internal);
          break;
        }
        case 'text':
          words += node.value.split(/\s+/).filter(Boolean).length;
          break;
        case 'html':
          issues.warn(`${line(node)}: raw HTML isn't shown on the page ("${node.value.slice(0, 40)}")`);
          break;
        case 'textDirective': {
          // "Catatan:penting" reads as a directive; put the text back.
          if (parent && index !== undefined) {
            const label = node.children.map((child) => ('value' in child ? child.value : '')).join('');
            parent.children.splice(index, 1, { type: 'text', value: `:${node.name}${label ? `[${label}]` : ''}` } as RootContent & { type: 'text' });
          }
          break;
        }
        case 'containerDirective':
          if (node.name !== 'whatsapp') {
            issues.fail(`${line(node)}: unknown directive ":::${node.name}" (there are :::whatsapp and ::demo)`);
            break;
          }
          {
            const href = whatsappLink(node.attributes?.message || ORDER_MESSAGE);
            node.data = { hName: 'aside', hProperties: { className: ['blog-cta'] } };
            if (href) {
              node.children.push({
                type: 'paragraph',
                children: [
                  {
                    type: 'link',
                    url: href,
                    children: [{ type: 'text', value: node.attributes?.label || 'Chat lewat WhatsApp' }],
                    data: {
                      hProperties: {
                        className: ['button', 'button-primary'],
                        target: '_blank',
                        rel: ['noopener', 'noreferrer'],
                        dataWaButton: 'blog_inline',
                      },
                    },
                  },
                ],
              });
            }
          }
          break;
        case 'leafDirective': {
          if (node.name !== 'demo') {
            issues.fail(`${line(node)}: unknown directive "::${node.name}" (there are :::whatsapp and ::demo)`);
            break;
          }
          const theme = node.attributes?.theme ?? '';
          const demo = `/template/${theme}`;
          if (!Object.hasOwn(PAGES, demo)) {
            const themes = Object.keys(PAGES).filter((p) => p.startsWith('/template/')).map((p) => p.slice('/template/'.length));
            issues.fail(`${line(node)}: ::demo{theme="${theme}"} isn't a theme with a demo (${themes.join(', ')})`);
            break;
          }
          internalLinks.push(demo);
          node.data = { hName: 'a', hProperties: { className: ['blog-demo'], href: demo } };
          node.children = [
            { type: 'emphasis', data: { hName: 'span', hProperties: { className: ['blog-demo-kicker'] } }, children: [{ type: 'text', value: 'Coba demonya' }] },
            { type: 'strong', children: [{ type: 'text', value: PAGES[demo].title.replace(DEMO_TITLE_SUFFIX, '') }] },
            { type: 'emphasis', data: { hName: 'span', hProperties: { className: ['blog-demo-more'] } }, children: [{ type: 'text', value: 'Lihat demo →' }] },
          ];
          break;
        }
      }
    });
  };

  // Image sizes and lazy loading (the cover above the body is the page's first image), and
  // rel="noopener" on links leaving the site.
  const finishElements = () => async (tree: HastRoot) => {
    const imgs: Element[] = [];
    visit(tree, 'element', (el) => {
      if (el.tagName === 'img') imgs.push(el);
      if (el.tagName === 'a' && typeof el.properties.href === 'string' && /^https?:/.test(el.properties.href) && !internalPath(el.properties.href)) {
        el.properties.rel ??= ['noopener'];
      }
    });
    for (const img of imgs) {
      const src = String(img.properties.src);
      const size = src.startsWith('/images/blog/') ? await imageSize(src) : undefined;
      if (src.startsWith('/images/blog/') && !size) issues.fail(`image ${src} not found in public${src}`);
      Object.assign(img.properties, size ?? {}, { loading: 'lazy', decoding: 'async' });
    }
  };

  const html = String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDirective)
      .use(checkAndExpand)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(finishElements)
      .use(rehypeStringify)
      .process(markdown),
  );

  return { html, words, internalLinks, images };
}
