import { useEffect, useRef, useState } from 'react';
import { useInView } from './scrollReveal';
import './handwriting.css';

// A heading written by hand as it scrolls into view, shared by the templates laid out in a scaled
// Figma frame (see scrollReveal). Needs the frame's reveals: without them (animations off, or the
// guest prefers reduced motion) the heading simply shows.

// How long the pen takes over a line: a one-line heading's whole line, or a longer heading's
// widest line (the others in proportion to their width). Between two words it lifts for a moment,
// and it takes a little longer to move down to the next line.
const WRITE_MS = 1800;
const LINE_MS = 1400;
const PEN_LIFT_MS = 180;
const NEXT_LINE_MS = 320;
// A word's strokes start slowly, speed up and slow down to its end.
const STROKE_EASE = 'cubic-bezier(0.35, 0, 0.65, 1)';
// The ink's soft edge: the mask is clear this far behind a line's --hw-write-<line>.
const INK_EDGE = '0.35em';
// The most lines a heading is written in (one --hw-write-<line> each in handwriting.css); one
// with more simply shows.
const MAX_WRITTEN_LINES = 3;
const MASK_PROPS = ['mask-image', 'mask-size', 'mask-position', '-webkit-mask-image', '-webkit-mask-size', '-webkit-mask-position'];

/**
 * A heading written by hand as frame y `at` scrolls into view (handwriting.css): line by line, each
 * from left to right, uncovered word by word at a pen's pace, the pen lifting for a moment between
 * words. The lines are the ones the text is laid out in, however it breaks (a couple's own closing
 * words too). With `wait`, it holds until that clears (e.g. a signature, until the words above it
 * are written); `onWritten` is called once it is. Kept as text throughout, so it stays sharp; once
 * written it is plain text again.
 */
export function Handwritten({ at, delay = 0, wait = false, onWritten, children }: { at: number; delay?: number; wait?: boolean; onWritten?: () => void; children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Starts as soon as it is just inside the viewport (`early`), unlike the reveals, which wait
  // until they are further up: the heading keeps its own timing.
  const inView = useInView(at, true);
  const [written, setWritten] = useState(false);
  const onWrittenRef = useRef(onWritten);
  onWrittenRef.current = onWritten;
  useEffect(() => {
    const el = ref.current;
    if (!inView || wait || written || !el) return;
    let anim: Animation | undefined;
    let cancelled = false;
    const clearMask = () => MASK_PROPS.forEach((p) => el.style.removeProperty(p));
    const finish = () => {
      clearMask();
      setWritten(true);
      onWrittenRef.current?.();
    };
    document.fonts.ready.then(() => {
      const text = el.firstChild;
      if (cancelled || !text) return;
      // Each word's left and right edges, as shares of the box the mask covers, gathered into
      // the lines they are laid out on, with how far down the box each line reaches.
      const box = el.getBoundingClientRect();
      const lines: { words: [number, number][]; top: number; bottom: number }[] = [];
      for (const m of children.matchAll(/\S+/g)) {
        const range = document.createRange();
        range.setStart(text, m.index);
        range.setEnd(text, m.index + m[0].length);
        const r = range.getBoundingClientRect();
        const word: [number, number] = [(r.left - box.left) / box.width, (r.right - box.left) / box.width];
        const top = (r.top - box.top) / box.height;
        const bottom = (r.bottom - box.top) / box.height;
        const line = lines[lines.length - 1];
        if (line && top - line.top < (line.bottom - line.top) / 2) {
          line.words.push(word);
          line.bottom = Math.max(line.bottom, bottom);
        } else lines.push({ words: [word], top, bottom });
      }
      if (!lines.length || lines.length > MAX_WRITTEN_LINES) return finish();

      // Each line uncovered in a band of the mask of its own, from halfway to the line above to
      // halfway to the one below (the first and last reaching the box's edges).
      const bands = lines.map((line, i) => [i ? (lines[i - 1].bottom + line.top) / 2 : 0, i < lines.length - 1 ? (line.bottom + lines[i + 1].top) / 2 : 1]);
      const write = (i: number) => `var(--hw-write-${i + 1})`;
      const mask = {
        image: lines.map((_, i) => `linear-gradient(90deg, #000 calc(${write(i)} - ${INK_EDGE}), transparent ${write(i)})`).join(', '),
        size: bands.map(([t, b]) => `100% ${(b - t) * 100}%`).join(', '),
        // A layer's % position is a share of the room left around it.
        position: bands.map(([t, b]) => `0 ${b - t < 1 ? (t / (1 - (b - t))) * 100 : 0}%`).join(', '),
      };
      for (const prefix of ['', '-webkit-']) {
        el.style.setProperty(`${prefix}mask-image`, mask.image);
        el.style.setProperty(`${prefix}mask-size`, mask.size);
        el.style.setProperty(`${prefix}mask-position`, mask.position);
      }

      // Where each line's ink has reached, from its first letter's left edge (the soft edge of
      // the ink still just short of it), and a keyframe of them all whenever one changes.
      const edge = (share: number) => `${share * 100}%`;
      const reached = lines.map((line) => edge(line.words[0][0]));
      const frames: (Keyframe & { offset: number })[] = [];
      let t = 0;
      const mark = (easing: string) => frames.push({ ...Object.fromEntries(reached.map((r, i) => [`--hw-write-${i + 1}`, r])), easing, offset: t });
      const ink = (line: (typeof lines)[number]) => line.words.reduce((sum, [start, end]) => sum + end - start, 0);
      const widest = Math.max(...lines.map(ink));
      mark(STROKE_EASE);
      lines.forEach((line, i) => {
        if (i) {
          t += NEXT_LINE_MS;
          mark(STROKE_EASE);
        }
        const strokesMs = (lines.length > 1 ? (LINE_MS * ink(line)) / widest : WRITE_MS) / ink(line);
        line.words.forEach(([start, end], j) => {
          const next = line.words[j + 1];
          // Each word written up to where the next one starts, so the pen lifts with it all
          // inked; the last one to its end.
          t += (end - start) * strokesMs;
          reached[i] = next ? edge(next[0]) : `calc(${edge(end)} + ${INK_EDGE})`;
          mark('linear');
          if (!next) return;
          t += PEN_LIFT_MS;
          mark(STROKE_EASE);
        });
        // The line done: its whole band clear at once, as nothing is left to write in it.
        reached[i] = `calc(100% + ${INK_EDGE})`;
        mark('linear');
      });
      // (The last at exactly 1: a hair short and the animation would end on the unwritten line.)
      const total = t;
      anim = el.animate(
        frames.map((f) => ({ ...f, offset: f.offset / total })),
        { duration: total, delay, fill: 'both' },
      );
      anim.finished.then(finish, () => {});
    });
    return () => {
      cancelled = true;
      anim?.cancel();
      clearMask();
    };
  }, [inView, wait, written, children, delay]);
  return (
    <span ref={ref} className={inView === null || written ? undefined : 'hw-write'}>
      {children}
    </span>
  );
}
