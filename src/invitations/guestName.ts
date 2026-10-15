import { useSearchParams } from 'react-router-dom';

const MAX_LENGTH = 50;

/**
 * The guest's name from the link: nicemice.id/radit-ratu?to=Budi+%26+Ani → "Budi & Ani".
 * The browser's own decoding handles + and %20 as spaces and every %-encoded character, and
 * leaves a stray % as it is rather than failing. Line breaks and runs of spaces become one
 * space, and very long names are cut to MAX_LENGTH characters. Null when there is no name.
 */
export function guestNameFromSearch(search: URLSearchParams): string | null {
  const raw = search.get('to');
  if (!raw) return null;
  const name = raw
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!name) return null;
  const chars = [...name]; // by character, so an emoji is never cut in half
  return chars.length > MAX_LENGTH ? `${chars.slice(0, MAX_LENGTH).join('').trimEnd()}…` : name;
}

/** The guest's name for the cover: from ?to=, or `fallback` when the link has none. */
export function useGuestName(fallback: string): string {
  const [search] = useSearchParams();
  return guestNameFromSearch(search) ?? fallback;
}
