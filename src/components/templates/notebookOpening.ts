// How The Notebook's cover gives way to the invitation when the guest taps it. Everything the
// template needs to know about an opening is in an Opening, so a different one (e.g. an
// envelope) can replace LIFT_OPENING without touching the cover or the page.

/** The cover's parts an opening animates. */
export type OpeningParts = {
  /** The whole cover column, with the shadow under its bottom edge. */
  column: HTMLElement;
  /** The painting (with its tint), inside the column. */
  painting: HTMLElement;
  /** The greeting, names and date. */
  text: HTMLElement;
  /** The tap arrow. */
  arrow: HTMLElement;
};

export type Opening = {
  /** When the cover is gone and the page takes over, in ms after the tap. */
  totalMs: number;
  /** How the letter (the first section) settles in under the cover, after the tap. */
  letter: { from: string; origin: string; delayMs: number; ms: number; ease: string };
  /** When the quote and then the doodle appear on the letter, in ms after the tap. */
  letterContentDelayMs: [quote: number, doodle: number];
  /** Starts the cover's own animations (they hold their last frame until it is removed). */
  play(parts: OpeningParts): void;
};

/** For guests who prefer reduced motion: the cover simply fades, in this many ms. */
export const REDUCED_FADE_MS = 300;

// A slow start and a slow finish, as if the cover had some weight.
const LIFT_EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';
const EASE_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';
const PRESS_MS = 120;
const LIFT_DELAY_MS = 150;
const LIFT_MS = 1100;

/**
 * The cover is a card lying on the letter: a tap presses it in a touch, its text fades, and it
 * lifts up and away (its painting drifting down inside it, for depth) while the letter beneath
 * settles into place.
 */
export const LIFT_OPENING: Opening = {
  totalMs: 1650,
  // Most of the letter is uncovered from about 600 to 900ms, so it is still visibly settling then.
  letter: { from: 'translateY(28px) scale(0.97)', origin: '50% 60%', delayMs: 650, ms: 1000, ease: 'cubic-bezier(0.25, 1, 0.5, 1)' },
  letterContentDelayMs: [1250, 1450],
  play({ column, painting, text, arrow }) {
    const end = LIFT_DELAY_MS + LIFT_MS;
    column.animate(
      [
        { transform: 'none', easing: EASE_OUT },
        { transform: 'scale(0.99)', offset: PRESS_MS / end },
        { transform: 'scale(0.99)', offset: LIFT_DELAY_MS / end, easing: LIFT_EASE },
        { transform: 'translateY(-104%) scale(1.02)' },
      ],
      { duration: end, fill: 'forwards' },
    );
    painting.animate([{ transform: 'none' }, { transform: 'translateY(8%)' }], { duration: LIFT_MS, delay: LIFT_DELAY_MS, easing: LIFT_EASE, fill: 'forwards' });
    const fade = { duration: 280, delay: PRESS_MS, easing: EASE_OUT, fill: 'forwards' } as const;
    text.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }], fade);
    arrow.animate([{ opacity: 1 }, { opacity: 0 }], fade);
  },
};

/** The opening The Notebook uses: swap it here. */
export const OPENING: Opening = LIFT_OPENING;
