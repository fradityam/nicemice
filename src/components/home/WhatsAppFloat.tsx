import { track } from '../../analytics';
import { ORDER_MESSAGE, whatsappLink } from '../../config';
import { WhatsAppIcon } from './icons';

/** Floating order button. Hidden until CONTACT_WHATSAPP is set in config.ts. */
export default function WhatsAppFloat() {
  const href = whatsappLink(ORDER_MESSAGE);
  if (!href) return null;

  return (
    <a
      className="whatsapp-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ngobrol dengan Nice Mice lewat WhatsApp"
      onClick={() => track('whatsapp_click', { button: 'floating' })}
    >
      <WhatsAppIcon />
      <span>Ngobrol Yuk</span>
    </a>
  );
}
