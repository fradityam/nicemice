import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import yellowFrame from '../../assets/images/friends/yellow-frame.webp';
import peepholeRing from '../../assets/images/friends/peephole-ring.webp';
import peepholeView from '../../assets/images/friends/peephole-view.webp';
import buttonPill from '../../assets/images/friends/button-pill.svg';
import buttonRivets from '../../assets/images/friends/button-rivets.svg';
import FriendsContent, { ENABLE_ANIMATIONS, INTRO } from './FriendsContent';
import { Reveal, RevealProvider, RevealSpan, useCoverReveals } from './scrollReveal';
import { MusicToggle, useBackgroundMusic } from './templateMusic';
import './friends.css';
import { STAGE_BG } from './templateStage';

// The couple's song, served from public/. Swap the file to give each couple their own
// music; set to null to hide the player.
const MUSIC_SRC: string | null = `${import.meta.env.BASE_URL}friends-music.mp3`;

const PURPLE = '#a07eb9';
const COVER_W = 375;
const COVER_H = 667;
const MAX_COLUMN_W = 430;
// Width of the cover that must stay on screen: the door frame and title span x 49–327.
const SAFE_W = 301;

// The peephole as it appears in the second Figma cover (551 × 551 ring at -88, -39, with the
// photo clipped to a circle inside it). The first cover's tiny peephole is the same artwork at
// 19.03px, centred on (188.5, 265.5), so step 1 shows this group scaled down and the zoom
// simply scales it (and the door around it) back up.
const RING = { x: -88, y: -39, size: 551 };
const LARGE_C = { x: RING.x + RING.size / 2, y: RING.y + RING.size / 2 };
const SMALL_C = { x: 179 + 19.03 / 2, y: 256 + 19.03 / 2 };
const SMALL_K = 19.03 / RING.size;
const DOOR_ZOOM = 1 / SMALL_K;

const ZOOM_MS = 700;
const STEP2_FADE_MS = 350;

// At zoom z (1 → DOOR_ZOOM) the door is scaled about the small peephole while the peephole
// travels to its step-2 centre; the peephole group gets the same move, so the two stay locked.
const zoomShift = (z: number) => (z - 1) / (DOOR_ZOOM - 1);
const doorTransform = (z: number) =>
  `translate(${zoomShift(z) * (LARGE_C.x - SMALL_C.x)}px, ${zoomShift(z) * (LARGE_C.y - SMALL_C.y)}px) scale(${z})`;
const peepholeTransform = (z: number) =>
  `translate(${(1 - zoomShift(z)) * (SMALL_C.x - LARGE_C.x)}px, ${(1 - zoomShift(z)) * (SMALL_C.y - LARGE_C.y)}px) scale(${z * SMALL_K})`;

type Phase = 'door' | 'zooming' | 'peek' | 'opening' | 'open';

function useCoverScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ w: COVER_W, h: COVER_H });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setViewport({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const columnW = Math.min(viewport.w, MAX_COLUMN_W);
  const fit = Math.min(columnW / COVER_W, viewport.h / COVER_H);
  // On phones taller than the frame, grow it to the full height (like the Notebook cover's
  // painting) by cropping the empty purple at the sides, at most down to SAFE_W, so the
  // peephole ring still bleeds off the top as in Figma. Otherwise fit, centred.
  const scale = Math.max(fit, Math.min(viewport.h / COVER_H, columnW / SAFE_W));
  return { ref, scale, top: (viewport.h - COVER_H * scale) / 2 };
}

// Figma "Cover" frames (375 × 667) at their own coordinates, scaled to fit the screen.
// Step 1, the door: tapping anywhere zooms into the peephole. Step 2, the view through it:
// "open invitation" opens the invitation. On load the door settles in: the yellow frame
// fades in and grows a touch into place, the title rises line by line, then the peephole
// starts to pulse. A tap works from the first moment.
function FriendsCover({ phase, reducedMotion, onPeek, onOpen }: { phase: Phase; reducedMotion: boolean; onPeek: () => void; onOpen: () => void }) {
  const { ref, scale, top } = useCoverScale();
  const { reveals, settled } = useCoverReveals({ enabled: ENABLE_ANIMATIONS, frameW: COVER_W, frameH: COVER_H, rootRef: ref, settleMs: 1300 });
  const pulseRef = useRef<HTMLDivElement>(null);
  const atDoor = phase === 'door';
  const zoomed = !atDoor;

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

  // The zoom runs as keyframes rather than a CSS transition: interpolating scale linearly from
  // 1 to 29 looks finished a third of the way in, so the zoom factor is eased in log space.
  const doorRef = useRef<HTMLDivElement>(null);
  const peepholeRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const door = doorRef.current;
    const peephole = peepholeRef.current;
    if (phase !== 'zooming' || reducedMotion || !door || !peephole) return;
    const steps = Array.from({ length: 25 }, (_, i) => {
      const e = 0.5 - 0.5 * Math.cos((Math.PI * i) / 24);
      return { z: DOOR_ZOOM ** e };
    });
    const opts = { duration: ZOOM_MS, easing: 'linear' } as const;
    const anims = [
      door.animate(steps.map(({ z }) => ({ transform: doorTransform(z) })), opts),
      peephole.animate(steps.map(({ z }) => ({ transform: peepholeTransform(z) })), opts),
    ];
    return () => anims.forEach((a) => a.cancel());
  }, [phase, reducedMotion]);

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
      className={`absolute inset-y-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 overflow-hidden outline-none ${atDoor ? 'cursor-pointer' : ''}`}
      style={{ backgroundColor: PURPLE }}
    >
      <div
        className="absolute left-1/2"
        style={{ top, width: COVER_W, height: COVER_H, transform: `translateX(-50%) scale(${scale})`, transformOrigin: '50% 0' }}
      >
        {/* Step 1: the door */}
        <div ref={doorRef} className="absolute inset-0" style={doorStyle}>
          {/* Grows about the peephole, so the two stay lined up. */}
          <Reveal at={0} kind="grow" origin={[SMALL_C.x, SMALL_C.y]}>
            <img alt="" src={yellowFrame} className="absolute left-[49px] top-[108px] block h-[314px] w-[278px] max-w-none object-cover" />
          </Reveal>
        </div>
        <div className="absolute inset-0" style={{ opacity: atDoor ? 1 : 0, transition: fade(reducedMotion ? 0 : 200) }}>
          <h1 className="ff-friends -translate-x-1/2 -translate-y-1/2 absolute left-[188.5px] top-[523px] text-center text-[35px] leading-[42px] tracking-[-0.017em] whitespace-nowrap text-white">
            <RevealSpan at={0} kind="fadeUp" delay={350}>The one with</RevealSpan>
            <br />
            <RevealSpan at={0} kind="fadeUp" delay={470}>Ratu &amp; Radit</RevealSpan>
            <br />
            <RevealSpan at={0} kind="fadeUp" delay={590}>Wedding</RevealSpan>
          </h1>
        </div>
        <div
          ref={pulseRef}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full border-2 border-[#fbda43]"
          style={{ left: 179, top: 256, width: 19.03, height: 19.03, opacity: 0, visibility: atDoor ? 'visible' : 'hidden' }}
        />

        {/* The peephole: small on the door, then the whole view in step 2 */}
        <div ref={peepholeRef} className="pointer-events-none absolute inset-0" style={peepholeStyle}>
          <div className="absolute left-[-29px] top-[22px] size-[434px]" style={{ clipPath: 'circle(229.583px at 216.5px 229.81px)' }}>
            <img alt="Ratu & Radit peeking through the door" src={peepholeView} className="absolute inset-0 block size-full max-w-none object-cover" />
          </div>
          <img alt="" src={peepholeRing} className="absolute block max-w-none" style={{ left: RING.x, top: RING.y, width: RING.size, height: RING.size }} />
        </div>

        {/* Step 2: the guest's name and the button */}
        <div className="absolute inset-0" style={step2Style} aria-hidden={atDoor}>
          <p className="ff-friends -translate-x-1/2 -translate-y-1/2 absolute left-[187px] top-[539px] text-[18px] leading-[42px] tracking-[-0.017em] whitespace-nowrap text-white">
            Dear
          </p>
          <p className="ff-friends -translate-x-1/2 -translate-y-1/2 absolute left-[187px] top-[566px] text-[30px] leading-[42px] tracking-[-0.017em] whitespace-nowrap text-white">
            Phoebe &amp; Mike
          </p>
          <button
            type="button"
            tabIndex={atDoor ? -1 : 0}
            disabled={phase !== 'peek'}
            onClick={onOpen}
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
    </RevealProvider>
  );
}

export default function FriendsTemplate() {
  const [phase, setPhase] = useState<Phase>('door');
  const [reducedMotion, setReducedMotion] = useState(false);
  const music = useBackgroundMusic(MUSIC_SRC);

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
      const t = setTimeout(() => setPhase('open'), reducedMotion ? INTRO.REDUCED_FADE_MS : INTRO.TOTAL_MS);
      return () => clearTimeout(t);
    }
  }, [phase, reducedMotion]);

  const peek = () => {
    if (phase !== 'door') return;
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setPhase('zooming');
  };

  const open = () => {
    if (phase !== 'peek') return;
    music.start(); // inside the tap: the gesture is what lets the browser start audio
    window.scrollTo({ top: 0, behavior: 'instant' });
    setPhase('opening');
  };

  const leaving = phase === 'opening';
  const coverFadeMs = reducedMotion ? INTRO.REDUCED_FADE_MS : INTRO.COVER_FADE_MS;
  const coverT = `${coverFadeMs}ms ${INTRO.EASE_OUT}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: STAGE_BG }}>
      <Link
        to="/"
        className="fixed top-4 left-4 z-[60] flex items-center gap-1.5 bg-white/80 hover:bg-white text-[#3D1F1F] backdrop-blur-sm text-[10px] tracking-widest uppercase font-semibold px-3 py-2 rounded-full shadow-sm transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        nicemice
      </Link>

      {phase !== 'open' && (
        <div
          className={`fixed inset-0 z-50 ${leaving ? 'pointer-events-none' : ''} ${phase === 'door' ? 'cursor-pointer' : ''}`}
          onClick={peek}
          style={{
            backgroundColor: STAGE_BG,
            opacity: leaving ? 0 : 1,
            transform: leaving && !reducedMotion ? `translateY(-${INTRO.COVER_RISE_PX}px)` : 'none',
            transition: `opacity ${coverT}, transform ${coverT}`,
          }}
        >
          <FriendsCover phase={phase} reducedMotion={reducedMotion} onPeek={peek} onOpen={open} />
        </div>
      )}

      <div className="relative max-w-[430px] mx-auto">
        <FriendsContent intro={{ revealed: phase === 'opening' || phase === 'open', reducedMotion }} />
      </div>

      {MUSIC_SRC && (phase === 'opening' || phase === 'open') && (
        <MusicToggle playing={music.playing} onToggle={music.toggle} background={PURPLE} iconColor="#fbda43" />
      )}
    </div>
  );
}
