import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createServer, type Plugin, type ResolvedConfig } from 'vite';
import { slugFromFile } from '../src/invitations/slugs';
import type { Invitation } from '../src/invitations/types';
import type { OgData, SharePreview } from '../worker/ogData';

// WhatsApp link previews for couple pages. WhatsApp's crawler doesn't run JavaScript, so the
// Worker (worker/index.ts) writes each couple's og: tags into the HTML. After `vite build` this
// reads every src/couples/<slug>.ts, writes the preview text to worker/og-data.json (bundled
// into the Worker, not public), and makes the preview photo dist/couples/<slug>/og.jpg:
//   - shareImage, when the couple has one: 1200×630, WhatsApp's large card;
//   - otherwise coverPhoto: 600×600, a square thumbnail beside the text.
// JPEG, since WhatsApp doesn't reliably show WebP, and kept under 300 KB, above which it often
// shows no photo at all.

const DATA_FILE = 'worker/og-data.json';
const MAX_BYTES = 300 * 1024;

const MONTHS = {
  id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

/** English when the couple greets in English ('Dear', 'To', …); Indonesian otherwise. */
const language = (greeting: string) => (/^(dear|to|for|hi|hello)$/i.test(greeting.trim()) ? 'en' : 'id');

/** '2027-09-27' → '27 September 2027' (or '27 Agustus 2027' style in Indonesian). */
function formatDate(iso: string, lang: keyof typeof MONTHS) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[lang][m - 1]} ${y}`;
}

/** A photo path from a couple file → the file on disk: /couples/… is in public/, /src/… an import. */
function photoFile(photo: string, config: ResolvedConfig) {
  const p = photo.startsWith(config.base) ? `/${photo.slice(config.base.length)}` : photo;
  return p.startsWith('/src/') ? path.join(config.root, p) : path.join(config.publicDir, p);
}

/** The photo as a JPEG of exactly width×height (cropped to fill), as light as needed. */
async function previewJpeg(file: string, width: number, height: number) {
  const resized = sharp(file).rotate().resize(width, height, { fit: 'cover' });
  for (let quality = 82; ; quality -= 8) {
    const jpeg = await resized.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
    if (jpeg.length <= MAX_BYTES || quality <= 50) return jpeg;
  }
}

export function sharePreviews(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'nicemice-share-previews',
    apply: 'build',
    configResolved(resolved) {
      config = resolved;
    },
    async closeBundle() {
      // Load the couple files the way the app does (photo imports, import.meta.env…).
      const server = await createServer({
        configFile: false,
        root: config.root,
        logLevel: 'error',
        appType: 'custom',
        server: { middlewareMode: true, hmr: false, watch: null },
        optimizeDeps: { noDiscovery: true, include: [] },
      });
      const data: OgData = {};
      try {
        const dir = path.join(config.root, 'src/couples');
        for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.ts')).sort()) {
          const slug = slugFromFile(name.slice(0, -'.ts'.length));
          if (!slug) continue;
          const mod = await server.ssrLoadModule(path.join(dir, name));
          const inv = mod.default as Invitation;
          const lang = language(inv.greeting);

          const [photo, width, height] = inv.shareImage ? [inv.shareImage, 1200, 630] : [inv.coverPhoto, 600, 600];
          const source = photoFile(photo, config);
          if (!fs.existsSync(source)) {
            this.warn(`src/couples/${name}: ${photo} not found (${source}); its WhatsApp preview uses the default image`);
            continue;
          }
          const jpeg = await previewJpeg(source, width, height);
          const out = path.join(config.root, config.build.outDir, 'couples', slug, 'og.jpg');
          fs.mkdirSync(path.dirname(out), { recursive: true });
          fs.writeFileSync(out, jpeg);
          // ?v= changes with the photo, so a new photo isn't hidden behind an old cached one.
          const version = crypto.createHash('sha256').update(jpeg).digest('hex').slice(0, 8);

          const preview: SharePreview = {
            title: `${inv.coupleNames} · ${formatDate(inv.date, lang)}`,
            greeting: inv.greeting,
            guestFallback: inv.guestFallback,
            invited: lang === 'en' ? `you’re invited to the wedding of ${inv.coupleNames}.` : `kamu diundang ke pernikahan ${inv.coupleNames}.`,
            image: { path: `${config.base}couples/${slug}/og.jpg?v=${version}`, width, height },
          };
          data[slug] = preview;
        }
      } finally {
        await server.close();
      }
      fs.mkdirSync(path.join(config.root, path.dirname(DATA_FILE)), { recursive: true });
      fs.writeFileSync(path.join(config.root, DATA_FILE), `${JSON.stringify(data, null, 2)}\n`);
      config.logger.info(`WhatsApp previews: ${Object.keys(data).join(', ') || 'no couples yet'} → ${DATA_FILE}`);
    },
  };
}
