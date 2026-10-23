import { fontsHref, type FontSet } from './content/fonts';

/**
 * Adds a page's fonts (content/fonts.ts) when the app moves to it, unless they're on the page
 * already (the Worker writes the first page's into the HTML). Fonts already loaded stay.
 */
export function loadFonts(set: FontSet) {
  const href = fontsHref(set);
  if ([...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].some((l) => l.href === href)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}
