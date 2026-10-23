import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { RSVP_ENDPOINT } from '../config';

// Talks to the RSVP Apps Script (apps-script/rsvp.gs): sends a guest's reply and reads back
// the couple's wishes. Every template uses these; only the look of the form is its own.

/** The only values the script accepts; the couple's sheet shows Hadir / Tidak hadir / Belum pasti. */
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
export type SendError = Exclude<SendResult, 'ok'>;

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

const TIME_WORDS = {
  en: { justNow: 'just now', relative: new Intl.RelativeTimeFormat('en', { numeric: 'auto' }), date: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }) },
  id: { justNow: 'baru saja', relative: new Intl.RelativeTimeFormat('id', { numeric: 'auto' }), date: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }) },
};

/** When a wish was sent: "just now", "5 minutes ago", "yesterday", "3 days ago", then "12 Oct" (or in Indonesian). */
export function timeAgo(iso: string | null, lang: keyof typeof TIME_WORDS) {
  if (!iso) return '';
  const words = TIME_WORDS[lang];
  const then = new Date(iso);
  const s = (Date.now() - then.getTime()) / 1000;
  if (s < 60) return words.justNow;
  if (s < 3600) return words.relative.format(-Math.floor(s / 60), 'minute');
  if (s < 86400) return words.relative.format(-Math.floor(s / 3600), 'hour');
  if (s < 30 * 86400) return words.relative.format(-Math.floor(s / 86400), 'day');
  return words.date.format(then);
}

/**
 * The attendance form's state, the same in every template. The form's fields are named
 * `name`, `message` and (the hidden bot trap, only on couple pages) `website`. On a couple's
 * page (`slug`) a reply goes to the RSVP script; on a demo it only shows the thank-you.
 * `sent` is also what the guest sees on reopening the invitation on the same phone.
 */
export function useRsvpForm(slug: string | undefined, onWish: (wish: Wish) => void) {
  const [attendance, setAttendance] = useState<Attendance>('hadir');
  const [sent, setSent] = useState<{ name: string; attendance: Attendance } | null>(() => (slug ? sentBefore(slug) : null));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<SendError | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const form = new FormData(e.currentTarget);
    const reply: RsvpReply = {
      name: String(form.get('name') ?? '').trim(),
      attendance,
      message: String(form.get('message') ?? '').trim(),
      website: String(form.get('website') ?? ''),
    };
    if (!reply.name) return;
    if (!slug) return setSent(reply);
    setSending(true);
    setError(null);
    const result = await sendRsvp(slug, reply);
    setSending(false);
    if (result !== 'ok') return setError(result);
    rememberSent(slug, { name: reply.name, attendance });
    setSent(reply);
    if (reply.message) onWish({ name: reply.name, message: reply.message, time: new Date().toISOString() });
  };

  const sendAnother = () => {
    if (slug) rememberSent(slug, null);
    setSent(null);
    setAttendance('hadir');
  };

  return { attendance, setAttendance, sent, sending, error, submit, sendAnother };
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
