import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import coverBg from '../../assets/images/notebook/cover-bg.webp';
import coverArrow from '../../assets/images/notebook/arrow.svg';
import NotebookContent, { INTRO } from './NotebookContent';
import { weddingDateCover } from './notebookWeddingDate';
import { MusicToggle, useBackgroundMusic } from './templateMusic';

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

// Figma "Cover" frame (375 × 667) at its own coordinates, scaled to the column width (or to
// the viewport height when that's tighter). Tapping anywhere opens the invitation; the
// hand-drawn arrow is the visual cue and nudges gently to invite the tap.
function NotebookCover({ onOpen }: { onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const el = arrowRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const anim = el.animate(
      [
        { transform: 'translateX(0) scale(1)' },
        { transform: 'translateX(5px) scale(1.06)', offset: 0.35 },
        { transform: 'translateX(0) scale(1)', offset: 0.7 },
        { transform: 'translateX(0) scale(1)' },
      ],
      { duration: 1800, iterations: Infinity, easing: 'ease-in-out', delay: 600 },
    );
    return () => anim.cancel();
  }, []);

  const scale = Math.min(Math.min(viewport.w, MAX_COLUMN_W) / COVER_W, viewport.h / COVER_H);
  const columnW = COVER_W * scale;

  return (
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
      {/* The painting fills the column's full height: phones taller than the 375 × 667 frame
          would otherwise show a blank band under it. The text keeps its Figma positions. */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 overflow-hidden" style={{ width: columnW }}>
        <img src={coverBg} alt="" className="absolute inset-0 size-full max-w-none object-cover object-top" />
        <div className="absolute inset-0" style={{ backgroundImage: coverGradient }} />
      </div>
      <div
        className="absolute left-1/2 top-0"
        style={{ width: COVER_W, height: COVER_H, transform: `translateX(-50%) scale(${scale})`, transformOrigin: '50% 0' }}
      >

        <div className="text-white" style={{ textShadow: coverTextShadow }}>
          <p className="-translate-y-1/2 absolute left-[28.14px] top-[67.16px] font-['Raleway'] text-[15px] leading-[normal] tracking-[-0.255px] whitespace-nowrap">
            Dear
          </p>
          <p className="-translate-y-1/2 absolute left-[28.14px] top-[91.16px] font-['Raleway'] font-bold text-[20px] leading-[normal] tracking-[-0.34px] underline decoration-solid [text-underline-position:from-font] whitespace-nowrap">
            Pevita Pearce
          </p>
          <p className="-translate-y-1/2 absolute left-[28px] top-[119.5px] font-['Raleway'] text-[15px] leading-[normal] tracking-[-0.255px] whitespace-nowrap">
            You’re invited to the wedding of
          </p>
          <h1 className="font-['Yeseva_One'] font-normal text-[70px] leading-[normal] tracking-[-1.19px]">
            <span className="-translate-y-1/2 absolute left-[30.94px] top-[266.2px] whitespace-nowrap">Noah</span>
            <span className="-translate-y-1/2 absolute left-[30.94px] top-[342.98px] whitespace-nowrap">&amp;</span>
            <span className="-translate-y-1/2 absolute left-[30.94px] top-[419.75px] whitespace-nowrap">Allie</span>
          </h1>
          <p className="-translate-y-1/2 absolute left-[28.14px] top-[479.92px] font-['Raleway'] font-bold text-[15px] leading-[normal] tracking-[-0.255px] whitespace-nowrap">
            {weddingDateCover}
          </p>
        </div>

      </div>

      {/* The arrow keeps its Figma distance from the bottom-right corner, so on screens taller
          than the frame it stays at the bottom instead of floating mid-painting. */}
      <div
        className="absolute bottom-0 left-1/2"
        style={{ width: COVER_W, height: COVER_H, transform: `translateX(-50%) scale(${scale})`, transformOrigin: '50% 100%' }}
      >
        <div className="absolute flex h-[53.858px] items-center justify-center left-[275px] top-[595px] w-[78.65px]">
          <div ref={arrowRef}>
            <div className="flex-none rotate-[-11.78deg]">
              <img alt="" src={coverArrow} className="block h-[40px] w-[72px] max-w-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
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
    <div className="min-h-screen" style={{ backgroundColor: PAGE_BG }}>
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
          style={{ backgroundColor: PAGE_BG, opacity: phase === 'cover' ? 1 : 0, transition: `opacity ${coverFadeMs}ms ${INTRO.EASE_OUT}` }}
        >
          <NotebookCover onOpen={open} />
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
