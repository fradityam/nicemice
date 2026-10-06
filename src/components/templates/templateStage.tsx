import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Background of every template page outside the invitation's phone-width column, so on
 * desktop each invitation reads as a phone screen centred on a dark stage. On phones the
 * column fills the screen and this colour isn't seen. Change it here for all templates.
 */
export const STAGE_BG = '#111111';

/**
 * True when the screen is wider than the invitation column, i.e. the dark stage shows around
 * it (desktop, tablets, phones in landscape). Covers use it to fill a tall column instead of
 * keeping their phone layout, which stays exactly as designed.
 */
export function useStageVisible(columnW: number) {
  const [visible, setVisible] = useState(() => typeof window !== 'undefined' && window.innerWidth > columnW);
  useEffect(() => {
    const update = () => setVisible(window.innerWidth > columnW);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [columnW]);
  return visible;
}

/**
 * Where a cover's text layer (a fixed-size design frame) goes in its column: as large as fits
 * without cutting anything off, centred horizontally. Phones keep it pinned to the top as
 * designed; on the stage it is centred vertically so a tall column stays balanced.
 */
export function coverTextLayout(columnW: number, columnH: number, frameW: number, frameH: number, stageVisible: boolean) {
  const scale = Math.min(columnW / frameW, columnH / frameH);
  return { scale, top: stageVisible ? (columnH - frameH * scale) / 2 : 0 };
}

/**
 * Wraps a cover's centred content (card, guest name, button) and shrinks it, as one block,
 * only when it is taller than the space its parent gives it, so a short screen never cuts
 * anything off. When the content fits it renders exactly as if unwrapped: no transform, no
 * fixed height. `reserve` keeps that much room free at the top and at the bottom (for a
 * label positioned at the top of the cover, say).
 */
export function FitToHeight({ className, wrapperClassName = '', reserve = 0, children }: { className: string; wrapperClassName?: string; reserve?: number; children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    const parent = outer?.parentElement;
    if (!outer || !inner || !parent) return;
    const measure = () => {
      const cs = getComputedStyle(parent);
      const space = parent.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 2 * reserve;
      // offsetHeight ignores the transform, so this is the content's natural height.
      const natural = inner.offsetHeight;
      const scale = natural > space && space > 0 ? space / natural : 1;
      setFit((f) => (f.scale === scale && f.height === natural ? f : { scale, height: natural }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [reserve]);

  const shrunk = fit.scale < 1;
  return (
    <div ref={outerRef} className={`w-full shrink-0 ${wrapperClassName}`} style={shrunk ? { height: fit.height * fit.scale } : undefined}>
      <div ref={innerRef} className={className} style={shrunk ? { transform: `scale(${fit.scale})`, transformOrigin: '50% 0' } : undefined}>
        {children}
      </div>
    </div>
  );
}
