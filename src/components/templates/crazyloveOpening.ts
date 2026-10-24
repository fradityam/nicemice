// How the Crazy Little Thing Called Love cover gives way to the invitation when the guest taps
// "Buka Undangan". Everything the template needs to know about an opening is in an Opening (as in
// notebookOpening.ts and friendsOpening.ts), so the two below can be swapped without touching the
// cover or the page.

/** The cover's parts an opening animates. */
export type OpeningParts = {
  /** The cover column. */
  column: HTMLElement;
  /** The cream and the lined paper behind everything on the cover. */
  backdrop: HTMLElement;
  /** The scalloped card the polaroid lies on. */
  card: HTMLElement;
  /** The polaroid (frame, photo and the couple's names), with its drop shadow. */
  polaroid: HTMLElement;
  /** The shadow the polaroid casts on the page once lifted: clear until an opening darkens it. */
  lift: HTMLElement;
  /** The bouquets and the kids, each with how far it drifts off (`data-drift`, frame px). */
  stickers: HTMLElement[];
  /** The greeting, the guest's name and the button. */
  text: HTMLElement[];
  /** The back of the cover's page, facing away: lined paper. */
  back: HTMLElement;
  /** A shadow over the cover, clear until an opening darkens it. */
  shade: HTMLElement;
  /** The shadow the cover casts on the page beneath it, clear until an opening darkens it. */
  cast: HTMLElement;
};

export type Opening = {
  /** When the cover is gone and the page takes over, in ms after the tap. */
  totalMs: number;
  /** How the collage page beneath settles into place under the cover, after the tap. */
  page: { from: string; origin: string; delayMs: number; ms: number; ease: string };
  /** When the collage's polaroids start being placed on it (their stickers after them), in ms after the tap. */
  collageDelayMs: number;
  /** The layer that moves first and most: made ready a moment before the tap (see the template). */
  prepare: 'polaroid' | 'column';
  /** Whether the cover's page has a back to show as it turns (`back`, `shade` and `cast`). */
  turns: boolean;
  /** Starts the cover's own animations (they hold their last frame until it is removed). */
  play(parts: OpeningParts): void;
};

const EASE_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';
// Picked up gently, and carried off gathering pace.
const LIFT_EASE = 'cubic-bezier(0.25, 1, 0.5, 1)';
const CARRY_EASE = 'cubic-bezier(0.55, 0, 0.75, 0.2)';
// The page settling: quick to start, a long soft landing.
const SETTLE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const TEXT_FADE = { duration: 250, easing: EASE_OUT, fill: 'forwards' } as const;

const fadeText = (text: HTMLElement[]) => text.forEach((el) => el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px)' }], TEXT_FADE));

// The peel: the polaroid is pressed, lifted off the card towards the guest, and carried up and away;
// then the page under it gives way to the collage. In ms after the tap.
const PEEL = { pressMs: 120, liftMs: 560, carryAt: 640, carryMs: 760, pageAt: 700, pageMs: 650 };
// The polaroid's centre on the cover (frame px), which it is lifted and turned about.
const POLAROID_C = '192.4px 310.3px';

/**
 * The polaroid is picked up off the scrapbook page: pressed in a touch, lifted towards the guest
 * (tipping as it comes, its shadow spreading on the page) and carried up and away; the card, the
 * paper and the flowers then give way to the collage beneath, whose polaroids are placed one by one.
 */
export const PEEL_OPENING: Opening = {
  totalMs: PEEL.pageAt + PEEL.pageMs + 50,
  page: { from: 'translateY(8px)', origin: '50% 40%', delayMs: PEEL.pageAt, ms: 900, ease: SETTLE_EASE },
  collageDelayMs: PEEL.pageAt + 150,
  prepare: 'polaroid',
  turns: false,
  play({ backdrop, card, polaroid, lift, stickers, text }) {
    fadeText(text);
    const end = PEEL.carryAt + PEEL.carryMs;
    const at = (ms: number) => ms / end;
    // Above the flowers once it leaves the page.
    polaroid.style.zIndex = '1';
    polaroid.style.transformOrigin = POLAROID_C;
    polaroid.animate(
      [
        { transform: 'none', easing: EASE_OUT },
        { transform: 'scale(0.985)', offset: at(PEEL.pressMs), easing: LIFT_EASE },
        { transform: 'perspective(900px) translateY(-14px) rotate(-5deg) rotateX(8deg) scale(1.07)', offset: at(PEEL.pressMs + PEEL.liftMs), easing: CARRY_EASE },
        { transform: 'perspective(900px) translate(40px, -1100px) rotate(9deg) rotateX(14deg) scale(1.1)' },
      ],
      { duration: end, fill: 'forwards' },
    );
    lift.animate(
      [
        { opacity: 0, transform: 'none' },
        { opacity: 0, transform: 'none', offset: at(PEEL.pressMs), easing: LIFT_EASE },
        { opacity: 0.42, transform: 'translate(6px, 18px) scale(1.03)', offset: at(PEEL.pressMs + PEEL.liftMs), easing: EASE_OUT },
        { opacity: 0, transform: 'translate(10px, 24px) scale(1.06)', offset: at(PEEL.carryAt + 300) },
        { opacity: 0, transform: 'translate(10px, 24px) scale(1.06)' },
      ],
      { duration: end, fill: 'forwards' },
    );
    const page = { duration: PEEL.pageMs, delay: PEEL.pageAt, easing: 'ease-in-out', fill: 'forwards' } as const;
    for (const el of [backdrop, card]) el.animate([{ opacity: 1 }, { opacity: 0 }], page);
    // The flowers drift off outwards as they go (never inwards: the bouquets are cut off at the
    // frame's edge).
    for (const el of stickers) {
      const [dx, dy] = (el.dataset.drift ?? '0 0').split(' ').map(Number);
      el.animate([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: `${dx}px ${dy}px` }], { ...page, delay: PEEL.pageAt - 100, easing: EASE_OUT });
    }
  },
};

// The page turn: the cover turns over towards the guest on a spine at its left edge, in ms after the tap.
const TURN = { at: 120, ms: 1300, deg: -105, perspective: 1100 };
// A page has some weight: it starts slowly, then turns on, easing to a stop.
const TURN_EASE = 'cubic-bezier(0.45, 0, 0.3, 1)';

/**
 * The cover is a page of the scrapbook: it turns over towards the guest on its spine at the left
 * edge, catching the light as it lifts, and the collage page beneath, in its shadow at first, is
 * uncovered as it goes.
 */
export const PAGE_OPENING: Opening = {
  totalMs: TURN.at + TURN.ms,
  page: { from: 'scale(0.985)', origin: '0 50%', delayMs: TURN.at + 200, ms: 1100, ease: SETTLE_EASE },
  collageDelayMs: TURN.at + 550,
  prepare: 'column',
  turns: true,
  play({ column, shade, cast, text }) {
    fadeText(text);
    const turn = { duration: TURN.ms, delay: TURN.at, easing: TURN_EASE, fill: 'forwards' } as const;
    column.animate([{ transform: `perspective(${TURN.perspective}px) rotateY(0deg)` }, { transform: `perspective(${TURN.perspective}px) rotateY(${TURN.deg}deg)` }], turn);
    shade.animate([{ opacity: 0 }, { opacity: 0.18 }], { ...turn, easing: 'linear' });
    cast.animate([{ opacity: 1 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { ...turn, easing: 'ease-out' });
  },
};

/** The opening Crazy Love uses: the peel. Locally, ?opening=page on the URL tries the page turn. */
export const OPENING: Opening = (() => {
  const asked = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('opening') : null;
  return asked === 'page' ? PAGE_OPENING : PEEL_OPENING;
})();
