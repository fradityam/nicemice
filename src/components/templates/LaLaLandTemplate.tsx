import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import coverBg from '../../assets/images/lalaland/figma/cover-bg.webp';
import LaLaLandContent, { ENABLE_ANIMATIONS, FitSpan, NAVY_FADE, dateId } from './LaLaLandContent';
import { useLight } from './lalalandLights';
import { LAMP, OPENING, REDUCED_FADE_MS } from './lalalandOpening';
import { Reveal, RevealProvider, RevealSpan, useCoverReveals } from './scrollReveal';
import { MusicToggle, useBackgroundMusic } from './templateMusic';
import { STAGE_BG, coverTextLayout, useStageVisible } from './templateStage';
import { useFit, type FitBox } from './fitText';
import type { TemplateProps } from '../CouplePage';
import { lalalandDemo } from '../../invitations/demo/lalaland';
import { useGuestName } from '../../invitations/guestName';
import type { LaLaLandInvitation } from '../../invitations/types';

const NAVY = '#081a51';
const COVER_W = 375;
const COVER_H = 667;
const MAX_COLUMN_W = 430;
// Frame y of the painting point each cover text group stays over (see LaLaLandCover).
const TITLE_ANCHOR_Y = 245;
const GUEST_ANCHOR_Y = 548;
const textShadow = '0px 4px 4px rgba(0,0,0,0.25)';
// The couple's names and the guest's shrink to stay inside the frame.
const NAME_FIT: FitBox = { w: 331 };
const GUEST_FIT: FitBox = { w: 300 };
// Figma Content frame fill (top → bottom).
const SKY_GRADIENT = 'linear-gradient(to bottom, #000433 0%, #181065 50%, #672dc1 100%)';

// The lamp's light (lalalandLights.ts), a warm glow this many frame px across over its glass.
const GLOW_D = 120;
const GLOW = 'radial-gradient(circle, rgba(255,222,150,0.6) 0%, rgba(255,196,120,0.3) 30%, rgba(255,180,110,0.1) 52%, rgba(255,180,110,0) 70%)';
// The glow opening's light, from the lamp: still strong at every corner of the frame (at most
// about 470 frame px away) and fading out within its own box, so that box never shows.
const LIGHT_R = 720;
const LIGHT = 'radial-gradient(circle closest-side, rgba(255,240,210,1) 0%, rgba(255,226,180,0.9) 18%, rgba(255,214,165,0.7) 45%, rgba(255,205,160,0.5) 66%, rgba(255,205,160,0) 100%)';
// A few of the painted stars that glint now and then (frame x, y; how often; how far behind the
// page's clock), none of them under the text.
const GLINTS = [
  { x: 72.9, y: 96.9, ms: 7400, delay: -1200 },
  { x: 303.1, y: 190.4, ms: 9100, delay: -5200 },
  { x: 192, y: 45.8, ms: 8300, delay: -3100 },
  { x: 352.6, y: 133.7, ms: 10200, delay: -7600 },
  { x: 231.2, y: 267.1, ms: 8800, delay: -400 },
];
const GLINT_D = 22;
// A small four-point sparkle: a bright core with fine rays.
const GLINT =
  'radial-gradient(circle, rgba(255,248,224,0.95) 0 1.2px, rgba(255,232,176,0.4) 3px, rgba(255,232,176,0) 7px), ' +
  'linear-gradient(90deg, rgba(255,240,205,0), rgba(255,240,205,0.75) 50%, rgba(255,240,205,0)) center / 100% 1px no-repeat, ' +
  'linear-gradient(rgba(255,240,205,0), rgba(255,240,205,0.75) 50%, rgba(255,240,205,0)) center / 1px 100% no-repeat';

// How long the lamp's light takes over one breath.
const GLOW_MS = 6400;

/** One painted star glinting now and then, while `active`. */
function Glint({ x, y, ms, delay, active }: (typeof GLINTS)[number] & { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useLight(ref, 'twinkle', { ms, delay, active });
  return <div ref={ref} className="ll-twinkle absolute" style={{ left: x - GLINT_D / 2, top: y - GLINT_D / 2, width: GLINT_D, height: GLINT_D, background: GLINT, mixBlendMode: 'screen' }} />;
}

/** The cover's layers the opening animates (see lalalandOpening.ts). */
type CoverParts = { painting: RefObject<HTMLDivElement | null>; glow: RefObject<HTMLDivElement | null>; text: RefObject<HTMLDivElement | null>; light: RefObject<HTMLDivElement | null> };

// Figma "Cover" frame (375 × 667), laid out at its native coordinates in two layers.
// The painting fills the whole column, pinned to the top: on short screens it is cropped at
// the bottom (the moon and lamp stay in view); on screens taller than the frame (tall phones,
// the desktop stage) it grows to the full height instead, cropping the left side only, so the
// moon and the lamp on the right stay in view.
// The text and button are scaled as large as fits without being cut off. On a tall phone the
// painting is then scaled up more than the text, so each text group moves down with the part
// of the painting it sits on (the title on the sky, the guest and button on the hills).
// On load it settles in: the painting eases back a touch, the title line drifts down, the
// names rise one by one, then the guest's name and the button; the button works from the start.
// Once it has settled the lamp's light starts breathing and a few stars glint now and then
// (lalalandLights.ts), until the guest opens it. `parts` are the layers the opening animates.
function LaLaLandCover({ invitation: inv, guest, parts, onOpen }: { invitation: LaLaLandInvitation; guest: string; parts: CoverParts; onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const greetingFit = useFit<HTMLParagraphElement>(GUEST_FIT);
  const guestFit = useFit<HTMLParagraphElement>(GUEST_FIT);
  const [viewport, setViewport] = useState({ w: COVER_W, h: COVER_H });
  const { reveals, settled } = useCoverReveals({ enabled: ENABLE_ANIMATIONS, frameW: COVER_W, frameH: COVER_H, rootRef: ref, settleMs: 1500 });
  // Without the reveals (animations off, or reduced motion) the night stays as painted.
  const live = settled && !!reveals;
  useLight(parts.glow, 'glow', { ms: GLOW_MS, active: live });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setViewport({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stageVisible = useStageVisible(MAX_COLUMN_W);
  const columnW = Math.min(viewport.w, MAX_COLUMN_W);
  const bgScale = Math.max(columnW / COVER_W, viewport.h / COVER_H);
  const bgShift = (COVER_W * bgScale - columnW) / 2;
  const text = coverTextLayout(columnW, viewport.h, COVER_W, COVER_H, stageVisible);
  // On tall phones the text layer is pinned to the top at its own (smaller) scale; moving a
  // group by this much per frame px of its anchor keeps it over the same spot of the painting.
  // Only when the painting is scaled to the height: on short screens the text is already
  // shrunk to fit and must stay where it is. (On the stage it is centred, as before.)
  const tallPhone = !stageVisible && viewport.h / COVER_H > columnW / COVER_W;
  const follow = tallPhone ? (bgScale - text.scale) / text.scale : 0;
  const shift = (anchorY: number) => (follow ? { transform: `translateY(${follow * anchorY}px)` } : undefined);

  return (
    <RevealProvider value={reveals}>
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-0 overflow-hidden bg-[#081a51]"
        style={{
          width: COVER_W,
          height: COVER_H,
          // Centred, then shifted left by half the overflow so the right edge meets the column's.
          transform: `translateX(-50%) ${bgShift ? `translateX(${-bgShift}px) ` : ''}scale(${bgScale})`,
          transformOrigin: '50% 0',
        }}
      >
        {/* Pushed in on the lamp as the cover opens. */}
        <div ref={parts.painting} className="absolute inset-0" style={{ transformOrigin: `${LAMP[0]}px ${LAMP[1]}px` }}>
          <Reveal at={0} kind="zoomOut" origin={[187.5, 300]}>
            <img
              src={coverBg}
              alt=""
              className="absolute max-w-none object-cover"
              style={{ left: -1, top: -1, width: 376, height: 668 }}
            />
          </Reveal>
          <div className="absolute left-0 top-[360px] h-[307px] w-[375px]" style={{ backgroundImage: NAVY_FADE }} />
          {GLINTS.map((g) => (
            <Glint key={g.x} {...g} active={live} />
          ))}
          <div
            ref={parts.glow}
            className="ll-glow absolute"
            style={{ left: LAMP[0] - GLOW_D / 2, top: LAMP[1] - GLOW_D / 2, width: GLOW_D, height: GLOW_D, backgroundImage: GLOW, mixBlendMode: 'screen' }}
          />
          {/* The warm light the glow opening fills the screen with, spreading from the lamp. */}
          <div
            ref={parts.light}
            className="pointer-events-none absolute opacity-0"
            style={{ left: LAMP[0] - LIGHT_R, top: LAMP[1] - LIGHT_R, width: 2 * LIGHT_R, height: 2 * LIGHT_R, backgroundImage: LIGHT, mixBlendMode: 'screen' }}
          />
        </div>
      </div>
      <div
        className="absolute left-1/2"
        style={{ top: text.top, width: COVER_W, height: COVER_H, transform: `translateX(-50%) scale(${text.scale})`, transformOrigin: '50% 0' }}
      >
        <div ref={parts.text} className="absolute inset-0">
        <div className="absolute inset-0" style={shift(TITLE_ANCHOR_Y)}>
        <Reveal at={0} kind="fadeDown" delay={150}>
          <p className="-translate-x-1/2 absolute font-['Raleway'] leading-[normal] left-[calc(50%+1px)] text-[20px] text-center text-white top-[112px] whitespace-nowrap">
            Meet Me Under the Stars
          </p>
        </Reveal>
        <Reveal at={0} kind="fadeDown" delay={250}>
          <p className="-translate-x-1/2 absolute font-['Raleway'] leading-[normal] left-[calc(50%+1px)] text-[16px] text-center text-white top-[139px] whitespace-nowrap">
            {dateId(inv.date)}
          </p>
        </Reveal>

        <h1 className="font-['Fasthand'] leading-[normal] text-center text-white">
          <RevealSpan at={0} kind="fadeUp" delay={400} className="-translate-x-1/2 absolute left-1/2 text-[80px] top-[147px] w-[331px]"><FitSpan fit={NAME_FIT}>{inv.coverNames[0]}</FitSpan></RevealSpan>
          <RevealSpan at={0} kind="fadeUp" delay={480} className="-translate-x-1/2 absolute left-[calc(50%-12.5px)] text-[50px] top-[235px] w-[42px]">&amp;</RevealSpan>
          {/* Centred where Figma centres "Mia" (in a 146px box), with room for a longer name. */}
          <RevealSpan at={0} kind="fadeUp" delay={560} className="-translate-x-1/2 absolute left-[calc(50%+0.5px)] text-[80px] top-[269px] w-[331px]"><FitSpan fit={NAME_FIT}>{inv.coverNames[1]}</FitSpan></RevealSpan>
        </h1>
        </div>

        <div className="absolute inset-0" style={shift(GUEST_ANCHOR_Y)}>
        <Reveal at={0} kind="fadeUp" delay={700}>
          <p
            ref={greetingFit.ref}
            className="-translate-x-1/2 absolute font-['Raleway'] leading-[normal] left-[calc(50%-0.5px)] text-[17px] text-center text-white top-[499px] whitespace-nowrap"
            style={{ textShadow, ...greetingFit.style }}
          >
            {inv.greeting}
            {greetingFit.probe}
          </p>
        </Reveal>
        <Reveal at={0} kind="fadeUp" delay={770}>
          <p
            ref={guestFit.ref}
            className="-translate-x-1/2 absolute font-['Raleway'] leading-[normal] left-[calc(50%+0.5px)] text-[25px] text-center text-white top-[523px] whitespace-nowrap"
            style={{ textShadow, ...guestFit.style }}
          >
            {guest}
            {guestFit.probe}
          </p>
        </Reveal>

        <Reveal at={0} kind="fadeUp" delay={840}>
          <button
            type="button"
            onClick={onOpen}
            className="absolute left-[95px] top-[564px] h-[34px] w-[185px] rounded-[20px] bg-[#f9de1f] cursor-pointer"
          >
            <span className="-translate-x-1/2 absolute left-[93px] top-[7px] font-['Raleway'] leading-[normal] text-[17px] text-[#181065] text-center whitespace-nowrap">
              BUKA UNDANGAN
            </span>
          </button>
        </Reveal>
        </div>
        </div>
      </div>
    </div>
    </RevealProvider>
  );
}

type Phase = 'cover' | 'opening' | 'open';

/** A couple's invitation, or (with no props, at /template/lalaland) the demo. */
export default function LaLaLandTemplate({ invitation = lalalandDemo, slug }: Partial<TemplateProps<LaLaLandInvitation>>) {
  const [phase, setPhase] = useState<Phase>('cover');
  const [reducedMotion, setReducedMotion] = useState(false);
  // Demo pages show their sample guest unless the link names one, so a demo can be tried with
  // any name too.
  const guest = useGuestName(invitation.demo?.sampleGuest ?? invitation.guestFallback);

  // The site sets `scroll-behavior: smooth` on <html>, so every scroll here must be
  // explicitly instant — otherwise the reset animates visibly from wherever the browser
  // restored the page (e.g. Cerita Kami) up to the top.
  useLayoutEffect(() => {
    const prev = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => {
      history.scrollRestoration = prev;
    };
  }, []);

  // Scrolling stays locked through the transition and unlocks once it has finished.
  useEffect(() => {
    document.body.style.overflow = phase === 'open' ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'opening') return;
    const t = setTimeout(() => setPhase('open'), reducedMotion ? REDUCED_FADE_MS : OPENING.totalMs);
    return () => clearTimeout(t);
  }, [phase, reducedMotion]);

  const music = useBackgroundMusic(invitation.music);

  const columnRef = useRef<HTMLDivElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);
  const parts: CoverParts = { painting: useRef(null), glow: useRef(null), text: useRef(null), light: useRef(null) };
  // The painting goes on a layer of its own as soon as a finger (or mouse button) is down, a
  // moment before the tap, so the push-in doesn't start by making that layer and painting it (a
  // noticeable hitch on slow phones). Not from the start: the cover's text drawn over it would
  // lose its sub-pixel smoothing.
  const preparePush = () => {
    if (ENABLE_ANIMATIONS && phase === 'cover' && parts.painting.current) parts.painting.current.style.willChange = 'transform';
  };

  const open = () => {
    if (phase !== 'cover') return;
    // Must run inside the click: the gesture is what lets the browser start audio.
    music.start();
    // Reset before the cover starts going, so the first content revealed is Quotes.
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Without animations the cover simply fades.
    const fade = !ENABLE_ANIMATIONS || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [column, painting, glow, text, light, iris] = [columnRef.current, parts.painting.current, parts.glow.current, parts.text.current, parts.light.current, irisRef.current];
    if (!fade && column && painting && glow && text && light && iris) OPENING.play({ column, painting, glow, text, light, iris });
    setReducedMotion(fade);
    setPhase('opening');
  };

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: STAGE_BG }}>
      {/* The invitation column's navy, under the fixed sky, for anything the sky doesn't reach. */}
      <div aria-hidden="true" className="absolute inset-y-0 inset-x-0 mx-auto w-full max-w-[430px]" style={{ backgroundColor: NAVY }} />
      {/* Back to site link (demo only) */}
      {invitation.demo && (
        <Link
          to="/"
          className="fixed top-4 left-4 z-[60] flex items-center gap-1.5 bg-white/80 hover:bg-white text-[#3D1F1F] backdrop-blur-sm text-[10px] tracking-widest uppercase font-semibold px-3 py-2 rounded-full shadow-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          nicemice
        </Link>
      )}

      {/* ============ COVER ============ */}
      {phase !== 'open' && (
        <div
          className={`fixed inset-0 z-50 ${phase === 'opening' ? 'pointer-events-none' : ''}`}
          style={{
            // Once opening, the page shows wherever the cover has gone.
            backgroundColor: phase === 'cover' ? STAGE_BG : 'transparent',
            opacity: phase !== 'cover' && reducedMotion ? 0 : 1,
            transition: `opacity ${REDUCED_FADE_MS}ms ease-out`,
          }}
        >
          {/* The cover keeps to the invitation column; the stage shows around it on desktop. */}
          <div ref={columnRef} className="absolute inset-0 mx-auto max-w-[430px]" style={{ backgroundColor: NAVY }} onPointerDown={preparePush}>
            <LaLaLandCover invitation={invitation} guest={guest} parts={parts} onOpen={open} />
          </div>
          {/* The iris opening's dark, over the cover and then the page (see lalalandOpening.ts). */}
          <div ref={irisRef} aria-hidden="true" className="pointer-events-none absolute inset-0 mx-auto max-w-[430px]" />
        </div>
      )}

      {/* ============ FULL INVITATION ============ */}
      {/* The Content frame's fill, fixed to the screen as in the Figma prototype: every
          screen runs navy → violet while the stars and sections scroll over it. A fixed
          element (not background-attachment: fixed, which iOS Safari ignores), limited to
          the invitation column and sized to the large viewport so it doesn't stretch as the
          mobile toolbar collapses. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 mx-auto h-lvh w-full max-w-[430px]"
        style={{ backgroundImage: SKY_GRADIENT }}
      />
      <div className="relative max-w-[430px] mx-auto">
        <LaLaLandContent invitation={invitation} slug={slug} intro={{ revealed: phase !== 'cover', reducedMotion }} />
      </div>

      {invitation.music && phase !== 'cover' && <MusicToggle playing={music.playing} onToggle={music.toggle} />}
    </div>
  );
}
