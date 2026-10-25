// Splits the bulbs of La La Land's photo frames (two rings of marquee bulbs per frame, each one
// compound path in its Figma export, one subpath per bulb) into two circuits that light up in
// turn (Bulbs in LaLaLandContent.tsx): every other bulb going round the ring, in <ring>-a.svg and
// <ring>-b.svg next to it. Rerun after re-exporting a ring: npx tsx scripts/marqueeCircuits.ts
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'src/assets/images/lalaland/figma';
const RINGS = ['6ebf7', 'ed8ee'];

for (const ring of RINGS) {
  const svg = readFileSync(`${DIR}/${ring}.svg`, 'utf8');
  const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)!.map(Number);
  const d = svg.match(/ d="([^"]+)"/)![1];
  // Each bulb starts with an absolute moveto; round the ring by its angle from the frame's centre.
  const bulbs = d.match(/M[^M]*/g)!.map((path) => {
    const [x, y] = path.match(/^M(-?[\d.]+)[ ,]?(-?[\d.]+)/)!.slice(1).map(Number);
    return { path, x, y, angle: Math.atan2(y - h / 2, x - w / 2) };
  });
  bulbs.sort((p, q) => p.angle - q.angle);
  // With an odd number of bulbs two neighbours share a circuit: the two closest together.
  const gap = (i: number) => {
    const [p, q] = [bulbs[i], bulbs[(i + 1) % bulbs.length]];
    return Math.hypot(q.x - p.x, q.y - p.y);
  };
  const closest = bulbs.reduce((best, _, i) => (gap(i) < gap(best) ? i : best), 0);
  const start = (closest + 1) % bulbs.length;
  for (const circuit of ['a', 'b']) {
    const paths = bulbs.filter((_, i) => ((i - start + bulbs.length) % bulbs.length) % 2 === (circuit === 'a' ? 0 : 1));
    writeFileSync(`${DIR}/${ring}-${circuit}.svg`, svg.replace(d, paths.map((b) => b.path).join('')));
    console.log(`${ring}-${circuit}.svg: ${paths.length} of ${bulbs.length} bulbs`);
  }
}
