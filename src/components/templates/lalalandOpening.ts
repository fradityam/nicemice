// How La La Land's cover gives way to the invitation when the guest taps it. Everything the
// template needs to know about an opening is in an Opening (as in notebookOpening.ts), so the two
// below can be swapped without touching the cover or the page.

/** The cover's parts an opening animates. */
export type OpeningParts = {
  /** The whole cover column. */
  column: HTMLElement;
  /** The painting with everything drawn on it (navy fade, lamp glow, star glints), in frame px. */
  painting: HTMLElement;
  /** The lamp's glow, centred on the lamp's glass. */
  glow: HTMLElement;
  /** The title, names, guest and button. */
  text: HTMLElement;
  /** Warm light centred on the lamp, on the painting and reaching past its edges, clear until an opening uses it. */
  light: HTMLElement;
  /** A column-sized layer over the cover and the page, clear until an opening draws on it. */
  iris: HTMLElement;
};

export type Opening = {
  /** When the cover is gone and the page takes over, in ms after the tap. */
  totalMs: number;
  /** When the Quotes card starts rising into place, and for how long, in ms after the tap. */
  quotes: { delayMs: number; ms: number };
  /** Starts the cover's own animations (they hold their last frame until it is removed). */
  play(parts: OpeningParts): void;
};

/** For guests who prefer reduced motion: the cover simply fades, in this many ms. */
export const REDUCED_FADE_MS = 300;

/** Frame px (in the 375 × 667 cover frame) of the centre of the lamp's glass. */
export const LAMP: [x: number, y: number] = [321, 377];

const EASE_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';
const EASE_IN = 'cubic-bezier(0.32, 0, 0.67, 0)';
const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
// A camera starting to move slowly and gathering pace, then easing to a stop.
const PUSH_EASE = 'cubic-bezier(0.45, 0, 0.2, 1)';
const PUSH_SCALE = 1.12;
const TEXT_FADE = { duration: 280, delay: 120, easing: EASE_OUT, fill: 'forwards' } as const;

/** The camera pushes in on the lamp (which stays where it is) while the text lifts away. */
function pushIn({ painting, text }: OpeningParts, ms: number) {
  painting.animate([{ transform: 'none' }, { transform: `scale(${PUSH_SCALE})` }], { duration: ms, delay: 150, easing: PUSH_EASE, fill: 'forwards' });
  text.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }], TEXT_FADE);
}

/** The glow's opacity right now (it breathes while the cover waits), to carry on from. */
const glowNow = (glow: HTMLElement) => Number(getComputedStyle(glow).opacity) || 0;

// The iris: closing on the lamp, holding on it a moment, shutting, and opening again on the page.
const IRIS = {
  closeAt: 450,
  closeMs: 800,
  // The ring it holds at around the lamp's head, in frame px (scaled with the cover).
  holdR: 30,
  holdMs: 220,
  shutMs: 200,
  // Dark between the cover and the page.
  pauseMs: 100,
  openMs: 750,
  color: '#000433',
};
const IRIS_SHUT_AT = IRIS.closeAt + IRIS.closeMs + IRIS.holdMs;
const IRIS_OPEN_AT = IRIS_SHUT_AT + IRIS.shutMs + IRIS.pauseMs;

/** Cubic Bézier easing (as in CSS) for a share `t` of the time, for the iris drawn frame by frame. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  return (t: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < t) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}
const irisClose = bezier(0.65, 0, 0.35, 1);
const irisShut = bezier(0.32, 0, 0.67, 0);
const irisOpen = bezier(0.33, 1, 0.68, 1);

/**
 * The film's own iris: the camera pushes in on the lamp, a circle closes around it and holds on
 * its light for a moment, shuts, and opens again from the same spot onto the page, where the same
 * skyline carries on behind the Quotes card.
 */
export const IRIS_OPENING: Opening = {
  totalMs: IRIS_OPEN_AT + IRIS.openMs,
  quotes: { delayMs: IRIS_OPEN_AT + 50, ms: 1000 },
  play(parts) {
    const { column, glow, iris } = parts;
    pushIn(parts, IRIS_SHUT_AT - 150);
    // The lamp brightens a little as the circle closes on it.
    glow.animate([{ opacity: glowNow(glow) }, { opacity: 1, transform: 'scale(1.3)' }], { duration: IRIS.closeMs + IRIS.holdMs, delay: IRIS.closeAt, easing: EASE_IN_OUT, fill: 'forwards' });
    // The cover goes once the circle has shut, and the page is there when it opens.
    column.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1, delay: IRIS_SHUT_AT + IRIS.shutMs, fill: 'forwards' });

    // A circle cut out of a dark layer, redrawn each frame: it is small, and a scaled ring (all on
    // the compositor) would need a layer many times the screen's size to stay dark to the edges.
    const box = iris.getBoundingClientRect();
    const lamp = glow.getBoundingClientRect();
    const [x, y] = [lamp.left + lamp.width / 2 - box.left, lamp.top + lamp.height / 2 - box.top];
    const full = Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y)) + 2;
    // The ring's size on screen: the lamp's glow is drawn at frame scale, and pushed in.
    const hold = (IRIS.holdR * (lamp.width / glow.offsetWidth)) * PUSH_SCALE;
    const draw = (r: number) => {
      iris.style.background = r >= full ? 'none' : `radial-gradient(circle at ${x}px ${y}px, transparent ${r}px, ${IRIS.color} ${r + 1.5}px)`;
    };
    const start = performance.now();
    const frame = (now: number) => {
      const t = now - start;
      const between = (from: number, ms: number) => Math.min(1, Math.max(0, (t - from) / ms));
      if (t < IRIS_SHUT_AT) draw(full + (hold - full) * irisClose(between(IRIS.closeAt, IRIS.closeMs)));
      else if (t < IRIS_OPEN_AT) draw(hold * (1 - irisShut(between(IRIS_SHUT_AT, IRIS.shutMs))));
      else draw(full * irisOpen(between(IRIS_OPEN_AT, IRIS.openMs)));
      if (t < IRIS_OPEN_AT + IRIS.openMs) requestAnimationFrame(frame);
      else draw(full);
    };
    requestAnimationFrame(frame);
  },
};

const GLOW = { bloomAt: 300, bloomMs: 700, lightAt: 450, lightMs: 750, fadeAt: 1050, fadeMs: 650 };

/**
 * The understated one: the camera pushes in on the lamp as its light swells and fills the screen
 * with a warm glow, through which the cover fades into the page.
 */
export const GLOW_OPENING: Opening = {
  totalMs: GLOW.fadeAt + GLOW.fadeMs,
  quotes: { delayMs: GLOW.fadeAt + 100, ms: 1000 },
  play(parts) {
    const { column, glow, light } = parts;
    pushIn(parts, GLOW.fadeAt + GLOW.fadeMs - 150);
    glow.animate([{ opacity: glowNow(glow) }, { opacity: 1, transform: 'scale(2.5)' }], { duration: GLOW.bloomMs, delay: GLOW.bloomAt, easing: EASE_IN, fill: 'forwards' });
    light.animate([{ opacity: 0, transform: 'scale(0.1)' }, { opacity: 0.85, transform: 'none' }], { duration: GLOW.lightMs, delay: GLOW.lightAt, easing: EASE_IN, fill: 'forwards' });
    column.animate([{ opacity: 1 }, { opacity: 0 }], { duration: GLOW.fadeMs, delay: GLOW.fadeAt, easing: EASE_IN_OUT, fill: 'forwards' });
  },
};

/** The opening La La Land uses: the glow. Locally, ?opening=iris on the URL tries the iris. */
export const OPENING: Opening = (() => {
  const asked = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('opening') : null;
  return asked === 'iris' ? IRIS_OPENING : GLOW_OPENING;
})();
