import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import coverBg from '../../assets/images/notebook/cover-bg.webp';
import coverArrow from '../../assets/images/notebook/arrow.svg';
import NotebookContent, { ENABLE_ANIMATIONS, INTRO } from './NotebookContent';
import { Reveal, RevealProvider, RevealSpan, useCoverReveals, useReveal } from './scrollReveal';
import { weddingDateCover } from './notebookWeddingDate';
import { MusicToggle, useBackgroundMusic } from './templateMusic';
import { STAGE_BG, coverTextLayout, useStageVisible } from './templateStage';

// The couple's song, served from public/. Swap the file to give each couple their own
// music; set to null to hide the player.
const MUSIC_SRC: string | null = `${import.meta.env.BASE_URL}notebook-music.mp3`;

const PAGE_BG = '#fefffa';
const COVER_W = 375;
const COVER_H = 667;
const MAX_COLUMN_W = 430;
const coverTextShadow = '2px 4px 4px rgba(0,0,0,0.25)';

// Figma's right-to-left rgba(113,120,76,0) → rgba(115,116,95,0.5) overlay, interpolated
// non-premultiplied like Figma (a plain CSS gradient would drop the olive tint mid-way).
const coverGradient = `linear-gradient(to left, ${Array.from({ length: 11 }, (_, i) => {
  const t = i / 10;
  const c = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgba(${c(113, 115)},${c(120, 116)},${c(76, 95)},${(0.5 * t).toFixed(3)}) ${t * 100}%`;
}).join(', ')})`;

/** The cover painting, easing back from a tiny zoom as the cover settles in. */
function CoverPainting() {
  const reveal = useReveal(0, 'zoomOut');
  return (
    <img
      src={coverBg}
      alt=""
      className="absolute inset-0 size-full max-w-none object-cover object-[50%_45%]"
      style={reveal?.style}
      onTransitionEnd={reveal?.onTransitionEnd}
    />
  );
}

// Figma "Cover" frame (375 × 667) at its own coordinates, scaled to the column width (or to
// the viewport height when that's tighter). Tapping anywhere opens the invitation; the
// hand-drawn arrow is the visual cue and nudges gently to invite the tap. On load it settles
// in: the greeting fades in, the names rise line by line, then the date and the arrow, which
// starts nudging once everything is in place. A tap works from the first moment.
function NotebookCover({ onOpen }: { onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ w: COVER_W, h: COVER_H });
  const { reveals, settled } = useCoverReveals({ enabled: ENABLE_ANIMATIONS, frameW: COVER_W, frameH: COVER_H, rootRef: ref, settleMs: 1400 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setViewport({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = arrowRef.current;
    if (!el || !settled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const anim = el.animate(
      [
        { transform: 'translateX(0) scale(1)' },
        { transform: 'translateX(5px) scale(1.06)', offset: 0.35 },
        { transform: 'translateX(0) scale(1)', offset: 0.7 },
        { transform: 'translateX(0) scale(1)' },
      ],
      { duration: 1800, iterations: Infinity, easing: 'ease-in-out', delay: reveals ? 200 : 600 },
    );
    return () => anim.cancel();
  }, [settled, reveals]);

  const stageVisible = useStageVisible(MAX_COLUMN_W);
  const columnW = Math.min(viewport.w, MAX_COLUMN_W);
  const { scale, top } = coverTextLayout(columnW, viewport.h, COVER_W, COVER_H, stageVisible);

  return (
    <RevealProvider value={reveals}>
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label="Buka undangan"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="absolute inset-0 cursor-pointer overflow-hidden outline-none"
    >
      {/* The painting fills the whole column: phones taller than the 375 × 667 frame would
          otherwise show a blank band under it, and short desktop screens bands at the sides.
          Cropping keeps the house and the lake (about 45% down the painting) in view. The
          text keeps its Figma positions. */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 overflow-hidden" style={{ width: columnW }}>
        <CoverPainting />
        <div className="absolute inset-0" style={{ backgroundImage: coverGradient }} />
      </div>
      <div
        className="absolute left-1/2"
        style={{ top, width: COVER_W, height: COVER_H, transform: `translateX(-50%) scale(${scale})`, transformOrigin: '50% 0' }}
      >

        <div className="text-white" style={{ textShadow: coverTextShadow }}>
          <Reveal at={0} kind="fade">
            <p className="-translate-y-1/2 absolute left-[28.14px] top-[67.16px] font-['Raleway'] text-[15px] leading-[normal] tracking-[-0.255px] whitespace-nowrap">
              Dear
            </p>
          </Reveal>
          <Reveal at={0} kind="fade" delay={100}>
            <p className="-translate-y-1/2 absolute left-[28.14px] top-[91.16px] font-['Raleway'] font-bold text-[20px] leading-[normal] tracking-[-0.34px] underline decoration-solid [text-underline-position:from-font] whitespace-nowrap">
              Pevita Pearce
            </p>
          </Reveal>
          <Reveal at={0} kind="fade" delay={200}>
            <p className="-translate-y-1/2 absolute left-[28px] top-[119.5px] font-['Raleway'] text-[15px] leading-[normal] tracking-[-0.255px] whitespace-nowrap">
              You’re invited to the wedding of
            </p>
          </Reveal>
          <h1 className="font-['Yeseva_One'] font-normal text-[70px] leading-[normal] tracking-[-1.19px]">
            <RevealSpan at={0} kind="fadeUp" delay={350} className="-translate-y-1/2 absolute left-[30.94px] top-[266.2px] whitespace-nowrap">Noah</RevealSpan>
            <RevealSpan at={0} kind="fadeUp" delay={450} className="-translate-y-1/2 absolute left-[30.94px] top-[342.98px] whitespace-nowrap">&amp;</RevealSpan>
            <RevealSpan at={0} kind="fadeUp" delay={550} className="-translate-y-1/2 absolute left-[30.94px] top-[419.75px] whitespace-nowrap">Allie</RevealSpan>
          </h1>
          <Reveal at={0} kind="fadeUp" delay={700}>
            <p className="-translate-y-1/2 absolute left-[28.14px] top-[479.92px] font-['Raleway'] font-bold text-[15px] leading-[normal] tracking-[-0.255px] whitespace-nowrap">
              {weddingDateCover}
            </p>
          </Reveal>
        </div>

      </div>

      {/* The arrow keeps its Figma distance from the bottom-right corner, so on screens taller
          than the frame it stays at the bottom instead of floating mid-painting. */}
      <div
        className="absolute bottom-0 left-1/2"
        style={{ width: COVER_W, height: COVER_H, transform: `translateX(-50%) scale(${scale})`, transformOrigin: '50% 100%' }}
      >
        <Reveal at={0} kind="pop" origin={[314.3, 621.9]} delay={850}>
          <div className="absolute flex h-[53.858px] items-center justify-center left-[275px] top-[595px] w-[78.65px]">
            <div ref={arrowRef}>
              <div className="flex-none rotate-[-11.78deg]">
                <img alt="" src={coverArrow} className="block h-[40px] w-[72px] max-w-none" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
    </RevealProvider>
  );
}

type Phase = 'cover' | 'opening' | 'open';

export default function NotebookTemplate() {
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

  const coverFadeMs = reducedMotion ? INTRO.REDUCED_FADE_MS : INTRO.COVER_FADE_MS;

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
          className={`fixed inset-0 z-50 ${phase === 'opening' ? 'pointer-events-none' : ''}`}
          style={{ backgroundColor: STAGE_BG, opacity: phase === 'cover' ? 1 : 0, transition: `opacity ${coverFadeMs}ms ${INTRO.EASE_OUT}` }}
        >
          {/* The cover keeps to the invitation column; the stage shows around it on desktop. */}
          <div className="absolute inset-0 mx-auto max-w-[430px]" style={{ backgroundColor: PAGE_BG }}>
            <NotebookCover onOpen={open} />
          </div>
        </div>
      )}

      <div className="relative max-w-[430px] mx-auto">
        <NotebookContent intro={{ revealed: phase !== 'cover', reducedMotion }} />
      </div>

      {MUSIC_SRC && phase !== 'cover' && (
        <MusicToggle playing={music.playing} onToggle={music.toggle} background="#324532" iconColor="#fefffa" />
      )}
    </div>
  );
}
