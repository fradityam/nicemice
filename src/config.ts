// Contact details used across the homepage. Leave a value empty while it doesn't exist yet:
// the parts of the page that need it hide themselves or fall back (see below).

/** WhatsApp number in international format, digits only, e.g. '6281234567890'. */
export const CONTACT_WHATSAPP = '';

/** Full Instagram profile URL, e.g. 'https://instagram.com/nicemice.id'. */
export const CONTACT_INSTAGRAM = '';

/** Where order buttons go while CONTACT_WHATSAPP is empty: the template catalog. */
export const ORDER_FALLBACK_HREF = '#template';

/** A wa.me link with a prefilled message, or null when no WhatsApp number is set. */
export function whatsappLink(message: string): string | null {
  const number = CONTACT_WHATSAPP.replace(/\D/g, '');
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
