// Contact details used across the homepage. Leave a value empty while it doesn't exist yet:
// without a WhatsApp number, order buttons show a "Pemesanan segera dibuka!" note and the
// floating WhatsApp button is hidden; without Instagram, the footer link is hidden.

/** WhatsApp number in international format, digits only, e.g. '6281234567890'. */
export const CONTACT_WHATSAPP = '628215000720';

/** Full Instagram profile URL, e.g. 'https://instagram.com/nicemice.id'. */
export const CONTACT_INSTAGRAM = '';

/**
 * The Google Apps Script web app that saves every couple's RSVPs ("Web app URL" from
 * apps-script/SETUP.md, ending in /exec). Until it is set, RSVP forms on couple pages say
 * sending isn't possible yet.
 */
export const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzljiDOOhcevTP-pWQ23ywSeuQSSoz8jcrbe1YO64qMKf9ovg6h8KhvEsjqDmrS4Y57gw/exec';

/**
 * Google Analytics 4 Measurement ID. index.html loads GA with it (see vite.config.ts), on
 * nicemice.id only; src/analytics.ts sends the events.
 */
export const GA_MEASUREMENT_ID = 'G-27HKTD21EM';

/** Prefilled WhatsApp message for general order buttons (announcement bar, final CTA, floating button). */
export const ORDER_MESSAGE = 'Halo Nice Mice, saya ingin pesan undangan digital.';

/** A wa.me link with a prefilled message, or null when no WhatsApp number is set. */
export function whatsappLink(message: string): string | null {
  const number = CONTACT_WHATSAPP.replace(/\D/g, '');
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
