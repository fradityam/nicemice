import { Fragment, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { formatIsoDate, parseIsoDate } from '../../invitations/dates';
import { MAX_MESSAGE, MAX_NAME, timeAgo, useRsvpForm, useWishes, type Attendance, type SendError, type Wish, type WishesState } from '../../invitations/rsvp';
import type { GalleryPhoto, LaLaLandInvitation, StoryMoment } from '../../invitations/types';
import { useFit, type FitBox } from './fitText';
import { Handwritten } from './handwriting';
import { useLight } from './lalalandLights';
import { OPENING } from './lalalandOpening';
import { MadeWithLoveFooter } from './MadeWithLoveFooter';
import { Float, Reveal, RevealOffset, RevealProvider, useReveal, useScrollReveals } from './scrollReveal';
import './lalaland.css';

// Every layer below is laid out in the Figma "Content" frame's own coordinate space. The
// whole frame is then scaled uniformly to the column width, so the composition stays
// identical on any phone — positions, sizes and font sizes are the Figma values verbatim.
// The frame is 375 × 4795 with the closing card and "Made with love" footer; the layers
// above them were laid out (many with % insets) when it was 375 × 4641, so that stays the
// frame box and the closing extends below it to PAGE_H.
const FRAME_W = 375;
const FRAME_H = 4641;
const PAGE_H = 4795;

const assetUrls = import.meta.glob('../../assets/images/lalaland/figma/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const A = (file: string) => assetUrls[`../../assets/images/lalaland/figma/${file}`];

const mask = (file: string, position: string, size: string): CSSProperties => {
  const url = `url("${A(file)}")`;
  return {
    maskImage: url,
    WebkitMaskImage: url,
    maskMode: 'alpha',
    maskComposite: 'intersect',
    WebkitMaskComposite: 'source-in',
    maskClip: 'no-clip',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: position,
    WebkitMaskPosition: position,
    maskSize: size,
    WebkitMaskSize: size,
  };
};

// Cover → content transition. As the cover goes (see lalalandOpening.ts), the Quotes card fades
// in and rises QUOTES_RISE_PX into place, when the opening says.
const QUOTES_RISE_PX = 32;
const EASE_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';

export type IntroState = { revealed: boolean; reducedMotion: boolean };

function quotesIntroStyle({ revealed, reducedMotion }: IntroState): CSSProperties {
  if (reducedMotion) return {};
  if (!revealed) return { opacity: 0, transform: `translateY(${QUOTES_RISE_PX}px)` };
  const t = `${OPENING.quotes.ms}ms ${EASE_OUT} ${OPENING.quotes.delayMs}ms`;
  return { opacity: 1, transform: 'translateY(0)', transition: `opacity ${t}, transform ${t}` };
}

/** Subtle one-time reveals on the cover and as sections scroll into view. Set to false to turn them all off. */
export const ENABLE_ANIMATIONS = true;

/** The design's date styles, from the couple's 'YYYY-MM-DD'. */
export const dateId = (iso: string) => formatIsoDate(iso, 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); // 23 Agustus 2026
const dateIdLong = (iso: string) => formatIsoDate(iso, 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); // Minggu, 23 Agustus 2026
const dateEn = (iso: string) => formatIsoDate(iso, 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); // 23 August 2026

/** The wedding day at the ceremony's start ('08.00 - 11.00' → 08:00), or midnight without a time. */
function ceremonyStart(inv: LaLaLandInvitation) {
  const d = parseIsoDate(inv.date);
  const time = inv.ceremony.time.match(/(\d{1,2})[.:](\d{2})/);
  if (time) d.setHours(Number(time[1]), Number(time[2]));
  return d;
}

const mapsSearch = (place: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
/** Address lines joined into one, for Maps and for copying: 'Jl. Cempaka No. 18, Kota Bogor'. */
const oneLine = (lines: string[]) => lines.map((l) => l.trim().replace(/,$/, '')).join(', ');

// The room each piece of the couple's text has (see FitBox). Text longer than the sample
// shrinks to fit rather than running out of its slot.
const FIT = {
  coverName: { w: 331 },
  coverGuest: { w: 300 },
  name: { w: 335 },
  parents: { w: 345 },
  eventLabel: { w: 140 },
  time: { w: 98, origin: '0 50%' },
  venue: { w: 160, origin: '0 50%' },
  venueAddress: { w: 160, h: 26, origin: '0 0' },
  storyLeft: { w: 150, h: 110, origin: '100% 50%' },
  storyRight: { w: 150, h: 110, origin: '0 50%' },
  gift: { w: 260 },
  giftAddress: { w: 260, h: 100 },
  closing: { w: 260, h: 80 },
  signature: { w: 280 },
} satisfies Record<string, FitBox>;

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

// Handwritten headings start as soon as they are just on screen, before the reveals around them.
// A name under a photo waits for the photo to start settling; the closing is signed once its
// paper and words have faded in (they reveal at much the same moment, see the closing).
const NAME_WRITE_DELAY_MS = 500;
const SIGN_DELAY_MS = 1300;

/** Lines of text with a <br /> between them. */
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
 * Layers moved down by `by` frame px (or up, when negative), e.g. everything below the wishes
 * band; their reveals move with them. No wrapper at all when `by` is 0, so layers that don't
 * move render exactly as laid out.
 */
function Shift({ by, children }: { by: number; children: ReactNode }) {
  const offset = useContext(RevealOffset);
  if (!by) return <>{children}</>;
  return (
    <RevealOffset.Provider value={offset + by}>
      <div className="absolute left-0 top-0 *:pointer-events-auto" style={{ width: FRAME_W, height: FRAME_H, transform: `translateY(${by}px)`, pointerEvents: 'none' }}>
        {children}
      </div>
    </RevealOffset.Provider>
  );
}

// Figma render bounds (Content-frame px) of each starfield's COLOR_DODGE group.
const FLARES = [
  { file: 'flare-665.webp', top: 687.3, w: 369.7, h: 446.16 },
  { file: 'flare-1165.webp', top: 1187.3, w: 375, h: 446.16 },
  { file: 'flare-2245.webp', top: 2267.3, w: 375, h: 446.16 },
  { file: 'flare-3195.webp', top: 3224.03, w: 203.62, h: 580.9 },
];
/**
 * Whether the element is on screen (or nearly), for idle motion that only runs there; also
 * toggles `data-live` on it, which starts a scene's depth (lalaland.css).
 */
function useLive<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        el.toggleAttribute('data-live', entry.isIntersecting);
        setLive(entry.isIntersecting);
      },
      { rootMargin: '100px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, live] as const;
}

// The brightest stars that aren't hidden behind a photo or a card, each twinkling now and then:
// its starfield's file, its centre and how far its rays reach (frame px), how often it flares up
// and how far behind the page's clock.
const TWINKLES: Record<string, { x: number; y: number; r: number; ms: number; delay: number }[]> = {
  'flare-665.webp': [
    { x: 316.7, y: 1091.5, r: 38, ms: 8600, delay: -2400 },
    { x: 350.7, y: 995.7, r: 16, ms: 10400, delay: -7000 },
  ],
  'flare-1165.webp': [{ x: 334, y: 1591.5, r: 38, ms: 9400, delay: -5600 }],
  'flare-2245.webp': [{ x: 316, y: 2293.3, r: 23, ms: 7900, delay: -1500 }],
  'flare-3195.webp': [
    { x: 14, y: 3259, r: 29, ms: 11200, delay: -8300 },
    { x: 134.7, y: 3750.9, r: 49, ms: 8200, delay: -3900 },
  ],
};
// A twinkling star's rays reach this much further at its brightest.
const TWINKLE_REACH = 1.25;

/**
 * One star of a starfield flaring up now and then: the same star from the starfield's image, a
 * touch larger, blended over it more brightly at times and not at all in between, so at rest the
 * sky is exactly as painted. Just around the star, so only that small box repaints.
 */
function Twinkle({ file, top: fileTop, w, h, x, y, r, ms, delay }: { file: string; top: number; w: number; h: number; x: number; y: number; r: number; ms: number; delay: number }) {
  const [ref, live] = useLive<HTMLDivElement>();
  const star = useRef<HTMLImageElement>(null);
  useLight(star, 'twinkle', { ms, delay, active: live });
  const half = Math.ceil(r * TWINKLE_REACH) + 2;
  const [left, top] = [x - half, y - half];
  return (
    <div ref={ref} className="pointer-events-none absolute overflow-hidden" style={{ left, top, width: 2 * half, height: 2 * half }}>
      <img
        ref={star}
        alt=""
        src={A(file)}
        className="ll-twinkle absolute block max-w-none"
        style={{
          left: -left,
          top: fileTop - top,
          width: w,
          height: h,
          mixBlendMode: 'color-dodge',
          transform: `scale(${TWINKLE_REACH})`,
          transformOrigin: `${x}px ${y - fileTop}px`,
        }}
      />
    </div>
  );
}

/**
 * One starfield's few bright stars, fading in as they scroll into view, and then twinkling. The
 * layer fades by itself: a fading wrapper would cut its colour-dodge off from the sky it blends
 * with.
 */
function Flare({ file, top, w, h }: { file: string; top: number; w: number; h: number }) {
  const reveal = useReveal(top + 120, 'fade', { delay: 200 });
  return (
    <>
      <img
        alt=""
        src={A(file)}
        className="absolute block max-w-none"
        style={{ left: 0, top, width: w, height: h, mixBlendMode: 'color-dodge', ...reveal?.style }}
        onTransitionEnd={reveal?.onTransitionEnd}
      />
      {reveal?.done && TWINKLES[file]?.map((t) => <Twinkle key={t.x} file={file} top={top} w={w} h={h} {...t} />)}
    </>
  );
}

/**
 * Plain image layer at a Figma box which, inside a Scene, drifts at its own `depth` as it scrolls
 * by (positive: further away, so slower than the page; negative: nearer).
 */
function DepthImg({ file, x, y, w, h, depth, alt = '' }: { file: string; x: number; y: number; w: number; h: number; depth: number; alt?: string }) {
  return (
    <div className="ll-depth absolute left-0 top-0" style={{ '--ll-depth': depth } as CSSProperties}>
      <img alt={alt} src={A(file)} className="absolute block max-w-none" style={{ left: x, top: y, width: w, height: h }} />
    </div>
  );
}

// Room around a Scene's layers for them to move in.
const SCENE_MARGIN = 14;

/**
 * Layers (DepthImg) that move as one scene, as in The Notebook: each is exactly at its Figma
 * position whenever the scene's box is centred on screen, and they move only while the scene is on
 * screen (or nearly). The box also clips them, just around themselves: Chrome assumes a running
 * animation may overlap everything painted after it and would move that onto separate layers, so
 * text painted later would lose its sub-pixel smoothing. Keep text drawn after a Scene out of its
 * box. (Not for layers inside a Shift: its transform would move the scene from the scroll
 * position the depth follows.)
 */
function Scene({ box: [x, y, w, h], children }: { box: [number, number, number, number]; children: ReactNode }) {
  const [ref] = useLive<HTMLDivElement>();
  if (!ENABLE_ANIMATIONS) return <>{children}</>;
  const m = SCENE_MARGIN;
  return (
    <div ref={ref} className="ll-scene pointer-events-none absolute overflow-clip" style={{ left: x - m, top: y - m, width: w + 2 * m, height: h + 2 * m }}>
      <div className="absolute [&_img]:pointer-events-auto" style={{ left: m - x, top: m - y }}>
        {children}
      </div>
    </div>
  );
}

const BG_ILLUSTRATIONS = [
  { file: 'piano-1.webp', top: 2756, h: 448 },
  // The piano under the gifts: part of the "Tanda Kasih" stretch, gone with it.
  { file: 'piano-2.webp', top: 3767, h: 683, gifts: true },
  { file: 'bg-pool.webp', top: 1692, h: 573 },
];

// Paper rip vector: node box is 398.887 × 33.13; the exported SVG adds 1% on each side
// and 24.15% below for the drop shadow.
function PaperRip({ x = -18, y }: { x?: number; y: number }) {
  return (
    <img
      alt=""
      src={A('ea3d9.svg')}
      className="absolute block max-w-none"
      style={{ left: x - 3.98887, top: y, width: 406.887, height: 41.1304 }}
    />
  );
}

function Hline({ left, top, width, file }: { left: number; top: number; width: number; file: string }) {
  return (
    <div className="absolute h-0" style={{ left, top, width }}>
      <div className="absolute inset-[-1px_0_0_0]">
        <img alt="" className="block max-w-none size-full" src={A(file)} />
      </div>
    </div>
  );
}

function Vline({ left, top, height, file }: { left: number; top: number; height: number; file: string }) {
  return (
    <div className="absolute flex items-center justify-center w-0" style={{ left, top, height }}>
      <div className="flex-none rotate-90">
        <div className="h-0 relative" style={{ width: height }}>
          <div className="absolute inset-[-1px_0_0_0]">
            <img alt="" className="block max-w-none size-full" src={A(file)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SalinButton({ top, label, text }: { top: number; label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <div className="absolute bg-[#efecec] border border-[#accadd] border-solid h-[22px] left-[156px] rounded-[20px] w-[64px]" style={{ top }} />
      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Raleway'] font-normal justify-center leading-[0] text-[10px] text-[#081a51] text-center tracking-[-0.17px] whitespace-nowrap"
        style={{ top: top + 11.5, left: copied ? 188 : 195.5 }}
      >
        <p className="leading-[15px]">{copied ? 'TERSALIN' : 'SALIN'}</p>
      </div>
      {/* "TERSALIN" is wider than the label slot, so it replaces the icon and centres. */}
      {!copied && <img alt="" src={A('8ae9e.svg')} className="absolute block max-w-none" style={{ left: 166.01, top: top + 4.33, width: 10.99, height: 13.47 }} />}
      <button
        type="button"
        aria-label={label}
        className="absolute left-[156px] h-[22px] w-[64px] rounded-[20px] cursor-pointer"
        style={{ top }}
        onClick={() => {
          navigator.clipboard?.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
      />
    </>
  );
}

// Figma's rgba(144,105,165,0) → #081a51 gradient, interpolated the way Figma does it
// (non-premultiplied, so the purple tint carries through the middle). A plain CSS
// gradient interpolates premultiplied and comes out noticeably darker mid-way. Used by
// the cover and the closing.
export const NAVY_FADE = `linear-gradient(to bottom, ${Array.from({ length: 11 }, (_, i) => {
  const t = i / 10;
  const c = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgba(${c(144, 8)},${c(105, 26)},${c(165, 81)},${t}) ${t * 100}%`;
}).join(', ')})`;

const pad2 = (n: number) => String(n).padStart(2, '0');

function CountdownNumbers({ target }: { target: Date }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const total = Math.max(0, Math.floor((target.getTime() - now) / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor(total / 3600) % 24;
  const minutes = Math.floor(total / 60) % 60;
  const seconds = total % 60;

  return (
    <div className="leading-[normal] text-[#f9de1f] text-center" role="timer" aria-live="off">
      {/* Figma's "137" + "days" group, centred at 192px: "days" follows the number 2.9px
          after it and 22.87px lower. Built as a row so the group stays centred whatever the
          digit count. */}
      <div className="-translate-x-1/2 absolute flex items-start left-[calc(50%+4.5px)] top-[2551.13px] whitespace-nowrap">
        <span className="font-['Federo'] text-[40px]">{days}</span>
        <span className="font-['Raleway'] text-[15px] ml-[2.9px] mt-[22.87px]">days</span>
      </div>
      <p className="-translate-x-1/2 absolute font-['Federo'] h-[27.597px] left-[calc(50%-105.06px)] text-[25px] top-[2612.98px] w-max">{pad2(hours)}</p>
      <p className="-translate-x-1/2 absolute font-['Raleway'] h-[13px] left-[calc(50%-106px)] text-[10px] top-[2641px] w-[31px]">hours</p>
      <p className="-translate-x-1/2 absolute font-['Federo'] h-[27.597px] left-[calc(50%-5.25px)] text-[25px] top-[2612.98px] w-max">{pad2(minutes)}</p>
      <p className="-translate-x-1/2 absolute font-['Raleway'] h-[13.323px] left-[calc(50%-6.69px)] text-[10px] top-[2641px] w-[41.621px]">minutes</p>
      <p className="-translate-x-1/2 absolute font-['Federo'] h-[27.597px] left-[calc(50%+102.47px)] text-[25px] top-[2612.98px] w-max">{pad2(seconds)}</p>
      <p className="-translate-x-1/2 absolute font-['Raleway'] h-[13px] left-[calc(50%+102px)] text-[10px] top-[2641px] w-[51px]">seconds</p>
    </div>
  );
}

// ---------- Pre-wedding gallery ----------

const MAX_GALLERY = 5;
// The thumbnail row (slides 2–5): Figma's four slots; fewer thumbnails are centred instead.
const THUMBS_4 = [
  { left: 30, w: 70 },
  { left: 112, w: 69 },
  { left: 194, w: 69 },
  { left: 275, w: 70 },
];
const THUMB_W = 70;
const THUMB_GAP = 12;
const thumbSlots = (count: number) =>
  count === THUMBS_4.length
    ? THUMBS_4
    : Array.from({ length: count }, (_, i) => ({ left: (FRAME_W - (count * THUMB_W + (count - 1) * THUMB_GAP)) / 2 + i * (THUMB_W + THUMB_GAP), w: THUMB_W }));
// The demo's first slide keeps Figma's own crop of its hero photo; every other photo fills the frame.
const FIGMA_CROPS: Record<string, string> = {
  [A('498fb.webp')]: 'absolute h-[114.03%] left-[-2.27%] max-w-none top-[-14.03%] w-[103.02%]',
};
const AUTOPLAY_MS = 4000;
const FADE_MS = 800;
const SWIPE_MIN_PX = 40;

function SlideImage({ photos, index, coupleNames }: { photos: GalleryPhoto[]; index: number; coupleNames: string }) {
  const src = photos[index].large ?? photos[index].photo;
  const alt = `Foto pre-wedding ${coupleNames} (${index + 1} dari ${photos.length})`;
  return <img alt={alt} src={src} className={FIGMA_CROPS[src] ?? 'absolute inset-0 size-full max-w-none object-cover'} draggable={false} />;
}

function FadeInLayer({ animate, children }: { animate: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (animate) ref.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: 'ease-in-out' });
  }, [animate]);
  return (
    <div ref={ref} className="absolute inset-0">
      {children}
    </div>
  );
}

function PrewedGallery({ photos, coupleNames }: { photos: GalleryPhoto[]; coupleNames: string }) {
  const count = photos.length;
  const frameRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  // `prev` stays fully opaque underneath while `active` fades in on top, so the crossfade
  // never dips to the background. `tick` bumps on every navigation to restart autoplay.
  const [slides, setSlides] = useState({ active: 0, prev: 0, fadeId: 0, tick: 0 });
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);

  const show = (target: (current: number) => number) =>
    setSlides((s) => {
      const next = (((target(s.active)) % count) + count) % count;
      return next === s.active
        ? { ...s, tick: s.tick + 1 }
        : { active: next, prev: s.active, fadeId: s.fadeId + 1, tick: s.tick + 1 };
    });

  useEffect(() => {
    for (const p of photos) {
      const img = new Image();
      img.src = p.large ?? p.photo;
      img.decode().catch(() => {});
    }
  }, [photos]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    if (count < 2 || !inView || !pageVisible) return;
    const t = setTimeout(() => show((a) => a + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [slides.tick, inView, pageVisible, count]);

  const thumbs = thumbSlots(count - 1);

  return (
    <>
      <div
        ref={frameRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Galeri foto pre-wedding"
        className="-translate-x-1/2 absolute h-[403px] left-1/2 rounded-[20px] top-[1737px] w-[315px] overflow-hidden touch-pan-y select-none"
        onPointerDown={(e) => (swipeStart.current = { x: e.clientX, y: e.clientY })}
        onPointerCancel={() => (swipeStart.current = null)}
        onPointerUp={(e) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) show((a) => a + (dx < 0 ? 1 : -1));
        }}
      >
        {slides.prev !== slides.active && (
          <div key={`prev-${slides.prev}`} className="absolute inset-0" aria-hidden="true">
            <SlideImage photos={photos} index={slides.prev} coupleNames={coupleNames} />
          </div>
        )}
        <FadeInLayer key={slides.fadeId} animate={slides.fadeId > 0}>
          <SlideImage photos={photos} index={slides.active} coupleNames={coupleNames} />
        </FadeInLayer>
      </div>

      {/* Slide 1 has no thumbnail (as in Figma): the row is slides 2 onwards. */}
      {photos.slice(1).map((p, j) => {
        const i = j + 1;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Tampilkan foto ${i + 1} dari ${count}`}
            aria-current={slides.active === i}
            onClick={() => show(() => i)}
            className="absolute top-[2159px] h-[70px] overflow-hidden rounded-[10px] cursor-pointer"
            style={{ left: thumbs[j].left, width: thumbs[j].w }}
          >
            <img alt="" src={p.photo} className="absolute inset-0 size-full max-w-none object-cover" draggable={false} />
            <span
              className={`pointer-events-none absolute inset-0 rounded-[10px] border-[1.5px] border-[#FFFF00] transition-opacity duration-300 ${
                slides.active === i ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </button>
        );
      })}
    </>
  );
}

// ---------- Cerita Kami (story timeline) ----------

const MAX_STORY = 4;
// Where each moment sits by the timeline: left of it (right-aligned) or right of it, in order.
// Figma lays out these mixed line-heights (15px first word, 12px rest, 9px or 12px title in one
// block) lower than CSS does, so the body carries a small measured offset (`nudge`). `minH` is
// Figma's box height: the text is centred in it exactly as in the design, and a longer text
// grows it evenly up and down.
const STORY_SLOTS = [
  { at: 2842, top: 2883.5, minH: 83, left: true, titleLeading: 12, nudge: 1.5, tracking: -0.17 },
  { at: 2919, top: 2962, minH: 86, left: false, titleLeading: 9, nudge: 3, tracking: -0.119 },
  { at: 2993, top: 3035.5, minH: 85, left: true, titleLeading: 12, nudge: 1.5, tracking: -0.17 },
  { at: 3066, top: 3112.5, minH: 93, left: false, titleLeading: 12, nudge: 1.5, tracking: -0.17 },
];

function StoryText({ moment, slot }: { moment: StoryMoment; slot: (typeof STORY_SLOTS)[number] }) {
  // The first word sits in its own 15px-line span, as in Figma; the rest follows at 12px.
  const [, first = '', rest = ''] = moment.text.match(/^(\S*)([\s\S]*)$/) ?? [];
  const side = slot.left ? '-translate-x-full left-[159.78px] text-right' : 'left-[209.78px]';
  return (
    <Fit
      fit={slot.left ? FIT.storyLeft : FIT.storyRight}
      className={`${side} -translate-y-1/2 absolute flex flex-col font-['Raleway'] font-normal justify-center leading-[0] text-[0px] text-white w-max max-w-[150px] whitespace-nowrap`}
      style={{ top: slot.top, minHeight: slot.minH, letterSpacing: slot.tracking }}
    >
      <p className="font-bold text-[12px]" style={{ lineHeight: `${slot.titleLeading}px` }}>{moment.title}</p>
      <p className="relative text-[10px] whitespace-pre-line" style={{ top: slot.nudge }}>
        <span className="leading-[15px]">{first}</span>
        <span className="leading-[12px]">{rest}</span>
      </p>
    </Fit>
  );
}

// The timeline drawing (Figma 331.55 × 336 at 19.99, 2830.13) has the four bullets drawn in.
// With fewer moments it is cut below the last one used, and its bottom end cap drawn there.
const TIMELINE = { x: 19.99, y: 2830.13, w: 331.55, h: 336 };
const BULLET_BOTTOMS = [66, 142.3, 211.5, 292.8];
const CAP_TOP = 326;

function Timeline({ count }: { count: number }) {
  if (count >= MAX_STORY)
    return (
      <div className="absolute inset-[60.98%_6.25%_31.78%_5.33%]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('22121.svg')} />
      </div>
    );
  const cut = BULLET_BOTTOMS[count - 1] + 26;
  const img = (top: number) => <img alt="" className="absolute left-0 block max-w-none" style={{ top, width: TIMELINE.w, height: TIMELINE.h }} src={A('22121.svg')} />;
  return (
    <>
      <div className="absolute overflow-hidden" style={{ left: TIMELINE.x, top: TIMELINE.y, width: TIMELINE.w, height: cut }}>{img(0)}</div>
      <div className="absolute overflow-hidden" style={{ left: TIMELINE.x, top: TIMELINE.y + cut, width: TIMELINE.w, height: TIMELINE.h - CAP_TOP }}>{img(-CAP_TOP)}</div>
    </>
  );
}

// ---------- RSVP ----------

const ATTENDANCE: { value: Attendance; label: string; top: number }[] = [
  { value: 'hadir', label: 'Akan Hadir', top: 3404 },
  { value: 'mungkin', label: 'Mungkin Hadir', top: 3447 },
  { value: 'tidak', label: 'Berhalangan Hadir', top: 3490 },
];

const fieldLabel = "-translate-y-1/2 absolute flex flex-col font-['Raleway'] justify-center leading-[0] left-[44px] text-[15px] text-[#f1e9dd] tracking-[-0.255px] whitespace-nowrap";
const fieldBox = "absolute left-[37px] w-[302px] bg-white border border-[#fade20] border-solid rounded-[10px]";
const fieldText = "font-['Raleway'] text-[13px] leading-[20px] tracking-[-0.221px] text-black placeholder:text-[rgba(0,0,0,0.2)] outline-none";

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
function Rsvp({ inv, slug, onWish }: { inv: LaLaLandInvitation; slug?: string; onWish: (wish: Wish) => void }) {
  const { attendance, setAttendance, sent, sending, error, submit, sendAnother } = useRsvpForm(slug, 'lalaland', onWish);

  if (sent)
    return (
      <div role="status" className={`${fieldBox} top-[3328px] flex h-[390px] flex-col items-center justify-center gap-[10px] px-[24px] text-center`}>
        <img alt="" src={A('71976.webp')} className="block h-[96px] w-[120px] max-w-none object-contain" />
        <p className="font-['Fasthand'] text-[34px] leading-[44px] text-[#081a51]">Terima kasih!</p>
        <p className="font-['Raleway'] text-[13px] leading-[19px] tracking-[-0.221px] text-[#181719]">
          Balasan Anda sudah terkirim kepada {inv.coupleNames}.
          <br />
          {THANKS[sent.attendance]}
        </p>
        {!slug && <p className="font-['Raleway'] text-[11px] leading-[15px] text-[#6b6f8f]">(Ini hanya demo, jadi tidak ada yang terkirim.)</p>}
        <button type="button" onClick={sendAnother} className="mt-[4px] cursor-pointer font-['Raleway'] text-[12px] leading-[20px] text-[#29567f] underline underline-offset-2">
          kirim balasan lain
        </button>
      </div>
    );

  return (
    <form onSubmit={submit}>
      <div className={fieldLabel} style={{ top: 3313 }}>
        <label htmlFor="rsvp-nama" className="leading-[20px]">Nama</label>
      </div>
      <input
        id="rsvp-nama"
        name="name"
        required
        maxLength={MAX_NAME}
        autoComplete="name"
        placeholder="Nama Anda"
        className={`${fieldBox} ${fieldText} h-[38px] top-[3328px] pl-[14px] pr-[14px]`}
      />
      {/* Hidden from guests (off the frame): only bots fill it in, and the script then drops the reply. */}
      {slug && <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-1000px] top-[3328px] h-px w-px" />}

      <div className={fieldLabel} style={{ top: 3389 }}>
        <p className="leading-[20px]">Konfirmasi Kehadiran</p>
      </div>
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
          <span className="absolute left-[9px] top-[8px] size-[19px] rounded-full border-2 border-[#324532] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#081a51]">
            {attendance === opt.value && <span className="absolute left-[3px] top-[3px] size-[9px] rounded-full bg-[#324532]" />}
          </span>
          <span className="-translate-y-1/2 absolute left-[39px] top-[18px] font-['Raleway'] text-[13px] leading-[20px] tracking-[-0.221px] text-black whitespace-nowrap">
            {opt.label}
          </span>
        </label>
      ))}

      <div className={fieldLabel} style={{ top: 3552 }}>
        <label htmlFor="rsvp-pesan" className="leading-[20px]">Pesan/Ucapan</label>
      </div>
      <textarea
        id="rsvp-pesan"
        name="message"
        maxLength={MAX_MESSAGE}
        placeholder="Tulis doa & ucapan Anda..."
        className={`${fieldBox} ${fieldText} h-[104px] top-[3567px] pl-[14px] pr-[14px] pt-[8px] resize-none`}
      />

      <button
        type="submit"
        disabled={sending}
        className="-translate-x-1/2 absolute bg-[#f9de1f] h-[38px] left-[calc(50%+0.5px)] rounded-[10px] top-[3680px] w-[302px] cursor-pointer disabled:cursor-wait disabled:opacity-70"
      >
        <span className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%-1px)] top-1/2 font-['Raleway'] text-[20px] leading-[20px] text-[#000433] tracking-[2px] whitespace-nowrap">
          {sending ? 'MENGIRIM…' : 'KIRIM UCAPAN'}
        </span>
      </button>
      {error && (
        <p role="alert" className="-translate-x-1/2 absolute left-1/2 top-[3724px] w-[302px] font-['Raleway'] text-center text-[11px] leading-[14px] text-[#fade20]">
          {SEND_ERRORS[error]}
        </p>
      )}
    </form>
  );
}

// ---------- Wishes ----------

// On a couple's page the guests' wishes get their own band under the form: everything below
// it moves down by WISHES_H. On a demo it shows sample wishes from the demo data.
const WISHES_Y = 3740;
const WISHES_H = 470;
// The sky's stars stop just below the form, so the band shows the stars from behind the form.
const BAND_STARS_FROM = 3290;
// With no gifts at all, the whole "Tanda Kasih" stretch (paper rip at 3749 down to the rip at
// 4438) is left out and everything below it moves up.
const GIFTS_TOP = 3749;
const GIFTS_H = 4438 - GIFTS_TOP;
// With only one gift card, it moves to the middle of where the two were.
const GIFT_CARD_STEP = 4175 - 3921;

function WishesBand({ wishes }: { wishes: WishesState }) {
  const note = "px-[10px] py-[24px] text-center font-['Raleway'] text-[12px] leading-[17px] text-[#6b6f8f]";
  return (
    <>
      <div className="absolute left-0 overflow-hidden" style={{ top: WISHES_Y, width: FRAME_W, height: WISHES_H }}>
        <img alt="" src={A('content-bg.webp')} className="absolute left-0 block max-w-none" style={{ top: -BAND_STARS_FROM, width: 375, height: 4450 }} />
      </div>
      <Reveal at={WISHES_Y + 20} kind="fadeUp">
        <p className="-translate-x-1/2 absolute font-['Federo'] leading-[normal] left-1/2 text-[25px] text-center text-white whitespace-nowrap" style={{ top: WISHES_Y + 20 }}>
          Ucapan &amp; Doa{wishes.wishes.length > 0 && ` (${wishes.wishes.length})`}
        </p>
        <div className={`${fieldBox} overflow-y-auto px-[16px]`} style={{ top: WISHES_Y + 68, height: WISHES_H - 98 }}>
          {wishes.wishes.length > 0 ? (
            <ul>
              {wishes.wishes.map((w, i) => (
                <li key={`${i}-${w.time}`} className="border-b border-dashed border-[#accadd] py-[12px] last:border-b-0">
                  <p className="flex items-baseline justify-between gap-[8px] font-['Raleway'] text-[13px] leading-[18px] text-[#081a51]">
                    <span className="min-w-0 break-words font-semibold">{w.name}</span>
                    <span className="shrink-0 text-[10px] text-[#6b6f8f]">{timeAgo(w.time, 'id')}</span>
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
    </>
  );
}

// ---------- Page ----------

export default function LaLaLandContent({ invitation: inv, slug, intro }: { invitation: LaLaLandInvitation; slug?: string; intro: IntroState }) {
  const introStyle = quotesIntroStyle(intro);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const wishes = useWishes(slug, inv.demo?.sampleWishes);
  const [withLoveWritten, setWithLoveWritten] = useState(false);

  // The wishes band: the couple's guests' wishes, or a demo's samples. (Without either, e.g. a
  // page with neither a slug nor demo data, the frame is Figma's exactly.)
  const bandH = slug || inv.demo ? WISHES_H : 0;
  const { bank, giftDelivery: gift } = inv;
  const hasGifts = Boolean(bank || gift);
  const giftsShift = bandH;
  const closingShift = bandH - (hasGifts ? 0 : GIFTS_H);
  // A lone gift card moves to the middle of the two slots.
  const bankShift = gift ? 0 : GIFT_CARD_STEP / 2;
  const giftShift = bank ? 0 : -GIFT_CARD_STEP / 2;
  const pageH = PAGE_H + closingShift;

  const gallery = inv.gallery.slice(0, MAX_GALLERY);
  const story = inv.story.slice(0, MAX_STORY);
  const venueAddress = inv.venue.addressLines;
  const mapsUrl = inv.venue.mapsUrl ?? mapsSearch(oneLine([inv.venue.name, ...venueAddress]));

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setScale(el.clientWidth / FRAME_W);
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / FRAME_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The reveal layers stay the 375 × 4641 frame box even with the wishes band: the layers' %
  // insets are laid out against it (the band only moves layers, as Shift does).
  const reveals = useScrollReveals({ enabled: ENABLE_ANIMATIONS, frameW: FRAME_W, frameH: FRAME_H, wrapRef, started: intro.revealed });

  return (
    <RevealProvider value={reveals}>
    {/* Clipped, not `overflow: hidden`: that would make it the scroll container the couple's scene
        follows for its depth (see Scene), which never scrolls. */}
    <div ref={wrapRef} className="relative w-full overflow-clip" style={{ aspectRatio: `${FRAME_W} / ${pageH}` }}>
      {/* Scaled with `zoom`, not `transform`: a transform would isolate this canvas, and the
          colour-dodge flares below must blend with the viewport-fixed gradient behind it. */}
      <div className="absolute left-0 top-0" style={{ width: FRAME_W, height: FRAME_H, zoom: scale }}>
        {/* ===== BG (Figma group "BG") =====
            The sky itself is the Content frame's gradient, drawn as a viewport-fixed layer by
            the template; these layers are transparent wherever that sky shows through.
            Order follows Figma: Piano BG + plain stars, then each starfield's COLOR_DODGE flare
            group, then the opaque piano / pool illustrations on top. With the wishes band, the
            plain stars stop at the band (it draws its own). */}
        {bandH ? (
          <div className="absolute left-0 top-0 overflow-hidden" style={{ width: 375, height: WISHES_Y }}>
            <img alt="" src={A('content-bg.webp')} className="absolute left-0 top-0 block max-w-none" style={{ width: 375, height: 4450 }} />
          </div>
        ) : (
          <img alt="" src={A('content-bg.webp')} className="absolute left-0 top-0 block max-w-none" style={{ width: 375, height: 4450 }} />
        )}
        {FLARES.map((f) => (
          <Flare key={f.file} {...f} />
        ))}
        {BG_ILLUSTRATIONS.map((b) =>
          b.gifts && !hasGifts ? null : (
            <Shift key={b.file} by={b.gifts ? giftsShift : 0}>
              <img alt="" src={A(b.file)} className="absolute left-0 block max-w-none" style={{ top: b.top, width: 375, height: b.h }} />
            </Shift>
          ),
        )}

        <Shift by={closingShift}>
          {/* ===== Closing painting (Figma "Painting", the last BG layer) =====
              465 × 615 at (-49, 4454), cropped by the frame's bottom edge at PAGE_H. */}
          <div className="absolute overflow-hidden" style={{ left: -49, top: 4454, width: 465, height: PAGE_H - 4454 }}>
            <img
              alt="Lukisan pasangan di restoran"
              className="absolute left-0 max-w-none"
              style={{ top: -615 * 0.0701, width: 465, height: 615 * 1.0703 }}
              src={A('b7947.webp')}
            />
          </div>
        </Shift>
        {/* Navy fades: over the bottom of the piano scene, and over the painting under the footer. */}
        {hasGifts && (
          <Shift by={giftsShift}>
            <div className="absolute" style={{ left: -6, top: 4147, width: 387, height: 307, backgroundImage: NAVY_FADE }} />
          </Shift>
        )}
        <Shift by={closingShift}>
          <div className="absolute" style={{ left: -6, top: 4549, width: 387, height: 307, backgroundImage: NAVY_FADE }} />
        </Shift>

        <PaperRip x={-23} y={2250} />
        <PaperRip y={1675} />
        <PaperRip y={3187} />
        {hasGifts && (
          <Shift by={giftsShift}>
            <PaperRip y={3749} />
          </Shift>
        )}
        <Shift by={closingShift}>
          <PaperRip x={-6} y={4438} />
        </Shift>

        {/* ===== Gift =====
            Each card and its text rise together (same timing, split only because the bow is
            drawn between them); the bows pop on after. */}
        {hasGifts && (
          <Shift by={giftsShift}>
            {bank && (
              <Shift by={bankShift}>
                <Reveal at={3921} kind="fadeUp" delay={150}>
                  <div className="absolute inset-[84.49%_10.92%_10.43%_11.24%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('d6919.svg')} />
                  </div>
                </Reveal>
                <Reveal at={3921} kind="pop" origin={[93.8, 3941.1]} delay={450}>
                  <Float box={[49.01, 3910.04, 89.48, 62.19]} delay={600}>
                    <div className="absolute inset-[84.25%_63.07%_14.41%_13.07%]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('5428d.svg')} />
                    </div>
                  </Float>
                </Reveal>
                <Reveal at={3921} kind="fadeUp" delay={150}>
                  <Fit fit={FIT.gift} className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Raleway'] justify-center leading-[0] left-[calc(50%+0.5px)] text-[25px] text-[#081a51] text-center top-[3987px] tracking-[-0.425px] whitespace-nowrap">
                    <p className="leading-[20px]">{bank.bank}</p>
                  </Fit>
                  <Fit fit={FIT.gift} className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Raleway'] justify-center leading-[0] left-[calc(50%-0.5px)] text-[35px] text-[#081a51] text-center top-[4027px] whitespace-nowrap">
                    <p className="leading-[20px]">{bank.number}</p>
                  </Fit>
                  <Fit fit={FIT.gift} className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Raleway'] justify-center leading-[0] left-[188.5px] text-[16px] text-[#081a51] text-center top-[4102.5px] tracking-[-0.272px] whitespace-nowrap">
                    <p className="leading-[15px]">{bank.holder}</p>
                  </Fit>
                  {/* Copied without spaces or dashes, so it pastes straight into a banking app. */}
                  <SalinButton top={4057} label="Salin nomor rekening" text={bank.number.replace(/[\s-]/g, '')} />
                </Reveal>
              </Shift>
            )}

            {gift && (
              <Shift by={giftShift}>
                <Reveal at={4175} kind="fadeUp" delay={150}>
                  <div className="absolute inset-[89.97%_10.92%_4.96%_11.24%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('d6919.svg')} />
                  </div>
                </Reveal>
                <Reveal at={4175} kind="pop" origin={[296.3, 4199.4]} delay={450}>
                  <div className="absolute flex inset-[89.42%_6.49%_8.45%_64.53%] items-center justify-center" style={{ containerType: 'size' }}>
                    <div className="flex-none h-[hypot(-28.945cqw,54.2471cqh)] rotate-[30.38deg] w-[hypot(71.055cqw,45.7529cqh)]">
                      <div className="relative size-full">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('5d942.svg')} />
                      </div>
                    </div>
                  </div>
                </Reveal>
                <Reveal at={4175} kind="fadeUp" delay={150}>
                  <Fit fit={FIT.gift} className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Raleway'] justify-center leading-[0] left-[calc(50%+1px)] text-[#29567f] text-[25px] text-center top-[4233px] tracking-[-0.425px] whitespace-nowrap">
                    <p className="leading-[20px]">{gift.name}</p>
                  </Fit>
                  <Fit fit={FIT.giftAddress} className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Raleway'] justify-center leading-[0] left-[188.5px] text-[#29567f] text-[13px] text-center top-[4298.5px] tracking-[-0.221px] whitespace-nowrap">
                    {gift.addressLines.map((line, i) => (
                      // Lines ending in a comma keep Figma's trailing space, so they centre as in the design.
                      <p key={i} className="leading-[19px] whitespace-pre">{line.endsWith(',') ? `${line} ` : line}</p>
                    ))}
                  </Fit>
                  <SalinButton top={4351} label="Salin alamat" text={oneLine([gift.name, ...gift.addressLines])} />
                </Reveal>
              </Shift>
            )}
            <Reveal at={3838} kind="fadeUp" delay={120}>
              <p className="-translate-x-1/2 absolute font-['Raleway'] leading-[normal] left-[187.5px] text-[13px] text-[#f1e9dd] text-center top-[3838px] w-max whitespace-nowrap">
                Doa restu Anda adalah karunia yang berarti bagi
                <br />
                kami. Jika ingin memberi tanda kasih, kami dengan
                <br />
                senang hati menerimanya melalui:
              </p>
            </Reveal>
            <Reveal at={3802} kind="fadeUp">
              <p className="-translate-x-1/2 absolute font-['Federo'] leading-[normal] left-[calc(50%+1px)] text-[#fade20] text-[25px] text-center top-[3802px] whitespace-nowrap">
                Tanda Kasih
              </p>
            </Reveal>
          </Shift>
        )}

        {/* ===== Konfirmasi Kehadiran (RSVP) ===== */}
        <Reveal at={3300} kind="fadeUp" delay={120}>
          <Rsvp inv={inv} slug={slug} onWish={wishes.add} />
        </Reveal>
        {bandH > 0 && <WishesBand wishes={wishes} />}

        <Reveal at={3251} kind="fadeUp">
          <p className="-translate-x-1/2 absolute font-['Federo'] leading-[normal] text-[27px] text-center text-white whitespace-nowrap" style={{ left: 70 + 237 / 2, top: 3251 }}>
            Konfirmasi Kehadiran
          </p>
        </Reveal>

        {/* ===== Love Story ===== */}
        <Reveal at={2830} kind="fade" delay={150}>
          <Timeline count={story.length} />
        </Reveal>
        <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Fasthand'] justify-center leading-[0] left-[186.78px] text-[#fade20] text-[30px] text-center top-[2806px] tracking-[-0.51px] whitespace-nowrap">
          <p className="leading-[20px]">
            <Handwritten at={2796}>Cerita Kami...</Handwritten>
          </p>
        </div>
        {story.map((moment, i) => {
          const slot = STORY_SLOTS[i];
          return (
            <Reveal key={i} at={slot.at} kind={slot.left ? 'fromLeft' : 'fromRight'} delay={slot.left ? 120 : 200}>
              <StoryText moment={moment} slot={slot} />
            </Reveal>
          );
        })}

        {/* Mirrored in Figma: the node's reported x (386) is its flipped origin, i.e. its right edge. */}
        <Reveal at={2770} kind="pop" origin={[352.5, 2810.6]} delay={350}>
          <Float box={[319, 2770.13, 67, 80.96]} delay={300}>
            <img alt="" src={A('45e9d.svg')} className="absolute block max-w-none -scale-x-100" style={{ left: 386 - 67, top: 2770.1267, width: 67, height: 80.9566 }} />
          </Float>
        </Reveal>
        <Reveal at={3145} kind="pop" origin={[47.4, 3161.2]} delay={350}>
          <Float box={[27, 3145, 40.87, 32.47]} delay={1800}>
            <img alt="" src={A('3d7c2.svg')} className="absolute block max-w-none" style={{ left: 27, top: 3145, width: 40.8687, height: 32.4681 }} />
          </Float>
        </Reveal>

        {/* ===== Countdown ===== */}
        <div className="-translate-x-1/2 absolute bg-[#081a51] border border-[#f9de1f] border-solid h-[194.129px] left-[calc(50%+2.85px)] rounded-[10px] top-[2516.87px] w-[299.758px]" />
        <div className="-translate-x-1/2 absolute bg-[#081a51] border border-[#f9de1f] border-solid h-[194.129px] left-[calc(50%-2.85px)] rounded-[10px] top-[2512.11px] w-[299.758px]" />
        <p className="-translate-x-1/2 absolute font-['Raleway'] h-[17px] leading-[normal] left-[calc(50%+0.5px)] text-[13px] text-[#f9de1f] text-center top-[2677px] w-max whitespace-nowrap">
          to {dateEn(inv.date)}
        </p>
        <p className="-translate-x-1/2 absolute font-['Federo'] h-[17px] leading-[normal] left-1/2 text-[15px] text-[#f9de1f] text-center top-[2524px] w-[99px]">
          Countdown
        </p>
        <Hline left={34.77} top={2600.61} width={299.758} file="13eeb.svg" />
        <CountdownNumbers target={ceremonyStart(inv)} />
        <Hline left={34.77} top={2550.18} width={299.758} file="13eeb.svg" />
        <Hline left={34.77} top={2600.61} width={299.758} file="13eeb.svg" />
        <Hline left={34.77} top={2665.32} width={299.758} file="13eeb.svg" />
        <Vline left={127.07} top={2600.61} height={64.71} file="09364.svg" />
        <Vline left={236.51} top={2600.61} height={64.71} file="09364.svg" />

        {/* ===== Detail Acara ===== */}
        <Reveal at={2373} kind="fadeUp" delay={150}>
          <div className="-translate-x-1/2 absolute bg-[#081a51] border border-[#f9de1f] border-solid h-[114.194px] left-[calc(50%+2.85px)] rounded-[10px] top-[2377.94px] w-[299.758px]" />
          <div className="-translate-x-1/2 absolute bg-[#081a51] border border-[#f9de1f] border-solid h-[114.194px] left-[calc(50%-2.85px)] rounded-[10px] top-[2373.18px] w-[299.758px]" />
          <Fit fit={FIT.eventLabel} className="-translate-x-1/2 absolute font-['Federo'] h-[17px] leading-[normal] left-[calc(50%-73.5px)] text-[13px] text-[#f9de1f] text-center top-[2381px] w-max min-w-[96px] whitespace-nowrap">
            {inv.ceremony.label ?? 'Akad Nikah'}
          </Fit>
          <Fit fit={FIT.time} className="absolute font-['Raleway'] h-[19.032px] leading-[normal] left-[calc(50%-104.2px)] text-[11px] text-[#f9de1f] top-[2406px] w-max whitespace-nowrap">
            {inv.ceremony.time}
          </Fit>
          <div className="absolute inset-[51.83%_79.31%_47.86%_16.88%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('11f60.svg')} />
          </div>
          <p className="-translate-x-1/2 absolute font-['Federo'] h-[17.129px] leading-[normal] left-[calc(50%+69.94px)] text-[13px] text-[#f9de1f] text-center top-[2380.79px] w-[43.774px] whitespace-nowrap">
            Resepsi
          </p>
          <Fit fit={FIT.time} className="absolute font-['Raleway'] h-[19.032px] leading-[normal] left-[calc(50%+43.3px)] text-[11px] text-[#f9de1f] top-[2406px] w-max whitespace-nowrap">
            {inv.reception.time}
          </Fit>
          <div className="absolute inset-[51.83%_39.98%_47.86%_56.22%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('11f60.svg')} />
          </div>
          <Vline left={187.5 - 0.48} top={2374.13} height={56.145} file="dbaf3.svg" />
          <Hline left={35.72} top={2430.27} width={298.806} file="df509.svg" />
          <div className="absolute bg-[#fade20] h-[22.839px] left-[220.33px] rounded-[100px] top-[2445.5px] w-[95.161px]" />
          <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Raleway'] font-normal h-[19.032px] justify-center leading-[0] left-[275.52px] text-[10px] text-[#081a51] text-center top-[2456.92px] tracking-[-0.17px] w-[60.903px]">
            <p className="leading-[20px]">Lihat Lokasi</p>
          </div>
          <div className="absolute left-[228.9px] overflow-clip size-[14.274px] top-[2449.31px]">
            <div className="absolute inset-[0_14.58%]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('030b0.svg')} />
            </div>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Lihat lokasi ${inv.venue.name} di Google Maps`}
            className="absolute h-[22.839px] left-[220.33px] rounded-[100px] top-[2445.5px] w-[95.161px]"
          />
          {/* Figma sets the address at 7px on one line; that's too small to read on a phone, so
              it is 10px on two lines, and the name and address are centred as a block in the
              box's lower half (2430–2487), level with the Lihat Lokasi button. */}
          <Fit fit={FIT.venue} className="absolute font-['Federo'] h-[17.129px] leading-[normal] left-[54px] text-[#fade20] text-[13px] top-[2436.5px] w-max whitespace-nowrap">
            {inv.venue.name}
          </Fit>
          <Fit fit={FIT.venueAddress} className="absolute font-['Raleway'] leading-[12px] left-[54px] text-[#fade20] text-[10px] top-[2455px] whitespace-nowrap">
            <Lines lines={venueAddress} />
          </Fit>
        </Reveal>
        <Reveal at={2298} kind="fadeUp">
          <p className="-translate-x-1/2 absolute font-['Federo'] h-[27.597px] leading-[normal] left-[calc(50%+0.48px)] text-[#fade20] text-[23px] text-center top-[2325.6px] w-max whitespace-nowrap">
            {dateIdLong(inv.date)}
          </p>
          <p className="-translate-x-1/2 absolute font-['Raleway'] h-[23px] leading-[normal] left-[calc(50%+2.5px)] text-[13px] text-center text-white top-[2298px] w-max whitespace-nowrap">
            Acara akan dilangsungkan pada:
          </p>
        </Reveal>

        {/* ===== Prewed ===== */}
        <PrewedGallery photos={gallery} coupleNames={inv.coupleNames} />

        {/* ===== Bride ===== */}
        <Reveal at={1295} kind="settle" origin={[184, 1437]} tilt={-2}>
          <div className="absolute flex inset-[27.9%_21.99%_65.99%_18.79%] items-center justify-center" style={{ containerType: 'size' }}>
            <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
              <div className="relative size-full">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('45f28.svg')} />
              </div>
            </div>
          </div>
          <div className="absolute left-[28.45px] size-[299px] top-[1288px]" style={mask('53719-mirrored.svg', '50.098px 14.653px', '211.419px 278.236px')}>
            <img alt={inv.bride.name} className="absolute inset-0 max-w-none object-cover size-full" src={inv.bride.photo} />
          </div>
          <div className="absolute flex inset-[27.93%_24.37%_65.98%_19.78%] items-center justify-center" style={{ containerType: 'size' }}>
            <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
              <div className="relative size-full">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('6ebf7.svg')} />
              </div>
            </div>
          </div>
          <div className="absolute flex inset-[27.95%_20.53%_65.65%_18.87%] items-center justify-center" style={{ containerType: 'size' }}>
            <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
              <div className="relative size-full">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('ed8ee.svg')} />
              </div>
            </div>
          </div>
        </Reveal>
        {/* Her name written by hand under her photo; her parents' line fades in. */}
        <Fit fit={FIT.name} className="-translate-x-1/2 absolute font-['Fasthand'] leading-[normal] left-1/2 text-[25px] text-center text-white top-[1594px] whitespace-nowrap">
          <Handwritten at={1594} delay={NAME_WRITE_DELAY_MS}>{inv.bride.name}</Handwritten>
        </Fit>
        <Reveal at={1594} kind="fadeUp" delay={150}>
          <Fit fit={FIT.parents} className="-translate-x-1/2 absolute font-['Raleway'] leading-[normal] left-[calc(50%-0.5px)] text-[13px] text-center text-white top-[1630px] whitespace-nowrap">
            {`${inv.bride.parentsLabel} ${inv.bride.parents}`}
          </Fit>
        </Reveal>

        {/* ===== Groom ===== */}
        <Reveal at={896} kind="settle" origin={[184, 1038]} tilt={2}>
          <div className="absolute inset-[19.31%_21.99%_74.59%_18.79%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('45f28.svg')} />
          </div>
          <div className="absolute inset-[19.36%_8.54%_73.77%_6.46%]" style={mask('53719.svg', '48.814px 5.235px', '211.419px 278.236px')}>
            <img alt={inv.groom.name} className="absolute left-0 top-0 max-w-none object-cover size-full" src={inv.groom.photo} />
          </div>
          <div className="absolute inset-[19.34%_22.98%_74.57%_21.17%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('6ebf7.svg')} />
          </div>
          <div className="absolute inset-[19.36%_22.07%_74.25%_17.33%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('ed8ee.svg')} />
          </div>
        </Reveal>
        <Fit fit={FIT.name} className="-translate-x-1/2 absolute font-['Fasthand'] leading-[normal] left-1/2 text-[25px] text-center text-white top-[1195px] whitespace-nowrap">
          <Handwritten at={1195} delay={NAME_WRITE_DELAY_MS}>{inv.groom.name}</Handwritten>
        </Fit>
        <Reveal at={1195} kind="fadeUp" delay={150}>
          <Fit fit={FIT.parents} className="-translate-x-1/2 absolute font-['Raleway'] leading-[normal] left-[calc(50%-0.5px)] text-[13px] text-center text-white top-[1231px] whitespace-nowrap">
            {`${inv.groom.parentsLabel} ${inv.groom.parents}`}
          </Fit>
        </Reveal>

        {/* ===== Intro text ===== */}
        <Reveal at={809} kind="fadeUp">
          <p className="-translate-x-1/2 absolute font-['Raleway'] leading-[normal] left-1/2 text-[13px] text-center text-white top-[809px] w-max whitespace-nowrap">
            Dengan penuh kebahagiaan, kami mengundang
            <br />
            Anda untuk menjadi bagian dari hari ketika kisah
            <br />
            kami memasuki babak baru.
          </p>
        </Reveal>

        {/* ===== Quotes ===== */}
        {/* The multiply texture animates on its own so it keeps blending with the
            background; the rest of the card animates as one group so the pattern layer
            under the photo never shows through a half-faded photo. The group's layers use
            the pixel values their Figma % insets resolve to within the 375 × 4641 frame. */}
        <div className="absolute inset-[0.88%_9.22%_88.71%_9.22%] mix-blend-multiply" style={introStyle}>
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('fa428.svg')} />
        </div>
        <div className="absolute left-0 top-0 h-[560px] w-[375px]" style={introStyle}>
          <div className="absolute" style={{ left: 53.4375, top: 56.1561, width: 269.8875, height: 444.1437 }}>
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('2af26.svg')} />
          </div>
          <div
            className="absolute"
            style={{ left: 62.4375, top: 73.3278, width: 251.8875, height: 252.0063, ...mask('372a1.svg', '7.871px -0.447px', '236.147px 251.888px') }}
          >
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('9ecb6.svg')} />
          </div>
          <div
            className="absolute"
            style={{ left: 46.275, top: -1.3923, width: 266.0625, height: 472.4538, ...mask('372a1.svg', '24.054px 74.392px', '236.147px 251.888px') }}
          >
            <img alt={`Foto ${inv.coupleNames}`} className="absolute left-0 top-0 max-w-none object-cover size-full" src={inv.coverPhoto} />
          </div>
          <p className="-translate-x-1/2 absolute font-['Pompiere'] leading-[26px] left-1/2 text-[22px] text-[#000433] text-center top-[357px] w-max whitespace-nowrap">
            Here's to the ones who dream,
            <br />
            foolish as they may seem. Here's
            <br />
            to the hearts that ache. Here's to
            <br />
            the mess we make.
          </p>
        </div>

        {/* ===== Couple and star =====
            Drawn after the Quotes card (which ends above them) so that nothing with text is drawn
            after them in their scene's box: the intro text below is drawn before (see Scene).
            Depth: the star sits further back than the dancing couple and drifts slower. */}
        <Scene box={[15.19, 530.93, 327.9, 263.07]}>
          <Reveal at={531} kind="pop" origin={[185.8, 660.3]} delay={600}>
            <DepthImg file="c0e6c.svg" x={47.0625} y={530.9304} w={277.3875} h={258.9678} depth={12} />
          </Reveal>
          <Reveal at={531} kind="fadeUp" delay={750}>
            <img
              alt="Ilustrasi pasangan berdansa"
              src={A('71976.webp')}
              className="absolute max-w-none object-cover"
              style={{ left: 15.19, top: 531, width: 327.896, height: 263 }}
            />
          </Reveal>
        </Scene>

        {/* ===== Top-most layers ===== */}
        <Reveal at={2595} kind="fromLeft" delay={250}>
          <div className="absolute" style={{ left: -45, top: 2595, width: 132, height: 159 }}>
            <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={A('968d4.webp')} />
          </div>
        </Reveal>
        <Reveal at={2627} kind="fromRight" delay={250}>
          <div className="absolute overflow-hidden" style={{ left: 260, top: 2627, width: 126, height: 130 }}>
            <img alt="" className="absolute h-[106.04%] left-[-0.11%] max-w-none top-0 w-[100.21%]" src={A('12bdd.webp')} />
          </div>
        </Reveal>
        <PaperRip y={2738} />

        <Shift by={closingShift}>
          {/* ===== Closing: thank-you note on torn paper ===== */}
          <Reveal at={4549} kind="fadeUp">
            {/* Figma's 200 × 316 paper, turned 90° about the centre of its 316 × 200 box. */}
            <div className="absolute" style={{ left: 188.02 - 100, top: 4649 - 158.025, width: 200, height: 316.05, transform: 'rotate(90deg)' }}>
              <img alt="" src={A('paper-vintage.webp')} className="absolute inset-0 block size-full max-w-none" />
            </div>
          </Reveal>
          <Reveal at={4586} kind="fadeUp" delay={150}>
            <Fit
              fit={FIT.closing}
              className="-translate-x-1/2 -translate-y-1/2 absolute font-['Pompiere'] leading-[22px] left-[188px] text-[18px] text-[#181719] text-center top-[4614.5px] tracking-[-0.306px] w-max max-w-[260px] whitespace-pre-line"
            >
              {inv.closing.text}
            </Fit>
          </Reveal>
          {/* Signed by hand: "with love," once the paper and the words above it are in, and then
              the couple's names. */}
          <p className="-translate-x-1/2 -translate-y-1/2 absolute font-['Pompiere'] leading-[22px] left-[188px] text-[18px] text-black text-center top-[4667px] tracking-[-0.306px] whitespace-nowrap">
            <Handwritten at={4656} delay={SIGN_DELAY_MS} onWritten={() => setWithLoveWritten(true)}>
              with love,
            </Handwritten>
          </p>
          <Fit fit={FIT.signature} className="-translate-x-1/2 -translate-y-1/2 absolute font-['Pompiere'] leading-[30px] left-[188.49px] text-[27px] text-[#081a51] text-center top-[4697.14px] tracking-[-0.459px] whitespace-nowrap">
            <Handwritten at={4697} wait={!withLoveWritten} delay={150}>
              {inv.closing.signature}
            </Handwritten>
          </Fit>

          {/* ===== Made with love by nicemice (on the painting's navy fade; no edge of its own) ===== */}
          <MadeWithLoveFooter y={4754} tone="light" />
        </Shift>
      </div>
    </div>
    </RevealProvider>
  );
}
