import { Fragment, createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { parseIsoDate } from '../../invitations/dates';
import { MAX_MESSAGE, MAX_NAME, timeAgo, useRsvpForm, useWishes, type Attendance, type SendError, type Wish, type WishesState } from '../../invitations/rsvp';
import type { FriendsInvitation } from '../../invitations/types';
import { useFit, type FitBox } from './fitText';
import { MadeWithLoveFooter } from './MadeWithLoveFooter';
import { PhotoLightbox, type LightboxPhoto, type LightboxTheme } from './PhotoLightbox';
import { OPENING } from './friendsOpening';
import { Handwritten } from './handwriting';
import { useLight } from './sceneLights';
import { Float, Reveal, RevealOffset, RevealProvider, useInView, useScrollReveals } from './scrollReveal';

// Every layer is placed at its position in the Figma "Content" frame (375 × 5768), in
// Figma's layer order, and the whole frame is scaled to the column width.
const FRAME_W = 375;
const FRAME_H = 5768;

const assetUrls = import.meta.glob('../../assets/images/friends/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const A = (file: string) => assetUrls[`../../assets/images/friends/${file}`];

/** Subtle one-time reveals on the cover and as sections scroll into view. Set to false to turn them all off. */
export const ENABLE_ANIMATIONS = true;

const PURPLE = '#a07eb9';
// Figma's #fbda43 → rgba(255,252,238,0) gradient, interpolated non-premultiplied like Figma (a
// plain CSS gradient keeps the yellow saturated all the way down to transparent).
const yellowGradient = `linear-gradient(to bottom, ${Array.from({ length: 11 }, (_, i) => {
  const t = i / 10;
  const c = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgba(${c(251, 255)},${c(218, 252)},${c(67, 238)},${(1 - t).toFixed(2)}) ${t * 100}%`;
}).join(', ')})`;

const mapsUrl = (place: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

/** The design's date style: "27 September 2027". */
const formatDate = (iso: string) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(parseIsoDate(iso));

// The room each piece of the couple's text has (see FitBox). Text longer than the sample
// shrinks to fit rather than running out of its slot.
const FIT = {
  title: { w: 335 },
  line: { w: 335 },
  doodle: { w: 150, h: 60 },
  doodleSignature: { w: 120 },
  storyTitle: { w: 255, origin: '0 50%' },
  // Story texts are centred on their Figma lines; these are the heights that clear the titles
  // above and below.
  storyText: [
    { h: 64, origin: '0 50%' },
    { h: 47, origin: '0 50%' },
    { h: 64, origin: '0 50%' },
  ],
  // Inside the ornate frames, clear of their borders.
  event: { w: 250 },
  gift: { w: 240 },
  address: { w: 240, h: 76 },
  closing: { h: 96 },
  signature: { w: 280 },
} satisfies Record<string, FitBox | FitBox[]>;

/** Cover → content transition without animations (shared with the template): the cover fades. */
export const INTRO = {
  EASE_OUT: 'cubic-bezier(0.33, 1, 0.68, 1)',
  REDUCED_FADE_MS: 300,
};
/** A point in the frame (px) the camera moves to as the cover opens. */
export type Focus = [x: number, y: number];
/**
 * The cover opening onto the page: `revealed` once it starts, `done` once the cover has gone,
 * with the point the camera moves to (see friendsOpening.ts).
 */
export type IntroState = { revealed: boolean; reducedMotion: boolean; done: boolean; focus: Focus };

/**
 * One plane of the fountain scene as the camera arrives (OPENING.scene): `k` times larger about
 * the focus under the cover, settling to its Figma position as the cover opens. `at` is where the
 * plane's own box starts in the frame, which its origin is measured from. Nothing once the cover
 * has gone, so the scene is exactly as laid out.
 */
function introStyle({ revealed, reducedMotion, done, focus }: IntroState, k: number, at: Focus = [0, 0]): CSSProperties {
  if (!ENABLE_ANIMATIONS || reducedMotion || done) return {};
  const transformOrigin = `${focus[0] - at[0]}px ${focus[1] - at[1]}px`;
  if (!revealed) return { transform: `scale(${k})`, transformOrigin };
  const { delayMs, ms, ease } = OPENING.scene;
  return { transform: 'none', transformOrigin, transition: `transform ${ms}ms ${ease} ${delayMs}ms` };
}

/** Image layer at a Figma box: a design file (`file`) or one of the couple's photos (`src`). */
function Img({ file, src, x, y, w, h, alt = '', className = '', style }: { file?: string; src?: string; x: number; y: number; w: number; h: number; alt?: string; className?: string; style?: CSSProperties }) {
  return (
    <img
      alt={alt}
      src={src ?? A(file!)}
      className={`absolute block max-w-none object-cover ${className}`}
      style={{ left: x, top: y, width: w, height: h, ...style }}
    />
  );
}

/** A layer with Figma's absolute transform [[a, b, x], [c, d, y]] (rotation and/or flip). */
function Transformed({ m, w, h, className = '', style, children }: { m: [number, number, number, number, number, number]; w: number; h: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  const [a, b, x, c, d, y] = m;
  return (
    <div
      className={`absolute left-0 top-0 ${className}`}
      style={{ width: w, height: h, transformOrigin: '0 0', transform: `matrix(${a}, ${c}, ${b}, ${d}, ${x}, ${y})`, ...style }}
    >
      {children}
    </div>
  );
}
const fill = 'absolute inset-0 block max-w-none size-full';

/** Text centred on a point, like Figma's centre-anchored text boxes; `fit` for the couple's own text. */
function Centered({ cx, cy, className, style, fit, children }: { cx: number; cy: number; className: string; style?: CSSProperties; fit?: FitBox; children: ReactNode }) {
  const f = useFit<HTMLDivElement>(fit);
  return (
    <div ref={f.ref} className={`-translate-x-1/2 -translate-y-1/2 absolute text-center whitespace-nowrap ${className}`} style={{ left: cx, top: cy, ...style, ...f.style }}>
      {children}
      {f.probe}
    </div>
  );
}

/** A paragraph of the couple's text that shrinks to fit `fit`. */
function FitP({ className, style, fit, children }: { className: string; style?: CSSProperties; fit: FitBox; children: ReactNode }) {
  const f = useFit<HTMLParagraphElement>(fit);
  return (
    <p ref={f.ref} className={className} style={{ ...style, ...f.style }}>
      {children}
      {f.probe}
    </p>
  );
}

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

const friendsTitle = 'ff-friends tracking-[-0.017em] whitespace-nowrap';

function SeeLocation({ place, href }: { place: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`See ${place} on Google Maps`}
      className="absolute left-[138px] top-[3609px] h-[24px] w-[100px] rounded-[100px] bg-[#fbda43]"
    >
      <span className="absolute left-[9px] top-[4px] size-[15px] overflow-clip">
        <span className="absolute inset-[0_14.58%]">
          <img alt="" className={fill} src={A('pin.svg')} />
        </span>
      </span>
      <span className="ff-f72 -translate-x-1/2 -translate-y-1/2 absolute left-[58px] top-[12px] text-[12px] leading-[20px] tracking-[-0.017em] text-[#181719] whitespace-nowrap">
        See Location
      </span>
    </a>
  );
}

/** The gift frame's "COPY" pill, at its Figma position (x, y = the pill's top-left). */
function CopyButton({ x, y, label, text }: { x: number; y: number; label: string; text: string }) {
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
      className="absolute h-[22px] w-[64px] cursor-pointer rounded-[20px] border border-solid border-[#a07eb9] bg-[#efecec]"
      style={{ left: x, top: y }}
    >
      {!copied && <img alt="" src={A('copy.svg')} className="absolute block max-w-none" style={{ left: 9, top: 3.2, width: 11, height: 13.41 }} />}
      {/* "COPIED" is wider than the text slot next to the icon, so it replaces the icon and centres. */}
      <span
        className="-translate-x-1/2 -translate-y-1/2 absolute top-[10.5px] font-['Raleway'] text-[10px] leading-[15px] tracking-[-0.17px] text-[#a07eb9] whitespace-nowrap"
        style={{ left: copied ? 31 : 38.5 }}
      >
        {copied ? 'COPIED' : 'COPY'}
      </span>
    </button>
  );
}

// ---------- Polaroids + gallery ----------

// The gallery starts on the photo at the top of the stack (the third polaroid drawn, the
// first in the data) and goes down through it.
const lightboxPhotos = ({ polaroids, coupleNames }: FriendsInvitation): LightboxPhoto[] =>
  polaroids.map((p, i) => ({ src: p.large ?? p.photo, alt: `${coupleNames}, photo ${i + 1} of ${polaroids.length}` }));
const lightboxTheme = ({ coupleNames }: FriendsInvitation): LightboxTheme => ({
  arrowBg: '#a07eb9',
  arrowFg: '#fbda43',
  counterClass: 'ff-friends text-[20px] leading-none tracking-[0.04em] text-[#fbda43]',
  labels: { dialog: `Photos of ${coupleNames}`, close: 'Close', prev: 'Previous photo', next: 'Next photo' },
});

/**
 * One polaroid: the white frame and the photo, clipped to Figma's mask rectangle (given in
 * the photo's own rotated coordinates). It has no box of its own; its children keep their
 * frame coordinates, so the stacking is exactly Figma's. A tap anywhere on the stack opens
 * the gallery on the top photo: the top polaroid is the (focusable) button, the two under it
 * just take taps.
 */
function Polaroid({ top = false, onOpen, children }: { top?: boolean; onOpen: () => void; children: ReactNode }) {
  if (!top)
    return (
      <div aria-hidden="true" onClick={onOpen} className="absolute left-0 top-0 size-0 cursor-zoom-in">
        {children}
      </div>
    );
  return (
    <button type="button" aria-label="View the photos (3)" onClick={onOpen} className="group absolute left-0 top-0 size-0 cursor-zoom-in outline-none">
      {children}
    </button>
  );
}
const polaroidPhoto = 'absolute inset-0 block max-w-none size-full object-cover group-focus-visible:outline-2 group-focus-visible:outline-white';

// ---------- RSVP ----------

const ATTENDANCE: { value: Attendance; label: string; top: number }[] = [
  { value: 'hadir', label: 'I’ll be there', top: 3922 },
  { value: 'tidak', label: 'Sorry, I can’t make it', top: 3965 },
  { value: 'mungkin', label: 'I’m not sure yet', top: 4008 },
];
const fieldLabel = 'ff-f72 -translate-y-1/2 absolute left-[44px] text-[12px] leading-[20px] tracking-[-0.017em] text-black whitespace-nowrap';
const fieldBox = 'absolute left-[37px] w-[302px] rounded-[10px] border border-solid border-[#a07eb9] bg-white';
const fieldText = 'ff-f72 text-[12px] leading-[20px] tracking-[-0.017em] text-black placeholder:text-[rgba(0,0,0,0.2)] outline-none';

const SEND_ERRORS: Record<SendError, string> = {
  failed: 'Couldn’t send your reply. Check your connection and try again.',
  busy: 'So many replies right now! Please try again in a minute.',
  closed: 'Replies to this invitation are closed.',
  unavailable: 'Sending replies isn’t possible yet. Please try again later.',
};
const THANKS: Record<Attendance, string> = {
  hadir: 'See you there!',
  tidak: 'We’ll miss you. Thank you for letting us know.',
  mungkin: 'Let us know once you’re sure.',
};

/**
 * The attendance form (see useRsvpForm). On a couple's page (`slug`) it sends to the RSVP
 * script; on the demo nothing is sent, and the wish only joins the samples on screen. After sending, the fields give way to a thank-you card, which
 * is also what the guest sees when they reopen the invitation on the same phone.
 */
function Rsvp({ inv, slug, onWish }: { inv: FriendsInvitation; slug?: string; onWish: (wish: Wish) => void }) {
  const { attendance, setAttendance, sent, sending, error, submit, sendAnother } = useRsvpForm(slug, 'friends', onWish);

  const title = (
    <Centered cx={188.5} cy={3800} className={`${friendsTitle} text-[18px] leading-[20px] text-[#a07eb9]`}>
      attendance
    </Centered>
  );

  if (sent)
    return (
      <>
        {title}
        <div role="status" className={`${fieldBox} top-[3846px] flex h-[390px] flex-col items-center justify-center gap-[10px] px-[24px] text-center`}>
          <img alt="" src={A('turkey-dance.webp')} className="block h-[95px] w-[91px] max-w-none" />
          <p className={`${friendsTitle} text-[30px] leading-[36px] text-[#a07eb9]`}>thank you!</p>
          <p className="ff-f72 text-[14px] leading-[19px] tracking-[-0.017em] text-[#181719]">
            Your reply is on its way to {inv.coupleNames}.
            <br />
            {THANKS[sent.attendance]}
          </p>
          {!slug && <p className="ff-f72 text-[11px] leading-[15px] text-[#8a7a96]">(This is a demo, so nothing was sent.)</p>}
          <button type="button" onClick={sendAnother} className="ff-f72 mt-[4px] cursor-pointer text-[12px] leading-[20px] tracking-[-0.017em] text-[#a07eb9] underline underline-offset-2">
            send another reply
          </button>
        </div>
      </>
    );

  return (
    <form onSubmit={submit}>
      {title}

      <label htmlFor="fr-name" className={fieldLabel} style={{ top: 3831 }}>Name</label>
      <input id="fr-name" name="name" required maxLength={MAX_NAME} autoComplete="name" placeholder="Your Name" className={`${fieldBox} ${fieldText} top-[3846px] h-[38px] px-[14px]`} />
      {/* Hidden from guests (off the frame): only bots fill it in, and the script then drops the reply. */}
      {slug && <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-1000px] top-[3846px] h-px w-px" />}

      <p className={fieldLabel} style={{ top: 3907 }}>Will you be joining us?</p>
      {ATTENDANCE.map((opt) => (
        <label key={opt.value} className={`${fieldBox} h-[38px] cursor-pointer`} style={{ top: opt.top }}>
          <input
            type="radio"
            name="attendance"
            value={opt.value}
            checked={attendance === opt.value}
            onChange={() => setAttendance(opt.value)}
            className="peer sr-only"
          />
          <span className="absolute left-[10px] top-[8px] size-[19px] rounded-full border-2 border-[#a07eb9] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#a07eb9]">
            {attendance === opt.value && <span className="absolute left-[3px] top-[3px] size-[9px] rounded-full bg-[#a07eb9]" />}
          </span>
          <span className="ff-f72 -translate-y-1/2 absolute left-[39px] top-[18px] text-[12px] leading-[20px] tracking-[-0.017em] text-black whitespace-nowrap">
            {opt.label}
          </span>
        </label>
      ))}

      <label htmlFor="fr-message" className={fieldLabel} style={{ top: 4070 }}>Message</label>
      <textarea
        id="fr-message"
        name="message"
        maxLength={MAX_MESSAGE}
        placeholder="A Note for Us"
        className={`${fieldBox} ${fieldText} top-[4085px] h-[104px] resize-none px-[14px] pt-[8px]`}
      />

      <button
        type="submit"
        disabled={sending}
        className="absolute left-[37px] top-[4198px] h-[38px] w-[302px] cursor-pointer rounded-[10px] disabled:cursor-wait disabled:opacity-70"
        style={{ backgroundColor: PURPLE }}
      >
        <span className="ff-f72 -translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 font-semibold text-[12px] leading-[20px] tracking-[1.2px] text-white whitespace-nowrap">
          {sending ? 'SENDING…' : 'SUBMIT RSVP'}
        </span>
      </button>
      {error && (
        <p role="alert" className="ff-f72 -translate-x-1/2 absolute left-1/2 top-[4241px] w-[302px] text-center text-[11px] leading-[14px] tracking-[-0.017em] text-[#d64f16]">
          {SEND_ERRORS[error]}
        </p>
      )}
    </form>
  );
}

// ---------- Wishes ----------

// On a couple's page the guests' wishes get their own band under the form: everything below
// it moves down by WISHES_H. On a demo it shows sample wishes from the demo data.
const WISHES_Y = 4256;
const WISHES_H = 470;
// The yellow gradient behind the form, at the band's top, continues as the band's colour.
const GRADIENT_TOP = 3106;
const GRADIENT_H = 2245;
const bandColour = (() => {
  const t = (WISHES_Y - GRADIENT_TOP) / GRADIENT_H;
  const c = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgba(${c(251, 255)},${c(218, 252)},${c(67, 238)},${(1 - t).toFixed(3)})`;
})();

// With no gifts at all, the whole "Gifting" stretch (the title down to the bottom of the yellow
// frame) is left out and everything below it moves up.
const GIFTS_TOP = 4680;
const GIFTS_H = 5290 - GIFTS_TOP;
// With only one gift option, it moves to the middle of the frame (its inside is 4799–5234).
const BANK_ALONE_SHIFT = 106;
const DELIVERY_ALONE_SHIFT = -100;

/**
 * Layers moved down by `by` frame px (or up, when negative), e.g. everything below the wishes
 * band; their reveals move with them. No wrapper at all when `by` is 0. Nothing in it reaches
 * above frame y `from`, where its box starts: a box drawn after a Scene that reaches into it would
 * go onto a layer of its own while the scene moves, and the text in it lose its sub-pixel
 * smoothing (see Scene).
 */
function Shift({ by, from = 0, children }: { by: number; from?: number; children: ReactNode }) {
  const offset = useContext(RevealOffset);
  // Where nothing moves, the box is the whole frame, exactly as without scenes.
  if (useStill()) from = 0;
  if (!by) return <>{children}</>;
  return (
    <RevealOffset.Provider value={offset + by}>
      <div className={`absolute left-0 ${from ? 'overflow-clip' : ''}`} style={{ top: from, width: FRAME_W, height: FRAME_H - from, transform: `translateY(${by}px)`, pointerEvents: 'none' }}>
        <div className="absolute left-0 *:pointer-events-auto" style={{ top: -from, width: FRAME_W, height: FRAME_H }}>
          {children}
        </div>
      </div>
    </RevealOffset.Provider>
  );
}

function WishesBand({ wishes }: { wishes: WishesState }) {
  const note = 'ff-f72 px-[10px] py-[24px] text-center text-[12px] leading-[17px] tracking-[-0.017em] text-[#8a7a96]';
  return (
    <>
      <div className="absolute left-0 w-[376px]" style={{ top: WISHES_Y, height: WISHES_H, backgroundColor: bandColour }} />
      <Reveal at={WISHES_Y} kind="fadeUp">
        <Centered cx={188.5} cy={WISHES_Y + 30} className={`${friendsTitle} text-[18px] leading-[20px] text-[#a07eb9]`}>
          wishes{wishes.wishes.length > 0 && ` (${wishes.wishes.length})`}
        </Centered>
        <div className={`${fieldBox} overflow-y-auto px-[16px]`} style={{ top: WISHES_Y + 50, height: WISHES_H - 80 }}>
          {wishes.wishes.length > 0 ? (
            <ul>
              {wishes.wishes.map((w, i) => (
                <li key={`${i}-${w.time}`} className="border-b border-dashed border-[#a07eb9]/40 py-[12px] last:border-b-0">
                  <p className="ff-f72 flex items-baseline justify-between gap-[8px] text-[13px] leading-[18px] tracking-[-0.017em] text-[#181719]">
                    <span className="min-w-0 break-words font-semibold">{w.name}</span>
                    <span className="shrink-0 text-[10px] text-[#8a7a96]">{timeAgo(w.time, 'en')}</span>
                  </p>
                  <p className="ff-f72 mt-[4px] whitespace-pre-line break-words text-[12px] leading-[17px] tracking-[-0.017em] text-[#363636]">{w.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={note}>
              {wishes.status === 'loading'
                ? 'Loading wishes…'
                : wishes.status === 'error'
                  ? 'Wishes can’t be shown right now.'
                  : 'No wishes yet. Be the first to leave one!'}
            </p>
          )}
        </div>
      </Reveal>
    </>
  );
}

/**
 * The fountain scene's nearest layers (the lamps, couch and Magna Doodle), settling further than
 * the rest as the camera arrives. Without a `style` (the cover has gone) there is no box at all.
 */
function Near({ style, children }: { style: CSSProperties; children: ReactNode }) {
  if (!style.transform) return <div className="contents">{children}</div>;
  return (
    <div className="absolute left-0 top-0 h-[780px] w-[375px]" style={style}>
      {children}
    </div>
  );
}

/** Whether the page's scenes stay still (animations off, or reduced motion): decided once, like the reveals. */
function useStill() {
  const [still] = useState(() => !ENABLE_ANIMATIONS || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return still;
}

/**
 * Whether the element is on screen (or nearly), for idle motion that only runs there; also
 * toggles `data-live` on it, which starts a scene's depth (friends.css).
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

/**
 * Layers which, inside a Scene, drift at their own `depth` as they scroll by (positive: further
 * away, so slower than the page; negative: nearer). The size of the whole frame at its origin, so
 * the layers keep their Figma coordinates. Outside a moving Scene, just the layers.
 */
function Depth({ depth, children }: { depth: number; children: ReactNode }) {
  if (!useContext(InMovingScene)) return <>{children}</>;
  return (
    <div className="fr-depth absolute inset-0" style={{ '--fr-depth': depth } as CSSProperties}>
      {children}
    </div>
  );
}

// Room around a Scene's layers for them to move in.
const SCENE_MARGIN = 14;
const InMovingScene = createContext(false);

/**
 * Layers (in Depth) that move as one scene, as in The Notebook and La La Land: each is exactly at
 * its Figma position whenever the scene's box is centred on screen, and they move only while the
 * scene is on screen (or nearly). The box also clips them, just around themselves: Chrome assumes
 * a running animation may overlap everything painted after it and would move that onto separate
 * layers, so text painted later would lose its sub-pixel smoothing. Keep text drawn after a Scene
 * out of its box. (Not for layers inside a Shift: its transform would move the scene from the
 * scroll position the depth follows.) For guests who prefer reduced motion there is no box at
 * all, so the layers are drawn exactly as without one.
 */
function Scene({ box: [x, y, w, h], children }: { box: [number, number, number, number]; children: ReactNode }) {
  const [ref] = useLive<HTMLDivElement>();
  if (useStill()) return <>{children}</>;
  const m = SCENE_MARGIN;
  return (
    <div ref={ref} className="fr-scene pointer-events-none absolute overflow-clip" style={{ left: x - m, top: y - m, width: w + 2 * m, height: h + 2 * m }}>
      <div className="absolute [&_img]:pointer-events-auto" style={{ left: m - x, top: m - y, width: FRAME_W, height: FRAME_H }}>
        <InMovingScene.Provider value>{children}</InMovingScene.Provider>
      </div>
    </div>
  );
}

// The Tiffany lamps' warm light (sceneLights.ts), a box this many frame px across over each
// shade's centre: the two at the fountain, and Central Perk's. A halo around the shade, faint over
// the glass itself so its colours aren't washed out.
const GLOW_W = 150;
const GLOW_H = 120;
// Laid over the painting as it is, not blended with it: a blend mode would have the browser put
// the whole page, text and all, on a layer of its own beside a moving scene.
const GLOW = 'radial-gradient(closest-side, rgba(255,214,150,0.08) 0%, rgba(255,204,130,0.12) 45%, rgba(255,190,112,0.2) 62%, rgba(255,180,100,0.08) 82%, rgba(255,180,100,0) 100%)';
const LAMP_GLOWS = {
  fountainLeft: { x: 32, y: 425.7, ms: 6400, delay: 0 },
  fountainRight: { x: 343, y: 425.7, ms: 7100, delay: -2600 },
  perk: { x: 341, y: 2865, ms: 6800, delay: -1300 },
};

/**
 * A lamp's light breathing (sceneLights.ts) while it is on screen, once `active`: it comes on
 * softly. For guests who prefer reduced motion there is no element at all.
 */
function LampGlow({ x, y, ms, delay, active = true }: (typeof LAMP_GLOWS)[keyof typeof LAMP_GLOWS] & { active?: boolean }) {
  const [ref, live] = useLive<HTMLDivElement>();
  useLight(ref, 'glow', { ms, delay, active: active && live });
  if (useStill()) return null;
  return <div ref={ref} className="light-glow pointer-events-none absolute" style={{ left: x - GLOW_W / 2, top: y - GLOW_H / 2, width: GLOW_W, height: GLOW_H, backgroundImage: GLOW }} />;
}

// Bright spots on the fountain's jets that glint now and then (frame x, y; how often; how far
// behind the page's clock), all well clear of the text.
const FOUNTAIN_GLINTS = [
  { x: 185, y: 352, ms: 5200, delay: -800 },
  { x: 132, y: 388, ms: 6100, delay: -3400 },
  { x: 232, y: 380, ms: 5700, delay: -2100 },
  { x: 262, y: 452, ms: 6600, delay: -4700 },
];
// How far around each spot the glint reaches.
const GLINT_R = 14;
const GLINT_MASK: CSSProperties = {
  maskImage: 'radial-gradient(circle closest-side, #000 35%, transparent)',
  WebkitMaskImage: 'radial-gradient(circle closest-side, #000 35%, transparent)',
};

/**
 * One spot of the fountain's water glinting now and then: the same part of the painting blended
 * over it more brightly at times and not at all in between (as La La Land's stars twinkle), so at
 * rest the water is exactly as painted. Just around the spot, so only that small box repaints.
 */
function FountainGlint({ x, y, ms, delay, active }: (typeof FOUNTAIN_GLINTS)[number] & { active: boolean }) {
  const [ref, live] = useLive<HTMLDivElement>();
  const water = useRef<HTMLImageElement>(null);
  useLight(water, 'twinkle', { ms, delay, active: active && live });
  if (useStill()) return null;
  const [left, top] = [x - GLINT_R, y - GLINT_R];
  return (
    // Fading out towards its edge, so the box never shows on the lit water around it.
    <div ref={ref} className="pointer-events-none absolute overflow-hidden" style={{ left, top, width: 2 * GLINT_R, height: 2 * GLINT_R, ...GLINT_MASK }}>
      <img ref={water} alt="" src={A('fountain.webp')} className="light-twinkle absolute block max-w-none" style={{ left: 60 - left, top: 334 - top, width: 245, height: 261, mixBlendMode: 'screen' }} />
    </div>
  );
}

/**
 * Chandler's emphasis: the word gives one small bounce, a moment after its line has come in at
 * frame y `at`, and is plain text again once it has. Without the reveals it simply shows.
 */
function Emphasis({ at, className, children }: { at: number; className: string; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(at);
  useEffect(() => {
    const el = ref.current;
    if (!inView || !el) return;
    // A transform needs a box of its own: the word alone, so the line is laid out as before.
    el.style.display = 'inline-block';
    const anim = el.animate(
      [
        { transform: 'none' },
        { transform: 'translateY(-3px) scale(1.16)', offset: 0.35 },
        { transform: 'translateY(0.5px) scale(0.97)', offset: 0.7 },
        { transform: 'none' },
      ],
      { duration: 650, delay: EMPHASIS_DELAY_MS, easing: 'cubic-bezier(0.37, 0, 0.63, 1)' },
    );
    const done = () => el.style.removeProperty('display');
    anim.finished.then(done, done);
    return () => anim.cancel();
  }, [inView]);
  return (
    <span ref={ref} className={className} style={{ transformOrigin: '50% 80%' }}>
      {children}
    </span>
  );
}
// Once the line has mostly faded in.
const EMPHASIS_DELAY_MS = 1100;

// Central Perk: the rug, lamp, couch and table come forward as one, nearer than the bar against
// the wall (which stays with the page), so nothing slides on the rug and the stools peeking over
// the couch shift behind it.
const PERK_DEPTH = -8;

// Handwritten headings start as soon as they are just on screen, before the reveals around them.
// A name under a photo waits for the photo to start coming in; the Magna Doodle is written once the
// camera has all but settled into its scene.
const NAME_WRITE_DELAY_MS = 400;
const DOODLE_WRITE_DELAY_MS = OPENING.scene.delayMs + OPENING.scene.ms * 0.4;

// ---------- Page ----------

const storyTitle = 'ff-f72 -translate-y-1/2 absolute left-[89px] text-[15px] leading-[30px] tracking-[-0.017em] text-[#d64f16] whitespace-nowrap';
const storyText = 'ff-f72 -translate-y-1/2 absolute left-[89px] w-[218px] text-[11px] leading-[13px] tracking-[-0.017em] text-black';
const eventText = 'ff-f72 text-[17px] leading-[22px] tracking-[-0.017em] text-white';
const eventTitle = 'ff-f72-supersoft text-[22px] leading-[30px] tracking-[-0.017em] text-white';
// "Our Love Story": where each moment's title and text sit on the torn paper.
const STORY_SLOTS = [
  { at: 2540, titleTop: 2553, textTop: 2593.5 },
  { at: 2632, titleTop: 2646, textTop: 2678.5 },
  { at: 2708, titleTop: 2723, textTop: 2763.5 },
];

export default function FriendsContent({ invitation: inv, slug, intro }: { invitation: FriendsInvitation; slug?: string; intro: IntroState }) {
  const wishes = useWishes(slug, inv.demo?.sampleWishes);
  // The wishes band: the couple's guests' wishes, or a demo's samples. (Without either, e.g. a
  // page with neither a slug nor demo data, the frame is Figma's exactly.)
  const shift = slug || inv.demo ? WISHES_H : 0;
  const { bank, giftDelivery: gift } = inv;
  const hasGifts = Boolean(bank || gift);
  // Everything below the gifts: down by the band, and up by the gifts when there are none.
  const closingShift = shift - (hasGifts ? 0 : GIFTS_H);
  const frameH = FRAME_H + closingShift;
  const weddingDate = formatDate(inv.date);
  const photos = useMemo(() => lightboxPhotos(inv), [inv]);
  const theme = useMemo(() => lightboxTheme(inv), [inv]);
  // Polaroids are drawn bottom of the stack first.
  const [topPolaroid, middlePolaroid, bottomPolaroid] = inv.polaroids;
  const titleFit = useFit<HTMLHeadingElement>(FIT.title);
  // The Magna Doodle is signed once its message is written.
  const [doodleWritten, setDoodleWritten] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const openGallery = () => setGalleryOpen(true);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setScale(el.clientWidth / FRAME_W);
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / FRAME_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const reveals = useScrollReveals({ enabled: ENABLE_ANIMATIONS, frameW: FRAME_W, frameH, wrapRef, started: intro.revealed });

  return (
    <RevealProvider value={reveals}>
    {/* `clip` too (`hidden` is the fallback): a box that hides its overflow goes onto a layer of
        its own, with all the text in it, while a scene inside it moves (see Scene). */}
    <div ref={wrapRef} className="relative w-full overflow-hidden bg-[#fefffa]" style={{ aspectRatio: `${FRAME_W} / ${frameH}`, overflow: 'clip' }}>
      {/* `clip` rather than `hidden` (kept as the fallback) so the browser can't scroll the frame
          sideways when it brings a form field or button into view. */}
      <div className="absolute left-0 top-0 overflow-hidden" style={{ width: FRAME_W, height: frameH, zoom: scale, overflow: 'clip' }}>
        {/* ===== BG ===== */}
        <div className="absolute left-0 top-[459px] h-[1587px] w-[377px]" style={{ backgroundColor: PURPLE }} />
        <Img file="fabric-texture.webp" x={1.01} y={676.8} w={378} h={1408.1} className="opacity-10" />
        {/* The fountain scene's painting and grass: the farthest planes as the camera arrives. */}
        <div className="absolute left-0 top-[-236px] h-[851px] w-[375px] overflow-hidden" style={introStyle(intro, OPENING.scene.far, [0, -236])}>
          {/* The largest thing on screen at first (the page's LCP): fetched before the rest. */}
          <img alt="" src={A('city-night.webp')} fetchPriority="high" className="absolute left-0 top-0 block h-[109.05%] w-full max-w-none" />
        </div>
        <Img file="grass.webp" x={-113} y={492} w={602} h={243} style={introStyle(intro, OPENING.scene.mid, [-113, 492])} />
        <div className="absolute left-0 top-[2018px] h-[1059px] w-[376px] bg-[#d64f16]" />
        {[2013, 2347, 2681].flatMap((y) => [0, 188].map((x) => <Img key={`${x}-${y}`} file="brick.webp" x={x} y={y} w={188} h={334} className="opacity-33" />))}
        {[0, 188].map((x) => (
          <div key={x} className="absolute top-[3014px] h-[69px] w-[188px] overflow-hidden opacity-33" style={{ left: x }}>
            <img alt="" src={A('brick.webp')} className="absolute left-0 top-0 block h-[334px] w-full max-w-none object-cover" />
          </div>
        ))}
        {shift ? (
          // The gradient in two pieces: above the wishes band, and (moved down) below it.
          <div className="absolute left-0 top-[3106px] w-[376px] overflow-hidden" style={{ height: WISHES_Y - GRADIENT_TOP }}>
            <div className="w-full" style={{ height: GRADIENT_H, backgroundImage: yellowGradient }} />
          </div>
        ) : (
          <div className="absolute left-0 top-[3106px] h-[2245px] w-[376px]" style={{ backgroundImage: yellowGradient }} />
        )}
        <Shift by={shift}>
          {shift > 0 && (
            <div className="absolute left-0 w-[376px] overflow-hidden" style={{ top: WISHES_Y, height: GRADIENT_TOP + GRADIENT_H - WISHES_Y }}>
              <div className="w-full" style={{ height: GRADIENT_H, marginTop: GRADIENT_TOP - WISHES_Y, backgroundImage: yellowGradient }} />
            </div>
          )}
        </Shift>
        {/* Without gifts the venue moves up with the closing; the couple photo strip then covers
            its top, so the same part of it shows as under the gift frame. */}
        <Shift by={closingShift}>
          <Img file="snowy-venue.webp" x={-56} y={4949} w={486} h={729} className="opacity-88" />
          <div className="absolute left-0 top-[5336px] h-[354px] w-[376px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-white to-[80.288%]" />
        </Shift>

        {/* ===== Background doodles ===== */}
        {hasGifts && (
          <Shift by={shift}>
            <Img file="gift-icons.svg" x={-8} y={4723} w={392.567} h={533.557} />
          </Shift>
        )}
        <Reveal at={887} kind="pop" origin={[57.5, 1012]} delay={300}>
          <Img file="lily-1.webp" x={-12} y={887} w={139} h={250} />
        </Reveal>
        <Reveal at={1341} kind="pop" origin={[316.9, 1467.9]} delay={300}>
          <Transformed m={[0.984, -0.179, 269.661, 0.179, 0.984, 1341]} w={138.373} h={232.678}><img alt="" src={A('lily-2.webp')} className={fill} /></Transformed>
        </Reveal>
        <Reveal at={1561} kind="pop" origin={[52.2, 1632.4]} delay={350}>
          <Transformed m={[-0.881, 0.474, 53.304, 0.474, 0.881, 1561]} w={69.617} h={124.637}><img alt="" src={A('lily-3.webp')} className={fill} /></Transformed>
        </Reveal>
        <Reveal at={1066} kind="pop" origin={[317.2, 1137.4]} delay={350}>
          <Transformed m={[0.881, -0.474, 316.066, 0.474, 0.881, 1066]} w={69.617} h={124.637}><img alt="" src={A('lily-3.webp')} className={fill} /></Transformed>
        </Reveal>
        <Reveal at={3985} kind="pop" origin={[351.9, 4105.6]} delay={300}>
          <Transformed m={[-0.908, 0.419, 364.547, 0.419, 0.908, 3985]} w={123.968} h={208.455}><img alt="" src={A('lily-2.webp')} className={fill} /></Transformed>
        </Reveal>
        <Reveal at={3665} kind="pop" origin={[36.2, 3756.1]} delay={300}>
          <Transformed m={[0.773, -0.634, 50.051, 0.634, 0.773, 3665]} w={94.229} h={158.448}><img alt="" src={A('lily-2.webp')} className={fill} /></Transformed>
        </Reveal>
        <Img file="ribbon.svg" x={-16} y={3735.1} w={377.688} h={440.765} />

        {/* ===== Cast line-art on the yellow arch ===== */}
        {/* The set lighting up as it scrolls in: the arch grows up from its base (still past both
            edges of the frame at its smallest), the rug comes up, then the friends on the couch. */}
        <Reveal at={1828} kind="grow" origin={[187.5, 2084]}>
          <Img file="yellow-arch.svg" x={-16.76} y={1828} w={408.511} h={256} />
        </Reveal>
        <Reveal at={1966} kind="fade" delay={150}>
          <Img file="carpet.webp" x={-18} y={1966} w={412} h={135} />
        </Reveal>
        <Reveal at={1854} kind="rise" delay={300}>
          <Img file="cast-lineart.webp" x={29} y={1854} w={325} h={217} alt="Line drawing of the bride and her friends on the couch" />
        </Reveal>

        <Reveal at={2110} kind="fadeUp">
          <Centered cx={188} cy={2137} className={`${friendsTitle} text-[24px] leading-[30px] text-white`}>
            Could this wedding
            <br />
            <Emphasis at={2110} className="text-[33px]">be</Emphasis> any more special?
          </Centered>
        </Reveal>
        <Reveal at={1330} kind="fade" delay={150}>
          <Centered cx={190} cy={1341} className="ff-f72-soft text-[24px] leading-[30px] tracking-[-0.017em] text-white">
            &amp;
          </Centered>
        </Reveal>
        <Reveal at={770} kind="fadeUp">
          <Centered cx={188} cy={798} className={`${friendsTitle} text-[22px] leading-[30px] text-white`}>
            THE ONE WHERE
            <br />
            WE FOUND OUR PERSON
          </Centered>
        </Reveal>

        {/* ===== Fountain scene (first section: the camera settles into it as the cover opens) ===== */}
        <div className="absolute left-0 top-0 h-[780px] w-[375px]" style={introStyle(intro, OPENING.scene.mid)}>
          <Img file="fountain.webp" x={60} y={334} w={245} h={261} />
          {FOUNTAIN_GLINTS.map((g) => (
            <FountainGlint key={g.x} {...g} active={intro.revealed} />
          ))}
          {/* h2: the cover's title (FriendsTemplate.tsx) is the page's one h1. (Drawn before the
              lamps and couch, which it is well clear of, so they can settle as one plane.) */}
          <h2 ref={titleFit.ref} className={`-translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-[116.5px] text-center ${friendsTitle} leading-[35px] text-white`} style={titleFit.style}>
            <span className="block text-[20px]">The one with</span>
            <span className="block text-[27px]">{inv.coupleNames}</span>
            <span className="block text-[27px]">Wedding</span>
            {titleFit.probe}
          </h2>
          <Centered cx={187.5} cy={185} className={`${friendsTitle} text-[17px] leading-[42px] text-white`}>
            {weddingDate}
          </Centered>

          <Near style={introStyle(intro, OPENING.scene.near / OPENING.scene.mid)}>
          <Img file="lamp.webp" x={264} y={389} w={157} h={236} />
          <Img file="lamp.webp" x={-47} y={389} w={157} h={236} />
          {/* The lamps come on as the cover opens. */}
          <LampGlow {...LAMP_GLOWS.fountainRight} active={intro.revealed} />
          <LampGlow {...LAMP_GLOWS.fountainLeft} active={intro.revealed} />
          <Img file="orange-couch.webp" x={24} y={472} w={327} h={164} alt="The orange couch in front of the fountain" />

          {/* Magna Doodle */}
          <Img file="magna-doodle.webp" x={81.25} y={515} w={223.5} h={149} />
          {/* Written on it with its pen as the camera settles into the scene (its lines as one
              text, broken where the couple broke them), and then signed. */}
          <Centered cx={181.24} cy={572.84} className={`${friendsTitle} text-[14px] leading-[19px] text-[#3a3535]`} style={{ whiteSpace: 'pre' }} fit={FIT.doodle}>
            <Handwritten at={548} delay={DOODLE_WRITE_DELAY_MS} onWritten={() => setDoodleWritten(true)}>
              {inv.doodle.lines.join('\n')}
            </Handwritten>
          </Centered>
          <Centered cx={176.8} cy={614.87} className={`${friendsTitle} text-[12px] leading-[26px] text-[#3a3535]`} fit={FIT.doodleSignature}>
            <Handwritten at={602} wait={!doodleWritten} delay={150}>
              {inv.doodle.signature}
            </Handwritten>
          </Centered>
          </Near>
        </div>

        <Reveal at={835} kind="fadeUp" delay={120}>
          <Centered cx={187.5} cy={845} className="ff-f72 text-[18px] leading-[30px] tracking-[-0.017em] text-white">
            Meet the two behind this love story.
          </Centered>
        </Reveal>

        {/* ===== Groom & bride in the yellow peephole frames ===== */}
        <Reveal at={887} kind="fadeUp" delay={150}>
          <Img src={inv.groom.photo} x={83} y={940} w={239} h={239} alt={inv.groom.name} style={{ clipPath: 'inset(3px 33px 12px 10px)' }} />
          <Img file="yellow-frame.webp" x={39} y={887} w={298} h={337} />
        </Reveal>
        {/* His name written by hand under his photo; his parents' lines fade in. */}
        <Centered cx={188} cy={1239} className={`${friendsTitle} text-[24px] leading-[30px] text-white`} fit={FIT.line}>
          <Handwritten at={1225} delay={NAME_WRITE_DELAY_MS}>{inv.groom.name}</Handwritten>
        </Centered>
        <Reveal at={1225} kind="fadeUp" delay={150}>
          <Centered cx={187} cy={1265} className="ff-f72 text-[16px] leading-[30px] tracking-[-0.017em] text-white" fit={FIT.line}>{inv.groom.parentsLabel}</Centered>
          <Centered cx={187.5} cy={1286} className="ff-f72 text-[16px] leading-[30px] tracking-[-0.017em] text-white" fit={FIT.line}>{inv.groom.parents}</Centered>
        </Reveal>

        <Reveal at={1381} kind="fadeUp" delay={150}>
          <Img src={inv.bride.photo} x={70} y={1437} w={240} h={240} alt={inv.bride.name} style={{ clipPath: 'inset(0 21px 16px 23px)' }} />
          <Img file="yellow-frame.webp" x={39} y={1381} w={298} h={337} />
        </Reveal>
        <Centered cx={188} cy={1733} className={`${friendsTitle} text-[24px] leading-[30px] text-white`} fit={FIT.line}>
          <Handwritten at={1720} delay={NAME_WRITE_DELAY_MS}>{inv.bride.name}</Handwritten>
        </Centered>
        <Reveal at={1720} kind="fadeUp" delay={150}>
          <Centered cx={187.5} cy={1759} className="ff-f72 text-[16px] leading-[30px] tracking-[-0.017em] text-white" fit={FIT.line}>{inv.bride.parentsLabel}</Centered>
          <Centered cx={187} cy={1780} className="ff-f72 text-[16px] leading-[30px] tracking-[-0.017em] text-white" fit={FIT.line}>{inv.bride.parents}</Centered>
        </Reveal>

        {/* ===== Stacked polaroids ===== */}
        <Reveal at={2177} kind="settle" origin={[186.7, 2299]} tilt={3} delay={150}>
          <Polaroid onOpen={openGallery}>
            <Img file="polaroid-frame-1.svg" x={46.963} y={2202} w={279.501} h={194} />
            <div className="absolute left-[50px] top-[2177px] h-[243px] w-[274px]" style={{ clipPath: 'inset(33.049px 5.507px 32.045px 4.701px)' }}>
              <img alt="" src={bottomPolaroid.photo} className={polaroidPhoto} />
            </div>
          </Polaroid>
        </Reveal>
        <Reveal at={2177} kind="settle" origin={[207.2, 2298.9]} tilt={-3} delay={300}>
          <Polaroid onOpen={openGallery}>
            <Transformed m={[0.995, -0.097, 77.799, 0.097, 0.995, 2189]} w={279} h={193.652}><img alt="" src={A('polaroid-frame-2.svg')} className={fill} /></Transformed>
            <Transformed m={[0.995, -0.097, 79.751, 0.097, 0.995, 2168.984]} w={286.575} h={214.931} style={{ clipPath: 'inset(28.137px 15.535px 9.207px 7.721px)' }}>
              <img alt="" src={middlePolaroid.photo} className={polaroidPhoto} />
            </Transformed>
          </Polaroid>
        </Reveal>
        <Reveal at={2177} kind="settle" origin={[171.6, 2303.9]} tilt={3} delay={450}>
          <Polaroid top onOpen={openGallery}>
            <Transformed m={[0.996, 0.089, 24, -0.089, 0.996, 2219.829]} w={279} h={193.652}><img alt="" src={A('polaroid-frame-3.svg')} className={fill} /></Transformed>
            <Transformed m={[0.996, 0.089, 9.771, -0.089, 0.996, 2229.132]} w={316} h={178} style={{ clipPath: 'inset(0.035px 29.958px 0.378px 22.723px)' }}>
              <img alt="" src={topPolaroid.photo} className={polaroidPhoto} />
            </Transformed>
          </Polaroid>
        </Reveal>

        <Reveal at={1795} kind="pop" origin={[338.1, 1873.3]} delay={600}>
          <Float box={[259.0, 1795.0, 158.4, 156.8]} delay={1200}>
            <Transformed m={[0.7806, 0.625, 259, -0.625, 0.7806, 1868.14]} w={117.02} h={106.94}><img alt="" src={A('turkey.webp')} className={fill} /></Transformed>
          </Float>
        </Reveal>

        {/* ===== Our Love Story on torn paper ===== */}
        <Transformed m={[0.974, 0.225, -62.181, -0.225, 0.974, 2716.135]} w={137.221} h={244.869}><img alt="" src={A('newspaper-1.webp')} className={fill} /></Transformed>
        <Img file="newspaper-2.webp" x={209} y={2481} w={225} h={271} />
        <Img file="torn-paper.webp" x={12} y={2429} w={358} h={567} />
        <Centered cx={187.5} cy={2495} className={`${friendsTitle} text-[24px] leading-[30px] text-[#d64f16]`}>
          <Handwritten at={2480}>Our Love Story</Handwritten>
        </Centered>
        <Reveal at={2544} kind="fade" delay={150}>
          <Img file="timeline-line.svg" x={69.5} y={2549.6} w={3} h={175.6} />
          {[2543.7, 2636.9, 2714.1].map((y) => (
            <Img key={y} file="timeline-bullet.svg" x={62} y={y} w={17} h={17} />
          ))}
        </Reveal>
        {STORY_SLOTS.map((slot, i) => (
          <Reveal key={i} at={slot.at} kind="fadeUp" delay={150}>
            <FitP className={storyTitle} style={{ top: slot.titleTop }} fit={FIT.storyTitle}>{inv.story[i].title}</FitP>
            <FitP className={storyText} style={{ top: slot.textTop }} fit={FIT.storyText[i]}>{inv.story[i].text}</FitP>
          </Reveal>
        ))}

        {/* ===== Central Perk ===== */}
        <Img file="perk-bar.webp" x={47} y={2808} w={280} h={224} />
        {/* Its box reaches to the frame's edges (the rug and lamp are cut off there) and stops
            above the Ceremony frame. */}
        <Scene box={[0, 2826, FRAME_W, 3202 - 2826]}>
          <Depth depth={PERK_DEPTH}>
            <Img file="carpet.webp" x={-62} y={3039} w={498} h={163} />
            <Img file="lamp.webp" x={257} y={2826} w={167} h={251} />
            <LampGlow {...LAMP_GLOWS.perk} />
            <Img file="perk-couch.webp" x={17} y={2925} w={340} h={191} alt="The Central Perk couch" />
            <Img file="perk-table.webp" x={71} y={3002} w={232} h={155} />
          </Depth>
        </Scene>

        {/* ===== Ceremony & Reception ===== */}
        <Reveal at={3221} kind="fadeUp" delay={150}>
          <div className="absolute left-[37px] top-[3265px] h-[435px] w-[299px]" style={{ backgroundColor: PURPLE }} />
          <Img file="ornate-frame.webp" x={14} y={3221} w={348} h={523} />
          <Centered cx={188} cy={3591} className={eventText} fit={FIT.event}>{inv.venue.name}</Centered>
          <SeeLocation place={inv.venue.name} href={inv.venue.mapsUrl ?? mapsUrl(inv.venue.name)} />

          <Centered cx={188} cy={3353} className={eventTitle}>Ceremony</Centered>
          <Centered cx={188} cy={3379} className={eventText}>{weddingDate}</Centered>
          <Centered cx={188} cy={3405} className={eventText} fit={FIT.event}>{inv.ceremony.time}</Centered>
          <Img file="rings.svg" x={166} y={3314.2} w={43.942} h={24} />
          <Img file="wreath.webp" x={238.99} y={3343} w={41.806} h={17.637} />
          <Transformed m={[-1, 0, 134.806, 0, 1, 3343]} w={41.806} h={17.637}><img alt="" src={A('wreath.webp')} className={fill} /></Transformed>

          <Centered cx={188} cy={3518} className={eventText}>{weddingDate}</Centered>
          <Centered cx={188.5} cy={3544} className={eventText} fit={FIT.event}>{inv.reception.time}</Centered>
          <Centered cx={188} cy={3488} className={eventTitle}>Reception</Centered>
          <Img file="wreath.webp" x={238.99} y={3478.9} w={41.806} h={17.637} />
          <Transformed m={[-1, 0, 135.81, 0, 1, 3478.9]} w={41.806} h={17.637}><img alt="" src={A('wreath.webp')} className={fill} /></Transformed>
          <Img file="cake.webp" x={176} y={3444.3} w={23} h={31.8} />
        </Reveal>

        <Reveal at={3202} kind="pop" origin={[54.2, 3263.6]} delay={400}>
          <Float box={[-13.0, 3202.0, 134.5, 123.4]} delay={600}>
            <Transformed m={[1, -0.023, -10.223, 0.023, 1, 3202]} w={131.543} h={120.213}><img alt="" src={A('turkey.webp')} className={fill} /></Transformed>
          </Float>
        </Reveal>
        <Reveal at={3602} kind="pop" origin={[289, 3687]} delay={400}>
          <Img file="laundry-couple.webp" x={208} y={3602} w={162} h={170} />
        </Reveal>

        {/* ===== Attendance ===== */}
        <Reveal at={3790} kind="fadeUp">
          <Rsvp inv={inv} slug={slug} onWish={wishes.add} />
        </Reveal>
        {shift > 0 && <WishesBand wishes={wishes} />}

        {/* ===== Gifting ===== */}
        {hasGifts && (
          <Shift by={shift} from={GIFTS_TOP}>
            <Reveal at={4690} kind="fadeUp">
              <Centered cx={189.5} cy={4699} className={`${friendsTitle} text-[18px] leading-[20px] text-[#a07eb9]`}>Gifting</Centered>
            </Reveal>
            <Reveal at={4715} kind="fadeUp" delay={120}>
              <Centered cx={188.5} cy={4729} className="ff-f72-soft text-[12px] leading-[15px] tracking-[-0.017em] text-[#181719]">
                Your prayers and good wishes mean so much to us.
                <br />
                If you’d like to send us a gift, you can do so here:
              </Centered>
            </Reveal>

            {/* The ornate yellow frame around the gift options */}
            <Reveal at={4756} kind="fadeUp" delay={150}>
              <div className="absolute left-[37px] top-[4799px] h-[435px] w-[299px] bg-[#fff1c2]" />
              <Img file="gift-frame.webp" x={14} y={4756} w={348} h={522} />
            </Reveal>

            {bank && (
              <Shift by={gift ? 0 : BANK_ALONE_SHIFT}>
                <Reveal at={4844} kind="fadeUp" delay={250}>
                  <Centered cx={189} cy={4854} className={`${friendsTitle} text-[18px] leading-[20px] text-[#cd5524]`}>Bank transfer</Centered>
                  <Centered cx={188.5} cy={4886} className="ff-fraunces font-bold text-[20px] leading-[20px] tracking-[-0.017em] text-[#363636]" fit={FIT.gift}>{bank.bank}</Centered>
                  <Centered cx={187.5} cy={4914} className="ff-fraunces text-[30px] leading-[20px] text-[#363636]" fit={FIT.gift}>{bank.number}</Centered>
                  {/* Copied without spaces or dashes, so it pastes straight into a banking app. */}
                  <CopyButton x={156} y={4934} label="Copy account number" text={bank.number.replace(/[\s-]/g, '')} />
                  <Centered cx={188.5} cy={4968.5} className="font-['Raleway'] text-[10px] leading-[15px] tracking-[-0.17px] text-[#363636]" fit={FIT.gift}>{bank.holder}</Centered>
                </Reveal>
              </Shift>
            )}

            {/* Two lilies between the options: Figma's 22.1 × 37.2 lily, turned (and mirrored) about its box centre. */}
            {bank && gift && (
              <Reveal at={4982} kind="pop" origin={[188.1, 5001.6]} delay={300}>
                <div className="absolute" style={{ left: 205.66 - 11.054, top: 5001.621 - 18.588, width: 22.108, height: 37.176, transform: 'rotate(57.14deg)' }}>
                  <img alt="" src={A('lily-2.webp')} className={fill} />
                </div>
                <div className="absolute" style={{ left: 170.61 - 11.054, top: 5001.621 - 18.588, width: 22.108, height: 37.176, transform: 'rotate(-57.14deg) scaleX(-1)' }}>
                  <img alt="" src={A('lily-2.webp')} className={fill} />
                </div>
              </Reveal>
            )}

            {gift && (
              <Shift by={bank ? 0 : DELIVERY_ALONE_SHIFT}>
                <Reveal at={5025} kind="fadeUp">
                  <Centered cx={189} cy={5035} className={`${friendsTitle} text-[18px] leading-[20px] text-[#cd5524]`}>Gift Delivery</Centered>
                  <Centered cx={188.5} cy={5064.5} className="ff-f72-soft text-[12px] leading-[15px] tracking-[-0.017em] text-[#181719]">
                    Want to send us a gift?
                    <br />
                    You can send it to the address below.
                  </Centered>
                </Reveal>
                <Reveal at={5084} kind="fadeUp" delay={150}>
                  {/* Name and address sit 10px higher than in Figma to make room above the frame's bottom
                      ornament for a Copy button like the bank one (Figma has none). */}
                  <Centered cx={189.5} cy={5094} className="ff-fraunces font-bold text-[25px] leading-[20px] tracking-[-0.017em] text-[#363636]" fit={FIT.gift}>{gift.name}</Centered>
                  <Centered cx={190} cy={5145.5} className="ff-fraunces text-[10px] leading-[15px] tracking-[-0.017em] text-[#363636]" fit={FIT.address}>
                    <Lines lines={gift.addressLines} />
                  </Centered>
                  <CopyButton x={156} y={5185} label="Copy address" text={[gift.name, ...gift.addressLines].map((l) => l.replace(/,$/, '')).join(', ')} />
                </Reveal>
              </Shift>
            )}
          </Shift>
        )}

        <Shift by={shift} from={4250}>
        {/* ===== Couple photo strip ===== */}
        <Reveal at={4276} kind="fade" delay={100}>
          <Img src={inv.couplePhoto} x={0} y={4276} w={376} h={376} alt={inv.coupleNames} />
          <Transformed m={[1, 0.006, -0.08, 0.006, -1, 4277.936]} w={375.062} h={25.936}><img alt="" src={A('scallop.svg')} className={fill} /></Transformed>
          <Transformed m={[1, 0.006, -0.08, -0.006, 1, 4647.349]} w={375.062} h={25.936}><img alt="" src={A('scallop.svg')} className={fill} /></Transformed>
        </Reveal>
        </Shift>

        <Shift by={closingShift} from={5430}>
        {/* ===== Closing note on torn paper ===== */}
        <Reveal at={5496} kind="fadeUp">
          {/* Figma's 200 × 316 paper, turned 90° about the centre of its 316 × 200 box. */}
          <div className="absolute" style={{ left: 187 - 100.075, top: 5595.825 - 158.025, width: 200.15, height: 316.05, transform: 'rotate(90deg)' }}>
            <img alt="" src={A('torn-paper.webp')} className={fill} />
          </div>
        </Reveal>
        <Reveal at={5540} kind="fadeUp" delay={150}>
          <FitP
            className="ff-fraunces -translate-x-1/2 -translate-y-1/2 absolute left-[187px] top-[5577.5px] w-[260px] text-center text-[12px] leading-[16px] tracking-[-0.017em] text-[#181719]"
            fit={FIT.closing}
          >
            {inv.closing.text}
          </FitP>
        </Reveal>
        <Reveal at={5625} kind="fadeUp" delay={250}>
          <Centered cx={187.5} cy={5644.14} className="ff-fraunces text-[27px] leading-[30px] tracking-[-0.017em] text-[#a07eb9]" fit={FIT.signature}>
            {inv.closing.signature}
          </Centered>
        </Reveal>
        </Shift>

        <Reveal at={666} kind="pop" origin={[187.5, 713.5]} delay={900}>
          <Img file="turkey-dance.webp" x={142} y={666} w={91} h={95} />
        </Reveal>

        {/* ===== Made with love by nicemice (no edge in Figma: the white gradient fades into it) ===== */}
        <Shift by={closingShift} from={5690}>
          <MadeWithLoveFooter y={5715} bgTop={5690} frameH={FRAME_H} background="#fefffa" />
        </Shift>
      </div>

      {galleryOpen && <PhotoLightbox photos={photos} start={0} theme={theme} onClose={() => setGalleryOpen(false)} />}
    </div>
    </RevealProvider>
  );
}
