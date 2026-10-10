import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Full-screen gallery for a template's photo section, shared by the templates. It opens on
// one photo; guests go to the next / previous one by swiping on phones, with the arrow
// buttons, or with the keyboard's arrow keys, looping from the last back to the first. The
// photos are stacked in one fixed box and crossfade (with a short slide in the swipe's
// direction), so nothing around them moves. Close with the X, Escape, or a tap outside the
// photo. Each template passes its own colours, counter font and labels.

export type LightboxPhoto = { src: string; alt: string };

export type LightboxTheme = {
  /** Arrow buttons: background and chevron colours. */
  arrowBg: string;
  arrowFg: string;
  /** Classes for the "1 / 3" counter (font, size, colour). */
  counterClass: string;
  labels: { dialog: string; close: string; prev: string; next: string };
};

const SWIPE_MIN_PX = 40;
const SLIDE_PX = 28;
const FADE_MS = 350;
const TAP_MAX_PX = 10;

export function PhotoLightbox({ photos, start, theme, onClose }: { photos: LightboxPhoto[]; start: number; theme: LightboxTheme; onClose: () => void }) {
  const count = photos.length;
  const [index, setIndex] = useState(start);
  // +1 when moving forward, -1 back: the new photo slides in from that side.
  const [direction, setDirection] = useState(1);
  const [dragX, setDragX] = useState(0);
  // The pointer that is down: where it started, and whether that was outside the photo.
  const drag = useRef<{ x: number; y: number; id: number; outside: boolean } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const go = (step: number) => {
    if (count < 2) return;
    setDirection(step);
    setIndex((i) => (((i + step) % count) + count) % count);
  };
  // The keyboard handler is set up once; these always reach the latest render's functions.
  const goRef = useRef(go);
  goRef.current = go;
  const closeFnRef = useRef(onClose);
  closeFnRef.current = onClose;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFnRef.current();
      else if (e.key === 'ArrowRight') goRef.current(1);
      else if (e.key === 'ArrowLeft') goRef.current(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  // Decode every photo up front, so the next one is ready before it is shown.
  useEffect(() => {
    for (const p of photos) {
      const img = new Image();
      img.src = p.src;
      img.decode().catch(() => {});
    }
  }, [photos]);

  // Outside the photo = anywhere in the dialog that isn't the photo or a button.
  const isOutside = (target: EventTarget) => !(target as HTMLElement).closest('img, button');

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, outside: isOutside(e.target) };
  };
  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || count < 2) return;
    const dx = e.clientX - d.x;
    // Follow the finger (damped) once the move is clearly sideways.
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - d.y)) setDragX(dx * 0.4);
  };
  const endDrag = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragX(0);
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (count > 1 && Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    // A tap outside the photo closes. Decided here rather than on `click`, which browsers
    // don't always send after a touch gesture (and which a swipe ending outside would send).
    else if (Math.hypot(dx, dy) < TAP_MAX_PX && d.outside && isOutside(e.target)) onClose();
  };

  const ms = reducedMotion ? 150 : FADE_MS;
  const arrow = 'absolute top-1/2 -translate-y-1/2 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={theme.labels.dialog}
      className="fixed inset-0 z-[70] bg-black/85 select-none"
      style={{ touchAction: 'pinch-zoom' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={() => {
        drag.current = null;
        setDragX(0);
      }}
    >
      {/* The photo box: the same size whatever the photo, each photo centred in it. */}
      <div className="absolute inset-x-4 top-[calc(3.5rem+env(safe-area-inset-top))] bottom-[calc(3.5rem+env(safe-area-inset-bottom))]">
        {photos.map((p, i) => {
          const active = i === index;
          const offset = active ? dragX : (i === (index - direction + count) % count ? -direction : direction) * SLIDE_PX;
          return (
            <img
              key={p.src}
              alt={active ? p.alt : ''}
              aria-hidden={!active}
              src={p.src}
              draggable={false}
              className="absolute inset-0 m-auto block max-h-full max-w-full rounded-lg object-contain"
              style={{
                opacity: active ? 1 : 0,
                transform: reducedMotion ? undefined : `translateX(${offset}px)`,
                transition: dragX && active ? 'none' : `opacity ${ms}ms ease, transform ${ms}ms cubic-bezier(0.33, 1, 0.68, 1)`,
                pointerEvents: active ? 'auto' : 'none',
              }}
            />
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label={theme.labels.prev}
            onClick={() => go(-1)}
            className={`${arrow} left-3`}
            style={{ backgroundColor: theme.arrowBg, color: theme.arrowFg }}
          >
            <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label={theme.labels.next}
            onClick={() => go(1)}
            className={`${arrow} right-3`}
            style={{ backgroundColor: theme.arrowBg, color: theme.arrowFg }}
          >
            <ChevronRight aria-hidden="true" className="size-5" strokeWidth={2.5} />
          </button>
          <p
            aria-live="polite"
            className={`-translate-x-1/2 absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 whitespace-nowrap ${theme.counterClass}`}
          >
            {index + 1} / {count}
          </p>
        </>
      )}

      <button
        ref={closeRef}
        type="button"
        aria-label={theme.labels.close}
        onClick={onClose}
        className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white"
      >
        ×
      </button>
    </div>
  );
}
