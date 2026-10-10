import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import coverBg from '../../assets/images/lalaland/figma/cover-bg.webp';
import LaLaLandContent, { ENABLE_ANIMATIONS, INTRO, NAVY_FADE } from './LaLaLandContent';
import { Reveal, RevealProvider, RevealSpan, useCoverReveals } from './scrollReveal';
import { weddingDateId } from './lalalandWeddingDate';
import { MusicToggle, useBackgroundMusic } from './templateMusic';
import { STAGE_BG, coverTextLayout, useStageVisible } from './templateStage';

// The couple's song. Swap this file (in public/) to give each couple their own music.
const MUSIC_SRC = `${import.meta.env.BASE_URL}lalaland-music.m4a`;

const NAVY = '#081a51';
const COVER_W = 375;
const COVER_H = 667;
const MAX_COLUMN_W = 430;
// Frame y of the painting point each cover text group stays over (see LaLaLandCover).
const TITLE_ANCHOR_Y = 260;
const GUEST_ANCHOR_Y = 506;
const textShadow = '0px 4px 4px rgba(0,0,0,0.25)';
// Figma Content frame fill (top → bottom).
const SKY_GRADIENT = 'linear-gradient(to bottom, #000433 0%, #181065 50%, #672dc1 100%)';

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
function LaLaLandCover({ onOpen }: { onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ w: COVER_W, h: COVER_H });
  const { reveals } = useCoverReveals({ enabled: ENABLE_ANIMATIONS, frameW: COVER_W, frameH: COVER_H, rootRef: ref, settleMs: 1500 });

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
        <Reveal at={0} kind="zoomOut" origin={[187.5, 300]}>
          <img
            src={coverBg}
            alt=""
            className="absolute max-w-none object-cover"
            style={{ left: -1, top: -1, width: 376, height: 668 }}
          />
        </Reveal>
        <div className="absolute left-0 top-[360px] h-[307px] w-[375px]" style={{ backgroundImage: NAVY_FADE }} />
      </div>
      <div
        className="absolute left-1/2"
        style={{ top: text.top, width: COVER_W, height: COVER_H, transform: `translateX(-50%) scale(${text.scale})`, transformOrigin: '50% 0' }}
      >
        <div className="absolute inset-0" style={shift(TITLE_ANCHOR_Y)}>
        <Reveal at={0} kind="fadeDown" delay={150}>
          <p className="-translate-x-1/2 absolute font-['Raleway'] leading-[normal] left-[calc(50%+1px)] text-[20px] text-center text-white top-[117px] whitespace-nowrap">
            Meet Me Under the Stars
          </p>
        </Reveal>
        <Reveal at={0} kind="fadeDown" delay={250}>
          <p className="-translate-x-1/2 absolute font-['Raleway'] leading-[normal] left-[calc(50%+1px)] text-[16px] text-center text-white top-[144px] whitespace-nowrap">
            {weddingDateId}
          </p>
        </Reveal>

        <h1 className="font-['Fasthand'] leading-[normal] text-center text-white">
          <RevealSpan at={0} kind="fadeUp" delay={400} className="-translate-x-1/2 absolute left-1/2 text-[80px] top-[163px] w-[331px]">Sebastian</RevealSpan>
          <RevealSpan at={0} kind="fadeUp" delay={480} className="-translate-x-1/2 absolute left-[calc(50%-12.5px)] text-[50px] top-[251px] w-[42px]">&amp;</RevealSpan>
          <RevealSpan at={0} kind="fadeUp" delay={560} className="-translate-x-1/2 absolute left-[calc(50%+0.5px)] text-[80px] top-[285px] w-[146px]">Mia</RevealSpan>
        </h1>
        </div>

        <div className="absolute inset-0" style={shift(GUEST_ANCHOR_Y)}>
        <Reveal at={0} kind="fadeUp" delay={700}>
          <p
            className="-translate-x-1/2 absolute font-['Raleway'] leading-[normal] left-[calc(50%-0.5px)] text-[17px] text-center text-white top-[457px] whitespace-nowrap"
            style={{ textShadow }}
          >
            Kepada
          </p>
        </Reveal>
        <Reveal at={0} kind="fadeUp" delay={770}>
          <p
            className="-translate-x-1/2 absolute font-['Raleway'] leading-[normal] left-[calc(50%+0.5px)] text-[25px] text-center text-white top-[481px] whitespace-nowrap"
            style={{ textShadow }}
          >
            Emma &amp; Ryan
          </p>
        </Reveal>

        <Reveal at={0} kind="fadeUp" delay={840}>
          <button
            type="button"
            onClick={onOpen}
            className="absolute left-[95px] top-[522px] h-[34px] w-[185px] rounded-[20px] bg-[#f9de1f] cursor-pointer"
          >
            <span className="-translate-x-1/2 absolute left-[93px] top-[7px] font-['Raleway'] leading-[normal] text-[17px] text-[#181065] text-center whitespace-nowrap">
              BUKA UNDANGAN
            </span>
          </button>
        </Reveal>
        </div>
      </div>
    </div>
    </RevealProvider>
  );
}

type Phase = 'cover' | 'opening' | 'open';

export default function LaLaLandTemplate() {
  const [phase, setPhase] = useState<Phase>('cover');
  const [reducedMotion, setReducedMotion] = useState(false);

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
    const t = setTimeout(() => setPhase('open'), reducedMotion ? INTRO.REDUCED_FADE_MS : INTRO.TOTAL_MS);
    return () => clearTimeout(t);
  }, [phase, reducedMotion]);

  const music = useBackgroundMusic(MUSIC_SRC);

  const open = () => {
    if (phase !== 'cover') return;
    // Must run inside the click: the gesture is what lets the browser start audio.
    music.start();
    // Reset before the cover starts fading, so the first content revealed is Quotes.
    window.scrollTo({ top: 0, behavior: 'instant' });
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setPhase('opening');
  };

  const coverFadeMs = reducedMotion ? INTRO.REDUCED_FADE_MS : INTRO.COVER_FADE_MS;

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: STAGE_BG }}>
      {/* The invitation column's navy, under the fixed sky, for anything the sky doesn't reach. */}
      <div aria-hidden="true" className="absolute inset-y-0 inset-x-0 mx-auto w-full max-w-[430px]" style={{ backgroundColor: NAVY }} />
      {/* Back to site link */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-[60] flex items-center gap-1.5 bg-white/80 hover:bg-white text-[#3D1F1F] backdrop-blur-sm text-[10px] tracking-widest uppercase font-semibold px-3 py-2 rounded-full shadow-sm transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        nicemice
      </Link>

      {/* ============ COVER ============ */}
      {phase !== 'open' && (
        <div
          className={`fixed inset-0 z-50 ${phase === 'opening' ? 'pointer-events-none' : ''}`}
          style={{
            backgroundColor: STAGE_BG,
            opacity: phase === 'cover' ? 1 : 0,
            transition: `opacity ${coverFadeMs}ms ${INTRO.EASE_OUT}`,
          }}
        >
          {/* The cover keeps to the invitation column; the stage shows around it on desktop. */}
          <div className="absolute inset-0 mx-auto max-w-[430px]" style={{ backgroundColor: NAVY }}>
            <LaLaLandCover onOpen={open} />
          </div>
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
        <LaLaLandContent intro={{ revealed: phase !== 'cover', reducedMotion }} />
      </div>

      {phase !== 'cover' && <MusicToggle playing={music.playing} onToggle={music.toggle} />}
    </div>
  );
}
