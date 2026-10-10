import { useEffect, useState } from 'react';
import { HeartIcon } from './icons';

// A small toast shown when someone tries to order before CONTACT_WHATSAPP is set.
// It's a single toast for the whole page (rendered once in App), not a bubble next to the
// button, because the catalog cards clip anything that overflows them.

const VISIBLE_MS = 3200;
const listeners = new Set<() => void>();

export function showOrderNotice() {
  listeners.forEach((listener) => listener());
}

export default function OrderNotice() {
  // Bumped on every show, so a second click restarts the timer.
  const [shownAt, setShownAt] = useState(0);

  useEffect(() => {
    const show = () => setShownAt(Date.now());
    listeners.add(show);
    return () => {
      listeners.delete(show);
    };
  }, []);

  useEffect(() => {
    if (!shownAt) return;
    const timer = window.setTimeout(() => setShownAt(0), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [shownAt]);

  const visible = shownAt !== 0;
  // The live region stays mounted so screen readers announce the text when it appears.
  return (
    <div className={`order-notice${visible ? ' is-visible' : ''}`} role="status" aria-live="polite">
      {visible && (
        <>
          <span className="heart-mini">
            <HeartIcon />
          </span>
          Pemesanan segera dibuka!
        </>
      )}
    </div>
  );
}
