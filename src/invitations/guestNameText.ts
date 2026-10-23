// No React here: the Worker (worker/index.ts) uses this too, for the WhatsApp preview text.

export const MAX_GUEST_NAME = 50;

/**
 * The guest's name from the link: nicemice.id/radit-ratu?to=Budi+%26+Ani → "Budi & Ani".
 * URLSearchParams handles + and %20 as spaces and every %-encoded character, and leaves a
 * stray % as it is rather than failing. Line breaks and runs of spaces become one space, and
 * very long names are cut to `maxLength` characters. Null when there is no name.
 */
export function guestNameFromSearch(search: URLSearchParams, maxLength = MAX_GUEST_NAME): string | null {
  const raw = search.get('to');
  if (!raw) return null;
  const name = raw
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!name) return null;
  const chars = [...name]; // by character, so an emoji is never cut in half
  return chars.length > maxLength ? `${chars.slice(0, maxLength).join('').trimEnd()}…` : name;
}
