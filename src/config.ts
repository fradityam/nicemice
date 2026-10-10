// Contact details used across the homepage. Leave a value empty while it doesn't exist yet:
// without a WhatsApp number, order buttons show a "Pemesanan segera dibuka!" note and the
// floating WhatsApp button is hidden; without Instagram, the footer link is hidden.

/** WhatsApp number in international format, digits only, e.g. '6281234567890'. */
export const CONTACT_WHATSAPP = '';

/** Full Instagram profile URL, e.g. 'https://instagram.com/nicemice.id'. */
export const CONTACT_INSTAGRAM = '';

/** A wa.me link with a prefilled message, or null when no WhatsApp number is set. */
export function whatsappLink(message: string): string | null {
  const number = CONTACT_WHATSAPP.replace(/\D/g, '');
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
