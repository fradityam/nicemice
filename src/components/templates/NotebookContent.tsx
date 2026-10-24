import { Children, Fragment, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { formatIsoDate } from '../../invitations/dates';
import { MAX_MESSAGE, MAX_NAME, timeAgo, useRsvpForm, useWishes, type Attendance, type SendError, type Wish, type WishesState } from '../../invitations/rsvp';
import type { GalleryPhoto, NotebookInvitation, StoryMoment, Venue } from '../../invitations/types';
import { useFit, type FitBox } from './fitText';
import { MadeWithLoveFooter } from './MadeWithLoveFooter';
import { OPENING } from './notebookOpening';
import { PhotoLightbox, type LightboxPhoto, type LightboxTheme } from './PhotoLightbox';
import { Float, Reveal, RevealOffset, RevealProvider, useScrollReveals, type RevealFeel, type RevealKind } from './scrollReveal';
import './notebook.css';

// Every layer is placed at its position in the Figma "Content" frame, in Figma's layer order,
// and the whole frame is scaled to the column width. The frame is 375 × 4010 with the
// "Made with love" footer; the layers above it were laid out (many with % insets) when it was
// 375 × 3941, so that stays the frame box and the footer extends below it to PAGE_H.
const FRAME_W = 375;
const FRAME_H = 3941;
const PAGE_H = 4010;

const assetUrls = import.meta.glob('../../assets/images/notebook/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const A = (file: string) => assetUrls[`../../assets/images/notebook/${file}`];

const mask = (file: string, position: string, size: string): CSSProperties => {
  const url = `url("${A(file)}")`;
  return {
    maskImage: url,
    WebkitMaskImage: url,
    maskMode: 'alpha',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: position,
    WebkitMaskPosition: position,
    maskSize: size,
    WebkitMaskSize: size,
  };
};

/**
 * Subtle one-time reveals on the cover and as sections scroll into view, the cover lifting off
 * the letter, and the scenes' depth and breeze. Set to false to turn them all off.
 */
export const ENABLE_ANIMATIONS = true;

/**
 * How The Notebook's reveals move: arrivals with some weight, a fast start and a long gentle
 * landing, a little further and slower than the other templates'; photos land with the
 * faintest overshoot, as if placed on a table.
 */
export const NOTEBOOK_FEEL: RevealFeel = {
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
  kinds: {
    fade: { ms: 900 },
    fadeUp: { ms: 900, from: () => 'translateY(20px)' },
    fromLeft: { ms: 900, from: () => 'translateX(-20px)' },
    fromRight: { ms: 900, from: () => 'translateX(20px)' },
    pop: { ms: 700 },
    settle: { ms: 1000, moveEase: 'cubic-bezier(0.34, 1.25, 0.64, 1)' },
  },
};

/** The parts of a section arriving one after another: each this many ms after the previous one. */
const STAGGER_MS = 80;

/** Reveals each child in turn, STAGGER_MS apart, from `delay` ms after frame y `at` comes into view. */
function Staggered({ at, kind = 'fadeUp', delay = 0, children }: { at: number; kind?: RevealKind; delay?: number; children: ReactNode }) {
  return (
    <>
      {Children.toArray(children).map((child, i) => (
        <Reveal key={i} at={at} kind={kind} delay={delay + i * STAGGER_MS}>
          {child}
        </Reveal>
      ))}
    </>
  );
}

/** The design's date styles, from the couple's 'YYYY-MM-DD'. */
const dateIdLong = (iso: string) => formatIsoDate(iso, 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); // Minggu, 16 Agustus 2026

const mapsSearch = (place: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
const mapsUrl = (venue: Venue) => venue.mapsUrl ?? mapsSearch(venue.name);
/** Lines joined into one, for copying: 'Allie H., Jl. Anggrek Loka No. 24, …'. */
const oneLine = (lines: string[]) => lines.map((l) => l.trim().replace(/,$/, '')).join(', ');

const DEFAULT_SALUTATION = 'Assalamu’alaikum Wr. Wb.';
const DEFAULT_CLOSING = 'Sampai Jumpa di\nHari Bahagia Kami';

// The room each piece of the couple's text has (see FitBox). Text longer than the sample
// shrinks to fit rather than running out of its slot.
const FIT = {
  salutation: { w: 330 },
  name: { w: 165 },
  parents: { h: 37, origin: '50% 0' },
  event: { w: 230 },
  storyLeft: { w: 150, h: 85, origin: '100% 50%' },
  storyRight: { w: 150, h: 85, origin: '0 50%' },
  gift: { w: 230 },
  giftAddress: { w: 215, h: 77 },
  closing: { w: 150, h: 42 },
  signature: { w: 200 },
} satisfies Record<string, FitBox>;

/**
 * The cover → content transition, from the template: `revealed` once the guest has tapped the
 * cover, `done` once the cover has gone.
 */
export type IntroState = { revealed: boolean; reducedMotion: boolean; done: boolean };

/** The letter waits under the cover a little lower and smaller, and settles as it lifts away. */
function introStyle({ revealed, reducedMotion, done }: IntroState): CSSProperties {
  if (!ENABLE_ANIMATIONS || reducedMotion || done) return {};
  const { from, origin, delayMs, ms, ease } = OPENING.letter;
  if (!revealed) return { transform: from, transformOrigin: origin };
  return { transform: 'none', transformOrigin: origin, transition: `transform ${ms}ms ${ease} ${delayMs}ms` };
}

/**
 * A plant in the wind (notebook.css), which blows from right to left: `keyframes` (nb-breeze, …)
 * at `deg` (degrees of skew at a full gust, or for a nod the dip in percent), one round every
 * `ms`, `delay` ms behind the page's clock (see Scene), bending about `origin`.
 */
type Wind = { keyframes: string; deg: number; ms: number; delay: number; origin: string };

// How the wind blows in the trees: `deg` of skew at a full gust in the left tree, one round of it
// every `ms`, as one slow, even swell (`breeze`: its crown moves about 4px per degree) or sharper
// gusts with a tilt (`gust`: about 5px per degree). `rustle` is the right tree's skew: negative
// bends it left with the wind (at most 0.68°: its cut edge, 3px beyond the frame, moves 2.5px in
// at the top), positive only rustles it outward. The left tree starts `lag` ms after the right
// one, which the wind reaches first. Locally, ?wind=subtle, ?wind=breeze, ?wind=medium or
// ?wind=strong on the URL tries each.
const WIND_STRENGTHS = {
  subtle: { deg: 2, ms: 7300, shape: 'gust', rustle: 0.44, lag: 0 },
  breeze: { deg: 2.8, ms: 9000, shape: 'breeze', rustle: -0.68, lag: 300 },
  medium: { deg: 3.5, ms: 7300, shape: 'gust', rustle: 0.77, lag: 0 },
  strong: { deg: 6, ms: 7300, shape: 'gust', rustle: 1.32, lag: 0 },
};
const WIND = (() => {
  const asked = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('wind') : null;
  return asked && asked in WIND_STRENGTHS ? WIND_STRENGTHS[asked as keyof typeof WIND_STRENGTHS] : WIND_STRENGTHS.breeze;
})();

/** The left tree's wind (`lead`) or the right one's, which it reaches first. */
const treeWind = (lead: boolean): Wind => ({
  // In the breeze both trees take the same swell; in the sharper gusts the right one rustles.
  keyframes: lead || WIND.shape === 'breeze' ? `nb-${WIND.shape}` : 'nb-gust-rustle',
  deg: lead ? WIND.deg : WIND.rustle,
  ms: WIND.ms,
  delay: lead ? WIND.lag : 0,
  // From the middle of the foot: a flipped tree is mirrored about its middle, as without wind.
  origin: '50% 100%',
});

// The lilies in the same breeze as the trees, from where their stems leave the frame. The right
// one, which the wind reaches 0.4s before the left, is cut off right at the frame's edge, so it
// only nods (its top dips 1–3px) until it has an image reaching past that edge; the left one
// leans its top 3–10px left, nearly as far as the left tree, out over its own edge.
const LILY_WIND = {
  right: { keyframes: 'nb-breeze-nod', deg: 1.5, ms: WIND_STRENGTHS.breeze.ms, delay: 0, origin: '100% 81%' },
  left: { keyframes: 'nb-breeze', deg: 2.4, ms: WIND_STRENGTHS.breeze.ms, delay: 400, origin: '0% 77%' },
} satisfies Record<string, Wind>;

/**
 * Plain image layer at a Figma box, object-cover like the Figma fill. Inside a Scene it can drift
 * at its own `depth` as it scrolls by (positive: further away, so slower than the page; negative:
 * nearer), and move in the `wind`.
 */
function Img({ file, x, y, w, h, flip, alt = '', depth, wind }: { file: string; x: number; y: number; w: number; h: number; flip?: boolean; alt?: string; depth?: number; wind?: Wind }) {
  const windStyle = wind && ({
    '--nb-wind': wind.deg,
    '--nb-wind-ms': `${wind.ms}ms`,
    '--nb-wind-delay': `${wind.delay}ms`,
    '--nb-wind-name': wind.keyframes,
    transformOrigin: wind.origin,
  } as CSSProperties);
  const img = (
    <img
      alt={alt}
      src={A(file)}
      className={`absolute max-w-none object-cover ${flip ? '-scale-x-100' : ''} ${wind ? 'nb-wind' : ''}`}
      style={{ left: x, top: y, width: w, height: h, ...windStyle }}
    />
  );
  if (!depth) return img;
  return (
    <div className="nb-depth absolute left-0 top-0" style={{ '--nb-depth': depth } as CSSProperties}>
      {img}
    </div>
  );
}

// Room around a Scene's layers for them to move in.
const SCENE_MARGIN = 14;

/**
 * Layers (Img with depth or wind) that move as one scene: each is exactly at its Figma position
 * whenever the scene's box is centred on screen, and the wind moves them only while it is on
 * screen. The box also clips them, just around themselves: Chrome assumes a running animation may
 * overlap everything painted after it and would move that onto separate layers, so text painted
 * later would lose its sub-pixel smoothing. Keep text drawn after a Scene out of its box.
 */
function Scene({ box: [x, y, w, h], children }: { box: [number, number, number, number]; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // How far a Shift has moved the scene down. A Shift moves it with a transform, which the
  // scroll position the depth follows doesn't see, so the box it follows (.nb-scene) is placed
  // that much lower itself; the clip inside it is moved back up to where the layers are.
  const offset = useContext(RevealOffset);
  useEffect(() => {
    const el = ref.current;
    const clip = el?.firstElementChild;
    if (!el || !clip) return;
    // The wind runs on one clock for the whole page: whenever a scene comes on screen its plants
    // carry on as if they had never stopped, so plants in different scenes keep their offsets.
    const io = new IntersectionObserver(
      ([entry]) => {
        const winds = el.getAnimations({ subtree: true }).filter((a) => a instanceof CSSAnimation && /^nb-(gust|breeze)/.test(a.animationName));
        for (const a of winds) {
          if (entry.isIntersecting) a.startTime = 0;
          else a.pause();
        }
      },
      { rootMargin: '100px 0px' },
    );
    io.observe(clip);
    return () => io.disconnect();
  }, []);
  if (!ENABLE_ANIMATIONS) return <>{children}</>;
  const m = SCENE_MARGIN;
  // The boxes themselves let taps through, as before; the images in them take them as usual.
  return (
    <div ref={ref} className="nb-scene pointer-events-none absolute" style={{ left: x - m, top: y - m + offset, width: w + 2 * m, height: h + 2 * m }}>
      <div className="absolute inset-x-0 h-full overflow-clip [&_img]:pointer-events-auto" style={{ top: -offset }}>
        <div className="absolute" style={{ left: m - x, top: m - y }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Text centred on a Figma text box; with `fit`, shrunk when it is longer than the sample. */
function Centered({ x, y, w, h, className, style, fit, children }: { x: number; y: number; w: number; h: number; className: string; style?: CSSProperties; fit?: FitBox; children: ReactNode }) {
  const f = useFit<HTMLDivElement>(fit);
  return (
    <div
      ref={f.ref}
      className={`-translate-x-1/2 -translate-y-1/2 absolute text-center whitespace-nowrap ${className}`}
      style={{ left: x + w / 2, top: y + h / 2, ...style, ...f.style }}
    >
      {children}
      {f.probe}
    </div>
  );
}

/** One of the couple's texts: exactly as before when it fits, shrunk to `fit` when it's longer. */
function Fit({ fit, className, style, children }: { fit: FitBox; className: string; style?: CSSProperties; children: ReactNode }) {
  const f = useFit<HTMLDivElement>(fit);
  return (
    <div ref={f.ref} className={className} style={{ ...style, ...f.style }}>
      {children}
      {f.probe}
    </div>
  );
}

/** Inline version of Fit, for a line inside a heading (e.g. a name on the cover). */
export function FitSpan({ fit, children }: { fit: FitBox; children: ReactNode }) {
  const f = useFit<HTMLSpanElement>(fit);
  return (
    <span ref={f.ref} className="relative inline-block whitespace-nowrap" style={f.style}>
      {children}
      {f.probe}
    </span>
  );
}

/** Lines of text with a <br /> between them. */
/** Text that wraps between words but never at a hyphen inside one: "Pura-pura" stays whole. */
const KeepHyphenated = ({ text }: { text: string }) => (
  <>
    {text.split(/(\S*-\S*)/).map((part, i) =>
      // Odd parts are the hyphenated words the split captured.
      i % 2 ? (
        <span key={i} className="whitespace-nowrap">
          {part}
        </span>
      ) : (
        part
      ),
    )}
  </>
);

const Lines = ({ lines }: { lines: readonly string[] }) => (
  <>
    {lines.map((line, i) => (
      <Fragment key={i}>
        {i > 0 && <br />}
        {line}
      </Fragment>
    ))}
  </>
);

/**
 * Layers moved down by `by` frame px (or up, when negative), and sideways by `x`, e.g.
 * everything below the wishes band; their reveals move with them. No wrapper at all when
 * nothing moves, so layers that stay put render exactly as laid out. `from` is the frame y
 * (before moving) where the layers inside start: the wrapper is the size of the frame, and
 * Chrome would take it as overlapping any animation higher up the page and put it, and all the
 * text drawn after it, on a layer of its own, losing that text's sub-pixel smoothing. So it is
 * cut off above `from`.
 */
function Shift({ by, x = 0, from, children }: { by: number; x?: number; from: number; children: ReactNode }) {
  const offset = useContext(RevealOffset);
  if (!by && !x) return <>{children}</>;
  const clipPath = `inset(${from}px -${FRAME_W}px -${FRAME_H}px)`;
  return (
    <RevealOffset.Provider value={offset + by}>
      <div className="absolute left-0 top-0 *:pointer-events-auto" style={{ width: FRAME_W, height: FRAME_H, transform: `translate(${x}px, ${by}px)`, clipPath, pointerEvents: 'none' }}>
        {children}
      </div>
    </RevealOffset.Provider>
  );
}

/** Stamp-edged card: outer stamp + inner panel, both rotated -90° inside their boxes. */
function StampCard({ outer, inner, outerFile, innerFile }: { outer: string; inner: string; outerFile: string; innerFile: string }) {
  return (
    <>
      {[[outer, outerFile], [inner, innerFile]].map(([inset, file]) => (
        <div key={file} className={`absolute flex ${inset} items-center justify-center`} style={{ containerType: 'size' }}>
          <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
            <div className="relative size-full">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={A(file)} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function LihatLokasi({ top, color, venue }: { top: number; color: string; venue: Venue }) {
  return (
    <a
      href={mapsUrl(venue)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Lihat lokasi ${venue.name} di Google Maps`}
      className="absolute left-[138px] h-[24px] w-[100px] rounded-[100px]"
      style={{ top, backgroundColor: color }}
    >
      <span className="absolute left-[9px] top-[4px] size-[15px] overflow-clip">
        <span className="absolute inset-[0_14.58%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('pin.svg')} />
        </span>
      </span>
      <span className="-translate-x-1/2 -translate-y-1/2 absolute left-[58px] top-[12px] font-['Raleway'] text-[12px] leading-[20px] tracking-[-0.204px] text-white whitespace-nowrap">
        Lihat Lokasi
      </span>
    </a>
  );
}

function SalinButton({ top, label, text }: { top: number; label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="absolute left-[156px] h-[22px] w-[64px] cursor-pointer rounded-[20px] border border-solid border-[#accadd] bg-[#efecec]"
      style={{ top }}
    >
      {!copied && <img alt="" src={A('copy.svg')} className="absolute block max-w-none" style={{ left: 9.01, top: 3.33, width: 10.99, height: 13.47 }} />}
      {/* "TERSALIN" is wider than the button's text slot, so it replaces the icon and centres. */}
      <span
        className="-translate-x-1/2 -translate-y-1/2 absolute top-[10.5px] font-['Raleway'] text-[10px] leading-[15px] tracking-[-0.17px] text-[#29567f] whitespace-nowrap"
        style={{ left: copied ? 31 : 38.5 }}
      >
        {copied ? 'TERSALIN' : 'SALIN'}
      </span>
    </button>
  );
}

// ---------- Masked photos (portraits and collage) ----------

/** A photo box with its Figma mask: [file, x, y, w, h], the visible window inside the box. */
type PhotoMask = [file: string, x: number, y: number, w: number, h: number];

// The demo's own photos keep Figma's crop (the photo stretched over the whole box, of which the
// mask shows a part). Every other photo fills the mask's window.
const FIGMA_PHOTOS = new Set(['couple-photos.webp', 'prewed-1.webp', 'prewed-2.webp', 'prewed-3.webp', 'prewed-4.webp'].map(A));

function MaskedPhoto({ box, boxMask: [file, x, y, w, h], src, alt, figmaClass = 'absolute left-0 top-0 max-w-none size-full' }: { box: string; boxMask: PhotoMask; src: string; alt: string; figmaClass?: string }) {
  return (
    <div className={`absolute ${box}`} style={mask(file, `${x}px ${y}px`, `${w}px ${h}px`)}>
      {FIGMA_PHOTOS.has(src) ? (
        <img alt={alt} className={figmaClass} src={src} />
      ) : (
        <img alt={alt} className="absolute max-w-none object-cover" style={{ left: x, top: y, width: w, height: h }} src={src} />
      )}
    </div>
  );
}

// ---------- Photo collage + gallery ----------

const MAX_GALLERY = 4;
// Where the collage starts: its highest frame, less room for a photo settling into place.
const COLLAGE_TOP = 1680;
// Each frame and its photo settle into place together. Frames: tall, square, square, wide.
const COLLAGE = [
  {
    reveal: { at: 1735, origin: [86.3, 1829.8] as [number, number], tilt: 2, delay: 150 },
    frame: (
      <div className="absolute inset-[44.03%_59.22%_51.17%_5.24%]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('prewed-1-frame.svg')} />
      </div>
    ),
    box: 'inset-[44%_63%_51.27%_9.03%]',
    mask: ['prewed-1-mask.svg', 0.035, 19.113, 104.073, 153.471] as PhotoMask,
    button: 'inset-[44.03%_59.22%_51.17%_5.24%]',
  },
  {
    reveal: { at: 1733, origin: [206.1, 1780] as [number, number], tilt: -2, delay: 280 },
    frame: (
      <div className="absolute inset-[43.97%_32.39%_53.64%_42.31%]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('prewed-2-frame.svg')} />
      </div>
    ),
    box: 'inset-[43.87%_35.01%_53.86%_43.61%]',
    mask: ['prewed-2-mask.svg', 5.051, 16.876, 74.678, 71.966] as PhotoMask,
    button: 'inset-[43.97%_32.39%_53.64%_42.31%]',
  },
  {
    reveal: { at: 1733, origin: [308.5, 1780.3] as [number, number], tilt: 2, delay: 410 },
    frame: (
      <div className="absolute inset-[43.97%_4.99%_53.62%_69.52%]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('prewed-3-frame.svg')} />
      </div>
    ),
    box: 'inset-[43.47%_2.76%_53.79%_69.53%]',
    mask: ['prewed-3-mask.svg', 9.934, 32.861, 75.224, 72.518] as PhotoMask,
    button: 'inset-[43.97%_4.99%_53.62%_69.52%]',
  },
  {
    reveal: { at: 1830, origin: [232.6, 1878.9] as [number, number], tilt: -2, delay: 540 },
    frame: (
      <div className="absolute flex inset-[46.43%_19.41%_51.08%_43.47%] items-center justify-center" style={{ containerType: 'size' }}>
        <div className="flex-none h-[100cqw] rotate-90 w-[100cqh]">
          <div className="relative size-full">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('prewed-4-frame.svg')} />
          </div>
        </div>
      </div>
    ),
    box: 'h-[76.972px] left-[158.09px] top-[1840.41px] w-[145.29px]',
    mask: ['prewed-4-mask.svg', 18.035, -0.009, 112.965, 76.605] as PhotoMask,
    figmaClass: 'absolute inset-0 max-w-none object-cover size-full',
    button: 'inset-[46.43%_19.41%_51.08%_43.47%]',
  },
];
// With fewer photos the frames used are centred as a group: [x, y] moves per frame. The squares
// come down level with the middle of the tall frame once the wide one below them is gone.
const COLLAGE_MOVES: Record<number, [number, number][]> = {
  1: [[101.2, 0]],
  2: [[50.9, 0], [50.9, 49.8]],
  3: [[0, 0], [0, 49.8], [0, 49.8]],
  4: [[0, 0], [0, 0], [0, 0], [0, 0]],
};

// The two lamps by the collage, [x, y] each, where Figma has them. With three photos the squares
// come down beside the right lamp and nothing sits under them, so it hangs below them instead;
// the left lamp, which would touch the tall frame's corner and has no free spot (above it is
// the lake), is left out. Neither then covers a corner of a photo.
const COLLAGE_LAMPS: Record<number, [number, number][]> = {
  3: [[307, 1880]],
  4: [[-3, 1705], [307, 1840]],
};

const LIGHTBOX_THEME =(coupleNames: string): LightboxTheme => ({
  arrowBg: '#aba935',
  arrowFg: '#fefffa',
  counterClass: "font-['Raleway'] font-semibold text-[14px] leading-none tracking-[0.12em] text-[#fefffa]",
  labels: { dialog: `Foto pre-wedding ${coupleNames}`, close: 'Tutup', prev: 'Foto sebelumnya', next: 'Foto berikutnya' },
});

function Collage({ photos, coupleNames, onOpen }: { photos: GalleryPhoto[]; coupleNames: string; onOpen: (i: number) => void }) {
  const moves = COLLAGE_MOVES[photos.length];
  return (
    <>
      {photos.map((p, i) => {
        const slot = COLLAGE[i];
        return (
          <Shift key={i} x={moves[i][0]} by={moves[i][1]} from={COLLAGE_TOP}>
            <Reveal at={slot.reveal.at} kind="settle" origin={slot.reveal.origin} tilt={slot.reveal.tilt} delay={slot.reveal.delay}>
              {slot.frame}
              <MaskedPhoto box={slot.box} boxMask={slot.mask} src={p.photo} alt="" figmaClass={slot.figmaClass} />
            </Reveal>
          </Shift>
        );
      })}
      {photos.map((_, i) => (
        <Shift key={i} x={moves[i][0]} by={moves[i][1]} from={COLLAGE_TOP}>
          <button
            type="button"
            aria-label={`Perbesar foto pre-wedding ${coupleNames} ${i + 1}`}
            onClick={() => onOpen(i)}
            className={`absolute ${COLLAGE[i].button} cursor-zoom-in`}
          />
        </Shift>
      ))}
    </>
  );
}

// ---------- Cerita Kami (story timeline) ----------

const MAX_STORY = 4;
// Where each moment sits by the timeline: left of it (right-aligned) or right of it, in order.
// Figma's mixed line-heights put the body a little lower (`nudge`); a longer text grows the
// block evenly up and down from where the sample is centred.
const STORY_SLOTS = [
  { at: 2012, top: 2046.5, left: true, titleLeading: 12, nudge: 3.5, tracking: -0.17 },
  { at: 2090, top: 2125, left: false, titleLeading: 9, nudge: 4, tracking: -0.119 },
  { at: 2164, top: 2198.5, left: true, titleLeading: 12, nudge: 3.5, tracking: -0.17 },
  { at: 2241, top: 2275.5, left: false, titleLeading: 12, nudge: 3.5, tracking: -0.17 },
];

const timelineText = "font-['Raleway'] text-[10px] leading-[12px] text-black";
const timelineTitle = "font-['Raleway'] font-bold text-[12px] text-black";

function StoryText({ moment, slot }: { moment: StoryMoment; slot: (typeof STORY_SLOTS)[number] }) {
  return (
    <Fit
      fit={slot.left ? FIT.storyLeft : FIT.storyRight}
      className={`${slot.left ? '-translate-x-full text-right' : ''} -translate-y-1/2 absolute max-w-[150px] whitespace-nowrap`}
      style={{ left: slot.left ? 157 : 207, top: slot.top, letterSpacing: slot.tracking }}
    >
      <p className={timelineTitle} style={{ lineHeight: `${slot.titleLeading}px` }}>{moment.title}</p>
      <p className={`${timelineText} relative whitespace-pre-line`} style={{ top: slot.nudge }}>{moment.text}</p>
    </Fit>
  );
}

// The timeline drawing has the four bullets drawn in. With fewer moments it is cut below the
// last one used, and its bottom end cap drawn there.
const TIMELINE = { x: 17.2125, y: 1992.97, w: 331.552, h: 336 };
const BULLET_BOTTOMS = [66, 142.3, 211.5, 292.8];
const CAP_TOP = 326;

function Timeline({ count }: { count: number }) {
  if (count >= MAX_STORY)
    return (
      <div className="absolute inset-[50.57%_6.99%_40.9%_4.59%]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('timeline.svg')} />
      </div>
    );
  const cut = BULLET_BOTTOMS[count - 1] + 26;
  const img = (top: number) => <img alt="" className="absolute left-0 block max-w-none" style={{ top, width: TIMELINE.w, height: TIMELINE.h }} src={A('timeline.svg')} />;
  return (
    <>
      <div className="absolute overflow-hidden" style={{ left: TIMELINE.x, top: TIMELINE.y, width: TIMELINE.w, height: cut }}>{img(0)}</div>
      <div className="absolute overflow-hidden" style={{ left: TIMELINE.x, top: TIMELINE.y + cut, width: TIMELINE.w, height: TIMELINE.h - CAP_TOP }}>{img(-CAP_TOP)}</div>
    </>
  );
}

// ---------- RSVP ----------

const ATTENDANCE: { value: Attendance; label: string; top: number }[] = [
  { value: 'hadir', label: 'Akan Hadir', top: 2548 },
  { value: 'mungkin', label: 'Mungkin Hadir', top: 2591 },
  { value: 'tidak', label: 'Berhalangan Hadir', top: 2634 },
];
const fieldLabel = "-translate-y-1/2 absolute left-[44px] font-['Raleway'] font-medium text-[12px] leading-[20px] tracking-[-0.204px] text-black whitespace-nowrap";
const fieldBox = 'absolute left-[37px] w-[302px] rounded-[10px] border border-solid border-[#aba935] bg-white';
const fieldText = "font-['Raleway'] font-medium text-[12px] leading-[20px] tracking-[-0.204px] text-black placeholder:text-[rgba(0,0,0,0.2)] outline-none";

const SEND_ERRORS: Record<SendError, string> = {
  failed: 'Balasan belum terkirim. Periksa koneksi internet Anda, lalu coba lagi.',
  busy: 'Sedang banyak balasan masuk. Silakan coba lagi sebentar lagi.',
  closed: 'Konfirmasi kehadiran untuk undangan ini sudah ditutup.',
  unavailable: 'Balasan belum bisa dikirim saat ini. Silakan coba lagi nanti.',
};
const THANKS: Record<Attendance, string> = {
  hadir: 'Sampai jumpa di hari bahagia kami!',
  tidak: 'Terima kasih sudah memberi kabar. Doa Anda sangat berarti bagi kami.',
  mungkin: 'Kabari kami lagi jika sudah pasti, ya.',
};

/**
 * The attendance form (see useRsvpForm). After sending, the fields give way to a thank-you
 * card, which is also what the guest sees on reopening the invitation on the same phone.
 */
function Rsvp({ inv, slug, onWish }: { inv: NotebookInvitation; slug?: string; onWish: (wish: Wish) => void }) {
  const { attendance, setAttendance, sent, sending, error, submit, sendAnother } = useRsvpForm(slug, 'notebook', onWish);

  const title = (
    <Centered x={0} y={2416} w={376} h={20} className="font-['La_Belle_Aurore'] text-[18px] leading-[20px] tracking-[-0.306px] text-[#324532]">
      Konfirmasi Kehadiran
    </Centered>
  );

  if (sent)
    return (
      <>
        {title}
        <div role="status" className={`${fieldBox} top-[2472px] flex h-[390px] flex-col items-center justify-center gap-[10px] px-[24px] text-center`}>
          <img alt="" src={A('doodle-couple.webp')} className="block h-[110px] w-[75px] max-w-none object-contain" />
          <p className="font-['La_Belle_Aurore'] text-[26px] leading-[34px] text-[#324532]">Terima kasih!</p>
          <p className="font-['Raleway'] text-[13px] leading-[19px] tracking-[-0.221px] text-black">
            Balasan Anda sudah terkirim kepada {inv.coupleNames}.
            <br />
            {THANKS[sent.attendance]}
          </p>
          {!slug && <p className="font-['Raleway'] text-[11px] leading-[15px] text-[#4e769a]">(Ini hanya demo, jadi tidak ada yang terkirim.)</p>}
          <button type="button" onClick={sendAnother} className="mt-[4px] cursor-pointer font-['Raleway'] text-[12px] leading-[20px] text-[#29567f] underline underline-offset-2">
            kirim balasan lain
          </button>
        </div>
      </>
    );

  return (
    <form onSubmit={submit}>
      {title}

      <label htmlFor="nb-nama" className={fieldLabel} style={{ top: 2457 }}>Nama</label>
      <input
        id="nb-nama"
        name="name"
        required
        maxLength={MAX_NAME}
        autoComplete="name"
        placeholder="Nama Anda"
        className={`${fieldBox} ${fieldText} top-[2472px] h-[38px] px-[14px]`}
      />
      {/* Hidden from guests (off the frame): only bots fill it in, and the script then drops the reply. */}
      {slug && <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-1000px] top-[2472px] h-px w-px" />}

      <p className={fieldLabel} style={{ top: 2533 }}>Konfirmasi Kehadiran</p>
      {ATTENDANCE.map((opt) => (
        <label key={opt.value} className={`${fieldBox} h-[38px] cursor-pointer`} style={{ top: opt.top }}>
          <input
            type="radio"
            name="kehadiran"
            value={opt.value}
            checked={attendance === opt.value}
            onChange={() => setAttendance(opt.value)}
            className="peer sr-only"
          />
          <span className="absolute left-[9px] top-[8px] size-[19px] rounded-full border-2 border-[#324532] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#324532]">
            {attendance === opt.value && <span className="absolute left-[3px] top-[3px] size-[9px] rounded-full bg-[#324532]" />}
          </span>
          <span className="-translate-y-1/2 absolute left-[39px] top-[18px] font-['Raleway'] font-medium text-[12px] leading-[20px] tracking-[-0.204px] text-black whitespace-nowrap">
            {opt.label}
          </span>
        </label>
      ))}

      <label htmlFor="nb-pesan" className={fieldLabel} style={{ top: 2696 }}>Pesan/Ucapan</label>
      <textarea
        id="nb-pesan"
        name="message"
        maxLength={MAX_MESSAGE}
        placeholder="Tulis doa & ucapan Anda..."
        className={`${fieldBox} ${fieldText} top-[2711px] h-[104px] resize-none px-[14px] pt-[9px]`}
      />

      <button
        type="submit"
        disabled={sending}
        className="absolute left-[37px] top-[2824px] h-[38px] w-[302px] cursor-pointer rounded-[10px] bg-[#aba935] disabled:cursor-wait disabled:opacity-70"
      >
        <span className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 font-['Raleway'] font-semibold text-[12px] leading-[20px] tracking-[1.2px] text-white whitespace-nowrap">
          {sending ? 'MENGIRIM…' : 'KIRIM UCAPAN'}
        </span>
      </button>
      {error && (
        <p role="alert" className="-translate-x-1/2 absolute left-1/2 top-[2868px] w-[302px] font-['Raleway'] text-center text-[11px] leading-[14px] text-[#a1251b]">
          {SEND_ERRORS[error]}
        </p>
      )}
    </form>
  );
}

// ---------- Wishes ----------

// On a couple's page (and on the demo, with sample wishes) the guests' wishes get their own band
// under the form, on the same blue: the blue grows by WISHES_H and everything below moves down.
const WISHES_Y = 2884;
const WISHES_H = 460;

function WishesBand({ wishes }: { wishes: WishesState }) {
  const note = "px-[10px] py-[24px] text-center font-['Raleway'] text-[12px] leading-[17px] text-[#4e769a]";
  return (
    <Reveal at={WISHES_Y + 20} kind="fadeUp">
      <Centered x={0} y={WISHES_Y + 20} w={376} h={20} className="font-['La_Belle_Aurore'] text-[18px] leading-[20px] tracking-[-0.306px] text-[#324532]">
        Ucapan &amp; Doa{wishes.wishes.length > 0 && ` (${wishes.wishes.length})`}
      </Centered>
      <div className={`${fieldBox} overflow-y-auto px-[16px]`} style={{ top: WISHES_Y + 58, height: WISHES_H - 100 }}>
        {wishes.wishes.length > 0 ? (
          <ul>
            {wishes.wishes.map((w, i) => (
              <li key={`${i}-${w.time}`} className="border-b border-dashed border-[#accadd] py-[12px] last:border-b-0">
                <p className="flex items-baseline justify-between gap-[8px] font-['Raleway'] text-[13px] leading-[18px] text-[#324532]">
                  <span className="min-w-0 break-words font-semibold">{w.name}</span>
                  <span className="shrink-0 text-[10px] text-[#4e769a]">{timeAgo(w.time, 'id')}</span>
                </p>
                <p className="mt-[4px] whitespace-pre-line break-words font-['Raleway'] text-[12px] leading-[17px] text-[#363636]">{w.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={note}>
            {wishes.status === 'loading'
              ? 'Memuat ucapan…'
              : wishes.status === 'error'
                ? 'Ucapan belum bisa ditampilkan saat ini.'
                : 'Belum ada ucapan. Jadilah yang pertama!'}
          </p>
        )}
      </div>
    </Reveal>
  );
}

// ---------- Gifts ----------

// With only the address card, "Bingkisan Fisik" moves up to where "Tanda Kasih" starts.
const BINGKISAN_UP = 3280 - 2970;
// The flower arch frames the bottom of the last card: with only the bank card it moves up by
// the distance between the two cards' bottoms, less a little so the bushes stay clear of the
// account holder (the bank card's text sits lower in its card than the address does); with no
// gifts at all, to just under the form.
const BANK_ONLY_UP = 3570 - 3245 - 60;
const NO_GIFTS_UP = 400;

// ---------- Page ----------

export default function NotebookContent({ invitation: inv, slug, intro }: { invitation: NotebookInvitation; slug?: string; intro: IntroState }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [photo, setPhoto] = useState<number | null>(null);
  const wishes = useWishes(slug, inv.demo?.sampleWishes);

  // The wishes band: the couple's guests' wishes, or a demo's samples. (Without either, the
  // frame is Figma's exactly.)
  const bandH = slug || inv.demo ? WISHES_H : 0;
  const { bank, giftDelivery: gift } = inv;
  const addressShift = bank ? 0 : -BINGKISAN_UP;
  const closingShift = bank && gift ? 0 : bank ? -BANK_ONLY_UP : gift ? -BINGKISAN_UP : -NO_GIFTS_UP;
  const pageH = PAGE_H + bandH + closingShift;

  const gallery = inv.gallery.slice(0, MAX_GALLERY);
  const story = inv.story.slice(0, MAX_STORY);
  const receptionVenue = inv.reception.venue ?? inv.venue;
  const lightboxPhotos: LightboxPhoto[] = gallery.map((p, i) => ({ src: p.large ?? p.photo, alt: `Foto pre-wedding ${inv.coupleNames} ${i + 1} dari ${gallery.length}` }));

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setScale(el.clientWidth / FRAME_W);
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / FRAME_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const reveals = useScrollReveals({ enabled: ENABLE_ANIMATIONS, frameW: FRAME_W, frameH: FRAME_H, wrapRef, started: intro.revealed, feel: NOTEBOOK_FEEL });

  const eventLine = "font-['Raleway'] text-[15px] leading-[20px] tracking-[-0.255px] text-black";
  const eventLabel = "font-['La_Belle_Aurore'] text-[20px] leading-[20px] tracking-[-0.34px] text-[#324532]";

  return (
    <RevealProvider value={reveals}>
    {/* `overflow: clip` rather than hidden, which would make this box the scroller the scenes'
        depth follows (and it never scrolls). */}
    <div ref={wrapRef} className="relative w-full overflow-clip bg-[#fefffa]" style={{ aspectRatio: `${FRAME_W} / ${pageH}` }}>
      <div className="absolute left-0 top-0" style={{ width: FRAME_W, height: FRAME_H, zoom: scale }}>
        {/* ===== BG ===== */}
        <div className="absolute left-0 top-0 h-[667px] w-[375px] bg-[#fefffa]" />
        <Img file="grass.webp" x={-48} y={-96} w={471} h={678} />
        <div className="absolute inset-[12.89%_0_83.08%_0]"><img alt="" src={A('drip.svg')} className="absolute block inset-0 max-w-none size-full" /></div>
        <Img file="lake.webp" x={-220} y={1217} w={768} h={511} />
        <div className="absolute inset-[41.61%_0_54.35%_0]"><img alt="" src={A('drip.svg')} className="absolute block inset-0 max-w-none size-full" /></div>
        <div className="absolute left-0 top-[2481px] w-[375px] bg-[#ddedf8]" style={{ height: 489 + bandH }} />
        <div className="absolute inset-[59.25%_0_36.72%_0]"><img alt="" src={A('drip-1.svg')} className="absolute block inset-0 max-w-none size-full" /></div>
        <Shift by={bandH} from={2860}>
          <div className="absolute inset-[73%_0_22.96%_0]"><img alt="" src={A('drip-2.svg')} className="absolute block inset-0 max-w-none size-full" /></div>
        </Shift>

        {/* ===== Forests behind the house ===== */}
        <Img file="forest.webp" x={-106} y={1270} w={525} h={249} />
        <Img file="forest.webp" x={-106} y={1270} w={525} h={249} />
        <Img file="forest.webp" x={-45} y={1183} w={423} h={201} />
        <Img file="forest.webp" x={-45} y={1183} w={423} h={201} />

        {/* ===== Envelope letter (first section, settles in as the cover lifts off it; then the
            quote and the doodle appear on it) ===== */}
        <div className="absolute left-0 top-0 h-[480px] w-[375px]" style={introStyle(intro)}>
          <Img file="letter.webp" x={30.33} y={92} w={313.211} h={376} />
          <Reveal at={0} kind="fade" delay={OPENING.letterContentDelayMs[0]}>
            <div className="-translate-y-1/2 absolute font-['La_Belle_Aurore'] text-[13px] leading-[20px] tracking-[-0.221px] text-black whitespace-nowrap" style={{ left: 177, top: 240 }}>
              “I want all of you,
              <br />
              forever, everyday.
              <br />
              You and me...
              <br />
              everyday”
            </div>
            <Centered x={89} y={278} w={184} h={55} className="font-['La_Belle_Aurore'] text-[13px] leading-[20px] tracking-[-0.221px] text-black">
              -The Notebook
            </Centered>
          </Reveal>
          <Reveal at={0} kind="fade" delay={OPENING.letterContentDelayMs[1]}>
            <Img file="doodle-couple.webp" x={90} y={173} w={83} h={123} alt="Ilustrasi pasangan dari film The Notebook" />
          </Reveal>
        </div>

        {/* ===== Greeting + bride & groom ===== */}
        <Reveal at={600} kind="fadeUp">
          <Centered x={0} y={600} w={374} h={20} fit={FIT.salutation} className="font-['La_Belle_Aurore'] text-[18px] leading-[20px] tracking-[-0.306px] text-[#324532]">
            {inv.salutation ?? DEFAULT_SALUTATION}
          </Centered>
        </Reveal>
        <Reveal at={627} kind="fadeUp" delay={120}>
          <Centered x={26} y={627} w={324} h={51} className="font-['Raleway'] text-[12px] leading-[18px] tracking-[-0.204px] text-[#324532]">
            Dengan penuh rasa syukur dan kebahagiaan, kami
            <br />
            mengundang Bapak/Ibu/Saudara/i untuk hadir dan
            <br />
            memberikan doa restu pada hari pernikahan kami:
          </Centered>
        </Reveal>
        {[
          { person: inv.bride, frame: ['inset-[17.9%_8.68%_78.01%_55.2%]', 'inset-[21.93%_23.54%_77.73%_70.23%]', 'inset-[17.53%_23.77%_82.04%_70%]'], box: 'inset-[17.67%_-17.71%_76.64%_57.93%]', maskX: 8.484, origin: [274.7, 786] as [number, number], tilt: -2, delay: 330 },
          { person: inv.groom, frame: ['inset-[17.9%_55.08%_78.01%_8.8%]', 'inset-[21.93%_69.94%_77.73%_23.83%]', 'inset-[17.53%_70.17%_82.04%_23.6%]'], box: 'inset-[17.67%_57.54%_76.64%_-17.33%]', maskX: 116.706, origin: [100.7, 786] as [number, number], tilt: 2, delay: 200 },
        ].map((p) => (
          // Each portrait settles into place, the groom's first.
          <Reveal key={p.maskX} at={705} kind="settle" origin={p.origin} tilt={p.tilt} delay={p.delay}>
            <div>
              {p.frame.map((inset, i) => (
                <div key={inset} className={`absolute ${inset}`}>
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={A(['oval-frame.svg', 'oval-bow-bottom.svg', 'oval-bow-top.svg'][i])} />
                </div>
              ))}
              <MaskedPhoto box={p.box} boxMask={['oval-mask.svg', p.maskX, 20.814, 97.277, 140.529]} src={p.person.photo} alt={p.person.name} />
            </div>
          </Reveal>
        ))}
        {/* Each name, then their parents, the groom's first. */}
        <Staggered at={881} delay={300}>
          {[
            { person: inv.groom, x: 44 },
            { person: inv.bride, x: 218 },
          ].flatMap(({ person, x }) => [
            <Centered key={`name-${x}`} x={x} y={881} w={113} h={18} fit={FIT.name} className="font-['Yeseva_One'] text-[14px] leading-[18px] tracking-[-0.238px] text-[#324532]">
              {person.name}
            </Centered>,
            // Wraps in Figma's 113px column (two lines for the sample), growing downwards.
            <Fit
              key={`parents-${x}`}
              fit={FIT.parents}
              className="-translate-x-1/2 absolute w-[113px] text-center font-['Raleway'] text-[10px] leading-[12px] tracking-[-0.17px] text-black"
              style={{ left: x + 113 / 2, top: 902.5 }}
            >
              <KeepHyphenated text={`${person.parentsLabel} ${person.parents}`} />
            </Fit>,
          ])}
        </Staggered>

        {/* ===== Akad Nikah (the card, then its lines one by one) ===== */}
        <Staggered at={968}>
          <StampCard outer="inset-[24.56%_14.17%_70.62%_14.93%]" inner="inset-[25.04%_18.95%_71.13%_19.6%]" outerFile="akad-stamp.svg" innerFile="akad-inner.svg" />
          <Centered x={0} y={1005} w={376} h={20} fit={FIT.event} className={eventLabel}>
            {inv.ceremony.label ?? 'Akad Nikah'}
          </Centered>
          <Centered x={0} y={1028} w={376} h={20} className={eventLine}>{dateIdLong(inv.date)}</Centered>
          <Centered x={0} y={1048} w={376} h={20} fit={FIT.event} className={eventLine}>{inv.ceremony.time}</Centered>
          <Centered x={0} y={1068} w={376} h={20} fit={FIT.event} className={eventLine}>{inv.venue.name}</Centered>
          <LihatLokasi top={1098} color="#aba935" venue={inv.venue} />
        </Staggered>

        {/* ===== Resepsi (card is rotated -87.52° in Figma) ===== */}
        <Staggered at={1168} delay={120}>
          {[
            ['inset-[29.64%_13.11%_65.26%_13.87%]', 'resepsi-stamp.svg', 'h-[hypot(97.0033cqw,5.70429cqh)] w-[hypot(2.99669cqw,-94.2957cqh)]'],
            ['inset-[30.13%_18.1%_65.79%_18.77%]', 'resepsi-inner.svg', 'h-[hypot(97.2496cqw,6.19821cqh)] w-[hypot(2.75041cqw,-93.8018cqh)]'],
          ].map(([inset, file, size]) => (
            <div key={file} className={`absolute flex ${inset} items-center justify-center`} style={{ containerType: 'size' }}>
              <div className={`flex-none rotate-[-87.52deg] ${size}`}>
                <div className="relative size-full">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={A(file)} />
                </div>
              </div>
            </div>
          ))}
          <Centered x={1} y={1210.65} w={375} h={20} className={eventLabel}>
            Resepsi
          </Centered>
          <Centered x={0} y={1233.65} w={376} h={20} className={eventLine}>{dateIdLong(inv.date)}</Centered>
          <Centered x={0} y={1253.65} w={376} h={20} fit={FIT.event} className={eventLine}>{inv.reception.time}</Centered>
          <Centered x={0} y={1273.65} w={376} h={20} fit={FIT.event} className={eventLine}>{receptionVenue.name}</Centered>
          <LihatLokasi top={1303.65} color="#4e769a" venue={receptionVenue} />
        </Staggered>

        {/* ===== House & boat =====
            Depth: the house sits furthest back and the trees a little nearer, both drifting
            slower than the page; the lake, boat and ducks are the ground and stay put; the lamps
            hang in front and drift faster. The forests behind stay put too: the Resepsi card's
            text is drawn over them (see Scene). The wind blows from right to left and bends both
            trees, drawn over the Resepsi card as in Figma: the left one fully, the right one
            only as far as keeps its edge, cut off just beyond the frame, beyond it. */}
        <Scene box={[-12, 1256, 390, 225]}>
          <Img file="house.webp" x={94} y={1349} w={207} h={132} depth={6} />
          <Img file="tree.webp" x={-12} y={1256} w={150} h={225} depth={4} wind={treeWind(true)} />
          <Img file="tree.webp" x={228} y={1256} w={150} h={225} flip depth={4} wind={treeWind(false)} />
        </Scene>
        <Img file="duck.webp" x={42} y={1506} w={49} h={33} />
        <Img file="duck.webp" x={8} y={1555} w={68} h={45} />
        {[[326, 952], [6, 1114]].map(([x, y]) => (
          <Scene key={y} box={[x, y, 45, 66]}>
            <Img file="lamp.webp" x={x} y={y} w={45} h={66} depth={-6} />
          </Scene>
        ))}
        <Img file="couple-boat.webp" x={42} y={1436} w={274} h={205} alt="Ilustrasi pasangan di perahu" />
        <Img file="duck.webp" x={290} y={1573} w={119} h={80} flip />

        {/* ===== Photo collage ===== */}
        <Collage photos={gallery} coupleNames={inv.coupleNames} onOpen={setPhoto} />

        {/* ===== Cerita Kami ===== */}
        <Reveal at={1993} kind="fade" delay={150}>
          <Timeline count={story.length} />
        </Reveal>
        <Reveal at={1959} kind="fadeUp">
          <Centered x={84} y={1959} w={200} h={20} className="font-['La_Belle_Aurore'] text-[30px] leading-[20px] tracking-[-0.51px] text-[#4e769a]">
            Cerita Kami...
          </Centered>
        </Reveal>
        {story.map((moment, i) => {
          const slot = STORY_SLOTS[i];
          return (
            <Reveal key={i} at={slot.at} kind={slot.left ? 'fromLeft' : 'fromRight'} delay={slot.left ? 120 : 200}>
              <StoryText moment={moment} slot={slot} />
            </Reveal>
          );
        })}
        <Reveal at={1969} kind="pop" origin={[50.1, 1987]} delay={400}>
          <Float box={[34, 1969, 32.2, 36]} delay={600}>
            <Img file="heart-1.svg" x={34} y={1969} w={32.2} h={36} />
          </Float>
        </Reveal>
        {/* The lower hearts sit by the third and fourth moments, and go with them. */}
        {story.length >= 3 && (
          <Reveal at={2210} kind="pop" origin={[340.1, 2228]} delay={400}>
            <Img file="heart-1.svg" x={324} y={2210} w={32.2} h={36} />
          </Reveal>
        )}
        {story.length >= 4 && (
          <Reveal at={2299} kind="pop" origin={[110.1, 2314]} delay={400}>
            <Float box={[96.68, 2299, 26.83, 30]} delay={2000}>
              <Img file="heart-2.svg" x={96.68} y={2299} w={26.83} h={30} />
            </Float>
          </Reveal>
        )}
        <Reveal at={2005} kind="pop" origin={[289.3, 2016.5]} delay={500}>
          <Img file="heart-3.svg" x={279} y={2005} w={20.57} h={23} />
        </Reveal>
        {(COLLAGE_LAMPS[gallery.length] ?? COLLAGE_LAMPS[MAX_GALLERY]).map(([x, y]) => (
          <Img key={x} file="lamp.webp" x={x} y={y} w={56} h={82} />
        ))}

        {/* ===== Konfirmasi Kehadiran ===== */}
        <Reveal at={2416} kind="fadeUp">
          <Rsvp inv={inv} slug={slug} onWish={wishes.add} />
        </Reveal>
        {bandH > 0 && <WishesBand wishes={wishes} />}

        <Shift by={bandH} from={2950}>
          {/* ===== Tanda Kasih & Bingkisan Fisik ===== */}
          {bank && (
            <Reveal at={2986} kind="fadeUp" delay={120}>
              <Centered x={43} y={2986} w={289} h={61} className="font-['Raleway'] text-[12px] leading-[15px] tracking-[-0.204px] text-black">
                Doa restu Anda adalah karunia yang berarti bagi kami.
                <br />
                Jika ingin memberi tanda kasih, kami dengan senang
                <br />
                hati menerimanya melalui:
              </Centered>
            </Reveal>
          )}
          <Shift by={closingShift} from={3390}>
            <Img file="forest.webp" x={-137} y={3402} w={677} h={321} />
            <Img file="forest.webp" x={-159} y={3599} w={721} h={342} />
            {/* The closing words, inside the flower arch below. Drawn here, under the lilies,
                bushes and arch (none of which reach them), so that while those plants move the
                words stay on the page's own layer and keep their sub-pixel smoothing (see Scene). */}
            <Staggered at={3723} delay={150}>
              <Fit
                fit={FIT.closing}
                className="-translate-x-1/2 -translate-y-1/2 absolute w-max max-w-[150px] text-center whitespace-pre-line font-['La_Belle_Aurore'] text-[17px] leading-[20px] tracking-[-0.289px] text-white"
                style={{ left: 195, top: 3743 }}
              >
                {inv.closing.text ?? DEFAULT_CLOSING}
              </Fit>
              <Centered x={141} y={3774} w={108} h={20} fit={FIT.signature} className="font-['La_Belle_Aurore'] text-[20px] leading-[20px] tracking-[-0.34px] text-white">
                {inv.closing.signature}
              </Centered>
            </Staggered>
            {/* ===== Made with love by nicemice: background and credit (its scalloped edge is
                drawn at the very end, over the arch) ===== */}
            <MadeWithLoveFooter y={3965} bgTop={3937} frameH={PAGE_H} background="#fefffa" />
          </Shift>

          {bank && (
            <Staggered at={3055} delay={150}>
              <StampCard outer="inset-[77.52%_15.24%_17.66%_13.87%]" inner="inset-[78%_20.02%_18.18%_18.53%]" outerFile="card-stamp.svg" innerFile="card-inner.svg" />
              <Centered x={1} y={3099} w={375} h={20} fit={FIT.gift} className="font-['Raleway'] font-bold text-[25px] leading-[20px] tracking-[-0.425px] text-[#29567f]">
                {bank.bank}
              </Centered>
              <Centered x={0} y={3130} w={375} h={20} fit={FIT.gift} className="font-['Open_Sans'] text-[30px] leading-[20px] text-[#29567f]">
                {bank.number}
              </Centered>
              {/* Copied without spaces or dashes, so it pastes straight into a banking app. */}
              <SalinButton top={3166} label="Salin nomor rekening" text={bank.number.replace(/[\s-]/g, '')} />
              <Centered x={138} y={3195} w={100} h={15} fit={FIT.gift} className="font-['Raleway'] text-[10px] leading-[15px] tracking-[-0.17px] text-[#29567f]">
                {bank.holder}
              </Centered>
            </Staggered>
          )}

          {gift && (
            <Shift by={addressShift} from={3340}>
              <Staggered at={3354} delay={150}>
                {/* Address card: 26px taller than in Figma (Figma's card has no Salin button and no
                    room for one), with the text moved up 8px so name, address and button sit evenly. */}
                <StampCard
                  outer="left-[52px] top-[3354.2px] w-[265.8px] h-[216px]"
                  inner="left-[69.5px] top-[3375.2px] w-[230.6px] h-[171.6px]"
                  outerFile="card-stamp.svg"
                  innerFile="card-inner.svg"
                />
                <Centered x={0.5} y={3390} w={375} h={20} fit={FIT.gift} className="font-['Raleway'] font-bold text-[25px] leading-[20px] tracking-[-0.425px] text-[#29567f]">
                  {gift.name}
                </Centered>
                <Centered x={88} y={3424} w={200} h={75} fit={FIT.giftAddress} className="font-['Raleway'] text-[10px] leading-[15px] tracking-[-0.17px] text-[#29567f]">
                  <Lines lines={gift.addressLines} />
                </Centered>
              </Staggered>
            </Shift>
          )}

          {bank && (
            <Reveal at={2970} kind="fadeUp">
              <Centered x={146} y={2970} w={84} h={20} className="font-['La_Belle_Aurore'] text-[18px] leading-[20px] tracking-[-0.306px] text-[#324532]">
                Tanda Kasih
              </Centered>
            </Reveal>
          )}
          {gift && (
            <Shift by={addressShift} from={3265}>
              <Reveal at={3280} kind="fadeUp" delay={120}>
                <Centered x={43} y={3296} w={289} h={61} className="font-['Raleway'] text-[12px] leading-[15px] tracking-[-0.204px] text-black">
                  Jika Anda ingin mengirimkan tanda kasih dalam
                  <br />
                  bentuk bingkisan, silakan kirimkan ke alamat berikut:
                </Centered>
              </Reveal>
              <Reveal at={3280} kind="fadeUp">
                <Centered x={132} y={3280} w={112} h={20} className="font-['La_Belle_Aurore'] text-[18px] leading-[20px] tracking-[-0.306px] text-[#324532]">
                  Bingkisan Fisik
                </Centered>
              </Reveal>
            </Shift>
          )}

          {/* ===== Closing flower arch =====
              Depth: the lilies and the bushes are nearest, drifting faster than the page; the
              arch and the forests behind it stay put. The lilies, cut off at the frame's edges,
              move in the same breeze as the trees (see LILY_WIND), about the point where their
              stems leave the frame. Nothing with text is drawn over the moving lilies or the arch above them (see
              Scene): the closing words and the footer's credit come earlier, under them, where
              none of them reach. */}
          <Shift by={closingShift} from={3370}>
            <Reveal at={3389} kind="pop" origin={[309.5, 3638]} delay={300}>
              <Scene box={[244, 3389, 131, 249.393]}>
                <Img file="lily-1.webp" x={244} y={3389} w={131} h={249.393} depth={-8} wind={LILY_WIND.right} />
              </Scene>
            </Reveal>
          </Shift>
          {/* The lily beside the bank card goes with it. */}
          {bank && (
            <Reveal at={3019} kind="pop" origin={[72.9, 3333]} delay={300}>
              <Scene box={[0, 3019, 145.808, 314.55]}>
                <Img file="lily-2.webp" x={0} y={3019} w={145.808} h={314.55} depth={-6} wind={LILY_WIND.left} />
              </Scene>
            </Reveal>
          )}
          <Shift by={closingShift} from={3400}>
            {/* The bushes stay still: the address card's Salin button is drawn over them (so no
                leaf can cover it), and over a moving layer its label would lose its sub-pixel
                smoothing (see Scene). */}
            <Img file="bushes-flower.webp" x={-9} y={3418} w={256} h={171} />
            <Img file="gapura.webp" x={2} y={3546} w={372} h={391} />
          </Shift>

          {/* ===== Made with love by nicemice: its scalloped edge, over the arch (its background
              and credit are drawn earlier, see above) ===== */}
          <Shift by={closingShift} from={3925}>
            {/* Figma's 447.07 × 33.70 box holds the 446.885 × 30.903 scallop, centred. */}
            <img alt="" src={A('footer-scallop.svg')} className="absolute block max-w-none" style={{ left: -60.85, top: 3931.2, width: 446.885, height: 30.903 }} />
          </Shift>

          {/* Drawn last so the foliage around the address card can't cover it; it arrives after the
              card's name and address. */}
          {gift && (
            <Shift by={addressShift} from={3495}>
              <Reveal at={3354} kind="fadeUp" delay={150 + 3 * STAGGER_MS}>
                <SalinButton top={3509} label="Salin alamat" text={oneLine([gift.name, ...gift.addressLines])} />
              </Reveal>
            </Shift>
          )}
        </Shift>
      </div>

      {photo !== null && <PhotoLightbox photos={lightboxPhotos} start={photo} theme={LIGHTBOX_THEME(inv.coupleNames)} onClose={() => setPhoto(null)} />}
    </div>
    </RevealProvider>
  );
}
