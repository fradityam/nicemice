// Google Analytics 4. index.html sets up `gtag` and loads Google's script once the page has
// finished loading (so it never slows the first paint), and only on nicemice.id. Calls made
// before that wait in window.dataLayer and are sent when the script arrives.
//
// Never send guest details: no guest names (the ?to= in a couple's link), RSVP names or
// messages. Couple slugs are fine.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Where a WhatsApp button sits, for whatsapp_click. */
export type WhatsAppButton = 'top_bar' | 'floating' | 'final_cta' | 'catalog_card' | 'pricing_custom' | 'partner';

export function track(event: string, params: Record<string, string> = {}) {
  window.gtag?.('event', event, params);
}

/** The page's address without the guest's name. index.html does the same for the first page. */
function pageLocation() {
  const url = new URL(window.location.href);
  url.searchParams.delete('to');
  url.hash = '';
  return url.href;
}

/**
 * A page view, once the page's title is set. The address and title are also kept for every
 * later event on the page, which would otherwise carry the full address, ?to= included.
 */
export function trackPageView() {
  const page = { page_location: pageLocation(), page_title: document.title };
  window.gtag?.('set', page);
  track('page_view', page);
}
