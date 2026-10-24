import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import yellowFrame from '../../assets/images/friends/yellow-frame.webp';
import peepholeRing from '../../assets/images/friends/peephole-ring.webp';
import buttonPill from '../../assets/images/friends/button-pill.svg';
import buttonRivets from '../../assets/images/friends/button-rivets.svg';
import FriendsContent, { ENABLE_ANIMATIONS, INTRO, type Focus } from './FriendsContent';
import { DOOR_ZOOM, HOLE_R, LARGE_C, OPENING, RING, SMALL_C, doorTransform, peepholeTransform, zoomSteps, type OpeningParts } from './friendsOpening';
import { Reveal, RevealProvider, RevealSpan, useCoverReveals } from './scrollReveal';
import { MusicToggle, useBackgroundMusic } from './templateMusic';
import './friends.css';
import { STAGE_BG } from './templateStage';
import { useFit, type FitBox } from './fitText';
import type { TemplateProps } from '../CouplePage';
import { friendsDemo } from '../../invitations/demo/friends';
import { useGuestName } from '../../invitations/guestName';
import type { FriendsInvitation } from '../../invitations/types';

const PURPLE = '#a07eb9';
const COVER_W = 375;
const COVER_H = 667;
const MAX_COLUMN_W = 430;
// Width of the cover that must stay on screen: the door frame and title span x 49–327.
const SAFE_W = 301;
// The couple's names and the guest's shrink to stay inside that width.
const COVER_FIT: FitBox = { w: 295 };

const ZOOM_MS = 700;
const STEP2_FADE_MS = 350;

type Phase = 'door' | 'zooming' | 'peek' | 'opening' | 'open';

/** The cover's layers the opening animates (see friendsOpening.ts). */
type CoverParts = { [K in keyof OpeningParts]: RefObject<HTMLDivElement | null> };

function useCoverScale(ref: RefObject<HTMLDivElement | null>) {
  const [viewport, setViewport] = useState({ w: COVER_W, h: COVER_H });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setViewport({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  const columnW = Math.min(viewport.w, MAX_COLUMN_W);
  const fit = Math.min(columnW / COVER_W, viewport.h / COVER_H);
  // On phones taller than the frame, grow it to the full height (like the Notebook cover's
  // painting) by cropping the empty purple at the sides, at most down to SAFE_W, so the
  // peephole ring still bleeds off the top as in Figma. Otherwise fit, centred.
  const scale = Math.max(fit, Math.min(viewport.h / COVER_H, columnW / SAFE_W));
  return { scale, top: (viewport.h - COVER_H * scale) / 2 };
}

// Figma "Cover" frames (375 × 667) at their own coordinates, scaled to fit the screen.
// Step 1, the door: tapping anywhere zooms into the peephole. Step 2, the view through it:
// "open invitation" opens the invitation. On load the door settles in: the yellow frame
// fades in and grows a touch into place, the title rises line by line, then the peephole
// starts to pulse. A tap works from the first moment. `parts` are the layers the opening animates.
function FriendsCover({ invitation: inv, guest, phase, reducedMotion, parts, onPeek, onOpen }: { invitation: FriendsInvitation; guest: string; phase: Phase; reducedMotion: boolean; parts: CoverParts; onPeek: () => void; onOpen: () => void }) {
  const ref = parts.column;
  const { scale, top } = useCoverScale(ref);
  const titleFit = useFit<HTMLHeadingElement>(COVER_FIT);
  const greetingFit = useFit<HTMLParagraphElement>(COVER_FIT);
  const guestFit = useFit<HTMLParagraphElement>(COVER_FIT);
  const { reveals, settled } = useCoverReveals({ enabled: ENABLE_ANIMATIONS, frameW: COVER_W, frameH: COVER_H, rootRef: ref, settleMs: 1300 });
  const pulseRef = useRef<HTMLDivElement>(null);
  const atDoor = phase === 'door';
  const zoomed = !atDoor;
  // The opening's own layers, there only while it plays (see friendsOpening.ts).
  const opening = phase === 'opening' && !reducedMotion;

  useEffect(() => {
    const el = pulseRef.current;
    if (!el || !atDoor || !settled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const anim = el.animate(
      [
        { transform: 'scale(1)', opacity: 0.75 },
        { transform: 'scale(2.1)', opacity: 0, offset: 0.7 },
        { transform: 'scale(2.1)', opacity: 0 },
      ],
      { duration: 1800, iterations: Infinity, easing: 'ease-out', delay: reveals ? 200 : 500 },
    );
    return () => anim.cancel();
  }, [atDoor, settled, reveals]);

  // The zoom runs as keyframes rather than a CSS transition, eased in log space (zoomSteps).
  useLayoutEffect(() => {
    const door = parts.door.current;
    const peephole = parts.peephole.current;
    if (phase !== 'zooming' || reducedMotion || !door || !peephole) return;
    const opts = { duration: ZOOM_MS, easing: 'linear' } as const;
    const steps = zoomSteps();
    const anims = [
      door.animate(steps.map((z) => ({ transform: doorTransform(z) })), opts),
      peephole.animate(steps.map((z) => ({ transform: peepholeTransform(z) })), opts),
    ];
    return () => anims.forEach((a) => a.cancel());
  }, [phase, reducedMotion, parts.door, parts.peephole]);

  // The layer the opening moves first goes on a layer of its own as soon as a finger is down, a
  // moment before the tap, so the opening doesn't start by making that layer and painting it (a
  // hitch on slow phones). Not from the start: the cover's text on it would lose its smoothing.
  const prepareOpening = () => {
    const el = parts[OPENING.prepare].current;
    if (ENABLE_ANIMATIONS && phase === 'peek' && el && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.style.willChange = 'transform';
  };

  const fade = (ms: number, delay = 0) => (reducedMotion ? `opacity ${INTRO.REDUCED_FADE_MS}ms ease` : `opacity ${ms}ms ease ${delay}ms`);

  const doorStyle: CSSProperties = {
    transformOrigin: `${SMALL_C.x}px ${SMALL_C.y}px`,
    transform: zoomed && !reducedMotion ? doorTransform(DOOR_ZOOM) : 'none',
    opacity: zoomed ? 0 : 1,
    transition: fade(ZOOM_MS * 0.5, ZOOM_MS * 0.35),
  };
  const peepholeStyle: CSSProperties = {
    transformOrigin: `${LARGE_C.x}px ${LARGE_C.y}px`,
    transform: zoomed ? 'none' : peepholeTransform(1),
    // With reduced motion the small peephole fades out and the large one fades in instead.
    opacity: reducedMotion && atDoor ? 0 : 1,
    transition: fade(0),
  };
  const step2Style: CSSProperties = {
    opacity: zoomed ? 1 : 0,
    transition: fade(STEP2_FADE_MS, ZOOM_MS - 150),
  };

  return (
    <RevealProvider value={reveals}>
    <div
      ref={ref}
      role={atDoor ? 'button' : undefined}
      tabIndex={atDoor ? 0 : undefined}
      aria-label={atDoor ? 'Look through the peephole' : undefined}
      onKeyDown={(e) => {
        if (atDoor && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onPeek();
        }
      }}
      // The cover stays in the invitation's phone-width column, on the dark stage on wide
      // screens. Taps anywhere (stage included) are handled by the overlay.
      // The column is the purple door, on its hinges at the left for the door opening.
      className={`absolute inset-y-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 overflow-hidden outline-none ${atDoor ? 'cursor-pointer' : ''}`}
      style={{ backgroundColor: opening && OPENING.hole ? undefined : PURPLE, ...(opening && { transformOrigin: '0 50%', backfaceVisibility: 'hidden' }) }}
    >
      <div
        className="absolute left-1/2"
        style={{ top, width: COVER_W, height: COVER_H, transform: `translateX(-50%) scale(${scale})`, transformOrigin: '50% 0' }}
      >
        {/* The camera: the peephole opening pushes on through the ring. */}
        <div ref={parts.camera} className="absolute inset-0" style={{ transformOrigin: `${LARGE_C.x}px ${LARGE_C.y}px` }}>
        {opening && OPENING.hole && (
          // The purple, with a hole behind the photo to see the page through (the ring covers its
          // edge), reaching well past the frame for any column it is drawn in.
          <div
            aria-hidden="true"
            className="absolute"
            style={{ left: -1000, top: -1000, width: COVER_W + 2000, height: COVER_H + 2000, backgroundImage: `radial-gradient(circle at ${LARGE_C.x + 1000}px ${LARGE_C.y + 1000}px, transparent ${HOLE_R}px, ${PURPLE} ${HOLE_R + 0.5}px)` }}
          />
        )}
        {/* Step 1: the door */}
        <div ref={parts.door} className="absolute inset-0" style={doorStyle}>
          {/* Grows about the peephole, so the two stay lined up. */}
          <Reveal at={0} kind="grow" origin={[SMALL_C.x, SMALL_C.y]}>
            <img alt="" src={yellowFrame} className="absolute left-[49px] top-[108px] block h-[314px] w-[278px] max-w-none object-cover" />
          </Reveal>
        </div>
        <div className="absolute inset-0" style={{ opacity: atDoor ? 1 : 0, transition: fade(reducedMotion ? 0 : 200) }}>
          <h1
            ref={titleFit.ref}
            className="ff-friends -translate-x-1/2 -translate-y-1/2 absolute left-[188.5px] top-[523px] text-center text-[35px] leading-[42px] tracking-[-0.017em] whitespace-nowrap text-white"
            style={titleFit.style}
          >
            <RevealSpan at={0} kind="fadeUp" delay={350}>The one with</RevealSpan>
            <br />
            <RevealSpan at={0} kind="fadeUp" delay={470}>{inv.coupleNames}</RevealSpan>
            <br />
            <RevealSpan at={0} kind="fadeUp" delay={590}>Wedding</RevealSpan>
            {titleFit.probe}
          </h1>
        </div>
        <div
          ref={pulseRef}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full border-2 border-[#fbda43]"
          style={{ left: 179, top: 256, width: 19.03, height: 19.03, opacity: 0, visibility: atDoor ? 'visible' : 'hidden' }}
        />

        {/* The peephole: small on the door, then the whole view in step 2 */}
        <div ref={parts.peephole} className="pointer-events-none absolute inset-0" style={peepholeStyle}>
          <div ref={parts.photo} className="absolute left-[-29px] top-[22px] size-[434px]" style={{ clipPath: 'circle(229.583px at 216.5px 229.81px)' }}>
            <img alt={`${inv.coupleNames} peeking through the door`} src={inv.coverPhoto} className="absolute inset-0 block size-full max-w-none object-cover" />
          </div>
          <img alt="" src={peepholeRing} className="absolute block max-w-none" style={{ left: RING.x, top: RING.y, width: RING.size, height: RING.size }} />
        </div>

        {/* Step 2: the guest's name and the button */}
        <div ref={parts.text} className="absolute inset-0" style={step2Style} aria-hidden={atDoor}>
          <p
            ref={greetingFit.ref}
            className="ff-friends -translate-x-1/2 -translate-y-1/2 absolute left-[187px] top-[539px] text-[18px] leading-[42px] tracking-[-0.017em] whitespace-nowrap text-white"
            style={greetingFit.style}
          >
            {inv.greeting}
            {greetingFit.probe}
          </p>
          <p
            ref={guestFit.ref}
            className="ff-friends -translate-x-1/2 -translate-y-1/2 absolute left-[187px] top-[566px] text-[30px] leading-[42px] tracking-[-0.017em] whitespace-nowrap text-white"
            style={guestFit.style}
          >
            {guest}
            {guestFit.probe}
          </p>
          <button
            type="button"
            tabIndex={atDoor ? -1 : 0}
            disabled={phase !== 'peek'}
            onClick={onOpen}
            onPointerDown={prepareOpening}
            className="absolute left-[103.98px] top-[592.53px] h-[39px] w-[165.279px] cursor-pointer disabled:cursor-default"
          >
            <img alt="" src={buttonPill} className="absolute inset-0 block size-full max-w-none" />
            <img alt="" src={buttonRivets} className="absolute block max-w-none" style={{ left: 4.92, top: 15.81, width: 155.452, height: 7.266 }} />
            <span className="ff-f72-soft -translate-x-1/2 -translate-y-1/2 absolute left-[82.52px] top-[17.47px] text-[19px] leading-[42px] tracking-[-0.017em] whitespace-nowrap text-white">
              open invitation
            </span>
          </button>
        </div>
        </div>
      </div>
      {/* The door darkening as it turns from the light. */}
      {opening && <div ref={parts.shade} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black opacity-0" />}
    </div>
    </RevealProvider>
  );
}

/** A couple's invitation, or (with no props, at /template/friends) the demo. */
export default function FriendsTemplate({ invitation = friendsDemo, slug }: Partial<TemplateProps<FriendsInvitation>>) {
  const [phase, setPhase] = useState<Phase>('door');
  const [reducedMotion, setReducedMotion] = useState(false);
  // The cover opens with an opening (friendsOpening.ts); without animations, it simply fades.
  const animated = ENABLE_ANIMATIONS && !reducedMotion;
  const music = useBackgroundMusic(invitation.music);
  // Demo pages show their sample guest unless the link names one, so a demo can be tried with
  // any name too.
  const guest = useGuestName(invitation.demo?.sampleGuest ?? invitation.guestFallback);

  // The site sets `scroll-behavior: smooth` on <html>, so scrolls here are explicitly instant.
  useLayoutEffect(() => {
    const prev = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => {
      history.scrollRestoration = prev;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = phase === 'open' ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'zooming') {
      const t = setTimeout(() => setPhase('peek'), reducedMotion ? INTRO.REDUCED_FADE_MS : ZOOM_MS + STEP2_FADE_MS - 150);
      return () => clearTimeout(t);
    }
    if (phase === 'opening') {
      const t = setTimeout(() => setPhase('open'), animated ? OPENING.totalMs : INTRO.REDUCED_FADE_MS);
      return () => clearTimeout(t);
    }
  }, [phase, reducedMotion, animated]);

  const parts: CoverParts = { column: useRef(null), camera: useRef(null), door: useRef(null), peephole: useRef(null), photo: useRef(null), text: useRef(null), shade: useRef(null) };
  // The opening starts once its own layers (the shade, the purple with a hole) are there.
  useLayoutEffect(() => {
    if (phase !== 'opening' || !animated) return;
    const els = Object.fromEntries(Object.entries(parts).map(([k, r]) => [k, r.current]));
    if (Object.values(els).every(Boolean)) OPENING.play(els as unknown as OpeningParts);
    // Only on entering the phase: the refs are the same objects on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, animated]);
  // Where the camera moves to, in the page's frame px (see FriendsContent's intro).
  const [focus, setFocus] = useState<Focus>([187.5, 300]);

  const peek = () => {
    if (phase !== 'door') return;
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setPhase('zooming');
  };

  const open = () => {
    if (phase !== 'peek') return;
    music.start(); // inside the tap: the gesture is what lets the browser start audio
    window.scrollTo({ top: 0, behavior: 'instant' });
    // The page's frame is scaled to the column, at the top of the screen.
    const columnW = Math.min(window.innerWidth, MAX_COLUMN_W);
    const k = columnW / COVER_W;
    const ring = parts.peephole.current?.lastElementChild?.getBoundingClientRect();
    if (OPENING.focus === 'peephole' && ring) setFocus([(ring.left + ring.width / 2 - (window.innerWidth - columnW) / 2) / k, (ring.top + ring.height / 2) / k]);
    else setFocus([COVER_W / 2, window.innerHeight / 2 / k]);
    setPhase('opening');
  };

  const leaving = phase === 'opening';
  const coverT = `${INTRO.REDUCED_FADE_MS}ms ${INTRO.EASE_OUT}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: STAGE_BG }}>
      {invitation.demo && (
        <Link
          to="/"
          className="fixed top-4 left-4 z-[60] flex items-center gap-1.5 bg-white/80 hover:bg-white text-[#3D1F1F] backdrop-blur-sm text-[10px] tracking-widest uppercase font-semibold px-3 py-2 rounded-full shadow-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          nicemice
        </Link>
      )}

      {phase !== 'open' && (
        <div
          className={`fixed inset-0 z-50 ${leaving ? 'pointer-events-none' : ''} ${phase === 'door' ? 'cursor-pointer' : ''}`}
          onClick={peek}
          style={
            leaving && animated
              ? // The page shows wherever the cover has gone.
                { backgroundColor: 'transparent' }
              : { backgroundColor: STAGE_BG, opacity: leaving ? 0 : 1, transform: 'none', transition: `opacity ${coverT}, transform ${coverT}` }
          }
        >
          <FriendsCover invitation={invitation} guest={guest} phase={phase} reducedMotion={!animated} parts={parts} onPeek={peek} onOpen={open} />
        </div>
      )}

      <div className="relative max-w-[430px] mx-auto">
        <FriendsContent invitation={invitation} slug={slug} intro={{ revealed: phase === 'opening' || phase === 'open', reducedMotion: !animated, done: phase === 'open', focus }} />
      </div>

      {invitation.music && (phase === 'opening' || phase === 'open') && (
        <MusicToggle playing={music.playing} onToggle={music.toggle} background={PURPLE} iconColor="#fbda43" />
      )}
    </div>
  );
}
