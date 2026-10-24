// How the Friends cover gives way to the invitation when the guest taps "open invitation".
// Everything the template needs to know about an opening is in an Opening (as in
// lalalandOpening.ts), so the two below can be swapped without touching the cover or the page.
// The zoom from the door into the peephole, before it, is the cover's own (FriendsTemplate.tsx);
// its geometry is here because the door opening plays it backwards.

// The peephole as it appears in the second Figma cover (551 × 551 ring at -88, -39, with the
// photo clipped to a circle inside it). The first cover's tiny peephole is the same artwork at
// 19.03px, centred on (188.5, 265.5), so step 1 shows this group scaled down and the zoom
// simply scales it (and the door around it) back up.
export const RING = { x: -88, y: -39, size: 551 };
export const LARGE_C = { x: RING.x + RING.size / 2, y: RING.y + RING.size / 2 };
export const SMALL_C = { x: 179 + 19.03 / 2, y: 256 + 19.03 / 2 };
export const SMALL_K = 19.03 / RING.size;
export const DOOR_ZOOM = 1 / SMALL_K;

// At zoom z (1 → DOOR_ZOOM) the door is scaled about the small peephole while the peephole
// travels to its step-2 centre; the peephole group gets the same move, so the two stay locked.
const zoomShift = (z: number) => (z - 1) / (DOOR_ZOOM - 1);
export const doorTransform = (z: number) =>
  `translate(${zoomShift(z) * (LARGE_C.x - SMALL_C.x)}px, ${zoomShift(z) * (LARGE_C.y - SMALL_C.y)}px) scale(${z})`;
export const peepholeTransform = (z: number) =>
  `translate(${(1 - zoomShift(z)) * (SMALL_C.x - LARGE_C.x)}px, ${(1 - zoomShift(z)) * (SMALL_C.y - LARGE_C.y)}px) scale(${z * SMALL_K})`;

/**
 * The zoom factors of the zoom into the peephole (or, `out`, back out to the door), eased in log
 * space: interpolating scale linearly from 1 to 29 looks finished a third of the way in.
 */
export const zoomSteps = (out = false) =>
  Array.from({ length: 25 }, (_, i) => {
    const e = 0.5 - 0.5 * Math.cos((Math.PI * i) / 24);
    return DOOR_ZOOM ** (out ? 1 - e : e);
  });

/**
 * Radius (cover frame px) of the hole in the cover's purple that the peephole opening sees the
 * page through: inside the ring's band, so the ring always covers its edge.
 */
export const HOLE_R = 218;

/** The cover's parts an opening animates. */
export type OpeningParts = {
  /** The cover column, with the purple door (hinged on its left edge). */
  column: HTMLElement;
  /** Everything in the cover's frame, scaled about the large peephole's centre. */
  camera: HTMLElement;
  /** Step 1's door: the yellow frame around the peephole. */
  door: HTMLElement;
  /** The peephole group: the ring and the photo seen through it. */
  peephole: HTMLElement;
  /** The couple's photo inside the ring. */
  photo: HTMLElement;
  /** Step 2's greeting, guest's name and button. */
  text: HTMLElement;
  /** A shadow over the door, clear until an opening darkens it. */
  shade: HTMLElement;
};

export type Opening = {
  /** When the cover is gone and the page takes over, in ms after the tap. */
  totalMs: number;
  /**
   * The camera settling into the page's first scene: its painting, the scene and its nearest
   * layers (the couch, lamps and Magna Doodle) start this much larger, about `focus`, and settle
   * to their Figma positions together, the nearer ones travelling further.
   */
  scene: { far: number; mid: number; near: number; delayMs: number; ms: number; ease: string };
  /** Where on screen the camera moves to: the middle of the door, or the peephole's centre. */
  focus: 'door' | 'peephole';
  /** Whether the cover's purple has a hole in it, behind the photo, to see the page through. */
  hole: boolean;
  /** The layer that moves first and most: made ready a moment before the tap (see the template). */
  prepare: keyof OpeningParts;
  /** Starts the cover's own animations (they hold their last frame until it is removed). */
  play(parts: OpeningParts): void;
};

const EASE_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';
// The camera settling: quick to start, a long soft landing.
const SETTLE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const TEXT_FADE = { duration: 250, easing: EASE_OUT, fill: 'forwards' } as const;

// The door: back out of the peephole, then the door swings open away from the guest, on its hinges
// at the left, darkening as it turns from the light.
const DOOR = { pullAt: 150, pullMs: 650, swingAt: 850, swingMs: 1050, perspective: 900, deg: 100 };
// A door has some weight: it starts slowly and swings on, easing to a stop.
const SWING_EASE = 'cubic-bezier(0.55, 0, 0.25, 1)';

/**
 * The camera steps back from the peephole to see the purple door, which swings open onto the
 * fountain scene, the camera stepping through after it.
 */
export const DOOR_OPENING: Opening = {
  totalMs: DOOR.swingAt + DOOR.swingMs,
  scene: { far: 1.04, mid: 1.07, near: 1.12, delayMs: DOOR.swingAt + 100, ms: 1500, ease: SETTLE_EASE },
  focus: 'door',
  hole: false,
  prepare: 'column',
  play({ column, door, peephole, text, shade }) {
    text.animate([{ opacity: 1 }, { opacity: 0 }], TEXT_FADE);
    const pull = { duration: DOOR.pullMs, delay: DOOR.pullAt, easing: 'linear', fill: 'forwards' } as const;
    const zoom = zoomSteps(true);
    door.animate(zoom.map((z) => ({ transform: doorTransform(z) })), pull);
    door.animate([{ opacity: 0 }, { opacity: 1, offset: 0.45 }, { opacity: 1 }], pull);
    peephole.animate(zoom.map((z) => ({ transform: peepholeTransform(z) })), pull);
    const swing = { duration: DOOR.swingMs, delay: DOOR.swingAt, easing: SWING_EASE, fill: 'forwards' } as const;
    column.animate([{ transform: `perspective(${DOOR.perspective}px) rotateY(0deg)` }, { transform: `perspective(${DOOR.perspective}px) rotateY(${DOOR.deg}deg)` }], swing);
    shade.animate([{ opacity: 0 }, { opacity: 0.45 }], { ...swing, easing: 'linear' });
  },
};

// The peephole: the photo fades to show the page through the ring, and the camera pushes on
// through it, the ring sweeping past the edges of the screen.
const LENS = { photoAt: 100, photoMs: 450, pushAt: 200, pushMs: 1100, scale: 3, fadeMs: 200 };
// Gathering pace as it goes, as if carried through.
const PUSH_EASE = 'cubic-bezier(0.6, 0, 0.4, 1)';

/**
 * The camera carries on through the peephole: the couple's photo gives way to the page, and the
 * purple and the ring sweep past the edges of the screen as the fountain scene settles.
 */
export const PEEPHOLE_OPENING: Opening = {
  totalMs: LENS.pushAt + LENS.pushMs,
  scene: { far: 1.1, mid: 1.16, near: 1.24, delayMs: LENS.pushAt, ms: 1500, ease: SETTLE_EASE },
  focus: 'peephole',
  hole: true,
  prepare: 'camera',
  play({ column, camera, photo, text }) {
    text.animate([{ opacity: 1 }, { opacity: 0 }], TEXT_FADE);
    photo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: LENS.photoMs, delay: LENS.photoAt, easing: 'ease-in-out', fill: 'forwards' });
    camera.animate([{ transform: 'none' }, { transform: `scale(${LENS.scale})` }], { duration: LENS.pushMs, delay: LENS.pushAt, easing: PUSH_EASE, fill: 'forwards' });
    // Whatever of the purple is still at the far corners of a tall screen goes with it.
    column.animate([{ opacity: 1 }, { opacity: 0 }], { duration: LENS.fadeMs, delay: LENS.pushAt + LENS.pushMs - LENS.fadeMs, fill: 'forwards' });
  },
};

/** The opening Friends uses: the door. Locally, ?opening=peephole on the URL tries the peephole. */
export const OPENING: Opening = (() => {
  const asked = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('opening') : null;
  return asked === 'peephole' ? PEEPHOLE_OPENING : DOOR_OPENING;
})();
