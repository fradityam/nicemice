import { whatsappLink } from '../../config';
import { WhatsAppIcon } from './icons';

/** Floating order button. Hidden until CONTACT_WHATSAPP is set in config.ts. */
export default function WhatsAppFloat() {
  const href = whatsappLink('Halo nice mice, saya ingin pesan undangan digital.');
  if (!href) return null;

  return (
    <a
      className="whatsapp-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Pesan undangan melalui WhatsApp"
    >
      <WhatsAppIcon />
      <span>Pesan undangan</span>
    </a>
  );
}
