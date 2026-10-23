import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';
import { fontsHref } from '../src/content/fonts';

// Writes dist/404.html: index.html marked noindex, with the "not found" page's fonts. Cloudflare serves it, with a 404 status,
// for any missing file (/foo.php, /old.xml…) (not_found_handling in wrangler.jsonc); the app
// then shows its own "not found" page. Missing page addresses without a dot never get here:
// the Worker (worker/index.ts) answers those itself.

export function notFoundPage(): Plugin {
  return {
    name: 'nicemice-not-found-page',
    apply: 'build',
    writeBundle(options) {
      const dir = options.dir!;
      const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
      if (!html.includes('</head>')) throw new Error('index.html has no </head> for the 404 page');
      const page = html
        .replace(/(<link data-fonts href=")[^"]*/, (_, start) => start + fontsHref('other').replace(/&/g, '&amp;'))
        .replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>');
      fs.writeFileSync(path.join(dir, '404.html'), page);
    },
  };
}
