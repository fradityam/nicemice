import { useEffect, type RefObject } from 'react';
import './sceneLights.css';

// Lights that twinkle or glow in a template's scenes: La La Land's stars and street lamp, Friends'
// Tiffany lamps and fountain. Each sets a custom property that its opacity reads (sceneLights.css),
// about a dozen times a second from one timer for the whole page: the page repaints just those few
// small boxes, nothing goes onto a layer of its own (where text drawn nearby would lose its
// sub-pixel smoothing), and in between the page does no work at all. (A CSS animation, even in
// steps, has the page recalculate its styles every frame while it runs: on a slow phone several
// times the cost.)

/** How bright a light is over one round of it: [share of the round, brightness], from 0 to 1. */
type Curve = [number, number][];

const CURVES = {
  // A star flaring up twice and settling back to how it is painted.
  twinkle: [[0, 0], [0.2, 0], [0.36, 0.85], [0.45, 0.4], [0.56, 0.7], [0.74, 0], [1, 0]],
  // A warm light, never quite still.
  glow: [[0, 0.55], [0.24, 0.85], [0.38, 0.72], [0.62, 1], [0.84, 0.68], [1, 0.55]],
} satisfies Record<string, Curve>;
type Kind = keyof typeof CURVES;
const PROPS: Record<Kind, string> = { twinkle: '--light-twinkle', glow: '--light-glow' };

const TICK_MS = 80;
// The lamp comes on softly when it starts.
const FADE_IN_MS = 1200;

type Light = { el: HTMLElement; kind: Kind; ms: number; delay: number; since: number; value?: number };
const lights = new Set<Light>();
let timer: ReturnType<typeof setInterval> | undefined;

/** The curve at share `p` of its round, easing in and out between its points. */
function sample(curve: Curve, p: number) {
  const i = curve.findIndex(([at]) => at >= p);
  if (i <= 0) return curve[0][1];
  const [[a, va], [b, vb]] = [curve[i - 1], curve[i]];
  const t = (p - a) / (b - a);
  return va + (vb - va) * (0.5 - Math.cos(Math.PI * t) / 2);
}

// One clock for the whole page: a light is wherever its round has got to since the page loaded
// (less its delay), so lights coming back on screen carry on as if they had never stopped.
function tick() {
  const now = performance.now();
  for (const light of lights) {
    const p = ((((now - light.delay) % light.ms) + light.ms) % light.ms) / light.ms;
    let v = sample(CURVES[light.kind], p);
    if (light.kind === 'glow') v *= sample([[0, 0], [1, 1]], Math.min(1, (now - light.since) / FADE_IN_MS));
    v = Math.round(v * 50) / 50;
    if (v === light.value) continue;
    light.value = v;
    light.el.style.setProperty(PROPS[light.kind], String(v));
  }
}

/**
 * Makes the element in `ref` twinkle (or glow) while `active`, one round every `ms`, `delay` ms
 * behind the page's clock. Not for guests who prefer reduced motion: the scene stays as painted.
 */
export function useLight(ref: RefObject<HTMLElement | null>, kind: Kind, { ms, delay = 0, active }: { ms: number; delay?: number; active: boolean }) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const light: Light = { el, kind, ms, delay, since: performance.now() };
    lights.add(light);
    timer ??= setInterval(tick, TICK_MS);
    return () => {
      lights.delete(light);
      el.style.removeProperty(PROPS[kind]);
      if (!lights.size) {
        clearInterval(timer);
        timer = undefined;
      }
    };
  }, [ref, kind, ms, delay, active]);
}
