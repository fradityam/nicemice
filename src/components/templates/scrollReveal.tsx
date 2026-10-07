import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject, type TransitionEvent } from 'react';

// Subtle one-time reveals as a template's sections scroll into view (useScrollReveals) and as
// its cover settles on load (useCoverReveals), shared by the templates laid out in a scaled
// Figma frame. Each template keeps its own ENABLE_ANIMATIONS switch and passes it to both;
// positions, origins and boxes are all in frame px.

const EASE_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';

// How far (in frame px) an element must be inside the viewport before it reveals.
const REVEAL_OFFSET = 40;

export type RevealKind = 'fade' | 'fadeUp' | 'fadeDown' | 'pop' | 'grow' | 'settle' | 'fromLeft' | 'fromRight' | 'zoomOut';
// `fade: false`: the element stays fully visible and only moves.
const REVEAL: Record<RevealKind, { from: (tilt: number) => string; ms: number; fade?: false }> = {
  fade: { from: () => 'none', ms: 700 },
  fadeUp: { from: () => 'translateY(12px)', ms: 700 },
  fadeDown: { from: () => 'translateY(-12px)', ms: 700 },
  pop: { from: () => 'scale(0.9)', ms: 500 },
  grow: { from: () => 'scale(0.96)', ms: 700 },
  // A photo being placed on the page: a touch higher, bigger and more tilted, then it settles.
  settle: { from: (tilt) => `translateY(-8px) rotate(${tilt}deg) scale(1.03)`, ms: 800 },
  fromLeft: { from: () => 'translateX(-16px)', ms: 700 },
  fromRight: { from: () => 'translateX(16px)', ms: 700 },
  // A cover painting settling: a very slow, tiny zoom out.
  zoomOut: { from: () => 'scale(1.03)', ms: 1500, fade: false },
};

/**
 * Tracks how far down the frame the viewport has reached (in frame px) and tells each
 * waiting element once it is in view. Inactive until the cover has opened.
 */
class RevealStore {
  active = false;
  bottom = 0;
  private waiting = new Map<() => void, number>();
  constructor(
    readonly frameW: number,
    readonly frameH: number,
  ) {}
  watch(at: number, show: () => void) {
    if (this.active && this.bottom >= at + REVEAL_OFFSET) {
      show();
      return undefined;
    }
    this.waiting.set(show, at);
    return () => void this.waiting.delete(show);
  }
  update(bottom: number) {
    this.bottom = bottom;
    if (!this.active) return;
    for (const [show, at] of this.waiting) {
      if (bottom >= at + REVEAL_OFFSET) {
        this.waiting.delete(show);
        show();
      }
    }
  }
}
const RevealContext = createContext<RevealStore | null>(null);

/** Provides the reveals from useScrollReveals / useCoverReveals to the frame's Reveal and Float layers. */
export const RevealProvider = RevealContext.Provider;

/**
 * Sets up the reveals for a frame of `frameW` × `frameH` drawn (scaled) in `wrapRef`. Returns
 * null, and every Reveal / Float renders its children untouched, when `enabled` is false or the
 * guest prefers reduced motion. Reveals start once `started` (the cover has opened).
 */
export function useScrollReveals({ enabled, frameW, frameH, wrapRef, started }: { enabled: boolean; frameW: number; frameH: number; wrapRef: RefObject<HTMLElement | null>; started: boolean }) {
  // Decided once, before the first paint, so animated elements start hidden rather than flash.
  const [store] = useState(() =>
    enabled && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? new RevealStore(frameW, frameH) : null,
  );

  // From then on the viewport's bottom edge (in frame px) is passed to the store on every
  // scroll and resize, at most once per frame.
  useEffect(() => {
    const el = wrapRef.current;
    if (!store || !el || !started) return;
    store.active = true;
    const measure = () => {
      const r = el.getBoundingClientRect();
      store.update((window.innerHeight - r.top) / (r.width / store.frameW));
    };
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [store, wrapRef, started]);

  return store;
}

// Longest a cover waits for its images and fonts before settling in anyway.
const COVER_WAIT_MS = 600;

/**
 * Reveals for a cover frame of `frameW` × `frameH`: every Reveal in it plays once on load, as
 * soon as the images and fonts in `rootRef` are ready (or COVER_WAIT_MS have passed), with
 * the sequence set by each one's delay. `settled` turns true `settleMs` after that (and
 * straight away when there is nothing to play), for hints that should only start once the
 * cover has settled. Null reveals when `enabled` is false or the guest prefers reduced motion.
 */
export function useCoverReveals({ enabled, frameW, frameH, rootRef, settleMs }: { enabled: boolean; frameW: number; frameH: number; rootRef: RefObject<HTMLElement | null>; settleMs: number }) {
  const [store] = useState(() =>
    enabled && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? new RevealStore(frameW, frameH) : null,
  );
  const [settled, setSettled] = useState(!store);

  useEffect(() => {
    const root = rootRef.current;
    if (!store || !root) return;
    let cancelled = false;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const images = [...root.querySelectorAll('img')].map((img) => img.decode().catch(() => {}));
    const ready = Promise.all([document.fonts.ready, ...images]);
    Promise.race([ready, new Promise((r) => setTimeout(r, COVER_WAIT_MS))]).then(() => {
      // A frame later, so the hidden starting state has been painted and the transitions run.
      raf = requestAnimationFrame(() => {
        if (cancelled) return;
        store.active = true;
        store.update(Infinity);
        timer = setTimeout(() => setSettled(true), settleMs);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [store, rootRef, settleMs]);

  return { reveals: store, settled };
}

// A layer the size of the whole frame at its origin, so the children keep their Figma
// coordinates (px and % alike) and nothing moves in the layout. It lets taps through to
// whatever lies under it; its direct children take them as usual.
const frameLayer = (store: RevealStore): CSSProperties => ({ width: store.frameW, height: store.frameH, pointerEvents: 'none' });
const FRAME_LAYER = 'absolute left-0 top-0 *:pointer-events-auto';

type RevealOptions = { origin?: [number, number]; delay?: number; tilt?: number };

/**
 * The reveal itself, for an element to apply to its own style: null when animations are off.
 * `origin` (in the element's own coords) is the centre for rotate / scale; `tilt` is the extra
 * rotation a `settle` starts from. Use Reveal instead, unless the element has to animate by
 * itself (e.g. a blended layer, which a wrapper would isolate from what it blends with).
 */
export function useReveal(at: number, kind: RevealKind, { origin, delay = 0, tilt = 3 }: RevealOptions = {}) {
  const store = useContext(RevealContext);
  const [state, setState] = useState<'waiting' | 'showing' | 'done'>('waiting');
  useEffect(() => store?.watch(at, () => setState('showing')), [store, at]);
  if (!store) return null;
  const { from, ms, fade = true } = REVEAL[kind];
  const t = `${ms}ms ${EASE_OUT} ${delay}ms`;
  // Once revealed the element drops its animation styles, so nothing stays on its own
  // compositing layer and the page renders exactly as it does without animations (text keeps
  // its sub-pixel smoothing).
  const style: CSSProperties =
    state === 'done'
      ? {}
      : {
          transformOrigin: origin ? `${origin[0]}px ${origin[1]}px` : undefined,
          opacity: fade ? (state === 'showing' ? 1 : 0) : undefined,
          transform: state === 'showing' ? 'none' : from(tilt),
          transition: state === 'showing' ? `opacity ${t}, transform ${t}` : 'none',
        };
  const onTransitionEnd = (e: TransitionEvent<HTMLElement>) => {
    if (e.target === e.currentTarget && e.propertyName === (fade ? 'opacity' : 'transform')) setState('done');
  };
  return { store, done: state === 'done', style, onTransitionEnd };
}

/**
 * Reveals its children once, when frame y `at` scrolls into view. Must sit where the frame's
 * origin is its containing block's origin; `origin` is then in frame coords.
 */
export function Reveal({ at, kind, children, ...options }: RevealOptions & { at: number; kind: RevealKind; children: ReactNode }) {
  const reveal = useReveal(at, kind, options);
  if (!reveal) return <>{children}</>;
  // Once revealed the wrapper stops generating a box at all, so the children lay out and paint
  // exactly as they would without it. (Even an empty frame-sized box changes how Chrome groups
  // the page into layers over a fixed background, which shifts text anti-aliasing slightly.)
  if (reveal.done) return <div className="contents">{children}</div>;
  return (
    <div className={FRAME_LAYER} style={{ ...frameLayer(reveal.store), ...reveal.style }} onTransitionEnd={reveal.onTransitionEnd}>
      {children}
    </div>
  );
}

/**
 * A span that reveals by itself, for one line of a heading or an element whose own position
 * mustn't change (its Tailwind translate stays as it is; the reveal adds a transform on top).
 * Shown inline-block while it animates, since an inline box can't be transformed.
 */
export function RevealSpan({ at, kind, className, style, children, ...options }: RevealOptions & { at: number; kind: RevealKind; className?: string; style?: CSSProperties; children: ReactNode }) {
  const reveal = useReveal(at, kind, options);
  const animating = reveal && !reveal.done;
  return (
    <span className={className} style={animating ? { display: 'inline-block', ...style, ...reveal.style } : style} onTransitionEnd={reveal?.onTransitionEnd}>
      {children}
    </span>
  );
}

/**
 * A very slow, tiny idle bob, for two or three small elements per template only. `box` is the
 * element's frame box [x, y, w, h]: the bob runs inside a clip just around it, because Chrome
 * assumes a running transform animation may overlap everything painted after it and would
 * otherwise move all later text onto separate layers (losing its sub-pixel smoothing).
 */
const FLOAT_PX = 3;
export function Float({ box: [x, y, w, h], delay = 0, children }: { box: [number, number, number, number]; delay?: number; children: ReactNode }) {
  const store = useContext(RevealContext);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!store || !el) return;
    const anim = el.animate([{ transform: 'translateY(0)' }, { transform: `translateY(-${FLOAT_PX}px)` }, { transform: 'translateY(0)' }], {
      duration: 4800,
      iterations: Infinity,
      easing: 'ease-in-out',
      delay,
    });
    return () => anim.cancel();
  }, [store, delay]);
  if (!store) return <>{children}</>;
  // The clip leaves room for the bob above; the inner layer shifts back to the frame origin so
  // the element keeps its Figma coordinates.
  const m = FLOAT_PX + 2;
  return (
    <div className="absolute overflow-hidden" style={{ left: x - m, top: y - m, width: w + 2 * m, height: h + 2 * m }}>
      <div ref={ref} className={FRAME_LAYER} style={{ ...frameLayer(store), left: m - x, top: m - y }}>
        {children}
      </div>
    </div>
  );
}
