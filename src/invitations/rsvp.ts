import { useCallback, useEffect, useState } from 'react';
import { RSVP_ENDPOINT } from '../config';

// Talks to the RSVP Apps Script (apps-script/rsvp.gs): sends a guest's reply and reads back
// the couple's wishes. Every template uses these; only the look of the form is its own.

export type Attendance = 'hadir' | 'tidak' | 'mungkin';
export type RsvpReply = {
  name: string;
  attendance: Attendance;
  message: string;
  /** The hidden field bots fill in: always '' from a real guest. */
  website: string;
};
export type Wish = { name: string; message: string; time: string | null };
/**
 * `closed`: the couple's RSVPs are switched off (or the link isn't a couple's).
 * `unavailable`: RSVP_ENDPOINT isn't set yet, so nothing can be sent.
 */
export type SendResult = 'ok' | 'closed' | 'busy' | 'failed' | 'unavailable';

export const MAX_NAME = 60;
export const MAX_MESSAGE = 500;

export async function sendRsvp(slug: string, reply: RsvpReply): Promise<SendResult> {
  if (!RSVP_ENDPOINT) return 'unavailable';
  try {
    // Sent as text/plain so the browser posts it straight away, without asking Google first
    // whether it may (Apps Script can't answer that question).
    const res = await fetch(RSVP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ slug, ...reply }),
    });
    const data = await res.json();
    if (data.ok) return 'ok';
    return data.error === 'unknown' ? 'closed' : data.error === 'busy' ? 'busy' : 'failed';
  } catch {
    return 'failed';
  }
}

async function fetchWishes(slug: string): Promise<Wish[] | null> {
  if (!RSVP_ENDPOINT) return null;
  try {
    const res = await fetch(`${RSVP_ENDPOINT}?slug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    return data.ok && Array.isArray(data.wishes) ? data.wishes : null;
  } catch {
    return null;
  }
}

export type WishesState = { status: 'loading' | 'ready' | 'error'; wishes: Wish[] };

/** The couple's wishes, newest first; `add` puts the guest's own just-sent wish on top. */
export function useWishes(slug: string | undefined) {
  const [state, setState] = useState<WishesState>({ status: 'loading', wishes: [] });
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchWishes(slug).then((wishes) => {
      if (cancelled) return;
      setState((s) => (wishes ? { status: 'ready', wishes: mergeOwn(s.wishes, wishes) } : { status: 'error', wishes: s.wishes }));
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  const add = useCallback((wish: Wish) => setState((s) => ({ status: s.status === 'error' ? 'ready' : s.status, wishes: [wish, ...s.wishes] })), []);
  return { ...state, add };
}

// A wish the guest sent before the list loaded stays on top if the list doesn't have it yet.
function mergeOwn(local: Wish[], loaded: Wish[]) {
  const own = local.filter((w) => !loaded.some((l) => l.name === w.name && l.message === w.message));
  return [...own, ...loaded];
}

// Remembers on this phone that the guest has replied, so reopening the invitation shows the
// thank-you rather than an empty form. Only a convenience: if storage is blocked, nothing breaks.
const sentKey = (slug: string) => `nicemice:rsvp:${slug}`;

export function sentBefore(slug: string): { name: string; attendance: Attendance } | null {
  try {
    const raw = localStorage.getItem(sentKey(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function rememberSent(slug: string, reply: { name: string; attendance: Attendance } | null) {
  try {
    if (reply) localStorage.setItem(sentKey(slug), JSON.stringify(reply));
    else localStorage.removeItem(sentKey(slug));
  } catch {
    // storage unavailable (private mode, blocked): fine
  }
}
