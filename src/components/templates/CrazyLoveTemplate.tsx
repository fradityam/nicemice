import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import paper from '../../assets/images/crazylove/paper.webp';
import scallopFrame from '../../assets/images/crazylove/scallop-frame.webp';
import coverPhoto from '../../assets/images/crazylove/cover-photo.webp';
import coverFrame from '../../assets/images/crazylove/cover-frame.svg';
import coverMask from '../../assets/images/crazylove/cover-mask.svg';
import bouquet1 from '../../assets/images/crazylove/bouquet-1.webp';
import bouquet2 from '../../assets/images/crazylove/bouquet-2.webp';
import kids from '../../assets/images/crazylove/kids.webp';
import CrazyLoveContent, { ENABLE_ANIMATIONS, INTRO } from './CrazyLoveContent';
import { Reveal, RevealProvider, useCoverReveals } from './scrollReveal';
import { MusicToggle, useBackgroundMusic } from './templateMusic';
import { STAGE_BG } from './templateStage';

// The couple's song, served from public/. Swap the file to give each couple their own
// music; set to null to hide the player.
const MUSIC_SRC: string | null = `${import.meta.env.BASE_URL}crazy-love-music.mp3`;

const CREAM = '#fff4e8';
const BROWN = '#70564b';
const COVER_W = 375;
const COVER_H = 667;
const MAX_COLUMN_W = 430;
// Width of the cover that must stay on screen: the scalloped card spans x 21–363, so a
// centred crop keeps it whole down to 351px. The bouquets may bleed off the sides.
const SAFE_W = 351;

const mask = `url("${coverMask}")`;

/** A layer centred in Figma's bounding box [x, y, w, h] and rotated about its centre. */
function Rot({ box, w, h, deg, children }: { box: [number, number, number, number]; w: number; h: number; deg: number; children: ReactNode }) {
  const [x, y, bw, bh] = box;
  return (
    <div className="absolute" style={{ left: x + bw / 2 - w / 2, top: y + bh / 2 - h / 2, width: w, height: h, transform: `rotate(${deg}deg)` }}>
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
// in, then the guest's name and the button rise; the button works from the start.
function CrazyLoveCover({ onOpen }: { onOpen: () => void }) {
  const { ref, scale, top } = useCoverScale();
  const { reveals } = useCoverReveals({ enabled: ENABLE_ANIMATIONS, frameW: COVER_W, frameH: COVER_H, rootRef: ref, settleMs: 1500 });
  return (
    <RevealProvider value={reveals}>
    <div ref={ref} className="absolute inset-0 overflow-hidden" style={{ backgroundColor: CREAM }}>
      <img alt="" src={paper} className={`${fill} opacity-50`} />
      <div
        className="absolute left-1/2"
        style={{ top, width: COVER_W, height: COVER_H, transform: `translateX(-50%) scale(${scale})`, transformOrigin: '50% 0' }}
      >
        <Reveal at={0} kind="fade">
          <Rot box={[21.13, 107, 341.747, 407.257]} w={319.416} h={389.147} deg={-3.37}>
            <img alt="" src={scallopFrame} className={fill} />
          </Rot>
        </Reveal>

        {/* The polaroid, with its group drop shadow */}
        <div className="absolute inset-0" style={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.25))' }}>
          <Reveal at={0} kind="settle" origin={[192.4, 310.3]} delay={150}>
            <Rot box={[60, 152.63, 264.852, 315.413]} w={243.238} h={298.053} deg={4.29}>
              <img alt="" src={coverFrame} className={fill} />
            </Rot>
            <Rot box={[75.6, 168.96, 238.129, 238.129]} w={222.135} h={222.135} deg={4.29}>
              <div
                className="absolute inset-0"
                style={{ maskImage: mask, WebkitMaskImage: mask, maskPosition: '2.45px 1.742px', WebkitMaskPosition: '2.45px 1.742px', maskSize: '216.109px 217.552px', WebkitMaskSize: '216.109px 217.552px', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' }}
              >
                <img alt="Ratu & Radit membaca buku di tempat tidur" src={coverPhoto} className={`${fill} rounded-[8px]`} />
              </div>
            </Rot>
            <Rot box={[78, 395.53, 210.6, 66.875]} w={207.41} h={52.273} deg={4.07}>
              <h1 className="font-['Nanum_Pen_Script'] font-normal text-center text-[#e58f9b]">
                <span className="block text-[30px] leading-[26px]">Ratu &amp; Radit</span>
                <span className="block text-[26px] leading-[26px]">said “I do!”</span>
              </h1>
            </Rot>
          </Reveal>
        </div>

        <Reveal at={0} kind="pop" origin={[0, 640]} delay={400}>
          <Rot box={[-109, 341, 215.506, 275.268]} w={162.517} h={243.775} deg={13.66}>
            <img alt="" src={bouquet1} className={fill} />
          </Rot>
        </Reveal>
        <Reveal at={0} kind="pop" origin={[375, 0]} delay={480}>
          <Rot box={[267, -69, 246.773, 220.301]} w={137.311} h={205.966} deg={-119.18}>
            <img alt="" src={bouquet1} className={fill} />
          </Rot>
        </Reveal>
        <Reveal at={0} kind="pop" origin={[5, 107]} delay={560}>
          <Rot box={[5, 107, 117.833, 141.64]} w={80.744} h={121.116} deg={-20.36}>
            <img alt="" src={bouquet2} className={fill} />
          </Rot>
        </Reveal>

        <Reveal at={0} kind="fadeUp" delay={650}>
          <p className="-translate-x-1/2 absolute left-1/2 top-[519px] font-['Josefin_Slab'] text-[22px] leading-[30px] whitespace-nowrap" style={{ color: BROWN }}>
            Dear
          </p>
        </Reveal>
        <Reveal at={0} kind="fadeUp" delay={730}>
          <p className="-translate-x-1/2 absolute left-1/2 top-[549px] font-['Josefin_Sans'] text-[22px] leading-[30px] whitespace-nowrap" style={{ color: BROWN }}>
            Chon &amp; Nam
          </p>
        </Reveal>
        <Reveal at={0} kind="fadeUp" delay={800}>
          <button
            type="button"
            onClick={onOpen}
            className="absolute left-[98px] top-[584px] h-[32px] w-[179px] cursor-pointer rounded-[17px] bg-[#a9c6d8] transition-[filter] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#519ac8]"
          >
            <span className="-translate-x-1/2 absolute left-1/2 top-[3px] font-['Josefin_Sans'] text-[17px] leading-[30px] whitespace-nowrap" style={{ color: BROWN }}>
              Open the Invitation
            </span>
          </button>
        </Reveal>

        <Reveal at={0} kind="pop" origin={[98.2, 76.7]} delay={600}>
          <Rot box={[53, 35, 90.316, 83.394]} w={89.929} h={82.974} deg={-0.27}>
            <img alt="" src={kids} className={fill} />
          </Rot>
        </Reveal>
      </div>
    </div>
    </RevealProvider>
  );
}

type Phase = 'cover' | 'opening' | 'open';

export default function CrazyLoveTemplate() {
  const [phase, setPhase] = useState<Phase>('cover');
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
    if (phase !== 'opening') return;
    const t = setTimeout(() => setPhase('open'), reducedMotion ? INTRO.REDUCED_FADE_MS : INTRO.TOTAL_MS);
    return () => clearTimeout(t);
  }, [phase, reducedMotion]);

  const open = () => {
    if (phase !== 'cover') return;
    music.start(); // inside the tap: the gesture is what lets the browser start audio
    window.scrollTo({ top: 0, behavior: 'instant' });
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setPhase('opening');
  };

  const leaving = phase !== 'cover';
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
          className={`fixed inset-0 z-50 ${leaving ? 'pointer-events-none' : ''}`}
          style={{
            opacity: leaving ? 0 : 1,
            transform: leaving && !reducedMotion ? `translateY(-${INTRO.COVER_RISE_PX}px)` : 'none',
            transition: `opacity ${coverT}, transform ${coverT}`,
          }}
        >
          {/* The cover keeps to the invitation column; the stage shows around it on desktop.
              The cover layer itself is transparent so the cream content shows through as it
              dissolves, instead of flashing the dark stage. */}
          <div className="absolute inset-0 mx-auto max-w-[430px]">
            <CrazyLoveCover onOpen={open} />
          </div>
        </div>
      )}

      <div className="relative max-w-[430px] mx-auto">
        <CrazyLoveContent intro={{ revealed: phase !== 'cover', reducedMotion }} />
      </div>

      {MUSIC_SRC && phase !== 'cover' && (
        <MusicToggle playing={music.playing} onToggle={music.toggle} background="#e58f9b" iconColor="#fff4e8" />
      )}
    </div>
  );
}
