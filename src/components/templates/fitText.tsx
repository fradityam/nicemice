import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * The room a piece of a couple's text has in its Figma slot, in frame px: `w` for a line that
 * mustn't run wider, `h` for a paragraph that mustn't run taller. `origin` is the point the
 * text shrinks towards (its centre unless given), so it stays anchored where Figma puts it.
 */
export type FitBox = { w?: number; h?: number; origin?: string };

/**
 * Shrinks an element, as a whole, when its text is bigger than `box`. Text that fits renders
 * exactly as if this weren't there. Returns the element's ref and the style to add to it, and
 * a probe to render inside it: a hidden 100px span that tells what a frame px measures inside
 * the scaled frame, so the element can be compared with `box` in frame px.
 */
export function useFit<T extends HTMLElement>(box: FitBox | undefined) {
  const ref = useRef<T>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);
  const w = box?.w;
  const h = box?.h;

  useLayoutEffect(() => {
    const el = ref.current;
    const probe = probeRef.current;
    if (!el || !probe || (w === undefined && h === undefined)) return;
    // Called again whenever the element's size changes, e.g. once its font has loaded. The
    // scale doesn't change the element's layout size, so this settles straight away.
    const measure = () => {
      const px = probe.offsetWidth / 100;
      if (!px) return;
      const fit = Math.min(1, w ? (w * px) / el.offsetWidth : 1, h ? (h * px) / el.offsetHeight : 1);
      setScale(fit);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);

  const probe = box ? <span ref={probeRef} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 h-0 w-[100px]" /> : null;
  const style: CSSProperties | undefined = box && scale < 1 ? { scale: String(scale), transformOrigin: box.origin } : undefined;
  return { ref, probe, style };
}
