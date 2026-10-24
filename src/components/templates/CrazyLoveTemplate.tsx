import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import paper from '../../assets/images/crazylove/paper.webp';
import scallopFrame from '../../assets/images/crazylove/scallop-frame.webp';
import coverFrame from '../../assets/images/crazylove/cover-frame.svg';
import coverMask from '../../assets/images/crazylove/cover-mask.svg';
import bouquet1 from '../../assets/images/crazylove/bouquet-1.webp';
import bouquet2 from '../../assets/images/crazylove/bouquet-2.webp';
import kids from '../../assets/images/crazylove/kids.webp';
import CrazyLoveContent, { CRAZY_FEEL, ENABLE_ANIMATIONS, INTRO } from './CrazyLoveContent';
import { OPENING, type OpeningParts } from './crazyloveOpening';
import { Handwritten } from './handwriting';
import { Reveal, RevealProvider, useCoverReveals } from './scrollReveal';
import { MusicToggle, useBackgroundMusic } from './templateMusic';
import { STAGE_BG } from './templateStage';
import { useFit, type FitBox } from './fitText';
import type { TemplateProps } from '../CouplePage';
import { crazyLoveDemo } from '../../invitations/demo/crazylove';
import { useGuestName } from '../../invitations/guestName';
import { greetingLanguage, type Language } from '../../invitations/language';
import type { CrazyLoveInvitation } from '../../invitations/types';

const CREAM = '#fff4e8';
const BROWN = '#70564b';
const COVER_W = 375;
const COVER_H = 667;
const MAX_COLUMN_W = 430;
// Width of the cover that must stay on screen: the scalloped card spans x 21–363, so a
// centred crop keeps it whole down to 351px. The bouquets may bleed off the sides.
const SAFE_W = 351;

const mask = `url("${coverMask}")`;

// The cover speaks the couple's greeting language: 'Dear' keeps the design's English button,
// 'Kepada' (or anything else) is Indonesian. "said “I do!”" is part of the design either way.
const OPEN_LABEL: Record<Language, string> = { en: 'Open the Invitation', id: 'Buka Undangan' };
// The couple's names on the polaroid, and the greeting and guest's name under it, shrink to
// stay inside their slots.
const NAMES_FIT: FitBox = { w: 200 };
// "said “I do!”" under the couple's names is written by hand once the polaroid has settled on the card.
const I_DO_WRITE_DELAY_MS = 950;
const LINE_FIT: FitBox = { w: 330 };

/** A line of the cover that shrinks (towards its centre) when it is longer than its slot. */
function FitLine({ fit, as: Tag = 'p', part, className, style, children }: { fit: FitBox; as?: 'p' | 'span'; part?: string; className: string; style?: CSSProperties; children: ReactNode }) {
  const f = useFit<HTMLElement>(fit);
  return (
    <Tag ref={f.ref as never} data-cover={part} className={className} style={{ ...style, ...f.style }}>
      {children}
      {f.probe}
    </Tag>
  );
}

/**
 * A layer centred in Figma's bounding box [x, y, w, h] and rotated about its centre; `part` names
 * it for the opening (see coverParts), `drift` how far it drifts off as the cover goes.
 */
function Rot({ box, w, h, deg, part, drift, children }: { box: [number, number, number, number]; w: number; h: number; deg: number; part?: string; drift?: [number, number]; children: ReactNode }) {
  const [x, y, bw, bh] = box;
  return (
    <div
      data-cover={part}
      data-drift={drift?.join(' ')}
      className="absolute"
      style={{ left: x + bw / 2 - w / 2, top: y + bh / 2 - h / 2, width: w, height: h, transform: `rotate(${deg}deg)` }}
    >
      {children}
    </div>
  );
}
const fill = 'absolute inset-0 block max-w-none size-full object-cover';

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
  // On phones taller than the frame and on the desktop stage, grow the frame towards the full
  // height by cropping the bouquets at the sides (never the card), then centre it vertically
  // on the lined paper, which fills the whole column.
  const scale = Math.max(fit, Math.min(viewport.h / COVER_H, columnW / SAFE_W));
  return { ref, scale, top: (viewport.h - COVER_H * scale) / 2 };
}

// Figma "Cover" frame (375 × 667) at its own coordinates, scaled to fit the column. On load
// it settles in: the card fades in, the polaroid drops onto it, the flowers and the kids pop
// in, then the guest's name and the button rise; the button works from the start. Its parts
// marked `data-cover` are what the opening animates (see coverParts); the polaroid's shadow on
// the page is only there once `opening`.
function CrazyLoveCover({ invitation: inv, guest, opening, onOpen }: { invitation: CrazyLoveInvitation; guest: string; opening: boolean; onOpen: () => void }) {
  const { ref, scale, top } = useCoverScale();
  const lang = greetingLanguage(inv.greeting);
  const { reveals } = useCoverReveals({ enabled: ENABLE_ANIMATIONS, frameW: COVER_W, frameH: COVER_H, rootRef: ref, settleMs: 1500, feel: CRAZY_FEEL });
  return (
    <RevealProvider value={reveals}>
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div data-cover="backdrop" className="absolute inset-0" style={{ backgroundColor: CREAM }}>
        <img alt="" src={paper} className={`${fill} opacity-50`} />
      </div>
      <div
        className="absolute left-1/2"
        style={{ top, width: COVER_W, height: COVER_H, transform: `translateX(-50%) scale(${scale})`, transformOrigin: '50% 0' }}
      >
        <Reveal at={0} kind="fade">
          <Rot box={[21.13, 107, 341.747, 407.257]} w={319.416} h={389.147} deg={-3.37} part="card">
            <img alt="" src={scallopFrame} className={fill} />
          </Rot>
        </Reveal>

        {opening && (
          <div data-cover="lift" className="absolute inset-0 opacity-0">
            <Rot box={[60, 152.63, 264.852, 315.413]} w={243.238} h={298.053} deg={4.29}>
              <div className="absolute inset-[6px] rounded-[10px] bg-[#3b2a22] blur-[10px]" />
            </Rot>
          </div>
        )}

        {/* The polaroid, with its group drop shadow */}
        <div data-cover="polaroid" className="absolute inset-0" style={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.25))' }}>
          <Reveal at={0} kind="settle" origin={[192.4, 310.3]} delay={150}>
            <Rot box={[60, 152.63, 264.852, 315.413]} w={243.238} h={298.053} deg={4.29}>
              <img alt="" src={coverFrame} className={fill} />
            </Rot>
            <Rot box={[75.6, 168.96, 238.129, 238.129]} w={222.135} h={222.135} deg={4.29}>
              <div
                className="absolute inset-0"
                style={{ maskImage: mask, WebkitMaskImage: mask, maskPosition: '2.45px 1.742px', WebkitMaskPosition: '2.45px 1.742px', maskSize: '216.109px 217.552px', WebkitMaskSize: '216.109px 217.552px', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' }}
              >
                <img alt={`Foto ${inv.coupleNames}`} src={inv.coverPhoto} className={`${fill} rounded-[8px]`} />
              </div>
            </Rot>
            <Rot box={[78, 395.53, 210.6, 66.875]} w={207.41} h={52.273} deg={4.07}>
              <h1 className="font-['Nanum_Pen_Script'] font-normal text-center text-[#e58f9b]">
                <FitLine as="span" fit={NAMES_FIT} className="mx-auto block w-max whitespace-nowrap text-[30px] leading-[26px]">
                  {inv.coupleNames}
                </FitLine>
                <span className="block text-[26px] leading-[26px]">
                  <Handwritten at={0} delay={I_DO_WRITE_DELAY_MS}>
                    said “I do!”
                  </Handwritten>
                </span>
              </h1>
            </Rot>
          </Reveal>
        </div>

        <Reveal at={0} kind="pop" origin={[0, 640]} tilt={-3} delay={400}>
          <Rot box={[-109, 341, 215.506, 275.268]} w={162.517} h={243.775} deg={13.66} part="sticker" drift={[-22, 14]}>
            <img alt="" src={bouquet1} className={fill} />
          </Rot>
        </Reveal>
        <Reveal at={0} kind="pop" origin={[375, 0]} tilt={3} delay={480}>
          <Rot box={[267, -69, 246.773, 220.301]} w={137.311} h={205.966} deg={-119.18} part="sticker" drift={[18, -16]}>
            <img alt="" src={bouquet1} className={fill} />
          </Rot>
        </Reveal>
        <Reveal at={0} kind="pop" origin={[5, 107]} tilt={3} delay={560}>
          <Rot box={[5, 107, 117.833, 141.64]} w={80.744} h={121.116} deg={-20.36} part="sticker" drift={[-14, -8]}>
            <img alt="" src={bouquet2} className={fill} />
          </Rot>
        </Reveal>

        <Reveal at={0} kind="fadeUp" delay={650}>
          <FitLine part="text" fit={LINE_FIT} className="-translate-x-1/2 absolute left-1/2 top-[519px] font-['Josefin_Slab'] text-[22px] leading-[30px] whitespace-nowrap" style={{ color: BROWN }}>
            {inv.greeting}
          </FitLine>
        </Reveal>
        <Reveal at={0} kind="fadeUp" delay={730}>
          <FitLine part="text" fit={LINE_FIT} className="-translate-x-1/2 absolute left-1/2 top-[549px] font-['Josefin_Sans'] text-[22px] leading-[30px] whitespace-nowrap" style={{ color: BROWN }}>
            {guest}
          </FitLine>
        </Reveal>
        <Reveal at={0} kind="fadeUp" delay={800}>
          <button
            type="button"
            data-cover="text"
            onClick={onOpen}
            className="absolute left-[98px] top-[584px] h-[32px] w-[179px] cursor-pointer rounded-[17px] bg-[#a9c6d8] transition-[filter] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#519ac8]"
          >
            <span className="-translate-x-1/2 absolute left-1/2 top-[3px] font-['Josefin_Sans'] text-[17px] leading-[30px] whitespace-nowrap" style={{ color: BROWN }}>
              {OPEN_LABEL[lang]}
            </span>
          </button>
        </Reveal>

        <Reveal at={0} kind="pop" origin={[98.2, 76.7]} tilt={-3} delay={600}>
          <Rot box={[53, 35, 90.316, 83.394]} w={89.929} h={82.974} deg={-0.27} part="sticker" drift={[-6, -14]}>
            <img alt="" src={kids} className={fill} />
          </Rot>
        </Reveal>
      </div>
    </div>
    </RevealProvider>
  );
}

type Phase = 'cover' | 'opening' | 'open';

/** The parts of the cover in `column` the opening animates, found by their `data-cover` names. */
function coverParts(column: HTMLElement): OpeningParts | null {
  const all = (name: string) => [...column.querySelectorAll<HTMLElement>(`[data-cover="${name}"]`)];
  const one = (name: string) => all(name)[0];
  const parts = {
    column,
    backdrop: one('backdrop'),
    card: one('card'),
    polaroid: one('polaroid'),
    lift: one('lift'),
    stickers: all('sticker'),
    text: all('text'),
    back: one('back'),
    shade: one('shade'),
    cast: column.parentElement?.querySelector<HTMLElement>('[data-cover="cast"]') ?? undefined,
  };
  const needed = OPENING.turns ? [parts.back, parts.shade, parts.cast] : [parts.lift];
  return [parts.backdrop, parts.card, parts.polaroid, ...needed].every(Boolean) ? (parts as OpeningParts) : null;
}

/** A couple's invitation, or (with no props, at /template/crazy-little-thing) the demo. */
export default function CrazyLoveTemplate({ invitation = crazyLoveDemo, slug }: Partial<TemplateProps<CrazyLoveInvitation>>) {
  const [phase, setPhase] = useState<Phase>('cover');
  const [reducedMotion, setReducedMotion] = useState(false);
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

  // The cover opens with an opening (crazyloveOpening.ts); without animations, it simply fades.
  const animated = ENABLE_ANIMATIONS && !reducedMotion;
  useEffect(() => {
    if (phase !== 'opening') return;
    const t = setTimeout(() => setPhase('open'), animated ? OPENING.totalMs : INTRO.REDUCED_FADE_MS);
    return () => clearTimeout(t);
  }, [phase, animated]);

  const columnRef = useRef<HTMLDivElement>(null);
  // The opening starts once its own layers (the polaroid's shadow, or the page's back and
  // shadows) are there.
  useLayoutEffect(() => {
    const parts = columnRef.current && coverParts(columnRef.current);
    if (phase === 'opening' && animated && parts) OPENING.play(parts);
  }, [phase, animated]);
  // The layer that moves first and most goes on a layer of its own as soon as a finger (or mouse
  // button) is down, a moment before the tap, so the opening doesn't start by making that layer
  // and painting it (a noticeable hitch on slow phones). Not from the start: on a layer the
  // cover's text would lose its sub-pixel smoothing.
  const prepareOpening = () => {
    const column = columnRef.current;
    if (!ENABLE_ANIMATIONS || phase !== 'cover' || !column || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = OPENING.prepare === 'column' ? column : column.querySelector<HTMLElement>('[data-cover="polaroid"]');
    if (el) el.style.willChange = 'transform';
  };

  const open = () => {
    if (phase !== 'cover') return;
    music.start(); // inside the tap: the gesture is what lets the browser start audio
    window.scrollTo({ top: 0, behavior: 'instant' });
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setPhase('opening');
  };

  const leaving = phase !== 'cover';
  const opening = leaving && animated;
  const turning = opening && OPENING.turns;
  const coverT = `${INTRO.REDUCED_FADE_MS}ms ${INTRO.EASE_OUT}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: STAGE_BG }}>
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

      {phase !== 'open' && (
        <div
          className={`fixed inset-0 z-50 ${leaving ? 'pointer-events-none' : ''}`}
          style={opening ? undefined : { opacity: leaving ? 0 : 1, transform: 'none', transition: `opacity ${coverT}, transform ${coverT}` }}
        >
          {/* The shadow the turning page casts on the collage beneath, deepest by its spine. */}
          {turning && (
            <div
              data-cover="cast"
              aria-hidden="true"
              className="absolute inset-0 mx-auto max-w-[430px] opacity-0"
              style={{ backgroundImage: 'linear-gradient(90deg, rgba(70,45,35,0.32), rgba(70,45,35,0.12) 55%, rgba(70,45,35,0))' }}
            />
          )}
          {/* The cover keeps to the invitation column; the stage shows around it on desktop.
              The cover layer itself is transparent so the cream content shows through as the
              cover goes, instead of flashing the dark stage. */}
          <div
            ref={columnRef}
            className="absolute inset-0 mx-auto max-w-[430px]"
            style={turning ? { transformOrigin: '0 50%', transformStyle: 'preserve-3d' } : undefined}
            onPointerDown={prepareOpening}
          >
            <div className="absolute inset-0" style={turning ? { backfaceVisibility: 'hidden' } : undefined}>
              <CrazyLoveCover invitation={invitation} guest={guest} opening={opening} onOpen={open} />
              {turning && <div data-cover="shade" aria-hidden="true" className="absolute inset-0 bg-[#3b2a22] opacity-0" />}
            </div>
            {/* The page's back, lined paper too, turned to face away until the page turns over. */}
            {turning && (
              <div data-cover="back" aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: CREAM, transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                <img alt="" src={paper} className={`${fill} opacity-50 -scale-x-100`} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative max-w-[430px] mx-auto">
        <CrazyLoveContent invitation={invitation} slug={slug} intro={{ revealed: phase !== 'cover', reducedMotion: !animated, done: phase === 'open' }} />
      </div>

      {invitation.music && phase !== 'cover' && (
        <MusicToggle playing={music.playing} onToggle={music.toggle} background="#e58f9b" iconColor="#fff4e8" />
      )}
    </div>
  );
}
